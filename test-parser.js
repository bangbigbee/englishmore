const text = \`
Q: The lecture will take place at 6:00 P.M., ------- which attendees may ask questions. A. across B. after C. inside D. among Answer: B Explanation: Cần một giới từ chỉ thời gian phù hợp với ngữ cảnh "sau khi" buổi thuyết trình kết thúc thì người tham gia mới đặt câu hỏi. Translation: Bài thuyết trình sẽ diễn ra lúc 6 giờ tối, sau đó những người tham dự có thể đặt câu hỏi. Tip: Cụm "after which" thường dùng để nối hai sự việc xảy ra kế tiếp nhau. Vocabulary:
- lecture (n): bài thuyết trình, bài giảng 
- attendee (n): người tham dự 
---
Q: The ------- antique shop in Pepper Valley will close down next month. A. last B. lasts C. lasted D. lasting Answer: A Explanation: Cần một tính từ đứng trước cụm danh từ "antique shop" để xác định. "Last" ở đây đóng vai trò tính từ mang nghĩa "cuối cùng". Translation: Cửa hàng đồ cổ cuối cùng ở Thung lũng Pepper sẽ đóng cửa vào tháng tới. Tip: (Blank) Vocabulary:
- antique (adj/n): đồ cổ 
- close down (phr.v): đóng cửa, ngừng kinh doanh 
---
\`;

function parseQuestionsFromDocxText(text) {
  const blocks = text.split(/---+/);
  const results = [];

  for (const block of blocks) {
    const trimmed = block.trim();
    if (!trimmed) continue;

    // We can extract parts by progressively matching and removing them from the text,
    // or by matching with regex.
    // It's safer to extract from end to beginning because Vocabulary, Tip, Translation, Explanation, Answer, D, C, B, A, Q are in order?
    // Wait, let's use matchers.
    
    // Extract Vocabulary block
    let vocabBlock = '';
    let textWithoutVocab = trimmed;
    const vocabMatch = trimmed.match(/(?:Vocabulary|Từ\s*vựng|Tu\s*vung)\s*[:\-]?\s*([\s\S]*)$/i);
    if (vocabMatch) {
        vocabBlock = vocabMatch[1];
        textWithoutVocab = trimmed.substring(0, vocabMatch.index).trim();
    }

    // Now extract Vocabulary items from vocabBlock
    const vocabulary = [];
    if (vocabBlock) {
        const vocabLines = vocabBlock.split('\\n');
        for (const line of vocabLines) {
            const vMatch = line.match(/^\\-\\s*([^\\(:\\-]+?)\\s*(?:\\(([^)]+)\\))?\\s*[:\\-]\\s*(.+)$/);
            if (vMatch) {
                const typeStr = vMatch[2] ? \`(\${vMatch[2].trim()}) \` : '';
                vocabulary.push({
                    word: vMatch[1].trim(),
                    meaning: \`\${typeStr}\${vMatch[3].trim()}\`
                });
            }
        }
    }

    // Extract Tip
    let tipBlock = '';
    let textWithoutTip = textWithoutVocab;
    const tipMatch = textWithoutVocab.match(/(?:Tip|Mẹo|Meo|Mẹo\s*TOEIC)\s*[:\-]?\s*([\s\S]*)$/i);
    if (tipMatch) {
        tipBlock = tipMatch[1].trim();
        textWithoutTip = textWithoutVocab.substring(0, tipMatch.index).trim();
    }

    // Extract Translation
    let transBlock = '';
    let textWithoutTrans = textWithoutTip;
    const transMatch = textWithoutTip.match(/(?:Translation|Dich\s*nghia|Dịch\s*nghĩa)\s*[:\-]?\s*([\s\S]*)$/i);
    if (transMatch) {
        transBlock = transMatch[1].trim();
        textWithoutTrans = textWithoutTip.substring(0, transMatch.index).trim();
    }

    // Extract Explanation
    let expBlock = '';
    let textWithoutExp = textWithoutTrans;
    const expMatch = textWithoutTrans.match(/(?:Explanation|Giai\s*thich|Giải\s*thích)\s*[:\-]?\s*([\s\S]*)$/i);
    if (expMatch) {
        expBlock = expMatch[1].trim();
        textWithoutExp = textWithoutTrans.substring(0, expMatch.index).trim();
    }

    // Extract Answer
    let ansBlock = 'A';
    let textWithoutAns = textWithoutExp;
    const ansMatch = textWithoutExp.match(/(?:ANSWER|CORRECT(?:\\s*OPTION)?|DAP\\s*AN|ĐÁP\\s*ÁN|Dap\\s*an)\\s*[:\\-]?\\s*([ABCD])\\b/i);
    if (ansMatch) {
        ansBlock = ansMatch[1].toUpperCase();
        textWithoutAns = textWithoutExp.substring(0, ansMatch.index).trim();
    }

    // Now textWithoutAns contains Question and Options A B C D.
    // E.g. "Q: The lecture ... A. across B. after C. inside D. among"
    // Let's extract D
    let optD = '';
    let textWithoutD = textWithoutAns;
    const dMatch = textWithoutAns.match(/(?:Option\s*)?D\s*[\).:-]\s*([\s\S]*)$/i);
    if (dMatch) {
        optD = dMatch[1].trim();
        textWithoutD = textWithoutAns.substring(0, dMatch.index).trim();
    }

    let optC = '';
    let textWithoutC = textWithoutD;
    const cMatch = textWithoutD.match(/(?:Option\s*)?C\s*[\).:-]\s*([\s\S]*)$/i);
    if (cMatch) {
        optC = cMatch[1].trim();
        textWithoutC = textWithoutD.substring(0, cMatch.index).trim();
    }

    let optB = '';
    let textWithoutB = textWithoutC;
    const bMatch = textWithoutC.match(/(?:Option\s*)?B\s*[\).:-]\s*([\s\S]*)$/i);
    if (bMatch) {
        optB = bMatch[1].trim();
        textWithoutB = textWithoutC.substring(0, bMatch.index).trim();
    }

    let optA = '';
    let textWithoutA = textWithoutB;
    const aMatch = textWithoutB.match(/(?:Option\s*)?A\s*[\).:-]\s*([\s\S]*)$/i);
    if (aMatch) {
        optA = aMatch[1].trim();
        textWithoutA = textWithoutB.substring(0, aMatch.index).trim();
    }

    // The rest is the question!
    let question = textWithoutA.replace(/^(?:Q(?:uestion)?|Cau|Câu)?\s*(\d{1,3})?\s*[\).:-]?\s*/i, '').trim();

    if (question && optA && optB && optC) {
        results.push({
            question,
            optionA: optA,
            optionB: optB,
            optionC: optC,
            optionD: optD,
            correctOption: ansBlock,
            explanation: expBlock,
            translation: transBlock,
            tips: tipBlock === '(Blank)' ? '' : tipBlock,
            vocabulary
        });
    } else {
        console.log("Failed to parse block:", { question, optA, optB, optC });
    }
  }

  return results;
}

console.log(JSON.stringify(parseQuestionsFromDocxText(text), null, 2));
