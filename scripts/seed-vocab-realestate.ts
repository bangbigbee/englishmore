import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // 1. Delete the duplicate topic
  await prisma.vocabularyItem.deleteMany({
    where: { topic: "Chủ đề: Shopping - Mua sắm" }
  });
  console.log("Deleted duplicate topic 'Chủ đề: Shopping - Mua sắm'");

  // 2. Add new topic "Real Estate & Housing - Bất động sản & Nhà ở"
  const topic = "Real Estate & Housing - Bất động sản & Nhà ở"
  
  const vocabData = [
    {
      word: "Tenant",
      phonetic: "/ˈten.ənt/",
      meaning: "Người thuê nhà",
      example: "The new tenant will move in next Monday.",
      exampleVi: "Người thuê nhà mới sẽ chuyển đến vào thứ Hai tới.",
      synonyms: "Renter, Lessee",
      antonyms: "Landlord, Owner",
      collocations: "Current tenant, Evict a tenant",
      toeicTrap: "Chú ý phân biệt 'Tenant' (người đi thuê) và 'Landlord' (chủ nhà).",
      displayOrder: 1,
      category: "BASIC"
    },
    {
      word: "Landlord",
      phonetic: "/ˈlænd.lɔːrd/",
      meaning: "Chủ nhà",
      example: "The landlord is responsible for major repairs.",
      exampleVi: "Chủ nhà chịu trách nhiệm cho những sửa chữa lớn.",
      synonyms: "Owner, Proprietor",
      antonyms: "Tenant",
      collocations: "Contact the landlord, Landlord's permission",
      toeicTrap: "Thường xuất hiện trong các thông báo về tiền thuê nhà hoặc sửa chữa ở Part 7.",
      displayOrder: 2,
      category: "BASIC"
    },
    {
      word: "Lease",
      phonetic: "/liːs/",
      meaning: "Hợp đồng thuê, cho thuê",
      example: "We signed a one-year lease for the apartment.",
      exampleVi: "Chúng tôi đã ký hợp đồng thuê căn hộ một năm.",
      synonyms: "Rental agreement, Contract",
      antonyms: "N/A",
      collocations: "Sign a lease, Renew a lease, Terminate a lease",
      toeicTrap: "Cẩn thận nhầm lẫn phát âm với 'Leave' (rời đi) trong Part 1 và 2.",
      displayOrder: 3,
      category: "ADVANCED"
    },
    {
      word: "Property",
      phonetic: "/ˈprɑː.pɚ.t̬i/",
      meaning: "Bất động sản, tài sản",
      example: "This commercial property is located in the city center.",
      exampleVi: "Bất động sản thương mại này nằm ở trung tâm thành phố.",
      synonyms: "Real estate, Premises",
      antonyms: "N/A",
      collocations: "Commercial property, Residential property",
      toeicTrap: "Có thể mang nghĩa là đồ vật cá nhân (personal property) hoặc đất đai, nhà cửa.",
      displayOrder: 4,
      category: "BASIC"
    },
    {
      word: "Mortgage",
      phonetic: "/ˈmɔːr.ɡɪdʒ/",
      meaning: "Thế chấp, tiền vay thế chấp",
      example: "They took out a 30-year mortgage to buy the house.",
      exampleVi: "Họ đã vay thế chấp 30 năm để mua ngôi nhà.",
      synonyms: "Home loan",
      antonyms: "N/A",
      collocations: "Pay off a mortgage, Mortgage rate",
      toeicTrap: "Chữ 't' là âm câm. Phát âm là /ˈmɔːr.ɡɪdʒ/, không phải /ˈmɔːrt.ɡɪdʒ/.",
      displayOrder: 5,
      category: "ADVANCED"
    },
    {
      word: "Utilities",
      phonetic: "/juːˈtɪl.ə.t̬iz/",
      meaning: "Dịch vụ tiện ích (điện, nước, gas)",
      example: "The rent is $1,200 a month, not including utilities.",
      exampleVi: "Tiền thuê là 1.200 đô la một tháng, không bao gồm điện nước.",
      synonyms: "Public services",
      antonyms: "N/A",
      collocations: "Utility bill, Pay utilities",
      toeicTrap: "Luôn dùng ở dạng số nhiều khi nói về các dịch vụ điện, nước.",
      displayOrder: 6,
      category: "MIXED"
    },
    {
      word: "Spacious",
      phonetic: "/ˈspeɪ.ʃəs/",
      meaning: "Rộng rãi",
      example: "The apartment has a spacious living room.",
      exampleVi: "Căn hộ có một phòng khách rộng rãi.",
      synonyms: "Roomy, Large",
      antonyms: "Cramped, Tiny",
      collocations: "Spacious room, Spacious accommodation",
      toeicTrap: "Tính từ thường được dùng để miêu tả ưu điểm của một căn phòng trong các bài quảng cáo cho thuê.",
      displayOrder: 7,
      category: "BASIC"
    },
    {
      word: "Furnished",
      phonetic: "/ˈfɝː.nɪʃt/",
      meaning: "Được trang bị đồ đạc, nội thất",
      example: "They are looking for a fully furnished apartment.",
      exampleVi: "Họ đang tìm kiếm một căn hộ được trang bị đầy đủ nội thất.",
      synonyms: "Equipped",
      antonyms: "Unfurnished",
      collocations: "Fully furnished, Furnished apartment",
      toeicTrap: "Thường đi kèm với 'fully' hoặc 'partially' trong các tờ rơi quảng cáo nhà đất.",
      displayOrder: 8,
      category: "MIXED"
    },
    {
      word: "Deposit",
      phonetic: "/dɪˈpɑː.zɪt/",
      meaning: "Tiền đặt cọc",
      example: "You must pay a security deposit before moving in.",
      exampleVi: "Bạn phải trả tiền đặt cọc trước khi chuyển đến.",
      synonyms: "Down payment",
      antonyms: "Withdrawal (ngân hàng)",
      collocations: "Security deposit, Make a deposit",
      toeicTrap: "Trong ngữ cảnh bất động sản nghĩa là 'tiền cọc', trong ngân hàng là 'gửi tiền vào'.",
      displayOrder: 9,
      category: "BASIC"
    },
    {
      word: "Evict",
      phonetic: "/ɪˈvɪkt/",
      meaning: "Đuổi ra khỏi nhà (theo pháp luật)",
      example: "The tenant was evicted for not paying rent for three months.",
      exampleVi: "Người thuê nhà đã bị đuổi vì không trả tiền thuê trong ba tháng.",
      synonyms: "Expel, Throw out",
      antonyms: "Admit, Welcome",
      collocations: "Be evicted from, Eviction notice",
      toeicTrap: "Danh từ là 'Eviction', thường xuất hiện trong các văn bản cảnh báo của luật sư/chủ nhà.",
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
