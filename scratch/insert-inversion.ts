import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting insertion...');
  
  // Check if topic already exists to avoid unique constraint errors
  let topic = await prisma.toeicGrammarTopic.findUnique({
    where: { slug: 'cau-dao-ngu' }
  });

  if (!topic) {
    topic = await prisma.toeicGrammarTopic.create({
      data: {
        title: 'Câu Đảo Ngữ (Inversion)',
        subtitle: 'Cấu trúc đảo ngữ thường gặp trong bài thi TOEIC',
        slug: 'cau-dao-ngu',
        level: 'Trung Cấp',
        type: 'GRAMMAR',
        part: 5
      }
    });
    console.log('Created Topic:', topic.title);
  } else {
    console.log('Topic already exists:', topic.title);
  }

  let lesson = await prisma.toeicGrammarLesson.findFirst({ where: { topicId: topic.id, title: 'Bài tập: Câu Đảo Ngữ' }});



  if (!lesson) {
    lesson = await prisma.toeicGrammarLesson.create({
      data: {
        topicId: topic.id,
        title: 'Bài tập: Câu Đảo Ngữ',
        order: 1,
        accessTier: 'FREE',
      }
    });
    console.log('Created Lesson:', lesson.title);
  } else {
    console.log('Lesson already exists:', lesson.title);
    // optionally delete existing questions to replace
    await prisma.toeicQuestion.deleteMany({ where: { lessonId: lesson.id }});
  }

  const questions = [
    {
      question: 'Hardly _____ the office when the phone started ringing.',
      optionA: 'he had reached',
      optionB: 'did he reached',
      optionC: 'had he reached',
      optionD: 'he reached',
      correctOption: 'C',
      explanation: 'Đây là cấu trúc đảo ngữ với "Hardly... when" (Vừa mới... thì). Khi "Hardly" đứng đầu câu, ta phải đảo trợ động từ "had" lên trước chủ ngữ. Công thức: Hardly + had + S + V3/ed + when + S + V2/ed.',
      translation: 'Anh ấy vừa mới tới văn phòng thì điện thoại bắt đầu reo.',
      tips: 'Mẹo: Thấy Hardly/Scarcely/Barely đứng đầu câu -> Chọn đảo ngữ với "had".'
    },
    {
      question: 'Under no circumstances _____ allowed to enter the restricted area.',
      optionA: 'are employees',
      optionB: 'employees are',
      optionC: 'do employees',
      optionD: 'employees do',
      correctOption: 'A',
      explanation: 'Cấu trúc đảo ngữ với cụm từ phủ định "Under no circumstances" (Trong bất kỳ hoàn cảnh nào cũng không). Động từ to be "are" phải được đảo lên trước chủ ngữ "employees". Câu gốc là: Employees are allowed...',
      translation: 'Trong bất kỳ hoàn cảnh nào nhân viên cũng không được phép vào khu vực hạn chế.',
      tips: 'Cụm từ phủ định đứng đầu câu (Under no circumstances, In no way...) -> Theo sau là đảo ngữ.'
    },
    {
      question: 'Not only _____ to the conference, but he also presented a research paper.',
      optionA: 'he went',
      optionB: 'went he',
      optionC: 'did he go',
      optionD: 'has he gone',
      correctOption: 'C',
      explanation: 'Cấu trúc đảo ngữ với "Not only... but also". Khi Not only đứng đầu câu, mệnh đề theo sau phải đảo ngữ. Do vế sau chia thì quá khứ đơn (presented), vế đầu cũng chia quá khứ đơn -> mượn trợ động từ "did".',
      translation: 'Anh ấy không chỉ tham dự hội nghị, mà anh ấy còn trình bày một bài nghiên cứu.',
      tips: 'Not only đứng đầu câu -> Mượn trợ động từ đảo lên trước chủ ngữ.'
    },
    {
      question: 'Only after the manager had signed the document _____ its importance.',
      optionA: 'we realized',
      optionB: 'did we realize',
      optionC: 'we did realize',
      optionD: 'realized we',
      correctOption: 'B',
      explanation: 'Cấu trúc đảo ngữ với "Only after + clause/N". Đảo ngữ sẽ nằm ở mệnh đề chính (mệnh đề phía sau). Vì sự việc đã xảy ra trong quá khứ nên mượn trợ động từ "did".',
      translation: 'Chỉ sau khi người quản lý đã ký tài liệu, chúng tôi mới nhận ra tầm quan trọng của nó.',
      tips: 'Only after/Only when/Only if + Mệnh đề 1 + Đảo ngữ ở Mệnh đề 2.'
    },
    {
      question: 'Seldom _____ such a high level of dedication in new employees.',
      optionA: 'have we seen',
      optionB: 'we have seen',
      optionC: 'we see',
      optionD: 'saw we',
      correctOption: 'A',
      explanation: 'Cấu trúc đảo ngữ với phó từ mang nghĩa phủ định/bán phủ định "Seldom" (Hiếm khi). Thường dùng với thì hiện tại hoàn thành để chỉ trải nghiệm. Đảo "have" lên trước chủ ngữ.',
      translation: 'Hiếm khi chúng tôi thấy mức độ cống hiến cao như vậy ở những nhân viên mới.',
      tips: 'Never/Seldom/Rarely đứng đầu -> Đảo ngữ. Thường hay kết hợp với hiện tại hoàn thành.'
    },
    {
      question: 'No sooner _____ the project than the client requested major changes.',
      optionA: 'they finished',
      optionB: 'they had finished',
      optionC: 'did they finish',
      optionD: 'had they finished',
      correctOption: 'D',
      explanation: 'Cấu trúc đảo ngữ "No sooner... than" (Ngay khi... thì). Vế chứa No sooner chia thì quá khứ hoàn thành và phải đảo ngữ. Công thức: No sooner + had + S + V3/ed + than + S + V2/ed.',
      translation: 'Họ vừa mới hoàn thành dự án thì khách hàng yêu cầu những thay đổi lớn.',
      tips: 'No sooner luôn đi với than. Đứng đầu câu phải đảo ngữ với "had".'
    },
    {
      question: 'Should _____ any further information, please do not hesitate to contact our customer service.',
      optionA: 'you require',
      optionB: 'require you',
      optionC: 'you to require',
      optionD: 'you requiring',
      correctOption: 'A',
      explanation: 'Đây là cấu trúc đảo ngữ của câu điều kiện loại 1. Lược bỏ "If" và đưa "Should" lên đầu câu. Cấu trúc: Should + S + V(nguyên thể).',
      translation: 'Nếu bạn cần thêm bất kỳ thông tin nào, vui lòng đừng ngần ngại liên hệ dịch vụ khách hàng của chúng tôi.',
      tips: 'Câu điều kiện loại 1 đảo ngữ: Should đứng đầu + S + V.'
    },
    {
      question: 'Were the director _____ the true cost of the project, he would cancel it immediately.',
      optionA: 'knowing',
      optionB: 'to know',
      optionC: 'knows',
      optionD: 'knew',
      correctOption: 'B',
      explanation: 'Đây là cấu trúc đảo ngữ câu điều kiện loại 2. Lược bỏ "If", đưa "Were" lên đầu. Nếu câu gốc dùng động từ thường thì cấu trúc đảo ngữ là: Were + S + to V.',
      translation: 'Nếu giám đốc biết chi phí thực sự của dự án, ông ấy sẽ hủy nó ngay lập tức.',
      tips: 'Đảo ngữ câu ĐK loại 2 với động từ thường: Were + S + to V.'
    },
    {
      question: 'Had the management team _____ the market trends, the company would not have lost money.',
      optionA: 'analyze',
      optionB: 'analyzing',
      optionC: 'analyzes',
      optionD: 'analyzed',
      correctOption: 'D',
      explanation: 'Cấu trúc đảo ngữ câu điều kiện loại 3. Đưa "Had" lên trước chủ ngữ. Động từ chính vẫn phải ở dạng quá khứ phân từ (V3/ed).',
      translation: 'Nếu đội ngũ quản lý phân tích xu hướng thị trường, công ty đã không bị lỗ.',
      tips: 'Đảo ngữ loại 3: Had + S + V3/ed.'
    },
    {
      question: 'On no account _____ the password be shared with anyone outside the organization.',
      optionA: 'must',
      optionB: 'should',
      optionC: 'has',
      optionD: 'does',
      correctOption: 'B',
      explanation: 'Cấu trúc đảo ngữ với cụm "On no account" (Tuyệt đối không). Sau nó phải là cấu trúc đảo ngữ. Ở đây động từ chính là "be shared", nên cần một động từ khiếm khuyết mang ý nghĩa khuyên bảo/cấm đoán. Đáp án A (must) cũng hợp nghĩa nhưng thường dùng "should" hoặc "must" trong ngữ cảnh này. Trong đề bài TOEIC, "should" phù hợp nhất khi kết hợp thành "should the password be shared".',
      translation: 'Tuyệt đối không được chia sẻ mật khẩu với bất kỳ ai ngoài tổ chức.',
      tips: 'On no account = Under no circumstances = Tuyệt đối không.'
    }
  ];

  for (const q of questions) {
    await prisma.toeicQuestion.create({
      data: {
        lessonId: lesson.id,
        ...q
      }
    });
  }

  console.log(`Inserted ${questions.length} questions.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
