import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const easyLesson1 = [
  { question: "I like coffee, ________ my brother prefers tea.", optionA: "and", optionB: "but", optionC: "so", optionD: "or", correctOption: "B", explanation: "Hai vế đối lập (thích cà phê >< thích trà) -> dùng but (nhưng).", translation: "Tôi thích cà phê, nhưng anh trai tôi thích trà.", tips: "Đối lập -> but" },
  { question: "She was tired, ________ she went to bed early.", optionA: "so", optionB: "because", optionC: "but", optionD: "or", correctOption: "A", explanation: "Chỉ kết quả (vì mệt nên đi ngủ sớm) -> dùng so (vì vậy).", translation: "Cô ấy mệt, vì vậy cô ấy đi ngủ sớm.", tips: "Kết quả -> so" },
  { question: "Would you like tea ________ coffee?", optionA: "and", optionB: "but", optionC: "or", optionD: "so", correctOption: "C", explanation: "Đưa ra sự lựa chọn -> dùng or (hoặc).", translation: "Bạn muốn dùng trà hay cà phê?", tips: "Lựa chọn -> or" },
  { question: "He didn't go to school ________ he was sick.", optionA: "because", optionB: "so", optionC: "but", optionD: "and", correctOption: "A", explanation: "Chỉ nguyên nhân -> dùng because (bởi vì).", translation: "Anh ấy không đi học vì anh ấy bị ốm.", tips: "Nguyên nhân -> because" },
  { question: "I can speak English ________ French.", optionA: "so", optionB: "and", optionC: "but", optionD: "because", correctOption: "B", explanation: "Bổ sung thông tin -> dùng and (và).", translation: "Tôi có thể nói tiếng Anh và tiếng Pháp.", tips: "Bổ sung -> and" },
  { question: "________ it rained heavily, we still played football.", optionA: "Because", optionB: "Although", optionC: "So", optionD: "But", correctOption: "B", explanation: "Hai vế tương phản (mưa to nhưng vẫn chơi) -> dùng Although (mặc dù).", translation: "Mặc dù trời mưa to, chúng tôi vẫn chơi bóng đá.", tips: "Tương phản -> Although" },
  { question: "Hurry up, ________ you will miss the bus.", optionA: "and", optionB: "or", optionC: "so", optionD: "but", correctOption: "B", explanation: "Dùng or với nghĩa 'nếu không thì'.", translation: "Nhanh lên, nếu không bạn sẽ lỡ chuyến xe buýt.", tips: "Nếu không thì -> or" },
  { question: "I bought a pen ________ a notebook.", optionA: "and", optionB: "so", optionC: "because", optionD: "but", correctOption: "A", explanation: "Liệt kê bổ sung -> dùng and.", translation: "Tôi đã mua một cái bút và một quyển vở.", tips: "Liệt kê -> and" },
  { question: "She is smart ________ lazy.", optionA: "so", optionB: "because", optionC: "and", optionD: "but", correctOption: "D", explanation: "Hai tính từ trái ngược nhau (thông minh >< lười biếng) -> dùng but.", translation: "Cô ấy thông minh nhưng lười biếng.", tips: "Trái ngược -> but" },
  { question: "We stayed at home ________ the weather was bad.", optionA: "because", optionB: "although", optionC: "so", optionD: "but", correctOption: "A", explanation: "Nguyên nhân của việc ở nhà -> because.", translation: "Chúng tôi ở nhà vì thời tiết xấu.", tips: "Nguyên nhân -> because" }
];

