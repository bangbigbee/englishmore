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
    `I joined this course because ${p.reasonToJoin}.`,
    'Thank you for listening.'
  ].join(' ')
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

  if (!apiKey) {
    return NextResponse.json({ script: buildTemplate(profile) })
  }

  try {
    const prompt = `You are an English writing assistant. A student provided the following personal information to create a self-introduction speech for an English class:

- Full name: ${profile.fullName}
- Age: ${profile.age}
- Hometown: ${profile.hometown}
- Educational background / major: ${profile.major}
- Current job: ${profile.currentJob}
- Years of experience: ${profile.yearsOfExperience}
- Hobbies: ${profile.hobbies}
- Three personality traits: ${profile.traitOne}, ${profile.traitTwo}, ${profile.traitThree}
- Reason for joining the course: ${profile.reasonToJoin}

Write a natural, grammatically correct self-introduction speech in English (about 8–10 sentences). Use simple vocabulary appropriate for an intermediate English learner. Start with "Hello everyone." and end with "Thank you for listening." Return ONLY the speech text, no extra commentary.`

    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.6,
        max_tokens: 400
      })
    })

    if (!res.ok) {
      return NextResponse.json({ script: buildTemplate(profile) })
    }

    const data = await res.json() as { choices?: Array<{ message?: { content?: string } }> }
    const script = data.choices?.[0]?.message?.content?.trim() || buildTemplate(profile)
    return NextResponse.json({ script })
  } catch {
    return NextResponse.json({ script: buildTemplate(profile) })
  }
}
