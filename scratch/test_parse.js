const fs = require('fs');

const text = fs.readFileSync('scratch/test_text.txt', 'utf8');

function parseQuestionsFromDocxText(text) {
  const lines = text
    .replace(/\r/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)

  const results = []
  let current = null

  let inAnswerSection = false;
  let currentGroupNumbers = [];
  let currentGroupVocab = [];
  let currentAnswerQuestion = null; // Track question being explained in answer section

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
    // Check if transitioning to answer section
    if (line.match(/\[Từ vựng.*Đáp án/i)) {
      pushCurrent();
      inAnswerSection = true;
      continue;
    }

    if (inAnswerSection) {
      // 1. Group match like [147-148] or [147 - 150] or [147]
      const groupMatch = line.match(/^\[(\d+)(?:\s*(?:-|–)\s*(\d+))?\]$/);
      if (groupMatch) {
         currentGroupNumbers = [];
         currentGroupVocab = [];
         currentAnswerQuestion = null; // Reset
         const start = parseInt(groupMatch[1]);
         const end = groupMatch[2] ? parseInt(groupMatch[2]) : start;
         for (let i = start; i <= end; i++) {
            currentGroupNumbers.push(i);
         }
         continue;
      }

      // 2. Vocabulary match like "Từ vựng: Component: Thành phần; Overtighten: Siết quá chặt"
      const vocabPrefixMatch = line.match(/^(?:Vocabulary|Từ\s*vựng|Tu\s*vung)\s*[:\-]\s*(.*)$/i);
      if (vocabPrefixMatch) {
         const vocabStr = vocabPrefixMatch[1].trim();
         if (vocabStr) {
             const items = vocabStr.split(';');
             for (const item of items) {
                 const parts = item.split(':');
                 if (parts.length >= 2) {
                     const word = parts[0].trim();
                     const meaning = parts.slice(1).join(':').trim();
                     if (word) {
                         currentGroupVocab.push({ word, meaning });
                     }
                 }
             }
         }
         // Apply this vocab to all questions in the current group
         for (const num of currentGroupNumbers) {
             const q = results.find(q => q.questionNumber === num);
             if (q) {
                 q.vocabulary = [...q.vocabulary, ...currentGroupVocab];
             }
         }
         continue;
      }

      // 3. Answer & Explanation match: "Câu 147. Đáp án (C): Ngay dòng thứ hai..."
      // Regex handling "Câu 147." or "147." followed by "Đáp án (C):" or "Answer (C):" or "Đáp án C:"
      const answerExplanationMatch = line.match(/^(?:Câu|Cau)?\s*(\d{1,3})[.\s]*Đáp\s*án\s*\(?([ABCD])\)?\s*[:\-]\s*(.*)$/i);
      if (answerExplanationMatch) {
          const num = parseInt(answerExplanationMatch[1]);
          const ans = answerExplanationMatch[2].toUpperCase();
          const exp = answerExplanationMatch[3].trim();
          
          const q = results.find(q => q.questionNumber === num);
          if (q) {
              q.correctOption = ans;
              q.explanation = exp;
              currentAnswerQuestion = q;
          }
          continue;
      }
      
      // If none of the above, it might be a continuation of explanation
      if (currentAnswerQuestion) {
          currentAnswerQuestion.explanation += ' ' + line;
      }
      continue;
    }

    // --- NORMAL PARSING (Question section) ---

    // Match question starts: "Câu 147: ...", "147. Where is..."
    // Let's adjust to parse the first sentence properly
    // The previous regex: /^(?:Q(?:uestion)?|Cau|Câu)?\s*(\d{1,3})\s*[\).:-]\s*(.+)$/i
    // Wait, the new format has: "147. Where is the information most likely found? (A) On a door (B) On a receipt (C) In a box (D) On a Web site" -> The options are inline!
    
    // We must handle options that are INLINE. Check if we need a custom function for inline options.
    const questionMatch = line.match(/^(?:Q(?:uestion)?|Cau|Câu)?\s*(\d{1,3})\s*[\).:-]\s*(.+)$/i)
    if (questionMatch) {
      pushCurrent()
      
      let rawText = questionMatch[2].trim();
      let questionText = rawText;
      let optA = '', optB = '', optC = '', optD = '';
      
      // Look for options in the text (A) ... (B) ... (C) ... (D) ...
      const rgxA = /(?:^|\s)(?:\(A\)|A\.|A\))\s+([\s\S]*?)(?=(?:^|\s)(?:\(B\)|B\.|B\))|$)/i;
      const rgxB = /(?:^|\s)(?:\(B\)|B\.|B\))\s+([\s\S]*?)(?=(?:^|\s)(?:\(C\)|C\.|C\))|$)/i;
      const rgxC = /(?:^|\s)(?:\(C\)|C\.|C\))\s+([\s\S]*?)(?=(?:^|\s)(?:\(D\)|D\.|D\))|$)/i;
      const rgxD = /(?:^|\s)(?:\(D\)|D\.|D\))\s+([\s\S]*?)$/i;

      const matchA = rawText.match(rgxA);
      if (matchA) {
         optA = matchA[1].trim();
         questionText = rawText.split(/(?:^|\s)(?:\(A\)|A\.|A\))/i)[0].trim();
         
         const matchB = rawText.match(rgxB);
         if (matchB) optB = matchB[1].trim();
         const matchC = rawText.match(rgxC);
         if (matchC) optC = matchC[1].trim();
         const matchD = rawText.match(rgxD);
         if (matchD) optD = matchD[1].trim();
      }

      current = {
        questionNumber: parseInt(questionMatch[1]),
        question: questionText,
        optionA: optA,
        optionB: optB,
        optionC: optC,
        optionD: optD,
        correctOption: 'A',
        explanation: '',
        translation: '',
        tips: '',
        vocabulary: []
      }
      
      // If we didn't find inline options, wait for them
      continue
    }

    if (!current) {
      continue
    }

    // Match options: "A. ...", "A) ...", "A: ..." 
    // (Only if not inline or if they span multiple lines, but usually they are inline in part 7 docs)
    const optionMatch = line.match(/^(?:Option\s*)?([ABCD])\s*[\).:-]\s*(.+)$/i)
    if (optionMatch) {
      const key = `option${optionMatch[1].toUpperCase()}`
      current[key] = optionMatch[2].trim()
      continue
    }

    // Match answers: "Đáp án: A", "Answer: A"
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

    // Match translation: "Dịch nghĩa: ..." (this line could have inline translated options)
    const translationMatch = line.match(/^(?:Translation|Dich\s*nghia|Dịch\s*nghĩa)\s*[:\-]?\s*(.+)$/i)
    if (translationMatch) {
      // It may contain (A) (B) (C) (D), but usually translation is just shown as text in UI. 
      // User says "có các tính năng dịch nghĩa câu hỏi và câu trả lời"
      // If it contains translated options, let's keep it as the whole translation string, UI will just show it.
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

    // Match inline vocabulary item: "Vocabulary: policy (n) : chính sách" (normal format)
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
        current.vocabulary.push({
          word: partsMatch[1].trim(),
          meaning: `${typeStr}${partsMatch[3].trim()}`
        })
      } else {
        current.vocabulary.push({ word: vocabStr, meaning: '' })
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

console.log(JSON.stringify(parseQuestionsFromDocxText(text), null, 2))