const easyLesson2 = [
  { question: "I will call you ________ I arrive at the station.", optionA: "when", optionB: "because", optionC: "so", optionD: "but", correctOption: "A", explanation: "Chỉ thời gian -> dùng when (khi).", translation: "Tôi sẽ gọi cho bạn khi tôi đến nhà ga.", tips: "Thời gian -> when" },
  { question: "She loves reading books, ________ she has a huge library.", optionA: "because", optionB: "so", optionC: "but", optionD: "or", correctOption: "B", explanation: "Chỉ kết quả (vì thích đọc sách nên có thư viện lớn) -> so.", translation: "Cô ấy thích đọc sách, vì vậy cô ấy có một thư viện khổng lồ.", tips: "Kết quả -> so" },
  { question: "You can watch TV ________ do your homework first.", optionA: "but", optionB: "and", optionC: "so", optionD: "because", correctOption: "A", explanation: "Điều kiện tương phản (có thể xem TV nhưng phải làm bài tập trước) -> but.", translation: "Bạn có thể xem TV nhưng phải làm bài tập về nhà trước.", tips: "Tương phản điều kiện -> but" },
  { question: "He is both intelligent ________ hardworking.", optionA: "or", optionB: "but", optionC: "and", optionD: "so", correctOption: "C", explanation: "Cấu trúc both... and... (vừa... vừa...).", translation: "Anh ấy vừa thông minh vừa chăm chỉ.", tips: "both... and..." },
  { question: "________ I was tired, I finished the work.", optionA: "Because", optionB: "Although", optionC: "So", optionD: "And", correctOption: "B", explanation: "Mặc dù mệt nhưng vẫn hoàn thành -> Although.", translation: "Mặc dù mệt, tôi đã hoàn thành công việc.", tips: "Mặc dù -> Although" },
  { question: "I don't like playing soccer ________ volleyball.", optionA: "or", optionB: "and", optionC: "but", optionD: "so", correctOption: "A", explanation: "Trong câu phủ định, dùng or để liệt kê.", translation: "Tôi không thích chơi bóng đá hay bóng chuyền.", tips: "Phủ định liệt kê -> or" },
  { question: "She studied hard, ________ she passed the exam.", optionA: "so", optionB: "because", optionC: "but", optionD: "or", correctOption: "A", explanation: "Kết quả của việc học chăm -> so.", translation: "Cô ấy học chăm, vì vậy cô ấy đã qua bài kiểm tra.", tips: "Kết quả -> so" },
  { question: "I went to the store ________ bought some milk.", optionA: "or", optionB: "so", optionC: "and", optionD: "because", correctOption: "C", explanation: "Hành động liên tiếp -> dùng and.", translation: "Tôi đến cửa hàng và mua một ít sữa.", tips: "Nối hành động -> and" },
  { question: "________ it was late, we decided to leave.", optionA: "Because", optionB: "Although", optionC: "But", optionD: "Or", correctOption: "A", explanation: "Nguyên nhân quyết định rời đi -> Because.", translation: "Vì trời đã muộn, chúng tôi quyết định rời đi.", tips: "Bởi vì -> Because" },
  { question: "We can go to the beach ________ the mountains.", optionA: "but", optionB: "or", optionC: "so", optionD: "and", correctOption: "B", explanation: "Sự lựa chọn giữa 2 địa điểm -> or.", translation: "Chúng ta có thể đi biển hoặc đi núi.", tips: "Lựa chọn -> or" }
];

const mediumLesson1 = [
  { question: "________ of the bad weather, the flight was canceled.", optionA: "Because", optionB: "Because of", optionC: "Although", optionD: "In spite of", correctOption: "B", explanation: "Sau ô trống là một cụm danh từ (the bad weather) chỉ nguyên nhân -> Because of.", translation: "Vì thời tiết xấu, chuyến bay đã bị hủy.", tips: "Because of + N/V-ing" },
  { question: "She decided to buy the dress ________ it was very expensive.", optionA: "although", optionB: "despite", optionC: "because", optionD: "so", correctOption: "A", explanation: "Sau ô trống là một mệnh đề (it was very expensive) chỉ sự nhượng bộ -> although.", translation: "Cô ấy quyết định mua chiếc váy mặc dù nó rất đắt.", tips: "Although + clause" },
  { question: "I will not forgive him ________ he apologizes.", optionA: "if", optionB: "unless", optionC: "because", optionD: "so", correctOption: "B", explanation: "Unless = If... not (trừ khi).", translation: "Tôi sẽ không tha thứ cho anh ta trừ khi anh ta xin lỗi.", tips: "Unless = trừ khi" },
  { question: "He spoke quietly ________ nobody could hear him.", optionA: "so that", optionB: "because", optionC: "in order to", optionD: "although", correctOption: "A", explanation: "so that + clause: để mà.", translation: "Anh ấy nói nhỏ để không ai có thể nghe thấy.", tips: "so that + clause" },
  { question: "________ working long hours, he still has time for his family.", optionA: "Although", optionB: "Because of", optionC: "Despite", optionD: "Since", correctOption: "C", explanation: "Sau ô trống là V-ing chỉ sự nhượng bộ -> Despite / In spite of.", translation: "Mặc dù làm việc nhiều giờ, anh ấy vẫn có thời gian cho gia đình.", tips: "Despite + V-ing/N" },
  { question: "Either you leave now ________ I will call the police.", optionA: "and", optionB: "nor", optionC: "or", optionD: "but", correctOption: "C", explanation: "Cấu trúc Either... or... (hoặc... hoặc...).", translation: "Hoặc bạn rời đi ngay bây giờ hoặc tôi sẽ gọi cảnh sát.", tips: "Either... or" },
  { question: "I have been living here ________ I was a child.", optionA: "for", optionB: "since", optionC: "when", optionD: "while", correctOption: "B", explanation: "since + mốc thời gian / mệnh đề quá khứ.", translation: "Tôi đã sống ở đây từ khi còn là một đứa trẻ.", tips: "since + mệnh đề QK" },
  { question: "The car was old; ________, it was very reliable.", optionA: "therefore", optionB: "however", optionC: "moreover", optionD: "because", correctOption: "B", explanation: "Liên từ trạng từ chỉ sự tương phản -> however (tuy nhiên).", translation: "Chiếc xe đã cũ; tuy nhiên, nó rất đáng tin cậy.", tips: "tuy nhiên -> however" },
  { question: "Neither my brother ________ I like playing tennis.", optionA: "or", optionB: "nor", optionC: "and", optionD: "but", correctOption: "B", explanation: "Cấu trúc Neither... nor... (không... cũng không...).", translation: "Cả anh trai tôi và tôi đều không thích chơi quần vợt.", tips: "Neither... nor" },
  { question: "He is learning English ________ he can study abroad.", optionA: "in order to", optionB: "so as to", optionC: "so that", optionD: "because of", correctOption: "C", explanation: "so that + mệnh đề chỉ mục đích.", translation: "Anh ấy đang học tiếng Anh để có thể đi du học.", tips: "so that + mệnh đề" }
];

