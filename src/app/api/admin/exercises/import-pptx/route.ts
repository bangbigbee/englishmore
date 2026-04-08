import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import JSZip from 'jszip'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

type ExtractedQuestion = {
  question: string
  optionA: string
  optionB: string
  optionC: string
  optionD: string
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

function decodeXmlEntities(input: string) {
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_m, code) => String.fromCharCode(Number(code)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_m, code) => String.fromCharCode(parseInt(code, 16)))
}

function normalizeLine(line: string) {
  return line
    .replace(/^[\u2022\u25CF\u25AA\-\*\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractSlideTexts(xml: string) {
  // PPTX often splits one visible line into many <a:t> runs.
  // We must merge runs inside the same <a:p> paragraph to preserve full sentences.
  const lines: string[] = []
  const paragraphRegex = /<a:p\b[\s\S]*?<\/a:p>/g

  let paragraphMatch: RegExpExecArray | null
  while ((paragraphMatch = paragraphRegex.exec(xml)) !== null) {
    const paragraph = String(paragraphMatch[0] || '')
    const runRegex = /<a:t[^>]*>([\s\S]*?)<\/a:t>/g
    const parts: string[] = []

    let runMatch: RegExpExecArray | null
    while ((runMatch = runRegex.exec(paragraph)) !== null) {
      const part = decodeXmlEntities(String(runMatch[1] || ''))
      if (part.trim()) {
        parts.push(part)
      }
    }

    const merged = normalizeLine(parts.join(' '))
    if (merged) {
      lines.push(merged)
    }
  }

  return lines
}

function parseQuestionFromLines(lines: string[]): ExtractedQuestion | null {
  let question = ''
  let optionA = ''
  let optionB = ''
  let optionC = ''
  let optionD = ''
  let correctOption = 'A'

  for (const line of lines) {
    const optionMatch = line.match(/^(?:Option\s*)?([ABCD])\s*[\).:\-]\s*(.+)$/i)
    if (optionMatch) {
      const key = optionMatch[1].toUpperCase()
      const value = optionMatch[2].trim()
      if (key === 'A') optionA = value
      if (key === 'B') optionB = value
      if (key === 'C') optionC = value
      if (key === 'D') optionD = value
      continue
    }

    const answerMatch = line.match(/^(?:ANSWER|CORRECT(?:\s*OPTION)?|ĐÁP\s*ÁN|DAP\s*AN)\s*[:\-]?\s*([ABCD])\b/i)
    if (answerMatch) {
      correctOption = answerMatch[1].toUpperCase()
      continue
    }

    if (!question) {
      const questionMatch = line.match(/^(?:Q(?:uestion)?\s*\d+|\d+)\s*[\).:\-]\s*(.+)$/i)
      if (questionMatch) {
        question = questionMatch[1].trim()
        continue
      }

      if (line.includes('?')) {
        question = line
      }
    }
  }

  if (!question || !optionA || !optionB || !optionC || !optionD) {
    return null
  }

  return {
    question,
    optionA,
    optionB,
    optionC,
    optionD,
    correctOption: ['A', 'B', 'C', 'D'].includes(correctOption) ? correctOption : 'A'
  }
}

function toFixedTen(items: ExtractedQuestion[]) {
  return Array.from({ length: 10 }, (_, index) => {
    const item = items[index]
    return {
      question: String(item?.question || '').trim(),
      optionA: String(item?.optionA || '').trim(),
      optionB: String(item?.optionB || '').trim(),
      optionC: String(item?.optionC || '').trim(),
      optionD: String(item?.optionD || '').trim(),
      correctOption: ['A', 'B', 'C', 'D'].includes(String(item?.correctOption || '').toUpperCase())
        ? String(item?.correctOption || 'A').toUpperCase()
        : 'A'
    }
  })
}

async function parsePptx(buffer: Buffer) {
  const zip = await JSZip.loadAsync(buffer)
  const slidePaths = Object.keys(zip.files)
    .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
    .sort((left, right) => {
      const leftNumber = Number(left.match(/slide(\d+)\.xml/i)?.[1] || 0)
      const rightNumber = Number(right.match(/slide(\d+)\.xml/i)?.[1] || 0)
      return leftNumber - rightNumber
    })

  const questions: ExtractedQuestion[] = []
  let extractedTitle = ''

  for (const path of slidePaths) {
    const xml = await zip.files[path].async('string')
    const rawLines = extractSlideTexts(xml)
    if (rawLines.length === 0) continue

    if (!extractedTitle) {
      const titleLine = rawLines.find((line) => /conversation\s*\d+/i.test(line))
      if (titleLine) {
        extractedTitle = titleLine
      }
    }

    const lines = rawLines
      .map(normalizeLine)
      .filter((line) => line.length > 0 && !/^conversation\s*\d+/i.test(line))

    const parsed = parseQuestionFromLines(lines)
    if (parsed) {
      questions.push(parsed)
    }

    if (questions.length >= 10) {
      break
    }
  }

  return {
    title: extractedTitle,
    questions: questions.slice(0, 10)
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  try {
    const formData = await request.formData()
    const pptxFile = formData.get('file')

    if (!(pptxFile instanceof File)) {
      return NextResponse.json({ error: 'Please upload a .pptx file.' }, { status: 400 })
    }

    const fileName = String(pptxFile.name || '').toLowerCase()
    if (!fileName.endsWith('.pptx')) {
      return NextResponse.json({ error: 'Only .pptx files are supported.' }, { status: 400 })
    }

    if (pptxFile.size > 20 * 1024 * 1024) {
      return NextResponse.json({ error: 'The .pptx file is too large. Maximum size is 20MB.' }, { status: 400 })
    }

    const arrayBuffer = await pptxFile.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const parsed = await parsePptx(buffer)

    if (parsed.questions.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid conversation questions were found. Expected format per slide: question + A/B/C/D options.'
        },
        { status: 400 }
      )
    }

    return NextResponse.json({
      title: parsed.title || `Conversation set: ${pptxFile.name}`,
      description: `Imported from PPTX: ${pptxFile.name}`,
      questions: toFixedTen(parsed.questions)
    })
  } catch {
    return NextResponse.json({ error: 'Unable to import PPTX right now. Please try again.' }, { status: 500 })
  }
}
