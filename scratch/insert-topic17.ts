import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const easyLesson1 = [
  { question: "The manager had his secretary ________ the report.", optionA: "typing", optionB: "to type", optionC: "type", optionD: "typed", correctOption: "C", explanation: "have sb do sth: nhờ/bảo ai làm gì.", translation: "Người quản lý đã bảo thư ký đánh máy báo cáo.", tips: "have sb + V(nguyên thể)" },
  { question: "I will get the mechanic ________ my car tomorrow.", optionA: "fix", optionB: "to fix", optionC: "fixed", optionD: "fixing", correctOption: "B", explanation: "get sb to do sth: nhờ/thuê ai làm gì.", translation: "Tôi sẽ nhờ thợ cơ khí sửa xe vào ngày mai.", tips: "get sb + to V" },
  { question: "He made his son ________ his room before going out.", optionA: "clean", optionB: "to clean", optionC: "cleaning", optionD: "cleaned", correctOption: "A", explanation: "make sb do sth: bắt ai làm gì.", translation: "Anh ấy bắt con trai dọn phòng trước khi đi ra ngoài.", tips: "make sb + V(nguyên thể)" },
  { question: "My parents never let me ________ out late.", optionA: "stay", optionB: "to stay", optionC: "staying", optionD: "stayed", correctOption: "A", explanation: "let sb do sth: cho phép ai làm gì.", translation: "Bố mẹ tôi không bao giờ cho tôi ở ngoài muộn.", tips: "let sb + V(nguyên thể)" },
  { question: "She helped me ________ my homework.", optionA: "do", optionB: "doing", optionC: "done", optionD: "did", correctOption: "A", explanation: "help sb (to) do sth: giúp ai làm gì.", translation: "Cô ấy đã giúp tôi làm bài tập về nhà.", tips: "help sb + V hoặc to V" },
  { question: "We had the roof ________ last week.", optionA: "repair", optionB: "to repair", optionC: "repairing", optionD: "repaired", correctOption: "D", explanation: "have sth done: có cái gì được làm (bị động).", translation: "Chúng tôi đã sửa lại mái nhà vào tuần trước.", tips: "have sth + PII" },
  { question: "I need to get my hair ________.", optionA: "cut", optionB: "to cut", optionC: "cutting", optionD: "cuts", correctOption: "A", explanation: "get sth done: có cái gì được làm (bị động). 'cut' là động từ bất quy tắc (cut-cut-cut).", translation: "Tôi cần đi cắt tóc.", tips: "get sth + PII" },
  { question: "The teacher made the students ________ the essay.", optionA: "rewrite", optionB: "to rewrite", optionC: "rewriting", optionD: "rewritten", correctOption: "A", explanation: "make sb do sth: bắt ai làm gì.", translation: "Giáo viên bắt học sinh viết lại bài luận.", tips: "make sb + V" },
  { question: "Please let me ________ your pen.", optionA: "borrow", optionB: "to borrow", optionC: "borrowing", optionD: "borrowed", correctOption: "A", explanation: "let sb do sth.", translation: "Làm ơn cho tôi mượn bút của bạn.", tips: "let sb + V" },
  { question: "He got his friend ________ him move the furniture.", optionA: "help", optionB: "to help", optionC: "helping", optionD: "helped", correctOption: "B", explanation: "get sb to do sth.", translation: "Anh ấy đã nhờ bạn bè giúp chuyển đồ đạc.", tips: "get sb + to V" }
];

