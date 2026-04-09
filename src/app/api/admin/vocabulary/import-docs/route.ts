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
  topic: string
}

type DraftVocabularyItem = {
  word?: string
  phonetic?: string | null
  englishDefinition?: string | null
  meaning?: string
  example?: string | null
  topic?: string
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

  const user = await prisma.user.findUnique({
    where: { id: session.user?.id as string },
    select: { role: true }
  })
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
  const lines = normalizedText.split('\n').map((line) => line.trim())
  const parsedItems: ParsedVocabularyItem[] = []
  let invalidCount = 0

  const currentMap = new Map<string, string>()
  let lastSeenTopic = 'WarmUp'

  const flushCurrentItem = () => {
    if (currentMap.size === 0) {
      return
    }

    const word = getFirstValue(currentMap, ['WORD'])
    const meaning = getFirstValue(currentMap, ['MEANING'])
    const phonetic = getFirstValue(currentMap, ['PHONETIC'])
    const partOfSpeech = getFirstValue(currentMap, ['PART_OF_SPEECH', 'PARTOFSPEECH', 'POS'])
    const englishDefinitionRaw = getFirstValue(currentMap, ['ENGLISH_DEFINITION', 'ENGLISHDEFINITION', 'DEFINITION'])
    const englishDefinition = englishDefinitionRaw
      ? (partOfSpeech ? `[${partOfSpeech}] ${englishDefinitionRaw}` : englishDefinitionRaw)
      : (partOfSpeech ? `[${partOfSpeech}]` : '')
    const example = getFirstValue(currentMap, ['EXAMPLE'])
    const topic = getFirstValue(currentMap, ['TOPIC']) || lastSeenTopic

    if (!word || !meaning) {
      invalidCount += 1
      currentMap.clear()
      return
    }

    parsedItems.push({
      word,
      phonetic: phonetic || null,
      englishDefinition: englishDefinition || null,
      meaning,
      example: example || null,
      topic
    })

    currentMap.clear()
  }

  for (const line of lines) {
    if (!line) {
      continue
    }

    if (/^---+$/.test(line)) {
      flushCurrentItem()
      continue
    }

    const separatorIndex = line.indexOf(':')
    if (separatorIndex <= 0) {
      continue
    }

    const key = line
      .slice(0, separatorIndex)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
    const value = line.slice(separatorIndex + 1).trim()
    if (!value) {
      continue
    }

    if (key === 'TOPIC') {
      lastSeenTopic = value
    }

    if ((key === 'WORD' || key === 'TOPIC') && (currentMap.has('WORD') || currentMap.has('TOPIC'))) {
      if (key === 'WORD' && currentMap.has('WORD')) {
        flushCurrentItem()
      } else if (key === 'TOPIC' && currentMap.has('TOPIC')) {
        flushCurrentItem()
      } else if (key === 'TOPIC' && currentMap.has('WORD')) {
         // If we see a new TOPIC but we already have a WORD, flush the previous item
         flushCurrentItem()
      }
    }

    if (!currentMap.has(key)) {
      currentMap.set(key, value)
    }
  }

  flushCurrentItem()

  return { parsedItems, invalidCount }
}

const normalizeDraftItems = (items: DraftVocabularyItem[]) => {
  const parsedItems: ParsedVocabularyItem[] = []
  let invalidCount = 0

  for (const item of items) {
    const word = String(item?.word || '').trim()
    const meaning = String(item?.meaning || '').trim()
    if (!word || !meaning) {
      invalidCount += 1
      continue
    }

    const phonetic = String(item?.phonetic || '').trim()
    const englishDefinition = String(item?.englishDefinition || '').trim()
    const example = String(item?.example || '').trim()

    parsedItems.push({
      word,
      phonetic: phonetic || null,
      englishDefinition: englishDefinition || null,
      meaning,
      example: example || null,
      topic: String(item?.topic || 'WarmUp').trim()
    })
  }

  return { parsedItems, invalidCount }
}

const dedupeVocabularyItems = async (courseId: string, items: ParsedVocabularyItem[]) => {
  const existingItems = await prismaWithVocabulary.vocabularyItem.findMany({
    where: { courseId },
    select: { word: true, meaning: true }
  }) as Array<{ word: string; meaning: string }>

  const existingSet = new Set(existingItems.map((item) => `${normalizeText(item.word)}||${normalizeText(item.meaning)}`))
  const seenInImport = new Set<string>()

  return items.filter((item) => {
    const key = `${normalizeText(item.word)}||${normalizeText(item.meaning)}`
    if (existingSet.has(key) || seenInImport.has(key)) {
      return false
    }
    seenInImport.add(key)
    existingSet.add(key)
    return true
  })
}

const createVocabularyItems = async (courseId: string, items: ParsedVocabularyItem[]) => {
  const lastItem = await prismaWithVocabulary.vocabularyItem.findFirst({
    where: { courseId },
    select: { displayOrder: true },
    orderBy: { displayOrder: 'desc' }
  }) as { displayOrder: number } | null

  const baseOrder = lastItem?.displayOrder || 0

  const created = items.length > 0
    ? await prismaWithVocabulary.vocabularyItem.createMany({
        data: items.map((item, index) => ({
          courseId,
          word: item.word,
          phonetic: item.phonetic,
          englishDefinition: item.englishDefinition,
          meaning: item.meaning,
          example: item.example,
          topic: item.topic,
          isActive: true,
          displayOrder: baseOrder + index + 1
        }))
      }) as { count: number }
    : { count: 0 }

  return Number(created.count || 0)
}

