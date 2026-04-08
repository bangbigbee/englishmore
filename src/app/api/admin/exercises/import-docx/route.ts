import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import mammoth from 'mammoth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

type ExtractedQuestion = {
  question: string
  optionA: string
  optionB: string
  optionC: string
  correctOption: string
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

function toFixedTen(items: ExtractedQuestion[]) {
  return Array.from({ length: 10 }, (_, index) => {
    const item = items[index]
    return {
      question: String(item?.question || '').trim(),
      optionA: String(item?.optionA || '').trim(),
      optionB: String(item?.optionB || '').trim(),
      optionC: String(item?.optionC || '').trim(),
      correctOption: ['A', 'B', 'C'].includes(String(item?.correctOption || '').toUpperCase())
        ? String(item.correctOption).toUpperCase()
        : 'A'
    }
  })
}

function parseQuestionsFromDocxText(text: string): ExtractedQuestion[] {
  const lines = text
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const results: ExtractedQuestion[] = []
  let current: ExtractedQuestion | null = null

  const pushCurrent = () => {
    if (!current) return

    if (
      current.question &&
      current.optionA &&
      current.optionB &&
      current.optionC &&
      ['A', 'B', 'C'].includes(current.correctOption)
    ) {
      results.push(current)
    }

    current = null
  }

  for (const line of lines) {
    const questionMatch = line.match(/^(?:Q(?:uestion)?|Cau|Câu)?\s*(\d{1,2})\s*[\).:-]\s*(.+)$/i)
    if (questionMatch) {
      pushCurrent()
      current = {
        question: questionMatch[2].trim(),
        optionA: '',
        optionB: '',
        optionC: '',
        correctOption: 'A'
      }
      continue
    }

    if (!current) {
      continue
    }

    const optionMatch = line.match(/^(?:Option\s*)?([ABC])\s*[\).:-]\s*(.+)$/i)
    if (optionMatch) {
      const key = `option${optionMatch[1].toUpperCase()}` as 'optionA' | 'optionB' | 'optionC'
      current[key] = optionMatch[2].trim()
      continue
    }

    const answerMatch = line.match(/^(?:ANSWER|CORRECT(?:\s*OPTION)?|DAP\s*AN|ĐÁP\s*ÁN)\s*[:\-]?\s*([ABC])\b/i)
    if (answerMatch) {
      current.correctOption = answerMatch[1].toUpperCase()
    }
  }

  pushCurrent()

  return results.slice(0, 10)
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

    if (docxFile.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'The .docx file is too large. Maximum size is 5MB.' }, { status: 400 })
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
          error: 'No valid questions were found. Please follow the required format: Q1, A/B/C, ANSWER.'
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      description: `Imported from DOCX: ${docxFile.name}`,
      questions: toFixedTen(questions)
    })
  } catch {
    return NextResponse.json({ error: 'Unable to import DOCX right now. Please try again.' }, { status: 500 })
  }
}
