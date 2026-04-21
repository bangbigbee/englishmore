import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import * as xlsx from 'xlsx'

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

export async function POST(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) {
    return NextResponse.json({ error: auth.status === 401 ? 'Unauthorized' : 'Forbidden' }, { status: auth.status })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Please upload an Excel file (.xlsx, .xls).' }, { status: 400 })
    }

    const fileName = String(file.name || '').toLowerCase()
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      return NextResponse.json({ error: 'Only .xlsx or .xls files are supported.' }, { status: 400 })
    }

    if (file.size > 15 * 1024 * 1024) {
      return NextResponse.json({ error: 'The Excel file is too large. Maximum size is 15MB.' }, { status: 400 })
    }

    const arrayBuffer = await file.arrayBuffer()
    const workbook = xlsx.read(arrayBuffer, { type: 'array' })
    const sheetName = workbook.SheetNames[0]
    const sheet = workbook.Sheets[sheetName]
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 }) as any[][]

    const results = []
    let currentGroupData: any = null

    // Excel template columns:
    // 0: STT
    // 1: Thoại tiếng Anh (Transcript / Question+Options)
    // 2: Dịch tiếng Việt
    // 3: Đáp án chính xác
    // 4: Từ vựng then chốt
    // 5: Giải thích đáp án
    // 6: TOEIC Tip

    const rgxA = /(?:^|\s|\n)(?:\(A\)|A\.|A\))\s+([\s\S]*?)(?=(?:^|\s|\n)(?:\(B\)|B\.|B\))|$)/i
    const rgxB = /(?:^|\s|\n)(?:\(B\)|B\.|B\))\s+([\s\S]*?)(?=(?:^|\s|\n)(?:\(C\)|C\.|C\))|$)/i
    const rgxC = /(?:^|\s|\n)(?:\(C\)|C\.|C\))\s+([\s\S]*?)(?=(?:^|\s|\n)(?:\(D\)|D\.|D\))|$)/i
    const rgxD = /(?:^|\s|\n)(?:\(D\)|D\.|D\))\s+([\s\S]*?)$/i

    for (let i = 1; i < data.length; i++) { // Skip header row
      const row = data[i]
      if (!row || row.length === 0) continue

      const stt = (row[0] || '').toString().trim()
      const eng = (row[1] || '').toString().trim()
      const viet = (row[2] || '').toString().trim()
      const answerRaw = (row[3] || '').toString().trim()
      const vocabRaw = (row[4] || '').toString().trim()
      const explainRaw = (row[5] || '').toString().trim()
      const tipsRaw = (row[6] || '').toString().trim()

      if (!eng) continue // Empty row

      const ansMatch = answerRaw.match(/A|B|C|D/i)
      const hasOptions = rgxA.test(eng)

      // If no valid answer option AND no A/B/C/D choices in the English text, it's a Transcript Group
      const isGroup = !ansMatch && !hasOptions && eng.length > 20

      if (isGroup) {
        currentGroupData = {
          transcriptEng: eng,
          transcriptViet: viet,
          vocabularyStr: vocabRaw,
          tips: tipsRaw
        }
        continue
      }

      // If it's a question row
      let finalQuestionText = eng
      let optionA = ''
      let optionB = ''
      let optionC = ''
      let optionD = ''
      let correctOption = 'A'
      
      const matchA = eng.match(rgxA)
      const matchB = eng.match(rgxB)
      const matchC = eng.match(rgxC)
      const matchD = eng.match(rgxD)

      if (matchA && matchA[1]) optionA = matchA[1].trim()
      if (matchB && matchB[1]) optionB = matchB[1].trim()
      if (matchC && matchC[1]) optionC = matchC[1].trim()
      if (matchD && matchD[1]) optionD = matchD[1].trim()

      if (matchA) {
        finalQuestionText = eng.split(/(?:^|\s|\n)(?:\(A\)|A\.|A\))/i)[0].trim()
      }

      if (ansMatch) {
         correctOption = ansMatch[0].toUpperCase()
      }

      let finalExplanation = explainRaw
      let finalVocab: any[] = []
      let finalTips = tipsRaw

      if (currentGroupData) {
        const engText = currentGroupData.transcriptEng
        const vietText = currentGroupData.transcriptViet
        finalExplanation = `[Transcript]\n${engText}\n\n[Dịch nghĩa]\n${vietText}\n\n[Giải thích]\n${finalExplanation}`
        
        if (!finalTips) finalTips = currentGroupData.tips

        if (currentGroupData.vocabularyStr) {
          const lines = currentGroupData.vocabularyStr.split(/\n/)
          for (const line of lines) {
            const cleaned = line.trim()
            if (!cleaned) continue
            const matchVocab = cleaned.match(/^([^\(:\-]+?)\s*(?:\(([^)]+)\))?\s*[:\-]?\s*(.+)$/)
            if (matchVocab && matchVocab[1].length < 30) {
              finalVocab.push({
                word: matchVocab[1].trim(),
                meaning: (matchVocab[2] ? `(${matchVocab[2].trim()}) ` : '') + matchVocab[3].trim()
              })
            } else {
              finalVocab.push({ word: cleaned.split(':')[0] || cleaned, meaning: cleaned.split(':').slice(1).join(':').trim() || '' })
            }
          }
        }
      }

      results.push({
        question: finalQuestionText,
        optionA,
        optionB,
        optionC,
        optionD,
        correctOption,
        explanation: finalExplanation,
        translation: viet, // In Excel, viet column has the full translated question text usually
        tips: finalTips,
        vocabulary: finalVocab
      })
    }

    if (results.length === 0) {
      return NextResponse.json(
        { error: 'Không tìm thấy câu hỏi hợp lệ trong file Excel. Vui lòng kiểm tra lại định dạng template.' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      questions: results
    })
  } catch (error) {
    console.error('Excel Import Error:', error)
    return NextResponse.json({ error: 'Unable to import Excel right now. Please try again.' }, { status: 500 })
  }
}
