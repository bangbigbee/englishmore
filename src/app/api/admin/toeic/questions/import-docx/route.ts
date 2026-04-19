import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import mammoth from 'mammoth'
import * as cheerio from 'cheerio'
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
  const lines = text
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const results: ExtractedToeicQuestion[] = []
  let current: ExtractedToeicQuestion | null = null

  const pushCurrent = () => {
    if (!current) return

    if (
      current.question &&
      current.optionA &&
      current.optionB &&
      current.optionC &&
      ['A', 'B', 'C', 'D'].includes(current.correctOption)
    ) {
      results.push(current)
    }

    current = null
  }

  for (const line of lines) {
    // Match question starts: "Câu 1:", "Question 1:", "Q1:", "1."
    const questionMatch = line.match(/^(?:Q(?:uestion)?|Cau|Câu)?\s*(\d{1,3})\s*[\).:-]\s*(.+)$/i)
    if (questionMatch) {
      pushCurrent()
      current = {
        question: questionMatch[2].trim(),
        optionA: '',
        optionB: '',
        optionC: '',
        optionD: '',
        correctOption: 'A',
        explanation: '',
        translation: '',
        tips: '',
        vocabulary: []
      }
      continue
    }

    if (!current) {
      continue
    }

    // Match options: "A. ...", "A) ...", "A: ..."
    const optionMatch = line.match(/^(?:Option\s*)?([ABCD])\s*[\).:-]\s*(.+)$/i)
    if (optionMatch) {
      const key = `option${optionMatch[1].toUpperCase()}` as 'optionA' | 'optionB' | 'optionC' | 'optionD'
      current[key] = optionMatch[2].trim()
      continue
    }

    // Match answers: "Đáp án: A", "Answer: A", "Dap an: A"
    const answerMatch = line.match(/^(?:ANSWER|CORRECT(?:\s*OPTION)?|DAP\s*AN|ĐÁP\s*ÁN|Dap\s*an)\s*[:\-]?\s*([ABCD])\b/i)
    if (answerMatch) {
      current.correctOption = answerMatch[1].toUpperCase()
      continue
    }

    // Match explanation: "Giải thích: ...", "Explanation: ..."
    const explanationMatch = line.match(/^(?:Explanation|Giai\s*thich|Giải\s*thích)\s*[:\-]?\s*(.+)$/i)
    if (explanationMatch) {
      current.explanation = explanationMatch[1].trim()
      continue
    }

    // Match translation: "Dịch nghĩa: ...", "Translation: ..."
    const translationMatch = line.match(/^(?:Translation|Dich\s*nghia|Dịch\s*nghĩa)\s*[:\-]?\s*(.+)$/i)
    if (translationMatch) {
      current.translation = translationMatch[1].trim()
      continue
    }

    // Match tip: "Tip: ...", "Mẹo: ..."
    const tipMatch = line.match(/^(?:Tip|Mẹo|Meo|Mẹo\s*TOEIC)\s*[:\-]?\s*(.*)$/i)
    if (tipMatch) {
      const parsedTip = tipMatch[1].trim()
      current.tips = parsedTip === '(Blank)' ? '' : parsedTip
      continue
    }

    // Match inline vocabulary item: "Vocabulary: policy (n) : chính sách" or "Vocabulary: (Blank)"
    const vocabMatch = line.match(/^(?:Vocabulary|Từ\s*vựng|Tu\s*vung)\s*[:\-]\s*(.*)$/i)
    if (vocabMatch) {
      const vocabStr = vocabMatch[1].trim()
      if (vocabStr === '(Blank)' || !vocabStr) {
        current.vocabulary = []
        continue
      }
      
      const partsMatch = vocabStr.match(/^([^\(:\-]+?)\s*(?:\(([^)]+)\))?\s*[:\-]?\s*(.+)$/)
      if (partsMatch) {
        const typeStr = partsMatch[2] ? `(${partsMatch[2].trim()}) ` : ''
        current.vocabulary = [{
          word: partsMatch[1].trim(),
          meaning: `${typeStr}${partsMatch[3].trim()}`
        }]
      } else {
        // Fallback if they just type "Vocabulary: antique" without meaning
        current.vocabulary = [{ word: vocabStr, meaning: '' }]
      }
      continue
    }

    // Append to either question, explanation, translation or tip if it doesn't match a prefix
    if (current.tips) {
      current.tips += ' ' + line
    } else if (current.translation) {
      current.translation += ' ' + line
    } else if (current.explanation) {
      current.explanation += ' ' + line
    } else if (current.question && !current.optionA) {
      current.question += ' ' + line
    }
  }

  pushCurrent()

  return results
}

