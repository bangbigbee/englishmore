const fs = require('fs');

const text = fs.readFileSync('scratch/test_text_p6.txt', 'utf8');

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
  let currentAnswerQuestion = null;

  const pushCurrent = () => {
    if (!current) return

    if (
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
    if (line.match(/\[(?:Từ vựng|Đáp án).*?(?:Đáp án|Giải thích).*?\]/i) || line.match(/\[.*đáp án.*\]/i)) {
      pushCurrent();
      inAnswerSection = true;
      continue;
    }

    if (inAnswerSection) {
      const groupMatch = line.match(/^\[(\d+)(?:\s*(?:-|–)\s*(\d+))?\]$/) || line.match(/\((\d+)(?:\s*(?:-|–)\s*(\d+))?\)\s*$/);
      if (groupMatch) {
         currentGroupNumbers = [];
         currentGroupVocab = [];
         currentAnswerQuestion = null;
         const start = parseInt(groupMatch[1]);
         const end = groupMatch[2] ? parseInt(groupMatch[2]) : start;
         for (let i = start; i <= end; i++) {
            currentGroupNumbers.push(i);
         }
         continue;
      }

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
         for (const num of currentGroupNumbers) {
             const q = results.find(q => q.questionNumber === num);
             if (q) {
                 q.vocabulary = [...q.vocabulary, ...currentGroupVocab];
             }
         }
         continue;
      }

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
          } else {
             // In case question was not parsed, let's create a stub
             results.push({
                 questionNumber: num,
                 question: '',
                 optionA: '', optionB: '', optionC: '', optionD: '',
                 correctOption: ans,
                 explanation: exp,
                 translation: '', tips: '', vocabulary: []
             })
             currentAnswerQuestion = results[results.length - 1];
          }
          continue;
      }
      
      if (currentAnswerQuestion) {
          currentAnswerQuestion.explanation += '\n' + line;
      }
      continue;
    }

    const questionMatch = line.match(/^(?:Q(?:uestion)?|Cau|Câu)?\s*(\d{1,3})\s*[\).:-]\s*(.+)$/i)
    if (questionMatch) {
      pushCurrent()
      
      let rawText = questionMatch[2].trim();
      let questionText = rawText;
      let optA = '', optB = '', optC = '', optD = '';
      
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
        questionNumber: parseInt(questionMatch[1], 10),
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
      continue
    }

    if (!current) {
      continue
    }

    const optionMatch = line.match(/^(?:Option\s*)?([ABCD])\s*[\).:-]\s*(.+)$/i)
    if (optionMatch) {
      const key = `option${optionMatch[1].toUpperCase()}`
      current[key] = optionMatch[2].trim()
      continue
    }

    const answerMatch = line.match(/^(?:ANSWER|CORRECT(?:\s*OPTION)?|DAP\s*AN|ĐÁP\s*ÁN|Dap\s*an)\s*[:\-]?\s*([ABCD])\b/i)
    if (answerMatch) {
      current.correctOption = answerMatch[1].toUpperCase()
      continue
    }

    const explanationMatch = line.match(/^(?:Explanation|Giai\s*thich|Giải\s*thích)\s*[:\-]?\s*(.+)$/i)
    if (explanationMatch) {
      current.explanation = explanationMatch[1].trim()
      continue
    }

    const translationMatch = line.match(/^(?:Translation|Dich\s*nghia|Dịch\s*nghĩa)\s*[:\-]?\s*(.+)$/i)
    if (translationMatch) {
      current.translation = translationMatch[1].trim()
      continue
    }

    const tipMatch = line.match(/^(?:Tip|Mẹo|Meo|Mẹo\s*TOEIC)\s*[:\-]?\s*(.*)$/i)
    if (tipMatch) {
      const parsedTip = tipMatch[1].trim()
      current.tips = parsedTip === '(Blank)' ? '' : parsedTip
      continue
    }

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

    if (current.tips) {
      current.tips += '\n' + line
    } else if (current.translation) {
      current.translation += '\n' + line
    } else if (current.explanation) {
      current.explanation += '\n' + line
    } else if (current.question && !current.optionA) {
      current.question += '\n' + line
    }
  }

  pushCurrent()

  return results
}

console.log(JSON.stringify(parseQuestionsFromDocxText(text), null, 2))
