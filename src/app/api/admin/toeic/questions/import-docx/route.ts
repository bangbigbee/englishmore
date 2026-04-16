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
  const blocks = text.split(/---+/)
  const results: ExtractedToeicQuestion[] = []

  for (const block of blocks) {
    const trimmed = block.trim()
    if (!trimmed) continue

    let vocabBlock = ''
    let textWithoutVocab = trimmed
    const vocabMatch = trimmed.match(/(?:Vocabulary|Từ\s*vựng|Tu\s*vung)\s*[:\-]?\s*([\s\S]*)$/i)
    if (vocabMatch) {
      vocabBlock = vocabMatch[1]
      textWithoutVocab = trimmed.substring(0, vocabMatch.index).trim()
    }

    const vocabulary: { word: string; meaning: string }[] = []
    if (vocabBlock) {
      const vocabLines = vocabBlock.split('\n')
      for (const line of vocabLines) {
        const vMatch = line.trim().match(/^\-\s*([^\(:\-]+?)\s*(?:\(([^)]+)\))?\s*[:\-]\s*(.+)$/)
        if (vMatch) {
          const typeStr = vMatch[2] ? `(${vMatch[2].trim()}) ` : ''
          vocabulary.push({
            word: vMatch[1].trim(),
            meaning: `${typeStr}${vMatch[3].trim()}`
          })
        }
      }
    }

    let tipBlock = ''
    let textWithoutTip = textWithoutVocab
    const tipMatch = textWithoutVocab.match(/(?:Tip|Mẹo|Meo|Mẹo\s*TOEIC)\s*[:\-]?\s*([\s\S]*)$/i)
    if (tipMatch) {
      tipBlock = tipMatch[1].trim()
      textWithoutTip = textWithoutVocab.substring(0, tipMatch.index).trim()
    }

    let transBlock = ''
    let textWithoutTrans = textWithoutTip
    const transMatch = textWithoutTip.match(/(?:Translation|Dich\s*nghia|Dịch\s*nghĩa)\s*[:\-]?\s*([\s\S]*)$/i)
    if (transMatch) {
      transBlock = transMatch[1].trim()
      textWithoutTrans = textWithoutTip.substring(0, transMatch.index).trim()
    }

    let expBlock = ''
    let textWithoutExp = textWithoutTrans
    const expMatch = textWithoutTrans.match(/(?:Explanation|Giai\s*thich|Giải\s*thích)\s*[:\-]?\s*([\s\S]*)$/i)
    if (expMatch) {
      expBlock = expMatch[1].trim()
      textWithoutExp = textWithoutTrans.substring(0, expMatch.index).trim()
    }

    let ansBlock = 'A'
    let textWithoutAns = textWithoutExp
    const ansMatch = textWithoutExp.match(/(?:ANSWER|CORRECT(?:\s*OPTION)?|DAP\s*AN|ĐÁP\s*ÁN|Dap\s*an)\s*[:\-]?\s*([ABCD])\b/i)
    if (ansMatch) {
      ansBlock = ansMatch[1].toUpperCase()
      textWithoutAns = textWithoutExp.substring(0, ansMatch.index).trim()
    }

    let optD = ''
    let textWithoutD = textWithoutAns
    const dMatch = textWithoutAns.match(/(?:Option\s*)?D\s*[\).:-]\s*([\s\S]*)$/i)
    if (dMatch) {
      optD = dMatch[1].trim()
      textWithoutD = textWithoutAns.substring(0, dMatch.index).trim()
    }

    let optC = ''
    let textWithoutC = textWithoutD
    const cMatch = textWithoutD.match(/(?:Option\s*)?C\s*[\).:-]\s*([\s\S]*)$/i)
    if (cMatch) {
      optC = cMatch[1].trim()
      textWithoutC = textWithoutD.substring(0, cMatch.index).trim()
    }

    let optB = ''
    let textWithoutB = textWithoutC
    const bMatch = textWithoutC.match(/(?:Option\s*)?B\s*[\).:-]\s*([\s\S]*)$/i)
    if (bMatch) {
      optB = bMatch[1].trim()
      textWithoutB = textWithoutC.substring(0, bMatch.index).trim()
    }

    let optA = ''
    let textWithoutA = textWithoutB
    const aMatch = textWithoutB.match(/(?:Option\s*)?A\s*[\).:-]\s*([\s\S]*)$/i)
    if (aMatch) {
      optA = aMatch[1].trim()
      textWithoutA = textWithoutB.substring(0, aMatch.index).trim()
    }

    let question = textWithoutA.replace(/^(?:Q(?:uestion)?|Cau|Câu)?\s*(\d{1,3})?\s*[\).:-]?\s*/i, '').trim()

    if (question && optA && optB && optC) {
      results.push({
        question,
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        correctOption: ansBlock,
        explanation: expBlock,
        translation: transBlock,
        tips: tipBlock === '(Blank)' ? '' : tipBlock,
        vocabulary
      })
    }
  }

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