function parseTableQuestionsFromHtml(html: string): ExtractedToeicQuestion[] {
  const $ = cheerio.load(html)
  const results: ExtractedToeicQuestion[] = []
  
  $('table').each((_, table) => {
    const rows = $(table).find('tr').toArray()
    if (rows.length < 2) return
    
    // Check if it's the expected format by checking headers or column count
    const headerCells = $(rows[0]).find('td, th').toArray()
    const firstRowText = $(rows[0]).text().toLowerCase()
    if (!firstRowText.includes('đáp án') && !firstRowText.includes('nội dung') && headerCells.length < 5) {
      return // Not the right table
    }

    // Process from the second row (or first row if it has data)
    for (let i = 0; i < rows.length; i++) {
        const cells = $(rows[i]).find('td, th').toArray()
        
        // Skip header row if it seems to be one
        if (i === 0 && (firstRowText.includes('đáp án') || firstRowText.includes('nội dung'))) continue;
        
        if (cells.length >= 6) {
          const correctOptionMatch = $(cells[1]).text().trim().replace(/[^A-D]/gi, '').toUpperCase()
          const correctOption = correctOptionMatch[0] || 'A';
          const questionText = $(cells[2]).text().trim();
          
          if (!questionText) continue;

          // Process options
          const optionsHtml = $(cells[3]).html() || '';
          const optsCleaned = optionsHtml.replace(/<p>/gi, ' ').replace(/<\/p>/gi, ' ').replace(/<br[^>]*>/gi, ' ').replace(/\s+/g, ' ').trim();
          
          const rgxA = /(?:\(A\)|A\.)[.\s:]+([\s\S]*?)(?=\(B\)|B\.|$)/i;
          const rgxB = /(?:\(B\)|B\.)[.\s:]+([\s\S]*?)(?=\(C\)|C\.|$)/i;
          const rgxC = /(?:\(C\)|C\.)[.\s:]+([\s\S]*?)(?=\(D\)|D\.|$)/i;
          const rgxD = /(?:\(D\)|D\.)[.\s:]+([\s\S]*?)$/i;

          const matchA = optsCleaned.match(rgxA);
          const matchB = optsCleaned.match(rgxB);
          const matchC = optsCleaned.match(rgxC);
          const matchD = optsCleaned.match(rgxD);

          const optionA = matchA ? matchA[1].trim() : '';
          const optionB = matchB ? matchB[1].trim() : '';
          const optionC = matchC ? matchC[1].trim() : '';
          const optionD = matchD ? matchD[1].trim() : '';

          // Process translation
          const transHtml = $(cells[4]).html() || '';
          const transCleaned = transHtml.replace(/<p>/gi, ' ').replace(/<\/p>/gi, ' ').replace(/<br[^>]*>/gi, ' ').replace(/\s+/g, ' ').trim();
          
          const transA = transCleaned.match(rgxA);
          const transB = transCleaned.match(rgxB);
          const transC = transCleaned.match(rgxC);
          const transD = transCleaned.match(rgxD);

          let translation = '';
          if (transA && transA[1]) {
             translation = `(A) ${transA[1].trim()}`;
             if (transB && transB[1]) translation += `\n(B) ${transB[1].trim()}`;
             if (transC && transC[1]) translation += `\n(C) ${transC[1].trim()}`;
             if (transD && transD[1]) translation += `\n(D) ${transD[1].trim()}`;
          } else {
             translation = $(cells[4]).text().trim();
          }

          const explanation = $(cells[5]).text().trim();
          let tips = '';
          if (cells.length > 6) {
             tips = $(cells[6]).text().trim();
          }

          results.push({
             question: questionText,
             optionA,
             optionB,
             optionC,
             optionD,
             correctOption,
             explanation,
             translation,
             tips,
             vocabulary: []
          })
        }
    }
  })
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
    
    const htmlParsed = await mammoth.convertToHtml({ buffer })
    const htmlOutput = htmlParsed.value || ''
    
    let questions: ExtractedToeicQuestion[] = []
    
    if (htmlOutput.includes('<table')) {
      questions = parseTableQuestionsFromHtml(htmlOutput)
    }
    
    if (questions.length === 0) {
      const parsed = await mammoth.extractRawText({ buffer })
      const rawText = String(parsed.value || '').trim()

      if (!rawText) {
        return NextResponse.json({ error: 'The file appears to be empty.' }, { status: 400 })
      }

      questions = parseQuestionsFromDocxText(rawText)
    }

    if (questions.length === 0) {
      return NextResponse.json(
        {
          error: 'Không tìm thấy câu hỏi hợp lệ. Vui lòng kiểm tra định dạng bảng hoặc file.',
          debugHtml: htmlOutput.substring(0, 1000)
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
