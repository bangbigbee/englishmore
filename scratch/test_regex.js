const text1 = "(A) To ship some materials.(B) About 10 years old.(C) Company offices, I think.";
const text2 = "(A) A three day vacation (B) At the Riverview Hotel (C) In the supply cabinet";

const regexes = [
  /(?:^|\s|[.,;])(?:\(A\)|A\.|A\))\s*([\s\S]*?)(?=(?:^|\s|[.,;])(?:\(B\)|B\.|B\))|$)/i,
  /(?:^|\s|[.,;])(?:\(B\)|B\.|B\))\s*([\s\S]*?)(?=(?:^|\s|[.,;])(?:\(C\)|C\.|C\))|$)/i,
  /(?:^|\s|[.,;])(?:\(C\)|C\.|C\))\s*([\s\S]*?)(?=(?:^|\s|[.,;])(?:\(D\)|D\.|D\))|$)/i,
  /(?:^|\s|[.,;])(?:\(D\)|D\.|D\))\s*([\s\S]*?)$/i
];

function testMatch(text) {
  console.log("Testing:", text);
  for (let i=0; i<4; i++) {
    const match = text.match(regexes[i]);
    if (match) {
      console.log(String.fromCharCode(65+i), "=>", match[1].trim());
    }
  }
}

testMatch(text1);
testMatch(text2);
