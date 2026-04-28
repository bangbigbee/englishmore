import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const grammarTopic = "Grammar: Essential Connectors - Từ nối thiết yếu"

  // Create config
  await prisma.vocabularyTopicConfig.upsert({
    where: { topic: grammarTopic },
    update: { packageType: "MIXED" },
    create: { topic: grammarTopic, packageType: "MIXED" }
  });

  const grammarData = [
    {
      word: "Furthermore",
      phonetic: "/ˌfɝː.ðɚˈmɔːr/",
      meaning: "Hơn nữa, ngoài ra",
      example: "The new system is faster. Furthermore, it is much cheaper.",
      exampleVi: "Hệ thống mới nhanh hơn. Hơn nữa, nó còn rẻ hơn nhiều.",
      synonyms: "Moreover, In addition, Besides",
      antonyms: "N/A",
      collocations: "(Đứng đầu câu hoặc sau dấu chấm phẩy)",
      toeicTrap: "Luôn đi kèm dấu phẩy phía sau khi đứng đầu câu. Thường làm đáp án đúng trong Part 6 khi cần nối 2 ý bổ sung cho nhau.",
      displayOrder: 1,
      category: "TOEIC"
    },
    {
      word: "Therefore",
      phonetic: "/ˈðer.fɔːr/",
      meaning: "Vì vậy, do đó",
      example: "He was late; therefore, he missed the meeting.",
      exampleVi: "Anh ấy đến muộn; vì vậy, anh ấy đã bỏ lỡ cuộc họp.",
      synonyms: "Consequently, Thus, Hence",
      antonyms: "N/A",
      collocations: "(Thường đứng sau dấu chấm phẩy và trước dấu phẩy)",
      toeicTrap: "Chỉ kết quả của hành động trước đó. Thường bị bẫy nhầm với 'because' (chỉ nguyên nhân).",
      displayOrder: 2,
      category: "TOEIC"
    },
    {
      word: "However",
      phonetic: "/haʊˈev.ɚ/",
      meaning: "Tuy nhiên",
      example: "The product is excellent. However, the price is too high.",
      exampleVi: "Sản phẩm thì tuyệt vời. Tuy nhiên, giá lại quá cao.",
      synonyms: "Nevertheless, Nonetheless, Yet",
      antonyms: "N/A",
      collocations: "However much / However hard (Dù ... đến đâu)",
      toeicTrap: "Có thể đứng đầu, giữa hoặc cuối câu (ngăn cách bởi dấu phẩy). Dùng để thể hiện sự đối lập cực kỳ phổ biến trong Part 7.",
      displayOrder: 3,
      category: "TOEIC"
    },
    {
      word: "Although",
      phonetic: "/ɑːlˈðoʊ/",
      meaning: "Mặc dù",
      example: "Although it was raining, they still played football.",
      exampleVi: "Mặc dù trời đang mưa, họ vẫn chơi bóng đá.",
      synonyms: "Though, Even though",
      antonyms: "N/A",
      collocations: "Although + Mệnh đề (S + V)",
      toeicTrap: "Luôn cộng với một MỆNH ĐỀ (S+V). Phân biệt rạch ròi với 'Despite/In spite of' (cộng danh từ/V-ing). Đây là bẫy kinh điển Part 5.",
      displayOrder: 4,
      category: "TOEIC"
    },
    {
      word: "Despite",
      phonetic: "/dɪˈspaɪt/",
      meaning: "Mặc dù",
      example: "We won the game despite the bad weather.",
      exampleVi: "Chúng tôi đã thắng trận đấu mặc dù thời tiết xấu.",
      synonyms: "In spite of, Regardless of",
      antonyms: "N/A",
      collocations: "Despite + Danh từ / V-ing",
      toeicTrap: "KHÔNG BAO GIỜ có 'Despite of'. Đã dùng Despite thì không có 'of'. Đã có 'of' thì phải là 'In spite of'.",
      displayOrder: 5,
      category: "TOEIC"
    },
    {
      word: "Consequently",
      phonetic: "/ˈkɑːn.sə.kwənt.li/",
      meaning: "Hậu quả là, do đó",
      example: "The company went bankrupt; consequently, many people lost their jobs.",
      exampleVi: "Công ty đã phá sản; hậu quả là, nhiều người bị mất việc.",
      synonyms: "As a result, Therefore",
      antonyms: "N/A",
      collocations: "(Thường nối 2 mệnh đề có quan hệ nhân - quả)",
      toeicTrap: "Là một trạng từ chỉ kết quả (Conjunctive Adverb). Cách dùng dấu câu y hệt 'Therefore'.",
      displayOrder: 6,
      category: "TOEIC"
    },
    {
      word: "Moreover",
      phonetic: "/mɔːrˈoʊ.vɚ/",
      meaning: "Hơn thế nữa",
      example: "The car is beautiful. Moreover, it is very fuel-efficient.",
      exampleVi: "Chiếc xe rất đẹp. Hơn thế nữa, nó còn rất tiết kiệm nhiên liệu.",
      synonyms: "Furthermore, Additionally",
      antonyms: "N/A",
      collocations: "(Dùng để bổ sung thêm một ý kiến đồng thuận với ý trước đó)",
      toeicTrap: "Được dùng rất nhiều trong thư giới thiệu sản phẩm (Part 6) để liệt kê thêm tính năng tốt.",
      displayOrder: 7,
      category: "TOEIC"
    },
    {
      word: "Nevertheless",
      phonetic: "/ˌnev.ɚ.ðəˈles/",
      meaning: "Tuy nhiên, dẫu vậy",
      example: "He was very tired; nevertheless, he kept working.",
      exampleVi: "Anh ấy rất mệt; tuy nhiên, anh ấy vẫn tiếp tục làm việc.",
      synonyms: "However, Nonetheless",
      antonyms: "N/A",
      collocations: "(Nhấn mạnh sự đối lập mạnh hơn However)",
      toeicTrap: "Nhìn rất dài và có vẻ giống từ nối nhưng nó là một trạng từ. Không được dùng để nối 2 mệnh đề nếu không có dấu phẩy/chấm phẩy.",
      displayOrder: 8,
      category: "TOEIC"
    },
    {
      word: "Unless",
      phonetic: "/ənˈles/",
      meaning: "Trừ khi, nếu không",
      example: "You cannot enter the building unless you have an ID card.",
      exampleVi: "Bạn không thể vào tòa nhà trừ khi bạn có thẻ ID.",
      synonyms: "If not, Except if",
      antonyms: "Provided that, If",
      collocations: "Unless + Mệnh đề khẳng định",
      toeicTrap: "'Unless' bản thân đã mang nghĩa phủ định (= If not), do đó KHÔNG dùng 'unless' đi kèm với mệnh đề phủ định (không có 'unless don't').",
      displayOrder: 9,
      category: "TOEIC"
    },
    {
      word: "Provided that",
      phonetic: "/prəˈvaɪ.dɪd ðæt/",
      meaning: "Miễn là, với điều kiện là",
      example: "You can borrow my car provided that you return it tomorrow.",
      exampleVi: "Bạn có thể mượn xe của tôi với điều kiện là bạn phải trả lại vào ngày mai.",
      synonyms: "As long as, Only if, Providing that",
      antonyms: "Unless",
      collocations: "Provided that + Mệnh đề",
      toeicTrap: "Trong TOEIC Part 5, 'Provided that' thường xuyên là đáp án đúng khi câu mang tính chất đưa ra điều kiện hợp đồng hoặc quy định.",
      displayOrder: 10,
      category: "TOEIC"
    }
  ];

  // Insert Grammar Topic
  await prisma.vocabularyItem.deleteMany({ where: { topic: grammarTopic } });
  for (const item of grammarData) {
    await prisma.vocabularyItem.create({ data: { ...item, topic: grammarTopic, isActive: true } });
    console.log("Added:", item.word);
  }

  console.log("Finished adding topic:", grammarTopic);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
