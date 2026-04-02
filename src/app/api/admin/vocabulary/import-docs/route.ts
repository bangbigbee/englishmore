import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import mammoth from 'mammoth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const runtime = 'nodejs'

type ParsedVocabularyItem = {
  word: string
  phonetic: string | null
  englishDefinition: string | null
  meaning: string
  example: string | null
}

const getFirstValue = (map: Map<string, string>, keys: string[]) => {
  for (const key of keys) {
    const value = String(map.get(key) || '').trim()
    if (value) {
      return value
    }
  }
  return ''
}

const prismaWithVocabulary = prisma as typeof prisma & {
  vocabularyItem: {
    findMany: (...args: unknown[]) => Promise<unknown>
    findFirst: (...args: unknown[]) => Promise<unknown>
    createMany: (...args: unknown[]) => Promise<unknown>
  }
}

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session) return { ok: false, status: 401 }

  const user = await prisma.user.findUnique({ where: { id: session.user?.id as string } })
  if (!user || user.role !== 'admin') return { ok: false, status: 403 }

  return { ok: true, status: 200 }
}

const normalizeText = (value: string | null | undefined) => String(value || '').trim().toLowerCase()

const extractGoogleDocId = (inputUrl: string) => {
  const trimmed = String(inputUrl || '').trim()
  if (!trimmed) return null

  try {
    const parsed = new URL(trimmed)
    if (parsed.hostname.toLowerCase() !== 'docs.google.com') return null

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

const parseVocabularyFromText = (text: string) => {
  const normalizedText = String(text || '').replace(/\r/g, '\n')
  const blocks = normalizedText
    .split(/\n\s*---+\s*\n|(?:\n\s*){2,}/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0)

  const parsedItems: ParsedVocabularyItem[] = []
  let invalidCount = 0

  for (const block of blocks) {
    const lines = block
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    const map = new Map<string, string>()

    for (const line of lines) {
      const separatorIndex = line.indexOf(':')
      if (separatorIndex <= 0) continue

      const key = line
        .slice(0, separatorIndex)
        .trim()
        .toUpperCase()
        .replace(/[^A-Z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '')
      const value = line.slice(separatorIndex + 1).trim()
      if (!value) continue

      if (!map.has(key)) {
        map.set(key, value)
      }
    }

    const word = getFirstValue(map, ['WORD'])
    const meaning = getFirstValue(map, ['MEANING'])
    const phonetic = getFirstValue(map, ['PHONETIC'])
    const partOfSpeech = getFirstValue(map, ['PART_OF_SPEECH', 'PARTOFSPEECH', 'POS'])
    const englishDefinitionRaw = getFirstValue(map, ['ENGLISH_DEFINITION', 'ENGLISHDEFINITION', 'DEFINITION'])
    const englishDefinition = englishDefinitionRaw
      ? (partOfSpeech ? `[${partOfSpeech}] ${englishDefinitionRaw}` : englishDefinitionRaw)
      : (partOfSpeech ? `[${partOfSpeech}]` : '')
    const example = getFirstValue(map, ['EXAMPLE'])

    if (!word || !meaning) {
      invalidCount += 1
      continue
    }

    parsedItems.push({
      word,
      phonetic: phonetic || null,
      englishDefinition: englishDefinition || null,
      meaning,
      example: example || null
    })
  }

  return { parsedItems, invalidCount }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  try {
    const formData = await request.formData()
    const courseId = String(formData.get('courseId') || '').trim()
    const docsUrl = String(formData.get('docsUrl') || '').trim()
    const file = formData.get('file')

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required.' }, { status: 400 })
    }

    if (!docsUrl && !(file instanceof File)) {
      return NextResponse.json({ error: 'Please provide a Google Docs link or upload a .docx file.' }, { status: 400 })
    }

    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
    }

    let buffer: Buffer | null = null

    if (file instanceof File) {
      const fileName = String(file.name || '').toLowerCase()
      if (!fileName.endsWith('.docx')) {
        return NextResponse.json({ error: 'Only .docx files are supported.' }, { status: 400 })
      }

      if (file.size > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'The .docx file is too large. Maximum size is 5MB.' }, { status: 400 })
      }

      const arrayBuffer = await file.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    } else {
      const parsedDoc = extractGoogleDocId(docsUrl)
      if (!parsedDoc) {
        return NextResponse.json({ error: 'Please provide a valid Google Docs link.' }, { status: 400 })
      }

      const exportUrl = `https://docs.google.com/document/d/${parsedDoc.docId}/export?format=docx`
      const response = await fetch(exportUrl, {
        headers: {
          'User-Agent': 'EnglishMore-VocabularyImport/1.0'
        },
        cache: 'no-store'
      })

      if (!response.ok) {
        return NextResponse.json({ error: 'Could not download the Google Docs file. Make sure it is shared for viewing.' }, { status: 400 })
      }

      const contentLength = Number(response.headers.get('content-length') || 0)
      if (contentLength > 5 * 1024 * 1024) {
        return NextResponse.json({ error: 'The Google Docs file is too large. Maximum size is 5MB.' }, { status: 400 })
      }

      const arrayBuffer = await response.arrayBuffer()
      buffer = Buffer.from(arrayBuffer)
    }

    if (!buffer || buffer.length === 0) {
      return NextResponse.json({ error: 'The import file appears to be empty.' }, { status: 400 })
    }

    if (buffer.length > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'The import file is too large. Maximum size is 5MB.' }, { status: 400 })
    }

    const parsedDocx = await mammoth.extractRawText({ buffer })
    const rawText = String(parsedDocx.value || '').trim()

    if (!rawText) {
      return NextResponse.json({ error: 'No readable content found in the file.' }, { status: 400 })
    }

    const { parsedItems, invalidCount } = parseVocabularyFromText(rawText)

    if (parsedItems.length === 0) {
      return NextResponse.json({ error: 'No valid vocabulary rows found. Required fields: WORD and MEANING.' }, { status: 400 })
    }

    const existingItems = await prismaWithVocabulary.vocabularyItem.findMany({
      where: { courseId },
      select: { word: true, meaning: true }
    }) as Array<{ word: string; meaning: string }>

    const existingSet = new Set(existingItems.map((item) => `${normalizeText(item.word)}||${normalizeText(item.meaning)}`))
    const seenInImport = new Set<string>()

    const dedupedItems = parsedItems.filter((item) => {
      const key = `${normalizeText(item.word)}||${normalizeText(item.meaning)}`
      if (existingSet.has(key) || seenInImport.has(key)) {
        return false
      }
      seenInImport.add(key)
      existingSet.add(key)
      return true
    })

    const lastItem = await prismaWithVocabulary.vocabularyItem.findFirst({
      where: { courseId },
      select: { displayOrder: true },
      orderBy: { displayOrder: 'desc' }
    }) as { displayOrder: number } | null

    const baseOrder = lastItem?.displayOrder || 0

    const created = dedupedItems.length > 0
      ? await prismaWithVocabulary.vocabularyItem.createMany({
          data: dedupedItems.map((item, index) => ({
            courseId,
            word: item.word,
            phonetic: item.phonetic,
            englishDefinition: item.englishDefinition,
            meaning: item.meaning,
            example: item.example,
            isActive: true,
            displayOrder: baseOrder + index + 1
          }))
        }) as { count: number }
      : { count: 0 }

    return NextResponse.json({
      createdCount: Number(created.count || 0),
      skippedCount: parsedItems.length - dedupedItems.length,
      invalidCount
    })
  } catch {
    return NextResponse.json({ error: 'Unable to import vocabulary right now. Please try again.' }, { status: 500 })
  }
}
