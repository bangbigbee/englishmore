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
    const rows = $(table).find('tr').filter((_, tr) => $(tr).closest('table')[0] === table).toArray()
    if (rows.length < 2) return
    
    // Check if it's the expected format by checking headers or column count
    const headerCells = $(rows[0]).children('td, th').toArray()
    const firstRowText = $(rows[0]).text().toLowerCase()
    if (!firstRowText.includes('đáp án') && !firstRowText.includes('nội dung') && headerCells.length < 5) {
      return // Not the right table
    }

    let currentGroupData: any = null;

    // Process from the second row (or first row if it has data)
    for (let i = 0; i < rows.length; i++) {
        const cells = $(rows[i]).children('td, th').toArray()
        
        // Skip header row if it seems to be one
        if (i === 0 && (firstRowText.includes('đáp án') || firstRowText.includes('nội dung') || firstRowText.includes('stt'))) continue;
        
        const stt = $(cells[0]).text().trim().toLowerCase()

        // If this is a conversation context row for Part 3 or Part 4
        if (stt.includes('hội thoại') || stt.includes('đoạn') || stt.includes('talk') || stt.includes('conversation')) {
           currentGroupData = {
              transcriptEng: $(cells[1]).html() || $(cells[1]).text().trim(),
              transcriptViet: $(cells[2]).html() || $(cells[2]).text().trim(),
              vocabularyStr: cells.length > 4 ? $(cells[4]).text().trim() : '',
              explanation: cells.length > 5 ? $(cells[5]).text().trim() : '',
              tips: cells.length > 6 ? $(cells[6]).text().trim() : ''
           };
           continue; // Skip creating a question for this row
        }

        if (cells.length >= 4) {
          const correctOptionMatch = $(cells[3]).text().trim().replace(/[^A-D]/gi, '').toUpperCase()
          const correctOption = correctOptionMatch[0] || 'A';
          const questionText = $(cells[1]).text().trim();
          
          const optionsHtml = $(cells[1]).html() + ' ' + ($(cells[2]).html() || ''); // Search A B C D in col 1 and 2
          const transHtml = $(cells[2]).html() || '';
          
          if (!questionText && !$(cells[1]).text().trim() && !$(cells[2]).text().trim()) continue;

          // Process options
          const optsCleaned = $(cells[1]).text().trim().replace(/\s+/g, ' ');
          
          // Flexible regex to grab (A) or A. or A) inside the question text column
          const rgxA = /(?:\(A\)|A\.|A\))\s+([\s\S]*?)(?=\(B\)|B\.|B\)|$)/i;
          const rgxB = /(?:\(B\)|B\.|B\))\s+([\s\S]*?)(?=\(C\)|C\.|C\)|$)/i;
          const rgxC = /(?:\(C\)|C\.|C\))\s+([\s\S]*?)(?=\(D\)|D\.|D\)|$)/i;
          const rgxD = /(?:\(D\)|D\.|D\))\s+([\s\S]*?)$/i;

          const matchA = optsCleaned.match(rgxA);
          const matchB = optsCleaned.match(rgxB);
          const matchC = optsCleaned.match(rgxC);
          const matchD = optsCleaned.match(rgxD);

          const optionA = matchA ? matchA[1].trim() : '';
          const optionB = matchB ? matchB[1].trim() : '';
          const optionC = matchC ? matchC[1].trim() : '';
          const optionD = matchD ? matchD[1].trim() : '';

          // Clean question text (remove options)
          let finalQuestionText = questionText;
          if (optionA) {
             finalQuestionText = questionText.split(/(?:\(A\)|A\.|A\))/i)[0].trim();
          }

          // Process translation
          const transCleaned = $(cells[2]).text().trim().replace(/\s+/g, ' ');
          
          const transA = transCleaned.match(rgxA);
          const transB = transCleaned.match(rgxB);
          const transC = transCleaned.match(rgxC);
          const transD = transCleaned.match(rgxD);

          let translation = '';
          if (transA && transA[1]) {
             const textBeforeA = transCleaned.split(/(?:\(A\)|A\.|A\))/i)[0].trim();
             if (textBeforeA) {
                 translation = textBeforeA + '\n';
             }
             translation += `(A) ${transA[1].trim()}`;
             if (transB && transB[1]) translation += `\n(B) ${transB[1].trim()}`;
             if (transC && transC[1]) translation += `\n(C) ${transC[1].trim()}`;
             if (transD && transD[1]) translation += `\n(D) ${transD[1].trim()}`;
          } else {
             translation = $(cells[2]).text().trim();
          }

          let finalExplanation = '';
          let finalTips = '';
          let finalVocab: { word: string; meaning: string }[] = [];

          if (currentGroupData) {
             // Merging group conversation context into explanation
             const engText = currentGroupData.transcriptEng.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
             const vietText = currentGroupData.transcriptViet.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
             
             finalExplanation = `[Transcript]\n${engText}\n\n[Dịch nghĩa]\n${vietText}\n\n[Giải thích]\n${currentGroupData.explanation}`;
             finalTips = currentGroupData.tips;

             if (currentGroupData.vocabularyStr) {
                 const lines = currentGroupData.vocabularyStr.split(/\n|<br[^>]*>/gi);
                 for (const line of lines) {
                     const cleaned = line.replace(/<[^>]+>/g, ' ').trim();
                     if (!cleaned) continue;
                     const matchVocab = cleaned.match(/^([^\(:\-]+?)\s*(?:\(([^)]+)\))?\s*[:\-]?\s*(.+)$/);
                     if (matchVocab && matchVocab[1].length < 30) {
                         finalVocab.push({
                             word: matchVocab[1].trim(),
                             meaning: (matchVocab[2] ? `(${matchVocab[2].trim()}) ` : '') + matchVocab[3].trim()
                         });
                     } else {
                         finalVocab.push({ word: cleaned.split(':')[0] || cleaned, meaning: cleaned.split(':').slice(1).join(':').trim() || '' });
                     }
                 }
             }
          } else {
             const vocabRaw = cells.length > 4 ? $(cells[4]).text().trim() : '';
             if (vocabRaw) {
                 const lines = vocabRaw.split(/\n|<br[^>]*>/gi);
                 for (const line of lines) {
                     const cleaned = line.replace(/<[^>]+>/g, '').trim();
                     if (cleaned) {
                        finalVocab.push({ word: cleaned.split(':')[0] || cleaned, meaning: cleaned.split(':').slice(1).join(':').trim() || '' });
                     }
                 }
             }
             finalExplanation = cells.length > 5 ? $(cells[5]).text().trim() : '';
             finalTips = cells.length > 6 ? $(cells[6]).text().trim() : '';
          }

          results.push({
             question: finalQuestionText,
             optionA,
             optionB,
             optionC,
             optionD,
             correctOption,
             explanation: finalExplanation,
             translation,
             tips: finalTips,
             vocabulary: finalVocab
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
