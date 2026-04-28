import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const manufacturingTopic = "Manufacturing & Production - Sản xuất & Chế tạo"
  const itTopic = "IT & Computers - Công nghệ thông tin"

  // Create config for both
  await prisma.vocabularyTopicConfig.upsert({
    where: { topic: manufacturingTopic },
    update: { packageType: "ADVANCED" },
    create: { topic: manufacturingTopic, packageType: "ADVANCED" }
  });

  await prisma.vocabularyTopicConfig.upsert({
    where: { topic: itTopic },
    update: { packageType: "MIXED" },
    create: { topic: itTopic, packageType: "MIXED" }
  });

  const mfgData = [
    {
      word: "Assemble",
      phonetic: "/əˈsem.bəl/",
      meaning: "Lắp ráp",
      example: "It takes about two hours to assemble the machine.",
      exampleVi: "Mất khoảng hai giờ để lắp ráp xong chiếc máy này.",
      synonyms: "Put together, Build",
      antonyms: "Dismantle, Take apart",
      collocations: "Assembly line, Assemble parts",
      toeicTrap: "Danh từ 'Assembly' không chỉ nghĩa là sự lắp ráp mà còn mang nghĩa là 'cuộc họp/hội đồng'.",
      displayOrder: 1,
      category: "TOEIC"
    },
    {
      word: "Defect",
      phonetic: "/ˈdiː.fekt/",
      meaning: "Lỗi, khuyết điểm (sản phẩm)",
      example: "The whole batch was recalled due to a manufacturing defect.",
      exampleVi: "Toàn bộ lô hàng đã bị thu hồi do một lỗi sản xuất.",
      synonyms: "Flaw, Fault, Imperfection",
      antonyms: "Perfection",
      collocations: "Manufacturing defect, Zero defects",
      toeicTrap: "Tính từ 'Defective' (bị lỗi) cực kỳ hay xuất hiện trong các bài email khiếu nại (Part 7).",
      displayOrder: 2,
      category: "TOEIC"
    },
    {
      word: "Inspect",
      phonetic: "/ɪnˈspekt/",
      meaning: "Kiểm tra, thanh tra",
      example: "A quality control officer will inspect the products.",
      exampleVi: "Một nhân viên kiểm soát chất lượng sẽ thanh tra các sản phẩm.",
      synonyms: "Examine, Check",
      antonyms: "Ignore",
      collocations: "Inspect for damage, Regular inspection",
      toeicTrap: "Thường đi kèm với cụm từ 'Quality control' (Kiểm soát chất lượng).",
      displayOrder: 3,
      category: "TOEIC"
    },
    {
      word: "Mass production",
      phonetic: "/ˌmæs prəˈdʌk.ʃən/",
      meaning: "Sản xuất hàng loạt",
      example: "Mass production has significantly reduced the cost of electronics.",
      exampleVi: "Sản xuất hàng loạt đã làm giảm đáng kể giá thành của đồ điện tử.",
      synonyms: "Large-scale production",
      antonyms: "Custom production",
      collocations: "Begin mass production",
      toeicTrap: "Từ này thường được dùng làm bối cảnh cho các đoạn hội thoại về nhà máy trong Part 3.",
      displayOrder: 4,
      category: "TOEIC"
    },
    {
      word: "Raw materials",
      phonetic: "/ˌrɑː məˈtɪr.i.əlz/",
      meaning: "Nguyên liệu thô",
      example: "The factory imports raw materials from overseas.",
      exampleVi: "Nhà máy nhập khẩu nguyên liệu thô từ nước ngoài.",
      synonyms: "Unprocessed materials",
      antonyms: "Finished goods",
      collocations: "Shortage of raw materials",
      toeicTrap: "Cẩn thận nhầm lẫn với 'Finished goods' (thành phẩm).",
      displayOrder: 5,
      category: "TOEIC"
    },
    {
      word: "Shift",
      phonetic: "/ʃɪft/",
      meaning: "Ca làm việc",
      example: "I am scheduled to work the night shift this week.",
      exampleVi: "Tôi được xếp lịch làm ca đêm trong tuần này.",
      synonyms: "Working hours",
      antonyms: "N/A",
      collocations: "Night shift, Day shift, Cover a shift",
      toeicTrap: "Đừng nhầm với nghĩa động từ là 'di chuyển/dịch chuyển'. Trong TOEIC, thường mang nghĩa 'ca làm việc'.",
      displayOrder: 6,
      category: "TOEIC"
    },
    {
      word: "Output",
      phonetic: "/ˈaʊt.pʊt/",
      meaning: "Sản lượng, đầu ra",
      example: "The new machinery will increase our daily output.",
      exampleVi: "Hệ thống máy móc mới sẽ làm tăng sản lượng hàng ngày của chúng ta.",
      synonyms: "Production, Yield",
      antonyms: "Input",
      collocations: "Increase output, Maximum output",
      toeicTrap: "Danh từ này không đếm được trong hầu hết các ngữ cảnh của TOEIC.",
      displayOrder: 7,
      category: "TOEIC"
    },
    {
      word: "Specification",
      phonetic: "/ˌspes.ə.fəˈkeɪ.ʃən/",
      meaning: "Thông số kỹ thuật, yêu cầu kỹ thuật",
      example: "The parts must be made exactly to the client's specifications.",
      exampleVi: "Các bộ phận phải được chế tạo chính xác theo yêu cầu kỹ thuật của khách hàng.",
      synonyms: "Requirement, Standard",
      antonyms: "N/A",
      collocations: "Meet specifications, Exact specifications",
      toeicTrap: "Thường được viết tắt là 'Specs'.",
      displayOrder: 8,
      category: "TOEIC"
    },
    {
      word: "Facility",
      phonetic: "/fəˈsɪl.ə.t̬i/",
      meaning: "Cơ sở vật chất, nhà máy",
      example: "We are building a new manufacturing facility in Texas.",
      exampleVi: "Chúng tôi đang xây dựng một nhà máy sản xuất mới ở Texas.",
      synonyms: "Plant, Building",
      antonyms: "N/A",
      collocations: "Production facility, State-of-the-art facility",
      toeicTrap: "Đây là một từ rất 'đa năng', có thể chỉ nhà máy, phòng tập, bệnh viện tùy theo ngữ cảnh.",
      displayOrder: 9,
      category: "TOEIC"
    },
    {
      word: "Comply",
      phonetic: "/kəmˈplaɪ/",
      meaning: "Tuân thủ (quy định, luật lệ)",
      example: "All factory workers must comply with safety regulations.",
      exampleVi: "Tất cả công nhân nhà máy phải tuân thủ các quy định về an toàn.",
      synonyms: "Obey, Adhere to, Follow",
      antonyms: "Violate, Disobey",
      collocations: "Comply with, In compliance with",
      toeicTrap: "Luôn luôn đi kèm với giới từ 'with'. Danh từ là 'Compliance'.",
      displayOrder: 10,
      category: "TOEIC"
    }
  ];

  const itData = [
    {
      word: "Troubleshoot",
      phonetic: "/ˈtrʌb.əl.ʃuːt/",
      meaning: "Khắc phục sự cố",
      example: "The IT department is troubleshooting the network issue.",
      exampleVi: "Bộ phận CNTT đang khắc phục sự cố mạng.",
      synonyms: "Fix, Repair, Resolve",
      antonyms: "N/A",
      collocations: "Troubleshoot a problem",
      toeicTrap: "Thường xuất hiện trong Part 3 khi một người báo cáo lỗi máy tính cho kỹ thuật viên.",
      displayOrder: 1,
      category: "TOEIC"
    },
    {
      word: "Upgrade",
      phonetic: "/ˈʌp.ɡreɪd/",
      meaning: "Nâng cấp",
      example: "We need to upgrade our software to the latest version.",
      exampleVi: "Chúng ta cần nâng cấp phần mềm lên phiên bản mới nhất.",
      synonyms: "Update, Improve",
      antonyms: "Downgrade",
      collocations: "System upgrade, Free upgrade",
      toeicTrap: "Có thể là động từ (nhấn âm 2) hoặc danh từ (nhấn âm 1).",
      displayOrder: 2,
      category: "TOEIC"
    },
    {
      word: "Compatible",
      phonetic: "/kəmˈpæt̬.ə.bəl/",
      meaning: "Tương thích",
      example: "This app is not compatible with older operating systems.",
      exampleVi: "Ứng dụng này không tương thích với các hệ điều hành cũ hơn.",
      synonyms: "Well-suited, Matching",
      antonyms: "Incompatible",
      collocations: "Compatible with",
      toeicTrap: "Giới từ đi kèm luôn là 'with'. Rất hay bị đục lỗ phần giới từ trong Part 5.",
      displayOrder: 3,
      category: "TOEIC"
    },
    {
      word: "Server",
      phonetic: "/ˈsɝː.vɚ/",
      meaning: "Máy chủ",
      example: "The website is down because the server crashed.",
      exampleVi: "Trang web bị sập vì máy chủ đã gặp sự cố.",
      synonyms: "Host computer",
      antonyms: "N/A",
      collocations: "Server crash, Secure server",
      toeicTrap: "Đừng nhầm lẫn với từ 'Server' (người bồi bàn) trong chủ đề nhà hàng.",
      displayOrder: 4,
      category: "TOEIC"
    },
    {
      word: "Backup",
      phonetic: "/ˈbæk.ʌp/",
      meaning: "Bản sao lưu / Dự phòng",
      example: "Make sure you have a backup of all your important files.",
      exampleVi: "Hãy đảm bảo bạn có một bản sao lưu của tất cả các tệp quan trọng.",
      synonyms: "Copy, Reserve",
      antonyms: "N/A",
      collocations: "Data backup, Create a backup",
      toeicTrap: "Viết liền 'backup' là danh từ/tính từ, viết rời 'back up' là động từ.",
      displayOrder: 5,
      category: "TOEIC"
    },
    {
      word: "Outage",
      phonetic: "/ˈaʊ.t̬ɪdʒ/",
      meaning: "Sự cúp điện, gián đoạn dịch vụ",
      example: "There was a power outage that lasted for three hours.",
      exampleVi: "Đã có một đợt cúp điện kéo dài trong ba giờ.",
      synonyms: "Interruption, Blackout",
      antonyms: "N/A",
      collocations: "Power outage, Network outage",
      toeicTrap: "Từ rất thường gặp trong email thông báo bảo trì định kỳ ở Part 7.",
      displayOrder: 6,
      category: "TOEIC"
    },
    {
      word: "Install",
      phonetic: "/ɪnˈstɑːl/",
      meaning: "Cài đặt, lắp đặt",
      example: "The technician will install the new router tomorrow.",
      exampleVi: "Kỹ thuật viên sẽ lắp đặt bộ định tuyến mới vào ngày mai.",
      synonyms: "Set up, Put in",
      antonyms: "Uninstall, Remove",
      collocations: "Install software, Installation process",
      toeicTrap: "Danh từ 'Installation' cũng có nghĩa là 'một tác phẩm nghệ thuật sắp đặt'.",
      displayOrder: 7,
      category: "TOEIC"
    },
    {
      word: "Malfunction",
      phonetic: "/ˌmælˈfʌŋk.ʃən/",
      meaning: "Sự trục trặc, hoạt động sai",
      example: "The printer is experiencing a technical malfunction.",
      exampleVi: "Máy in đang gặp phải một trục trặc kỹ thuật.",
      synonyms: "Breakdown, Failure",
      antonyms: "N/A",
      collocations: "Equipment malfunction",
      toeicTrap: "Có thể dùng như một động từ (ví dụ: the system malfunctioned).",
      displayOrder: 8,
      category: "TOEIC"
    },
    {
      word: "Credential",
      phonetic: "/krɪˈden.ʃəl/",
      meaning: "Thông tin đăng nhập, chứng chỉ",
      example: "Please enter your login credentials to access the system.",
      exampleVi: "Vui lòng nhập thông tin đăng nhập của bạn để truy cập hệ thống.",
      synonyms: "Login details, Qualifications",
      antonyms: "N/A",
      collocations: "Login credentials, Academic credentials",
      toeicTrap: "Trong TOEIC, từ này có thể chỉ 'chứng chỉ năng lực' của một người khi xin việc, hoặc 'tài khoản đăng nhập' IT.",
      displayOrder: 9,
      category: "TOEIC"
    },
    {
      word: "Manual",
      phonetic: "/ˈmæn.ju.əl/",
      meaning: "Sách hướng dẫn sử dụng / Bằng tay",
      example: "Please refer to the user manual for troubleshooting steps.",
      exampleVi: "Vui lòng tham khảo sách hướng dẫn sử dụng để biết các bước khắc phục sự cố.",
      synonyms: "Guidebook, Instructions",
      antonyms: "Automatic (nếu là tính từ)",
      collocations: "User manual, Instruction manual",
      toeicTrap: "Phân biệt nghĩa Danh từ (sách hướng dẫn) và Tính từ (làm bằng tay - manual labor).",
      displayOrder: 10,
      category: "TOEIC"
    }
  ];

  // Insert Manufacturing
  await prisma.vocabularyItem.deleteMany({ where: { topic: manufacturingTopic } });
  for (const item of mfgData) {
    await prisma.vocabularyItem.create({ data: { ...item, topic: manufacturingTopic, isActive: true } });
    console.log("Added:", item.word);
  }
  
  // Insert IT
  await prisma.vocabularyItem.deleteMany({ where: { topic: itTopic } });
  for (const item of itData) {
    await prisma.vocabularyItem.create({ data: { ...item, topic: itTopic, isActive: true } });
    console.log("Added:", item.word);
  }

  console.log("Finished adding both topics!");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