const easyLesson2 = [
  { question: "I will have my brother ________ my computer.", optionA: "to fix", optionB: "fix", optionC: "fixing", optionD: "fixed", correctOption: "B", explanation: "have sb do sth.", translation: "Tôi sẽ nhờ anh trai sửa máy tính.", tips: "have sb + V" },
  { question: "They got the house ________ before they moved in.", optionA: "paint", optionB: "to paint", optionC: "painting", optionD: "painted", correctOption: "D", explanation: "get sth done.", translation: "Họ đã thuê người sơn nhà trước khi chuyển vào.", tips: "get sth + PII" },
  { question: "The sad movie made her ________.", optionA: "cry", optionB: "crying", optionC: "to cry", optionD: "cried", correctOption: "A", explanation: "make sb do sth.", translation: "Bộ phim buồn đã làm cô ấy khóc.", tips: "make sb + V" },
  { question: "Let him ________ what he wants.", optionA: "to do", optionB: "do", optionC: "doing", optionD: "done", correctOption: "B", explanation: "let sb do sth.", translation: "Hãy để anh ấy làm những gì anh ấy muốn.", tips: "let sb + V" },
  { question: "Can you help me ________ this box?", optionA: "to carrying", optionB: "carried", optionC: "carry", optionD: "carrying", correctOption: "C", explanation: "help sb (to) do sth.", translation: "Bạn có thể giúp tôi bê cái hộp này không?", tips: "help sb + V/to V" },
  { question: "We had the documents ________ into English.", optionA: "translate", optionB: "translating", optionC: "to translate", optionD: "translated", correctOption: "D", explanation: "have sth done.", translation: "Chúng tôi đã cho người dịch các tài liệu sang tiếng Anh.", tips: "have sth + PII" },
  { question: "She always gets her children ________ their hands before meals.", optionA: "wash", optionB: "to wash", optionC: "washing", optionD: "washed", correctOption: "B", explanation: "get sb to do sth.", translation: "Cô ấy luôn bắt bọn trẻ rửa tay trước bữa ăn.", tips: "get sb + to V" },
  { question: "The boss made us ________ overtime yesterday.", optionA: "work", optionB: "to work", optionC: "working", optionD: "worked", correctOption: "A", explanation: "make sb do sth.", translation: "Ông chủ bắt chúng tôi làm thêm giờ vào ngày hôm qua.", tips: "make sb + V" },
  { question: "Don't let the children ________ with matches.", optionA: "play", optionB: "to play", optionC: "playing", optionD: "played", correctOption: "A", explanation: "let sb do sth.", translation: "Đừng để trẻ em chơi với diêm.", tips: "let sb + V" },
  { question: "I got my watch ________ yesterday.", optionA: "repair", optionB: "repairing", optionC: "repaired", optionD: "to repair", correctOption: "C", explanation: "get sth done.", translation: "Tôi đã mang đồng hồ đi sửa ngày hôm qua.", tips: "get sth + PII" }
];

const mediumLesson1 = [
  { question: "The company had a new software ________ to improve efficiency.", optionA: "install", optionB: "to install", optionC: "installing", optionD: "installed", correctOption: "D", explanation: "have sth done.", translation: "Công ty đã cài đặt một phần mềm mới để cải thiện hiệu quả.", tips: "have sth + PII" },
  { question: "We must get someone ________ the air conditioner.", optionA: "fix", optionB: "to fix", optionC: "fixed", optionD: "fixing", correctOption: "B", explanation: "get sb to do sth.", translation: "Chúng ta phải nhờ ai đó sửa máy điều hòa.", tips: "get sb + to V" },
  { question: "The complicated instructions made me ________ confused.", optionA: "feel", optionB: "to feel", optionC: "feeling", optionD: "felt", correctOption: "A", explanation: "make sb do sth.", translation: "Các hướng dẫn phức tạp làm tôi cảm thấy bối rối.", tips: "make sb + V" },
  { question: "She helps the poor ________ reading and writing.", optionA: "learn", optionB: "learning", optionC: "learned", optionD: "learns", correctOption: "A", explanation: "help sb (to) do sth.", translation: "Cô ấy giúp người nghèo học đọc và viết.", tips: "help sb + V" },
  { question: "They wouldn't let me ________ the building without an ID.", optionA: "enter", optionB: "to enter", optionC: "entered", optionD: "entering", correctOption: "A", explanation: "let sb do sth.", translation: "Họ không cho phép tôi vào tòa nhà nếu không có giấy tờ tùy thân.", tips: "let sb + V" },
  { question: "I'm going to have my eyes ________ tomorrow.", optionA: "test", optionB: "to test", optionC: "tested", optionD: "testing", correctOption: "C", explanation: "have sth done.", translation: "Tôi định đi kiểm tra mắt vào ngày mai.", tips: "have sth + PII" },
  { question: "You should get your assistant ________ this report.", optionA: "type", optionB: "to type", optionC: "typed", optionD: "typing", correctOption: "B", explanation: "get sb to do sth.", translation: "Bạn nên bảo trợ lý của mình đánh máy báo cáo này.", tips: "get sb + to V" },
  { question: "His jokes made everyone ________ loudly.", optionA: "laugh", optionB: "to laugh", optionC: "laughing", optionD: "laughed", correctOption: "A", explanation: "make sb do sth.", translation: "Những câu nói đùa của anh ấy làm mọi người cười lớn.", tips: "make sb + V" },
  { question: "Please help me ________ these boxes upstairs.", optionA: "carried", optionB: "carry", optionC: "carrying", optionD: "carries", correctOption: "B", explanation: "help sb (to) do sth.", translation: "Làm ơn giúp tôi mang những chiếc hộp này lên lầu.", tips: "help sb + V" },
  { question: "We got the floors ________ before the guests arrived.", optionA: "clean", optionB: "cleaning", optionC: "to clean", optionD: "cleaned", correctOption: "D", explanation: "get sth done.", translation: "Chúng tôi đã cho lau nhà sạch sẽ trước khi khách đến.", tips: "get sth + PII" }
];

