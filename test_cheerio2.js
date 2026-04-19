const cheerio = require('cheerio');
const html = `<table border='1'>
<tr><td>STT</td><td>Đáp án</td><td>Nội dung câu hỏi (Script)</td><td>Các lựa chọn đáp án</td><td>Dịch nghĩa</td><td>Giải thích</td><td>TOEIC tip</td></tr>
<tr>
  <td>7</td>
  <td>A</td>
  <td>How much is a taxi to the train station?</td>
  <td>(A) About twenty dollars.<br>(B) A ticket to London.<br>(C) Usually at 6 o'clock.</td>
  <td>Giá đi taxi đến nhà ga là bao nhiêu?<br>(A) Khoảng 20 đô.<br>(B) Vé tới Luân đôn.<br>(C) Thường lúc 6h.</td>
  <td>Giải thích abc</td>
  <td>Mẹo: xyz</td>
</tr>
</table>`;

function parseTableQuestionsFromHtml(html) {
  const $ = cheerio.load(html)
  const results = []
  
  $('table').each((_, table) => {
    const rows = $(table).find('tr').toArray()
    if (rows.length < 2) return
    
    // Check if it's the expected format by checking headers
    const firstRowText = $(rows[0]).text().toLowerCase()
    console.log('firstRowText:', firstRowText)
    if (!firstRowText.includes('đáp án') || !firstRowText.includes('nội dung')) {
      console.log('Header mismatch!');
      return // Not the right table
    }

    // Process from the second row
    for (let i = 1; i < rows.length; i++) {
        const cells = $(rows[i]).find('td').toArray()
        if (cells.length >= 6) {
          const correctOption = $(cells[1]).text().trim().replace(/[^A-D]/gi, '').toUpperCase()[0] || 'A';
          const questionText = $(cells[2]).text().trim();
          
          if (!questionText) continue;

          // Process options
          const optionsHtml = $(cells[3]).html() || '';
          const optsCleaned = optionsHtml.replace(/<p>/gi, ' ').replace(/<\/p>/gi, ' ').replace(/<br[^>]*>/gi, ' ').replace(/\s+/g, ' ').trim();
          
          console.log('optsCleaned:', optsCleaned)
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
             
             // Prepend the first sentence of translation as well if it's there
             let firstLine = transHtml.split(/<br[^>]*>/i)[0].replace(/<[^>]*>?/gm, '').trim();
             if (firstLine && !firstLine.match(/^(?:\(A\)|A\.)/i)) {
                translation = firstLine + '\n' + translation;
             }
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
             optionA, optionB, optionC, optionD,
             correctOption,
             explanation, translation, tips
          })
        }
    }
  })
  return results
}

console.dir(parseTableQuestionsFromHtml(html), {depth: null})