const mediumLesson2 = [
  { question: "Not only is she beautiful ________ she is also intelligent.", optionA: "and", optionB: "but", optionC: "or", optionD: "so", correctOption: "B", explanation: "Cấu trúc Not only... but also... (không những... mà còn...).", translation: "Cô ấy không những xinh đẹp mà còn thông minh.", tips: "Not only... but also" },
  { question: "I couldn't sleep ________ the noise.", optionA: "because", optionB: "because of", optionC: "although", optionD: "despite", correctOption: "B", explanation: "the noise là cụm danh từ chỉ nguyên nhân -> because of.", translation: "Tôi không thể ngủ vì tiếng ồn.", tips: "because of + Noun" },
  { question: "________ she was sick, she still went to work.", optionA: "Even though", optionB: "Despite", optionC: "In spite of", optionD: "Because", correctOption: "A", explanation: "Even though + mệnh đề chỉ sự nhượng bộ.", translation: "Mặc dù cô ấy bị ốm, cô ấy vẫn đi làm.", tips: "Even though + clause" },
  { question: "I will go to the party ________ you come with me.", optionA: "unless", optionB: "provided that", optionC: "although", optionD: "because of", correctOption: "B", explanation: "provided that = as long as = if (với điều kiện là).", translation: "Tôi sẽ đi đến bữa tiệc với điều kiện là bạn đi cùng tôi.", tips: "provided that = miễn là" },
  { question: "He didn't study hard; ________, he failed the exam.", optionA: "however", optionB: "therefore", optionC: "but", optionD: "moreover", correctOption: "B", explanation: "Chỉ kết quả hợp lý -> therefore (vì vậy).", translation: "Anh ấy không học chăm chỉ; vì vậy, anh ấy đã trượt kỳ thi.", tips: "therefore = vì vậy" },
  { question: "I read a book ________ I was waiting for the bus.", optionA: "while", optionB: "during", optionC: "since", optionD: "for", correctOption: "A", explanation: "while + mệnh đề tiếp diễn (trong khi).", translation: "Tôi đã đọc một cuốn sách trong khi chờ xe buýt.", tips: "while + clause" },
  { question: "It was raining hard. ________, we decided to go out.", optionA: "Therefore", optionB: "Moreover", optionC: "Nevertheless", optionD: "Consequently", correctOption: "C", explanation: "Nevertheless = however (tuy nhiên).", translation: "Trời mưa rất to. Tuy nhiên, chúng tôi vẫn quyết định ra ngoài.", tips: "Nevertheless = tuy nhiên" },
  { question: "I am saving money ________ buy a new house.", optionA: "so that", optionB: "in order that", optionC: "in order to", optionD: "for", correctOption: "C", explanation: "in order to + V-bare (để).", translation: "Tôi đang tiết kiệm tiền để mua một ngôi nhà mới.", tips: "in order to + V" },
  { question: "________ having a lot of money, he is not happy.", optionA: "Although", optionB: "Even though", optionC: "In spite of", optionD: "Because of", correctOption: "C", explanation: "In spite of + V-ing.", translation: "Mặc dù có nhiều tiền, anh ấy không hạnh phúc.", tips: "In spite of + V-ing" },
  { question: "She is a talented singer. ________, she is a great dancer.", optionA: "Therefore", optionB: "However", optionC: "Moreover", optionD: "Although", correctOption: "C", explanation: "Bổ sung thêm thông tin -> Moreover (hơn nữa).", translation: "Cô ấy là một ca sĩ tài năng. Hơn nữa, cô ấy còn là một vũ công tuyệt vời.", tips: "Moreover = Hơn nữa" }
];