const mediumLesson2 = [
  { question: "He had his wallet ________ while he was on the bus.", optionA: "steal", optionB: "to steal", optionC: "stolen", optionD: "stealing", correctOption: "C", explanation: "have sth done (bị hỏng/mất/làm việc xấu).", translation: "Anh ấy bị trộm ví khi đang ở trên xe buýt.", tips: "have sth + PII (bị làm sao)" },
  { question: "Can you get the printer ________? It's jammed.", optionA: "work", optionB: "to work", optionC: "working", optionD: "worked", correctOption: "B", explanation: "get sth to do sth / get sb to do sth.", translation: "Bạn có thể làm cho máy in hoạt động được không? Nó bị kẹt.", tips: "get sth + to V (làm cho vật gì hoạt động)" },
  { question: "The heavy rain made us ________ the match.", optionA: "cancel", optionB: "to cancel", optionC: "canceled", optionD: "canceling", correctOption: "A", explanation: "make sb do sth.", translation: "Trời mưa to khiến chúng tôi phải hủy trận đấu.", tips: "make sb + V" },
  { question: "She won't let her dog ________ on the sofa.", optionA: "sleep", optionB: "to sleep", optionC: "sleeping", optionD: "slept", correctOption: "A", explanation: "let sb/sth do sth.", translation: "Cô ấy không để chó ngủ trên ghế sofa.", tips: "let sth + V" },
  { question: "I had the gardener ________ the trees yesterday.", optionA: "water", optionB: "to water", optionC: "watered", optionD: "watering", correctOption: "A", explanation: "have sb do sth.", translation: "Tôi đã bảo người làm vườn tưới cây ngày hôm qua.", tips: "have sb + V" },
  { question: "They got the roof ________ after the storm.", optionA: "repair", optionB: "repairing", optionC: "repaired", optionD: "to repair", correctOption: "C", explanation: "get sth done.", translation: "Họ đã thuê người sửa chữa mái nhà sau cơn bão.", tips: "get sth + PII" },
  { question: "This software will help you ________ your files effectively.", optionA: "organize", optionB: "organizing", optionC: "organized", optionD: "organizes", correctOption: "A", explanation: "help sb (to) do sth.", translation: "Phần mềm này sẽ giúp bạn quản lý các tệp hiệu quả.", tips: "help sb + V" },
  { question: "I got my sister ________ my dresses.", optionA: "iron", optionB: "to iron", optionC: "ironed", optionD: "ironing", correctOption: "B", explanation: "get sb to do sth.", translation: "Tôi đã nhờ chị gái là quần áo cho mình.", tips: "get sb + to V" },
  { question: "The teacher made him ________ for his mistake.", optionA: "apologize", optionB: "to apologize", optionC: "apologized", optionD: "apologizing", correctOption: "A", explanation: "make sb do sth.", translation: "Giáo viên bắt anh ấy xin lỗi vì sai lầm của mình.", tips: "make sb + V" },
  { question: "We had our house ________ last year.", optionA: "rebuild", optionB: "to rebuild", optionC: "rebuilt", optionD: "rebuilding", correctOption: "C", explanation: "have sth done.", translation: "Chúng tôi đã xây lại nhà vào năm ngoái.", tips: "have sth + PII" }
];

