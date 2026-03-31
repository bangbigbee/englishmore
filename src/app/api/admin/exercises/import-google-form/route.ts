import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

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

function normalizeGoogleFormUrl(inputUrl: string) {
  const trimmed = String(inputUrl || '').trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    if (parsed.hostname !== 'docs.google.com' || !parsed.pathname.includes('/forms/')) {
      return null
    }

    return parsed.toString()
  } catch {
    return null
  }
}

function toFixedTen(items: ExtractedQuestion[]) {
  const normalized = Array.from({ length: 10 }, (_, index) => {
    const item = items[index]
    return {
      question: String(item?.question || '').trim(),
      optionA: String(item?.optionA || '').trim(),
      optionB: String(item?.optionB || '').trim(),
      optionC: String(item?.optionC || '').trim(),
      correctOption: ['A', 'B', 'C'].includes(String(item?.correctOption || '').toUpperCase()) ? String(item.correctOption).toUpperCase() : 'A'
    }
  })

  return normalized
}

function extractFromPublicLoadData(raw: unknown): ExtractedQuestion[] {
  const extracted: ExtractedQuestion[] = []

  const walk = (value: unknown) => {
    if (!Array.isArray(value)) return

    // Google Form question candidate format: [id, title, ..., type, options]
    const maybeTitle = value[1]
    const maybeType = value[3]
    const maybeOptions = value[4]

    if (
      typeof maybeTitle === 'string' &&
      (typeof maybeType === 'number' || maybeType === null) &&
      Array.isArray(maybeOptions)
    ) {
      const optionTexts = maybeOptions
        .map((option) => (Array.isArray(option) && typeof option[0] === 'string' ? option[0].trim() : ''))
        .filter((option) => option.length > 0)

      if (optionTexts.length >= 3) {
        extracted.push({
          question: maybeTitle.trim(),
          optionA: optionTexts[0],
          optionB: optionTexts[1],
          optionC: optionTexts[2],
          correctOption: 'A'
        })
      }
    }

    value.forEach((item) => walk(item))
  }

  walk(raw)

  // De-duplicate same question text if scanner hits nested copies.
  const seen = new Set<string>()
  return extracted.filter((item) => {
    const key = item.question.toLowerCase()
    if (!key || seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function extractFormPayload(html: string) {
  const markerRegex = /FB_PUBLIC_LOAD_DATA_\s*=\s*(\[[\s\S]*?\]);/
  const match = html.match(markerRegex)
  if (!match) {
    return null
  }

  try {
    // Google embeds this as JS array literal. Evaluate in isolated function scope.
    const data = Function(`"use strict"; return (${match[1]});`)()
    return data
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  const body = await request.json()
  const formUrl = normalizeGoogleFormUrl(body?.formUrl)

  if (!formUrl) {
    return NextResponse.json({ error: 'Invalid Google Form link' }, { status: 400 })
  }

  try {
    const response = await fetch(formUrl, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'User-Agent': 'Mozilla/5.0'
      }
    })

    if (!response.ok) {
      return NextResponse.json({ error: 'Unable to read data from Google Form. Make sure the form is public.' }, { status: 400 })
    }

    const html = await response.text()
    const payload = extractFormPayload(html)
    if (!payload) {
      return NextResponse.json({ error: 'Unable to extract form content. Please use a public viewform link.' }, { status: 400 })
    }

    const parsedQuestions = extractFromPublicLoadData(payload)
    if (parsedQuestions.length === 0) {
      return NextResponse.json({ error: 'No valid multiple-choice questions were found in this form.' }, { status: 400 })
    }

    return NextResponse.json({
      description: `Imported from Google Form: ${formUrl}`,
      sourceFormUrl: formUrl,
      questions: toFixedTen(parsedQuestions)
    })
  } catch {
    return NextResponse.json({ error: 'Unable to import from Google Form right now. Please try again.' }, { status: 500 })
  }
}
