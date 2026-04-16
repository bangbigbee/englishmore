import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import mammoth from 'mammoth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

type ExtractedToeicQuestion = {
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
  correctOption: string
  explanation: string
  translation: string
  tips: string
  vocabulary: { word: string; meaning: string }[]
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return { ok: false, status: 401 }

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id as string },
    select: { role: true }
  })
  if (!user || user.role !== 'admin') return { ok: false, status: 403 }

  return { ok: true, status: 200 }
}

function parseQuestionsFromDocxText(text: string): ExtractedToeicQuestion[] {
  const lines = text
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const results: ExtractedToeicQuestion[] = []
  let current: ExtractedToeicQuestion | null = null

  const pushCurrent = () => {
    if (!current) return

    if (
      current.question &&
      current.optionA &&
      current.optionB &&
      current.optionC &&
      ['A', 'B', 'C', 'D'].includes(current.correctOption)
    ) {
      results.push(current)
    }

    current = null
  }

  for (const line of lines) {
    // Match question starts: "Câu 1:", "Question 1:", "Q1:", "1."
    const questionMatch = line.match(/^(?:Q(?:uestion)?|Cau|Câu)?\s*(\d{1,3})\s*[\).:-]\s*(.+)$/i)
    if (questionMatch) {
      pushCurrent()
      current = {
        question: questionMatch[2].trim(),
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        explanation: '',
        translation: '',
        tips: '',
        vocabulary: []
      }
      continue
    }

    if (!current) {
      continue
    }

    // Match options: "A. ...", "A) ...", "A: ..."
    const optionMatch = line.match(/^(?:Option\s*)?([ABCD])\s*[\).:-]\s*(.+)$/i)
    if (optionMatch) {
      const key = `option${optionMatch[1].toUpperCase()}` as 'optionA' | 'optionB' | 'optionC' | 'optionD'
      current[key] = optionMatch[2].trim()
      continue
    }

    // Match answers: "Đáp án: A", "Answer: A", "Dap an: A"
    const answerMatch = line.match(/^(?:ANSWER|CORRECT(?:\s*OPTION)?|DAP\s*AN|ĐÁP\s*ÁN|Dap\s*an)\s*[:\-]?\s*([ABCD])\b/i)
    if (answerMatch) {
      current.correctOption = answerMatch[1].toUpperCase()
      continue
    }

    // Match explanation: "Giải thích: ...", "Explanation: ..."
    const explanationMatch = line.match(/^(?:Explanation|Giai\s*thich|Giải\s*thích)\s*[:\-]?\s*(.+)$/i)
    if (explanationMatch) {
      current.explanation = explanationMatch[1].trim()
      continue
    }

    // Match translation: "Dịch nghĩa: ...", "Translation: ..."
    const translationMatch = line.match(/^(?:Translation|Dich\s*nghia|Dịch\s*nghĩa)\s*[:\-]?\s*(.+)$/i)
    if (translationMatch) {
      current.translation = translationMatch[1].trim()
      continue
    }

    // Match tip: "Tip: ...", "Mẹo: ..."
    const tipMatch = line.match(/^(?:Tip|Mẹo|Meo|Mẹo\s*TOEIC)\s*[:\-]?\s*(.*)$/i)
    if (tipMatch) {
      const parsedTip = tipMatch[1].trim()
      current.tips = parsedTip === '(Blank)' ? '' : parsedTip
      continue
    }

    // Match vocabulary header (can be ignored as we just catch items)
    if (line.match(/^(?:Vocabulary|Từ\s*vựng|Tu\s*vung)\s*[:\-]?\s*$/i)) {
      continue
    }

    // Match vocabulary item: "- policy (n) : chính sách"
    const vocabItemMatch = line.match(/^\-\s*([^\(:\-]+?)\s*(?:\(([^)]+)\))?\s*[:\-]\s*(.+)$/)
    if (vocabItemMatch) {
       const typeStr = vocabItemMatch[2] ? `(${vocabItemMatch[2].trim()}) ` : ''
       current.vocabulary.push({
         word: vocabItemMatch[1].trim(),
         meaning: `${typeStr}${vocabItemMatch[3].trim()}`
       })
       continue
    }

    // Append to either question, explanation, translation or tip if it doesn't match a prefix
    if (current.tips) {
      current.tips += ' ' + line
    } else if (current.translation) {
      current.translation += ' ' + line
    } else if (current.explanation) {
      current.explanation += ' ' + line
    } else if (current.question && !current.optionA) {
      current.question += ' ' + line
    }
  }

  pushCurrent()

  return results
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  try {
    const formData = await request.formData()
    const docxFile = formData.get('file')

    if (!(docxFile instanceof File)) {
      return NextResponse.json({ error: 'Please upload a .docx file.' }, { status: 400 })
    }

    const fileName = String(docxFile.name || '').toLowerCase()
    if (!fileName.endsWith('.docx')) {
      return NextResponse.json({ error: 'Only .docx files are supported.' }, { status: 400 })
    }

    if (docxFile.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'The .docx file is too large. Maximum size is 10MB.' }, { status: 400 })
    }

    const arrayBuffer = await docxFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const parsed = await mammoth.extractRawText({ buffer })
    const rawText = String(parsed.value || '').trim()

    if (!rawText) {
      return NextResponse.json({ error: 'The file appears to be empty.' }, { status: 400 })
    }

    const questions = parseQuestionsFromDocxText(rawText)

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid questions were found. Please check your DOCX format.'
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      questions: questions
    })
  } catch (error) {
    console.error('DOCX Import Error:', error)
    return NextResponse.json({ error: 'Unable to import DOCX right now. Please try again.' }, { status: 500 })
  }
}
