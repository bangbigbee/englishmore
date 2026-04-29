import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const easyLesson1 = [
  { question: "I have ________ apple in my bag.", optionA: "a", optionB: "an", optionC: "the", optionD: "some", correctOption: "B", explanation: "apple bắt đầu bằng nguyên âm (a, e, i, o, u) nên dùng mạo từ 'an'.", translation: "Tôi có một quả táo trong túi.", tips: "an + nguyên âm" },
  { question: "She wants to buy ________ new car.", optionA: "a", optionB: "an", optionC: "the", optionD: "any", correctOption: "A", explanation: "new car đếm được số ít, bắt đầu bằng phụ âm nên dùng 'a'.", translation: "Cô ấy muốn mua một chiếc ô tô mới.", tips: "a + phụ âm" },
  { question: "Can you pass me ________ salt, please?", optionA: "a", optionB: "an", optionC: "the", optionD: "some", correctOption: "C", explanation: "Lọ muối trên bàn ăn là vật xác định cả người nói và nghe đều biết -> dùng 'the'.", translation: "Bạn có thể đưa cho tôi lọ muối được không?", tips: "the + vật xác định" },
  { question: "I don't have ________ money left.", optionA: "some", optionB: "any", optionC: "many", optionD: "a few", correctOption: "B", explanation: "Trong câu phủ định, dùng 'any' đi với danh từ không đếm được (money).", translation: "Tôi không còn chút tiền nào.", tips: "Phủ định -> any" },
  { question: "Would you like ________ coffee?", optionA: "some", optionB: "any", optionC: "many", optionD: "a", correctOption: "A", explanation: "Trong câu mời mọc, dùng 'some' thay vì 'any'.", translation: "Bạn có muốn uống chút cà phê không?", tips: "Câu mời -> some" },
  { question: "There are ________ students in the classroom.", optionA: "much", optionB: "many", optionC: "little", optionD: "a little", correctOption: "B", explanation: "students là danh từ đếm được số nhiều -> dùng many.", translation: "Có nhiều học sinh trong phòng học.", tips: "many + danh từ đếm được" },
  { question: "We don't have ________ time before the train leaves.", optionA: "many", optionB: "much", optionC: "few", optionD: "a few", correctOption: "B", explanation: "time là danh từ không đếm được -> dùng much.", translation: "Chúng ta không có nhiều thời gian trước khi tàu chạy.", tips: "much + danh từ không đếm được" },
  { question: "He has ________ friends in London.", optionA: "a little", optionB: "little", optionC: "a few", optionD: "much", correctOption: "C", explanation: "friends là danh từ đếm được số nhiều -> dùng a few (một vài).", translation: "Anh ấy có một vài người bạn ở London.", tips: "a few + đếm được số nhiều" },
  { question: "I speak ________ Spanish, so I can understand them.", optionA: "a few", optionB: "few", optionC: "a little", optionD: "little", correctOption: "C", explanation: "Spanish (tiếng Tây Ban Nha) là danh từ không đếm được. Dùng 'a little' (một chút) với ý nghĩa tích cực (đủ để hiểu).", translation: "Tôi nói được một chút tiếng Tây Ban Nha, nên tôi có thể hiểu họ.", tips: "a little + không đếm được" },
  { question: "Look at ________ sun! It's so bright today.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "C", explanation: "sun (mặt trời) là duy nhất nên luôn dùng mạo từ 'the'.", translation: "Nhìn mặt trời kìa! Hôm nay trời thật chói chang.", tips: "the + vật duy nhất" }
];

const easyLesson2 = [
  { question: "I need ________ hour to finish this test.", optionA: "a", optionB: "an", optionC: "the", optionD: "some", correctOption: "B", explanation: "hour bắt đầu bằng âm câm 'h', phát âm bắt đầu bằng nguyên âm /aʊ/ nên dùng 'an'.", translation: "Tôi cần một giờ để hoàn thành bài kiểm tra này.", tips: "an hour (h câm)" },
  { question: "She is ________ best student in the class.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "C", explanation: "Dùng 'the' trước tính từ so sánh nhất.", translation: "Cô ấy là học sinh giỏi nhất lớp.", tips: "the + so sánh nhất" },
  { question: "I usually drink ________ water every day.", optionA: "many", optionB: "a lot of", optionC: "a few", optionD: "few", correctOption: "B", explanation: "water không đếm được -> dùng 'a lot of' (nhiều).", translation: "Tôi thường uống nhiều nước mỗi ngày.", tips: "a lot of + N đếm được/không đếm được" },
  { question: "There is ________ milk in the fridge. We need to buy more.", optionA: "a little", optionB: "little", optionC: "a few", optionD: "few", correctOption: "B", explanation: "milk không đếm được. Dùng 'little' mang nghĩa phủ định (rất ít, không đủ).", translation: "Có rất ít sữa trong tủ lạnh. Chúng ta cần mua thêm.", tips: "little = rất ít (phủ định)" },
  { question: "Do you have ________ questions?", optionA: "some", optionB: "any", optionC: "much", optionD: "a little", correctOption: "B", explanation: "Trong câu hỏi thường dùng 'any'.", translation: "Bạn có câu hỏi nào không?", tips: "Câu hỏi -> any" },
  { question: "He plays ________ piano very well.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "C", explanation: "Dùng 'the' trước tên các loại nhạc cụ.", translation: "Anh ấy chơi piano rất giỏi.", tips: "the + nhạc cụ" },
  { question: "________ people enjoy reading books.", optionA: "Much", optionB: "Many", optionC: "A little", optionD: "Little", correctOption: "B", explanation: "people là danh từ đếm được số nhiều -> dùng Many.", translation: "Nhiều người thích đọc sách.", tips: "Many + N số nhiều" },
  { question: "I have ________ idea!", optionA: "a", optionB: "an", optionC: "the", optionD: "some", correctOption: "B", explanation: "idea bắt đầu bằng nguyên âm -> an idea.", translation: "Tôi có một ý tưởng!", tips: "an + nguyên âm" },
  { question: "Let's go to ________ cinema tonight.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "C", explanation: "go to the cinema / the theater là cụm cố định.", translation: "Hãy đi xem phim tối nay.", tips: "go to the cinema" },
  { question: "She bought ________ apples and ________ milk.", optionA: "some / some", optionB: "any / any", optionC: "some / any", optionD: "any / some", correctOption: "A", explanation: "Câu khẳng định dùng 'some' cho cả danh từ đếm được và không đếm được.", translation: "Cô ấy đã mua một vài quả táo và một ít sữa.", tips: "Khẳng định -> some" }
];

const mediumLesson1 = [
  { question: "________ knowledge is a dangerous thing.", optionA: "A little", optionB: "Little", optionC: "A few", optionD: "Few", correctOption: "A", explanation: "Câu tục ngữ: 'A little knowledge is a dangerous thing' (Sự hiểu biết hời hợt là một điều nguy hiểm). knowledge không đếm được.", translation: "Sự hiểu biết hời hợt là một điều nguy hiểm.", tips: "A little knowledge" },
  { question: "He has ________ interest in politics. He never reads the news.", optionA: "a little", optionB: "little", optionC: "a few", optionD: "few", correctOption: "B", explanation: "interest (sự quan tâm) không đếm được. Dùng 'little' mang nghĩa phủ định (hầu như không).", translation: "Anh ấy hầu như không quan tâm đến chính trị.", tips: "little = hầu như không" },
  { question: "________ of the students passed the exam.", optionA: "Much", optionB: "Many", optionC: "Most", optionD: "Almost", correctOption: "C", explanation: "Most of the + N số nhiều (Hầu hết). Không dùng Almost of.", translation: "Hầu hết các học sinh đều qua bài kiểm tra.", tips: "Most of + the/tính từ sở hữu + N" },
  { question: "I go to ________ bed at 10 PM every night.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "D", explanation: "go to bed (đi ngủ) không dùng mạo từ.", translation: "Tôi đi ngủ lúc 10 giờ mỗi tối.", tips: "go to bed (không mạo từ)" },
  { question: "He is studying at ________ university in London.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "A", explanation: "university bắt đầu bằng chữ 'u' nhưng phát âm là /ju:/ (phụ âm) -> dùng 'a'.", translation: "Anh ấy đang học tại một trường đại học ở London.", tips: "a university" },
  { question: "We need ________ information before making a decision.", optionA: "an", optionB: "many", optionC: "some", optionD: "a few", correctOption: "C", explanation: "information là danh từ không đếm được -> dùng some. Không dùng an/many/a few.", translation: "Chúng tôi cần một số thông tin trước khi đưa ra quyết định.", tips: "information không đếm được" },
  { question: "________ the people in the room were listening carefully.", optionA: "All", optionB: "Every", optionC: "Each", optionD: "Whole", correctOption: "A", explanation: "All (the) + N số nhiều: Tất cả. Every và Each + N số ít.", translation: "Tất cả mọi người trong phòng đều đang lắng nghe cẩn thận.", tips: "All the + N số nhiều" },
  { question: "I have two brothers. ________ of them are doctors.", optionA: "All", optionB: "Both", optionC: "Either", optionD: "Neither", correctOption: "B", explanation: "Both dùng cho 2 người/vật (Cả hai).", translation: "Tôi có hai anh trai. Cả hai người họ đều là bác sĩ.", tips: "Both = Cả hai" },
  { question: "There are trees on ________ side of the street.", optionA: "both", optionB: "all", optionC: "either", optionD: "every", correctOption: "C", explanation: "on either side of the street = ở cả hai bên đường.", translation: "Có cây ở cả hai bên đường.", tips: "either side = cả hai bên" },
  { question: "Could you give me ________ advice?", optionA: "an", optionB: "a", optionC: "some", optionD: "many", correctOption: "C", explanation: "advice là danh từ không đếm được, dùng some.", translation: "Bạn có thể cho tôi một vài lời khuyên không?", tips: "advice không đếm được" }
];

const mediumLesson2 = [
  { question: "He is ________ honest man.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "B", explanation: "honest bắt đầu bằng âm 'h' câm, phát âm là /ɒnɪst/ (nguyên âm) -> dùng 'an'.", translation: "Anh ấy là một người đàn ông trung thực.", tips: "an honest man" },
  { question: "________ poor need our help.", optionA: "A", optionB: "An", optionC: "The", optionD: "No article", correctOption: "C", explanation: "The + Tính từ = Nhóm người (The poor = những người nghèo).", translation: "Người nghèo cần sự giúp đỡ của chúng ta.", tips: "The + Adj = Danh từ số nhiều" },
  { question: "I don't like ________ dogs.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "D", explanation: "Nói về sở thích chung chung dùng danh từ số nhiều không mạo từ.", translation: "Tôi không thích chó.", tips: "Chung chung -> không mạo từ" },
  { question: "She bought ________ furniture for her new house.", optionA: "a", optionB: "some", optionC: "many", optionD: "a few", correctOption: "B", explanation: "furniture là danh từ không đếm được -> dùng some.", translation: "Cô ấy đã mua một số đồ nội thất cho ngôi nhà mới của mình.", tips: "furniture không đếm được" },
  { question: "________ child was given a present.", optionA: "All", optionB: "Both", optionC: "Each", optionD: "Many", correctOption: "C", explanation: "Each + N số ít: Mỗi. All/Both/Many + N số nhiều.", translation: "Mỗi đứa trẻ đều được tặng một món quà.", tips: "Each + N số ít" },
  { question: "There is ________ traffic on the road today.", optionA: "too many", optionB: "too much", optionC: "a few", optionD: "few", correctOption: "B", explanation: "traffic không đếm được -> dùng too much.", translation: "Có quá nhiều xe cộ trên đường hôm nay.", tips: "traffic không đếm được" },
  { question: "He has ________ experience in this field.", optionA: "a lot of", optionB: "many", optionC: "a few", optionD: "few", correctOption: "A", explanation: "experience (kinh nghiệm) không đếm được -> dùng a lot of.", translation: "Anh ấy có nhiều kinh nghiệm trong lĩnh vực này.", tips: "experience không đếm được" },
  { question: "Can I have ________ piece of cake?", optionA: "another", optionB: "other", optionC: "others", optionD: "the others", correctOption: "A", explanation: "another + N số ít (một cái khác).", translation: "Tôi có thể ăn thêm một miếng bánh nữa không?", tips: "another + N số ít" },
  { question: "Some people like tea, ________ prefer coffee.", optionA: "another", optionB: "other", optionC: "others", optionD: "the others", correctOption: "C", explanation: "others = other people (những người khác chung chung).", translation: "Một số người thích trà, những người khác thích cà phê.", tips: "others đứng một mình" },
  { question: "I have two pens. One is red, ________ is blue.", optionA: "another", optionB: "other", optionC: "the other", optionD: "others", correctOption: "C", explanation: "the other: cái còn lại (trong 2 cái).", translation: "Tôi có hai cái bút. Một cái màu đỏ, cái còn lại màu xanh.", tips: "the other = cái còn lại (xác định)" }
];

const hardLesson1 = [
  { question: "________ amount of time spent on this project was enormous.", optionA: "A", optionB: "An", optionC: "The", optionD: "Some", correctOption: "C", explanation: "Cụm the amount of + N không đếm được (lượng...).", translation: "Lượng thời gian dành cho dự án này là rất lớn.", tips: "The amount of + N không đếm được" },
  { question: "Only ________ of the applicants were selected for the interview.", optionA: "a little", optionB: "a few", optionC: "few", optionD: "little", correctOption: "B", explanation: "applicants đếm được -> dùng a few (một vài). Only a few = chỉ một vài.", translation: "Chỉ một vài ứng viên được chọn phỏng vấn.", tips: "Only a few + đếm được" },
  { question: "________ number of cars on the road is increasing.", optionA: "A", optionB: "An", optionC: "The", optionD: "Some", correctOption: "C", explanation: "The number of + N số nhiều + V số ít (Số lượng...). A number of + N số nhiều + V số nhiều (Nhiều...). Ở đây động từ là 'is' -> dùng The.", translation: "Số lượng ô tô trên đường đang tăng lên.", tips: "The number of + V số ít" },
  { question: "He goes to ________ church on Sundays.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "D", explanation: "go to church (đi lễ) không dùng mạo từ khi đi đúng mục đích của nơi đó.", translation: "Anh ấy đi lễ nhà thờ vào các ngày Chủ nhật.", tips: "go to church (đúng mục đích)" },
  { question: "My mother went to ________ school to meet my teacher.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "C", explanation: "Đến trường không phải để học (đúng mục đích) mà để gặp giáo viên -> dùng 'the'.", translation: "Mẹ tôi đã đến trường để gặp giáo viên của tôi.", tips: "the school (không đúng mục đích)" },
  { question: "________ Pacific Ocean is the largest ocean in the world.", optionA: "A", optionB: "An", optionC: "The", optionD: "No article", correctOption: "C", explanation: "Dùng 'the' trước tên đại dương (The Pacific Ocean).", translation: "Thái Bình Dương là đại dương lớn nhất thế giới.", tips: "the + đại dương" },
  { question: "He plays ________ football with his friends every weekend.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "D", explanation: "Không dùng mạo từ trước tên các môn thể thao.", translation: "Anh ấy chơi bóng đá với bạn bè vào mỗi cuối tuần.", tips: "Không mạo từ + thể thao" },
  { question: "There are no easy ways to learn ________ English.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "D", explanation: "Không dùng mạo từ trước tên ngôn ngữ (English). (Trừ khi có từ 'language': the English language).", translation: "Không có cách nào dễ dàng để học tiếng Anh.", tips: "Không mạo từ + ngôn ngữ" },
  { question: "________ English are famous for drinking tea.", optionA: "A", optionB: "An", optionC: "The", optionD: "No article", correctOption: "C", explanation: "The + quốc tịch = Người dân nước đó (The English = Người Anh).", translation: "Người Anh nổi tiếng về việc uống trà.", tips: "The + quốc tịch" },
  { question: "I don't have ________ luggage, just a small bag.", optionA: "many", optionB: "much", optionC: "few", optionD: "a few", correctOption: "B", explanation: "luggage (hành lý) là danh từ không đếm được -> dùng much.", translation: "Tôi không có nhiều hành lý, chỉ một chiếc túi nhỏ.", tips: "luggage không đếm được" }
];

const hardLesson2 = [
  { question: "He had ________ money, so he couldn't buy the ticket.", optionA: "a little", optionB: "little", optionC: "a few", optionD: "few", correctOption: "B", explanation: "Không thể mua vé -> không đủ tiền -> dùng 'little' (rất ít, không đủ).", translation: "Anh ấy có rất ít tiền, nên anh ấy không thể mua vé.", tips: "little mang nghĩa phủ định" },
  { question: "She gave me a necklace. ________ necklace is made of silver.", optionA: "A", optionB: "An", optionC: "The", optionD: "No article", correctOption: "C", explanation: "Danh từ 'necklace' được nhắc đến lần thứ 2 -> dùng 'the'.", translation: "Cô ấy tặng tôi một chiếc vòng cổ. Chiếc vòng cổ đó làm bằng bạc.", tips: "Nhắc lại lần 2 -> the" },
  { question: "They climbed ________ Mount Everest last year.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "D", explanation: "Không dùng mạo từ trước tên của một ngọn núi riêng lẻ (Mount Everest). (Dùng the cho dãy núi: The Alps).", translation: "Họ đã leo núi Everest vào năm ngoái.", tips: "Không mạo từ + núi riêng lẻ" },
  { question: "We stayed at a hotel near ________ River Thames.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "C", explanation: "Dùng 'the' trước tên các dòng sông (The River Thames).", translation: "Chúng tôi ở tại một khách sạn gần sông Thames.", tips: "the + sông" },
  { question: "________ United States of America is a large country.", optionA: "A", optionB: "An", optionC: "The", optionD: "No article", correctOption: "C", explanation: "Dùng 'the' trước tên quốc gia có từ: Republic, States, Kingdom, v.v.", translation: "Hợp chủng quốc Hoa Kỳ là một đất nước rộng lớn.", tips: "The + United States" },
  { question: "He was appointed ________ chairman of the committee.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "D", explanation: "Không dùng mạo từ sau các động từ như appoint, elect, become... với chức danh duy nhất.", translation: "Ông ấy được bổ nhiệm làm chủ tịch ủy ban.", tips: "appoint + chức danh (không mạo từ)" },
  { question: "Every student has ________ own textbook.", optionA: "his or her", optionB: "their", optionC: "its", optionD: "Both A and B", correctOption: "D", explanation: "Sau Every student, ta có thể dùng his or her (trang trọng) hoặc their (phổ biến trong giao tiếp hiện đại).", translation: "Mỗi học sinh đều có sách giáo khoa riêng.", tips: "Every student -> his/her hoặc their" },
  { question: "I have read ________ pages of the book.", optionA: "first two", optionB: "the first two", optionC: "two first", optionD: "the two first", correctOption: "B", explanation: "Trật tự: The + số thứ tự (first) + số đếm (two).", translation: "Tôi đã đọc hai trang đầu của cuốn sách.", tips: "The first two" },
  { question: "________ people believe that aliens exist.", optionA: "A large amount of", optionB: "A great deal of", optionC: "A large number of", optionD: "Much", correctOption: "C", explanation: "people đếm được số nhiều -> dùng A large number of. Amount / deal / much đi với không đếm được.", translation: "Một số lượng lớn người tin rằng người ngoài hành tinh tồn tại.", tips: "A number of + đếm được" },
  { question: "He earns ________ twice as much as I do.", optionA: "a", optionB: "an", optionC: "the", optionD: "no article", correctOption: "D", explanation: "twice as much as không dùng mạo từ ở trước.", translation: "Anh ấy kiếm được gấp đôi số tiền tôi kiếm được.", tips: "twice as much as (không mạo từ)" }
];

async function run() {
  const slug = "tu-chi-so-luong-mao-tu";
  const title = "22. Từ chỉ số lượng và Mạo từ (Quantifiers & Articles)";
  
  let topic = await prisma.toeicGrammarTopic.findUnique({ where: { slug } });
  if (topic) {
    console.log("Topic 22 already exists!");
    return;
  }
  
  topic = await prisma.toeicGrammarTopic.create({
    data: {
      title,
      subtitle: "Cách dùng a, an, the và some, any, much, many, few, little...",
      slug,
      level: "Cơ Bản",
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
        title: `${l.title}: Mạo từ & Lượng từ`,
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

  console.log("Created Topic 22: Quantifiers & Articles with 6 lessons (60 questions).");
}

run().catch(console.error).finally(() => prisma.$disconnect());