const hardLesson1 = [
  { question: "He was very tired. ________, he kept on working.", optionA: "Consequently", optionB: "However", optionC: "Otherwise", optionD: "Furthermore", correctOption: "B", explanation: "However đứng đầu câu sau dấu chấm chỉ sự tương phản.", translation: "Anh ấy rất mệt. Tuy nhiên, anh ấy vẫn tiếp tục làm việc.", tips: "Tuy nhiên -> However" },
  { question: "You'd better take an umbrella ________ it rains.", optionA: "in case", optionB: "so that", optionC: "unless", optionD: "if not", correctOption: "A", explanation: "in case: phòng khi.", translation: "Tốt hơn là bạn nên mang theo ô phòng khi trời mưa.", tips: "in case = phòng khi" },
  { question: "The project was a success, ________ the tight budget.", optionA: "although", optionB: "even though", optionC: "despite", optionD: "because of", correctOption: "C", explanation: "the tight budget là cụm danh từ chỉ sự nhượng bộ -> despite.", translation: "Dự án đã thành công, mặc dù ngân sách eo hẹp.", tips: "despite + Noun" },
  { question: "________ you study harder, you won't pass the exam.", optionA: "If", optionB: "Unless", optionC: "Provided that", optionD: "As long as", correctOption: "B", explanation: "Unless = Nếu không.", translation: "Trừ khi bạn học chăm hơn, bạn sẽ không qua được kỳ thi.", tips: "Unless = If... not" },
  { question: "The company's profits increased. ________, they hired more employees.", optionA: "On the other hand", optionB: "Nevertheless", optionC: "Consequently", optionD: "In contrast", correctOption: "C", explanation: "Consequently = Therefore = As a result (hậu quả là, kết quả là).", translation: "Lợi nhuận của công ty tăng. Kết quả là, họ đã thuê thêm nhân viên.", tips: "Consequently = Do đó" },
  { question: "________ tired she was, she managed to finish the report.", optionA: "However", optionB: "Although", optionC: "Despite", optionD: "No matter", correctOption: "A", explanation: "Cấu trúc nhượng bộ: However + adj/adv + S + V.", translation: "Dù cô ấy mệt đến đâu, cô ấy vẫn cố gắng hoàn thành báo cáo.", tips: "However + adj/adv = Dù... đến mấy" },
  { question: "He went to bed early ________ be tired the next day.", optionA: "so as not to", optionB: "in order not", optionC: "so that not", optionD: "not to", correctOption: "A", explanation: "so as not to + V = in order not to + V (để không).", translation: "Anh ấy đi ngủ sớm để không bị mệt vào ngày hôm sau.", tips: "so as not to V" },
  { question: "________ had I arrived home than it started to rain.", optionA: "Hardly", optionB: "Scarcely", optionC: "No sooner", optionD: "Barely", correctOption: "C", explanation: "Cấu trúc đảo ngữ: No sooner... than... (vừa mới... thì...).", translation: "Tôi vừa mới về đến nhà thì trời bắt đầu mưa.", tips: "No sooner + than" },
  { question: "I will lend you the money ________ you pay me back next week.", optionA: "in case", optionB: "unless", optionC: "on condition that", optionD: "even if", correctOption: "C", explanation: "on condition that = provided that (với điều kiện là).", translation: "Tôi sẽ cho bạn mượn tiền với điều kiện bạn trả tôi vào tuần tới.", tips: "on condition that" },
  { question: "________ his lack of experience, he was offered the job.", optionA: "Because of", optionB: "Although", optionC: "Despite", optionD: "Even though", correctOption: "C", explanation: "his lack of experience là Noun Phrase chỉ sự tương phản -> Despite.", translation: "Mặc dù thiếu kinh nghiệm, anh ấy vẫn được nhận vào làm việc.", tips: "Despite + Noun" }
];

