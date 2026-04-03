import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

interface ProfilePayload {
  fullName: string
  age: string
  hometown: string
  major: string
  currentJob: string
  yearsOfExperience: string
  hobbies: string
  traitOne: string
  traitTwo: string
  traitThree: string
  reasonToJoin: string
}

const normalizeProfile = (raw: unknown): ProfilePayload => {
  const p = (raw ?? {}) as Partial<ProfilePayload>
  return {
    fullName: String(p.fullName || '').trim(),
    age: String(p.age || '').trim(),
    hometown: String(p.hometown || '').trim(),
    major: String(p.major || '').trim(),
    currentJob: String(p.currentJob || '').trim(),
    yearsOfExperience: String(p.yearsOfExperience || '').trim(),
    hobbies: String(p.hobbies || '').trim(),
    traitOne: String(p.traitOne || '').trim(),
    traitTwo: String(p.traitTwo || '').trim(),
    traitThree: String(p.traitThree || '').trim(),
    reasonToJoin: String(p.reasonToJoin || '').trim()
  }
}

const finalizeSentence = (text: string) => {
  const value = String(text || '').trim().replace(/[.!?]+$/g, '')
  if (!value) return ''
  return `${value}.`
}

const buildReasonSentence = (reasonRaw: string) => {
  const reason = String(reasonRaw || '').trim()
  const normalized = reason.toLowerCase()

  if (!reason) {
    return 'I joined this course because I want to improve my English speaking skills.'
  }

  if (/^(better english|improve english|english)$/i.test(reason)) {
    return 'I joined this course because I want to improve my English.'
  }

  if (/^because\b/i.test(reason)) {
    return finalizeSentence(`I joined this course ${reason}`)
  }

  if (/^to\b/i.test(reason)) {
    return finalizeSentence(`I joined this course ${reason}`)
  }

  if (/^i\b/i.test(reason)) {
    return finalizeSentence(`I joined this course because ${reason}`)
  }

  if (normalized.split(/\s+/).filter(Boolean).length <= 4) {
    return 'I joined this course because I want to improve my English.'
  }

  return finalizeSentence(`I joined this course because ${reason}`)
}

/** Template fallback — used when no OPENAI_API_KEY is set */
const buildTemplate = (p: ProfilePayload): string => {
  const article = (word: string) => /^[aeiou]/i.test(word) ? 'an' : 'a'
  return [
    `Hello everyone. My name is ${p.fullName}.`,
    `I am ${p.age} years old, and I come from ${p.hometown}.`,
    `My educational background is in ${p.major}.`,
    `Currently, I work as ${article(p.currentJob)} ${p.currentJob}, and I have ${p.yearsOfExperience} years of experience in this field.`,
    `In my free time, I enjoy ${p.hobbies}.`,
    `Three words that best describe me are: ${p.traitOne}, ${p.traitTwo}, and ${p.traitThree}.`,
    buildReasonSentence(p.reasonToJoin),
    'Thank you for listening.'
  ].join(' ')
}

type ChatCompletionResponse = { choices?: Array<{ message?: { content?: string } }> }

const callOpenAI = async (apiKey: string, messages: Array<{ role: 'system' | 'user'; content: string }>) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages,
      temperature: 0.35,
      max_tokens: 420
    })
  })

  if (!response.ok) {
    return null
  }

  const data = await response.json() as ChatCompletionResponse
  return data.choices?.[0]?.message?.content?.trim() || null
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const profile = normalizeProfile(body?.profile)

  const missing = Object.entries(profile).filter(([, v]) => !v).map(([k]) => k)
  if (missing.length > 0) {
    return NextResponse.json({ error: `Missing fields: ${missing.join(', ')}` }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  const templateScript = buildTemplate(profile)

  if (!apiKey) {
    return NextResponse.json({
      script: templateScript,
      source: 'template',
      warning: 'OPENAI_API_KEY is missing, so the system used the built-in template.'
    })
  }

  try {
    const draftPrompt = `You are an English writing assistant. Create a fluent self-introduction speech based on the student profile below.

- Full name: ${profile.fullName}
- Age: ${profile.age}
- Hometown: ${profile.hometown}
- Educational background / major: ${profile.major}
- Current job: ${profile.currentJob}
- Years of experience: ${profile.yearsOfExperience}
- Hobbies: ${profile.hobbies}
- Three personality traits: ${profile.traitOne}, ${profile.traitTwo}, ${profile.traitThree}
- Reason for joining the course: ${profile.reasonToJoin}

Rules:
- 8 to 10 short sentences.
- Natural, grammatical English for an intermediate learner.
- Keep facts accurate to the provided profile.
- Start exactly with "Hello everyone." and end exactly with "Thank you for listening."
- If the reason is a short fragment (example: "better English"), rewrite it into a full natural sentence.
- Return only the final speech text.`

    const draft = await callOpenAI(apiKey, [
      {
        role: 'system',
        content: 'You write clear, grammatical, learner-friendly spoken English.'
      },
      {
        role: 'user',
        content: draftPrompt
      }
    ])

    if (!draft) {
      return NextResponse.json({
        script: templateScript,
        source: 'template',
        warning: 'OpenAI request failed, so the system used the built-in template.'
      })
    }

    const polished = await callOpenAI(apiKey, [
      {
        role: 'system',
        content: 'You are a strict English grammar editor.'
      },
      {
        role: 'user',
        content: `Polish the grammar, punctuation, and phrasing of this speech without changing its meaning. Keep it natural and easy to speak aloud. Return only the corrected speech text.\n\n${draft}`
      }
    ])

    return NextResponse.json({
      script: polished || draft,
      source: 'ai'
    })
  } catch {
    return NextResponse.json({
      script: templateScript,
      source: 'template',
      warning: 'Unexpected error while generating script, so the system used the built-in template.'
    })
  }
}