const hardLesson1 = [
  { question: "If you don't understand, I can get John ________ it to you.", optionA: "explain", optionB: "to explain", optionC: "explained", optionD: "explaining", correctOption: "B", explanation: "get sb to do sth.", translation: "Nếu bạn không hiểu, tôi có thể nhờ John giải thích cho bạn.", tips: "get sb + to V" },
  { question: "The government had a new bridge ________ across the river.", optionA: "build", optionB: "to build", optionC: "building", optionD: "built", correctOption: "D", explanation: "have sth done.", translation: "Chính phủ đã cho xây một cây cầu mới qua sông.", tips: "have sth + PII" },
  { question: "His parents made him ________ his studies seriously.", optionA: "take", optionB: "to take", optionC: "taking", optionD: "took", correctOption: "A", explanation: "make sb do sth.", translation: "Bố mẹ anh ấy bắt anh ấy phải học tập nghiêm túc.", tips: "make sb + V" },
  { question: "They didn't let us ________ pictures inside the museum.", optionA: "take", optionB: "to take", optionC: "taking", optionD: "taken", correctOption: "A", explanation: "let sb do sth.", translation: "Họ không cho chúng tôi chụp ảnh bên trong bảo tàng.", tips: "let sb + V" },
  { question: "I'll have my lawyer ________ the contract before signing it.", optionA: "review", optionB: "to review", optionC: "reviewed", optionD: "reviewing", correctOption: "A", explanation: "have sb do sth.", translation: "Tôi sẽ bảo luật sư của mình xem lại hợp đồng trước khi ký.", tips: "have sb + V" },
  { question: "She got her passport ________ yesterday.", optionA: "renew", optionB: "renewing", optionC: "renewed", optionD: "to renew", correctOption: "C", explanation: "get sth done.", translation: "Cô ấy đã đi gia hạn hộ chiếu ngày hôm qua.", tips: "get sth + PII" },
  { question: "The new medicine helped him ________ quickly.", optionA: "recover", optionB: "recovering", optionC: "recovered", optionD: "recovers", correctOption: "A", explanation: "help sb (to) do sth.", translation: "Loại thuốc mới giúp anh ấy hồi phục nhanh chóng.", tips: "help sb + V" },
  { question: "We must get the plumber ________ the leaking pipe.", optionA: "fix", optionB: "to fix", optionC: "fixed", optionD: "fixing", correctOption: "B", explanation: "get sb to do sth.", translation: "Chúng ta phải gọi thợ sửa ống nước đến sửa ống bị rò rỉ.", tips: "get sb + to V" },
  { question: "The strict rules made the students ________ uncomfortable.", optionA: "feel", optionB: "to feel", optionC: "feeling", optionD: "felt", correctOption: "A", explanation: "make sb do sth.", translation: "Những quy định nghiêm ngặt làm học sinh cảm thấy không thoải mái.", tips: "make sb + V" },
  { question: "I had all my money ________.", optionA: "steal", optionB: "stealing", optionC: "stolen", optionD: "to steal", correctOption: "C", explanation: "have sth done (bị mất).", translation: "Tôi đã bị trộm mất hết tiền.", tips: "have sth + PII" }
];