const parseSourceToVocabularyItems = async (docsUrl: string, file: FormDataEntryValue | null) => {
  let buffer: Buffer | null = null

  if (file instanceof File) {
    const fileName = String(file.name || '').toLowerCase()
    if (!fileName.endsWith('.docx')) {
      throw new Error('Only .docx files are supported.')
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new Error('The .docx file is too large. Maximum size is 5MB.')
    }

    const arrayBuffer = await file.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  } else {
    const parsedDoc = extractGoogleDocId(docsUrl)
    if (!parsedDoc) {
      throw new Error('Please provide a valid Google Docs link.')
    }

    const exportUrl = `https://docs.google.com/document/d/${parsedDoc.docId}/export?format=docx`
    const response = await fetch(exportUrl, {
      headers: {
        'User-Agent': 'EnglishMore-VocabularyImport/1.0'
      },
      cache: 'no-store'
    })

    if (!response.ok) {
      throw new Error('Could not download the Google Docs file. Make sure it is shared for viewing.')
    }

    const contentLength = Number(response.headers.get('content-length') || 0)
    if (contentLength > 5 * 1024 * 1024) {
      throw new Error('The Google Docs file is too large. Maximum size is 5MB.')
    }

    const arrayBuffer = await response.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  }

  if (!buffer || buffer.length === 0) {
    throw new Error('The import file appears to be empty.')
  }

  if (buffer.length > 5 * 1024 * 1024) {
    throw new Error('The import file is too large. Maximum size is 5MB.')
  }

  const parsedDocx = await mammoth.extractRawText({ buffer })
  const rawText = String(parsedDocx.value || '').trim()

  if (!rawText) {
    throw new Error('No readable content found in the file.')
  }

  return parseVocabularyFromText(rawText)
}

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  try {
    const formData = await request.formData()
    const action = String(formData.get('action') || 'direct').trim().toLowerCase()
    const courseId = String(formData.get('courseId') || '').trim()
    const docsUrl = String(formData.get('docsUrl') || '').trim()
    const file = formData.get('file')

    if (!courseId) {
      return NextResponse.json({ error: 'courseId is required.' }, { status: 400 })
    }

    const course = await prisma.course.findUnique({ where: { id: courseId }, select: { id: true } })
    if (!course) {
      return NextResponse.json({ error: 'Course not found.' }, { status: 404 })
    }

    if (action === 'preview') {
      if (!docsUrl && !(file instanceof File)) {
        return NextResponse.json({ error: 'Please provide a Google Docs link or upload a .docx file.' }, { status: 400 })
      }

      const { parsedItems, invalidCount } = await parseSourceToVocabularyItems(docsUrl, file)

      if (parsedItems.length === 0) {
        return NextResponse.json({ error: 'No valid vocabulary rows found. Required fields: WORD and MEANING.' }, { status: 400 })
      }

      return NextResponse.json({
        previewItems: parsedItems,
        invalidCount
      })
    }

    let parsedItems: ParsedVocabularyItem[] = []
    let invalidCount = 0

    if (action === 'commit') {
      const itemsJson = String(formData.get('itemsJson') || '').trim()
      if (!itemsJson) {
        return NextResponse.json({ error: 'No preview rows were provided for confirmation.' }, { status: 400 })
      }

      let parsedRawItems: DraftVocabularyItem[] = []
      try {
        const decoded = JSON.parse(itemsJson) as unknown
        if (!Array.isArray(decoded)) {
          return NextResponse.json({ error: 'Invalid preview rows payload.' }, { status: 400 })
        }
        parsedRawItems = decoded as DraftVocabularyItem[]
      } catch {
        return NextResponse.json({ error: 'Invalid preview rows payload.' }, { status: 400 })
      }

      const normalized = normalizeDraftItems(parsedRawItems)
      parsedItems = normalized.parsedItems
      invalidCount = normalized.invalidCount
    } else {
      if (!docsUrl && !(file instanceof File)) {
        return NextResponse.json({ error: 'Please provide a Google Docs link or upload a .docx file.' }, { status: 400 })
      }

      const parsed = await parseSourceToVocabularyItems(docsUrl, file)
      parsedItems = parsed.parsedItems
      invalidCount = parsed.invalidCount
    }

    if (parsedItems.length === 0) {
      return NextResponse.json({ error: 'No valid vocabulary rows found. Required fields: WORD and MEANING.' }, { status: 400 })
    }

    const dedupedItems = await dedupeVocabularyItems(courseId, parsedItems)
    const createdCount = await createVocabularyItems(courseId, dedupedItems)

    return NextResponse.json({
      createdCount,
      skippedCount: parsedItems.length - dedupedItems.length,
      invalidCount
    })
  } catch (error) {
    if (error instanceof Error && error.message) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Unable to import vocabulary right now. Please try again.' }, { status: 500 })
  }
}
