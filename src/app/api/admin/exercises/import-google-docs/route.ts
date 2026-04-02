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

  const user = await prisma.user.findUnique({ where: { id: session.user?.id as string } })
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

function extractGoogleDocId(inputUrl: string) {
  const trimmed = String(inputUrl || '').trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    const host = parsed.hostname.toLowerCase()
    if (host !== 'docs.google.com') return null

    const match = parsed.pathname.match(/^\/document\/d\/([^/]+)/)
    if (!match?.[1]) return null

    return {
      docId: match[1],
      normalizedUrl: `https://docs.google.com/document/d/${match[1]}/edit`
    }
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  try {
    const body = await request.json().catch(() => ({})) as { docsUrl?: string }
    const parsed = extractGoogleDocId(String(body?.docsUrl || ''))

    if (!parsed) {
      return NextResponse.json(
        { error: 'Please provide a valid Google Docs link (docs.google.com/document/d/...).'},
        { status: 400 }
      )
    }

    const exportUrl = `https://docs.google.com/document/d/${parsed.docId}/export?format=docx`
    const response = await fetch(exportUrl, {
      headers: {
        'User-Agent': 'EnglishMore-Import/1.0'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: 'Could not download the Google Docs file. Make sure the document is shared for viewing.' },
        { status: 400 }
      )
    }

    const contentLength = Number(response.headers.get('content-length') || 0)
    if (contentLength > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'The Google Docs file is too large. Maximum size is 5MB.' }, { status: 400 })
    }

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    if (buffer.length === 0) {
      return NextResponse.json({ error: 'The Google Docs file appears to be empty.' }, { status: 400 })
    }

    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'The Google Docs file is too large. Maximum size is 5MB.' }, { status: 400 })
    }

    const parsedDocx = await mammoth.extractRawText({ buffer })
    const rawText = String(parsedDocx.value || '').trim()

    if (!rawText) {
      return NextResponse.json({ error: 'No readable content found in the Google Docs file.' }, { status: 400 })
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
      sourceFormUrl: parsed.normalizedUrl,
      description: `Imported from Google Docs: ${parsed.normalizedUrl}`,
      questions: toFixedTen(questions)
    })
  } catch {
    return NextResponse.json({ error: 'Unable to import from Google Docs right now. Please try again.' }, { status: 500 })
  }
}