const hardLesson2 = [
  { question: "He got his assistant ________ all the emails.", optionA: "answer", optionB: "to answer", optionC: "answered", optionD: "answering", correctOption: "B", explanation: "get sb to do sth.", translation: "Anh ấy đã bảo trợ lý trả lời tất cả các email.", tips: "get sb + to V" },
  { question: "We had the house ________ completely before selling it.", optionA: "renovate", optionB: "to renovate", optionC: "renovating", optionD: "renovated", correctOption: "D", explanation: "have sth done.", translation: "Chúng tôi đã cải tạo lại toàn bộ ngôi nhà trước khi bán nó.", tips: "have sth + PII" },
  { question: "The boss made everyone ________ the meeting.", optionA: "attend", optionB: "to attend", optionC: "attending", optionD: "attended", correctOption: "A", explanation: "make sb do sth.", translation: "Sếp bắt mọi người tham dự cuộc họp.", tips: "make sb + V" },
  { question: "Don't let failures ________ you.", optionA: "discourage", optionB: "to discourage", optionC: "discouraged", optionD: "discouraging", correctOption: "A", explanation: "let sb/sth do sth.", translation: "Đừng để thất bại làm bạn nản chí.", tips: "let sth + V" },
  { question: "I will have the porter ________ your luggage to your room.", optionA: "carry", optionB: "to carry", optionC: "carried", optionD: "carrying", correctOption: "A", explanation: "have sb do sth.", translation: "Tôi sẽ bảo người khuân vác mang hành lý lên phòng cho bạn.", tips: "have sb + V" },
  { question: "She got her car ________ after the accident.", optionA: "repair", optionB: "repairing", optionC: "repaired", optionD: "to repair", correctOption: "C", explanation: "get sth done.", translation: "Cô ấy đã mang xe đi sửa sau vụ tai nạn.", tips: "get sth + PII" },
  { question: "This tool helps users ________ data effectively.", optionA: "analyze", optionB: "analyzing", optionC: "analyzed", optionD: "analyzes", correctOption: "A", explanation: "help sb (to) do sth.", translation: "Công cụ này giúp người dùng phân tích dữ liệu hiệu quả.", tips: "help sb + V" },
  { question: "I need to get my teeth ________.", optionA: "check", optionB: "to check", optionC: "checked", optionD: "checking", correctOption: "C", explanation: "get sth done.", translation: "Tôi cần đi kiểm tra răng.", tips: "get sth + PII" },
  { question: "The film made him ________ about his past.", optionA: "think", optionB: "to think", optionC: "thinking", optionD: "thought", correctOption: "A", explanation: "make sb do sth.", translation: "Bộ phim làm anh ấy nghĩ về quá khứ của mình.", tips: "make sb + V" },
  { question: "We had the pizza ________ to our house.", optionA: "deliver", optionB: "to deliver", optionC: "delivering", optionD: "delivered", correctOption: "D", explanation: "have sth done.", translation: "Chúng tôi đã gọi pizza giao đến tận nhà.", tips: "have sth + PII" }
];

async function run() {
  const slug = "dong-tu-gay-nguyen-nhan";
  const title = "17. Động từ gây nguyên nhân (Causative Verbs)";
  
  let topic = await prisma.toeicGrammarTopic.findUnique({ where: { slug } });
  if (topic) {
    console.log("Topic 17 already exists!");
    return;
  }
  
  topic = await prisma.toeicGrammarTopic.create({
    data: {
      title,
      subtitle: "Cấu trúc Have, Get, Make, Let, Help",
      slug,
      level: "Trung Cấp",
      type: "GRAMMAR",
      part: 5
    }
  });

  const lessons = [
    { title: "Bài tập 1 (Dễ)", order: 1, questions: easyLesson1 },
    { title: "Bài tập 2 (Dễ)", order: 2, questions: easyLesson2 },
    { title: "Bài tập 3 (Trung bình)", order: 3, questions: mediumLesson1 },
    { title: "Bài tập 4 (Trung bình)", order: 4, questions: mediumLesson2 },
    { title: "Bài tập 5 (Khó)", order: 5, questions: hardLesson1 },
    { title: "Bài tập 6 (Khó)", order: 6, questions: hardLesson2 },
  ];

  for (const l of lessons) {
    const lesson = await prisma.toeicGrammarLesson.create({
      data: {
        topicId: topic.id,
        title: `${l.title}: Động từ gây nguyên nhân`,
        order: l.order,
        accessTier: 'FREE'
      }
    });

    for (const q of l.questions) {
      await prisma.toeicQuestion.create({
        data: {
          lessonId: lesson.id,
          ...q
        }
      });
    }
  }

  console.log("Created Topic 17: Causative Verbs with 6 lessons (60 questions).");
}

run().catch(console.error).finally(() => prisma.$disconnect());
