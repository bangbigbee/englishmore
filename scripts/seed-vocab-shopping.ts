import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const topic = "Chủ đề: Shopping - Mua sắm"
  
  const vocabData = [
    {
      word: "Purchase",
      phonetic: "/ˈpɝː.tʃəs/",
      meaning: "Mua, sự mua sắm",
      example: "We plan to purchase a new car next year.",
      exampleVi: "Chúng tôi dự định mua một chiếc ô tô mới vào năm tới.",
      synonyms: "Buy, Acquire",
      antonyms: "Sell",
      collocations: "Make a purchase, Purchase order",
      toeicTrap: "Từ này thường gặp ở cả Part 3, 4, 7 với nghĩa là 'mua' hoặc 'hàng hóa được mua'.",
      displayOrder: 1,
      category: "BASIC"
    },
    {
      word: "Receipt",
      phonetic: "/rɪˈsiːt/",
      meaning: "Biên lai, hóa đơn",
      example: "Please keep your receipt as proof of purchase.",
      exampleVi: "Vui lòng giữ lại biên lai làm bằng chứng mua hàng.",
      synonyms: "Proof of purchase, Voucher",
      antonyms: "N/A",
      collocations: "Original receipt, Keep the receipt",
      toeicTrap: "Chữ 'p' là âm câm. Thường xuyên xuất hiện trong ngữ cảnh hoàn trả tiền (refund) trong Part 7.",
      displayOrder: 2,
      category: "BASIC"
    },
    {
      word: "Refund",
      phonetic: "/ˈriː.fʌnd/",
      meaning: "Sự hoàn tiền, trả lại tiền",
      example: "You can get a full refund if the item is defective.",
      exampleVi: "Bạn có thể được hoàn tiền toàn bộ nếu sản phẩm bị lỗi.",
      synonyms: "Reimbursement, Repayment",
      antonyms: "N/A",
      collocations: "Full refund, Demand a refund",
      toeicTrap: "Có thể đóng vai trò vừa là danh từ (nhấn âm 1) vừa là động từ (nhấn âm 2).",
      displayOrder: 3,
      category: "BASIC"
    },
    {
      word: "Warranty",
      phonetic: "/ˈwɔːr.ən.t̬i/",
      meaning: "Giấy bảo hành, sự bảo hành",
      example: "The new laptop comes with a two-year warranty.",
      exampleVi: "Máy tính xách tay mới đi kèm với chế độ bảo hành hai năm.",
      synonyms: "Guarantee",
      antonyms: "N/A",
      collocations: "Under warranty, Extended warranty",
      toeicTrap: "Câu hỏi dạng 'what is included?' thường có đáp án chứa từ này.",
      displayOrder: 4,
      category: "ADVANCED"
    },
    {
      word: "Defective",
      phonetic: "/dɪˈfek.tɪv/",
      meaning: "Bị lỗi, hỏng hóc",
      example: "Please return the defective products to the manufacturer.",
      exampleVi: "Vui lòng trả lại các sản phẩm bị lỗi cho nhà sản xuất.",
      synonyms: "Faulty, Flawed, Broken",
      antonyms: "Perfect, Flawless, Working",
      collocations: "Defective item, Defective merchandise",
      toeicTrap: "Đồng nghĩa với từ 'faulty' - thường bị paraphrase trong Part 7.",
      displayOrder: 5,
      category: "ADVANCED"
    },
    {
      word: "Discount",
      phonetic: "/ˈdɪs.kaʊnt/",
      meaning: "Sự giảm giá, chiết khấu",
      example: "Employees get a 20% discount on all purchases.",
      exampleVi: "Nhân viên được giảm giá 20% cho tất cả các giao dịch mua hàng.",
      synonyms: "Reduction, Deduction",
      antonyms: "Surcharge, Markup",
      collocations: "Offer a discount, Corporate discount",
      toeicTrap: "Có thể được diễn đạt lại bằng cụm 'at a reduced price' hoặc '% off'.",
      displayOrder: 6,
      category: "BASIC"
    },
    {
      word: "Inventory",
      phonetic: "/ˈɪn.vən.tɔːr.i/",
      meaning: "Hàng tồn kho, sự kiểm kê",
      example: "The store will be closed tomorrow for inventory.",
      exampleVi: "Cửa hàng sẽ đóng cửa vào ngày mai để kiểm kê hàng tồn kho.",
      synonyms: "Stock, Supply",
      antonyms: "N/A",
      collocations: "Inventory clearance, Take inventory",
      toeicTrap: "Một trong những từ vựng kinh điển trong Part 3 và 4 về chủ đề Retail.",
      displayOrder: 7,
      category: "ADVANCED"
    },
    {
      word: "Out of stock",
      phonetic: "/aʊt əv stɑːk/",
      meaning: "Hết hàng",
      example: "I am sorry, but this model is currently out of stock.",
      exampleVi: "Tôi rất tiếc, nhưng mẫu này hiện đang hết hàng.",
      synonyms: "Sold out, Unavailable",
      antonyms: "In stock, Available",
      collocations: "Temporarily out of stock",
      toeicTrap: "Được dùng rất nhiều khi khách hàng hỏi mua sản phẩm. Paraphrase thường gặp là 'unavailable at the moment'.",
      displayOrder: 8,
      category: "MIXED"
    },
    {
      word: "Exchange",
      phonetic: "/ɪksˈtʃeɪndʒ/",
      meaning: "Sự trao đổi, đổi hàng",
      example: "Can I exchange this shirt for a larger size?",
      exampleVi: "Tôi có thể đổi chiếc áo này lấy một kích thước lớn hơn được không?",
      synonyms: "Swap, Trade",
      antonyms: "Keep",
      collocations: "Exchange policy, In exchange for",
      toeicTrap: "Phân biệt 'Exchange' (đổi lấy hàng khác) và 'Refund' (trả lại và nhận lại tiền).",
      displayOrder: 9,
      category: "BASIC"
    },
    {
      word: "Merchandise",
      phonetic: "/ˈmɝː.tʃən.daɪz/",
      meaning: "Hàng hóa (nói chung)",
      example: "The store offers a wide variety of merchandise.",
      exampleVi: "Cửa hàng cung cấp đa dạng các loại hàng hóa.",
      synonyms: "Goods, Products, Wares",
      antonyms: "N/A",
      collocations: "Defective merchandise, General merchandise",
      toeicTrap: "Đây là danh từ không đếm được. Không bao giờ dùng 'merchandises'.",
      displayOrder: 10,
      category: "ADVANCED"
    }
  ]

  for (const item of vocabData) {
    await prisma.vocabularyItem.create({
      data: {
        ...item,
        topic,
        isActive: true,
      }
    })
    console.log("Added:", item.word)
  }

  console.log("Finished adding topic:", topic)
}

main()
  .catch(e => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