const hardLesson2 = [
  { question: "You must leave immediately; ________, you will miss the train.", optionA: "otherwise", optionB: "however", optionC: "moreover", optionD: "therefore", correctOption: "A", explanation: "otherwise: nếu không thì.", translation: "Bạn phải rời đi ngay lập tức; nếu không, bạn sẽ lỡ chuyến tàu.", tips: "otherwise = nếu không thì" },
  { question: "________ difficult the problem is, we must solve it.", optionA: "However", optionB: "Whatever", optionC: "No matter", optionD: "Although", correctOption: "A", explanation: "However + adj/adv + S + V: dù... có thế nào đi nữa.", translation: "Dù vấn đề có khó khăn đến đâu, chúng ta cũng phải giải quyết nó.", tips: "However + adj" },
  { question: "He was deeply in debt. ________, he bought a new sports car.", optionA: "Thus", optionB: "Hence", optionC: "Yet", optionD: "Accordingly", correctOption: "C", explanation: "Yet = however = nhưng/tuy nhiên (kết nối câu).", translation: "Anh ta đang nợ ngập đầu. Thế nhưng, anh ta lại mua một chiếc xe thể thao mới.", tips: "Yet = Tuy nhiên" },
  { question: "________ he comes, tell him to wait for me.", optionA: "Whether", optionB: "Should", optionC: "In case of", optionD: "If only", correctOption: "B", explanation: "Đảo ngữ câu điều kiện loại 1: Should + S + V.", translation: "Nếu anh ấy đến, bảo anh ấy đợi tôi.", tips: "Đảo ngữ ĐK 1: Should S V" },
  { question: "He acted ________ he had seen a ghost.", optionA: "as if", optionB: "even if", optionC: "only if", optionD: "what if", correctOption: "A", explanation: "as if: cứ như thể là.", translation: "Anh ta cư xử cứ như thể là anh ta vừa nhìn thấy ma.", tips: "as if = cứ như thể" },
  { question: "I took a taxi ________ I wouldn't be late for the interview.", optionA: "in order to", optionB: "so that", optionC: "in case", optionD: "for", correctOption: "B", explanation: "so that + clause (để mà).", translation: "Tôi đã bắt taxi để không bị trễ buổi phỏng vấn.", tips: "so that + clause" },
  { question: "________ being a brilliant scientist, he is also a gifted musician.", optionA: "Apart from", optionB: "Except for", optionC: "Besides", optionD: "In addition to", correctOption: "D", explanation: "In addition to / Besides + V-ing: Ngoài việc...", translation: "Ngoài việc là một nhà khoa học lỗi lạc, anh ấy còn là một nhạc sĩ tài năng.", tips: "In addition to + V-ing" },
  { question: "The machine is broken. ________, we have to stop production.", optionA: "Consequently", optionB: "Conversely", optionC: "Likewise", optionD: "Similarly", correctOption: "A", explanation: "Consequently = As a result (kết quả là).", translation: "Máy bị hỏng. Kết quả là, chúng tôi phải ngừng sản xuất.", tips: "Consequently = Kết quả là" },
  { question: "________ happens, I will always support you.", optionA: "However", optionB: "Whatever", optionC: "Whichever", optionD: "Wherever", correctOption: "B", explanation: "Whatever: Dù có chuyện gì xảy ra.", translation: "Dù có chuyện gì xảy ra, tôi sẽ luôn ủng hộ bạn.", tips: "Whatever = Bất cứ điều gì" },
  { question: "Not only ________ the exam, but she also got a scholarship.", optionA: "she passed", optionB: "did she pass", optionC: "passed she", optionD: "she did pass", correctOption: "B", explanation: "Đảo ngữ với Not only: Not only + Trợ ĐT + S + V.", translation: "Cô ấy không những qua kỳ thi mà còn nhận được học bổng.", tips: "Đảo ngữ Not only" }
];

async function run() {
  const slug = "lien-tu";
  const title = "19. Liên từ (Conjunctions)";
  
  let topic = await prisma.toeicGrammarTopic.findUnique({ where: { slug } });
  if (topic) {
    console.log("Topic 19 already exists!");
    return;
  }
  
  topic = await prisma.toeicGrammarTopic.create({
    data: {
      title,
      subtitle: "Cách sử dụng từ nối (and, but, because, although...)",
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
        title: `${l.title}: Liên từ`,
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

  console.log("Created Topic 19: Conjunctions with 6 lessons (60 questions).");
}

run().catch(console.error).finally(() => prisma.$disconnect());
