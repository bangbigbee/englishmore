import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const easyLesson1 = [
  { question: "I usually wake up ________ 6 o'clock in the morning.", optionA: "in", optionB: "on", optionC: "at", optionD: "for", correctOption: "C", explanation: "Dùng at trước thời gian cụ thể (giờ).", translation: "Tôi thường thức dậy lúc 6 giờ sáng.", tips: "at + giờ cụ thể" },
  { question: "My birthday is ________ October 15th.", optionA: "in", optionB: "on", optionC: "at", optionD: "by", correctOption: "B", explanation: "Dùng on trước ngày hoặc ngày tháng.", translation: "Sinh nhật của tôi là vào ngày 15 tháng 10.", tips: "on + ngày/tháng" },
  { question: "It is very cold ________ winter.", optionA: "in", optionB: "on", optionC: "at", optionD: "during", correctOption: "A", explanation: "Dùng in trước các mùa trong năm.", translation: "Trời rất lạnh vào mùa đông.", tips: "in + mùa" },
  { question: "She left the keys ________ the table.", optionA: "in", optionB: "on", optionC: "at", optionD: "under", correctOption: "B", explanation: "on: ở trên bề mặt.", translation: "Cô ấy để quên chìa khóa trên bàn.", tips: "on = trên bề mặt" },
  { question: "I live ________ New York City.", optionA: "in", optionB: "on", optionC: "at", optionD: "with", correctOption: "A", explanation: "in: ở trong (thành phố, quốc gia).", translation: "Tôi sống ở thành phố New York.", tips: "in + thành phố" },
  { question: "We are meeting ________ Monday.", optionA: "in", optionB: "on", optionC: "at", optionD: "by", correctOption: "B", explanation: "Dùng on trước các thứ trong tuần.", translation: "Chúng ta sẽ gặp nhau vào thứ Hai.", tips: "on + thứ" },
  { question: "The cat is hiding ________ the bed.", optionA: "under", optionB: "above", optionC: "over", optionD: "on", correctOption: "A", explanation: "under: ở dưới (bề mặt che khuất).", translation: "Con mèo đang trốn dưới gầm giường.", tips: "under = ở dưới" },
  { question: "They have been married ________ 10 years.", optionA: "since", optionB: "for", optionC: "in", optionD: "at", correctOption: "B", explanation: "for + khoảng thời gian.", translation: "Họ đã kết hôn được 10 năm.", tips: "for + khoảng thời gian" },
  { question: "I go to work ________ bus.", optionA: "in", optionB: "on", optionC: "by", optionD: "with", correctOption: "C", explanation: "by + phương tiện giao thông.", translation: "Tôi đi làm bằng xe buýt.", tips: "by + phương tiện" },
  { question: "He is interested ________ learning Japanese.", optionA: "in", optionB: "on", optionC: "at", optionD: "about", correctOption: "A", explanation: "be interested in: quan tâm, thích thú với cái gì.", translation: "Anh ấy quan tâm đến việc học tiếng Nhật.", tips: "interested in" }
];

const easyLesson2 = [
  { question: "I was born ________ 1995.", optionA: "in", optionB: "on", optionC: "at", optionD: "from", correctOption: "A", explanation: "Dùng in trước năm.", translation: "Tôi sinh năm 1995.", tips: "in + năm" },
  { question: "Please wait ________ me here.", optionA: "for", optionB: "to", optionC: "with", optionD: "at", correctOption: "A", explanation: "wait for: chờ đợi ai/cái gì.", translation: "Vui lòng đợi tôi ở đây.", tips: "wait for" },
  { question: "Look ________ the picture on the wall.", optionA: "in", optionB: "on", optionC: "at", optionD: "to", correctOption: "C", explanation: "look at: nhìn vào.", translation: "Hãy nhìn vào bức tranh trên tường.", tips: "look at = nhìn vào" },
  { question: "She is good ________ playing the piano.", optionA: "in", optionB: "at", optionC: "on", optionD: "with", correctOption: "B", explanation: "good at: giỏi về cái gì.", translation: "Cô ấy chơi piano giỏi.", tips: "good at = giỏi về" },
  { question: "They walked ________ the park.", optionA: "through", optionB: "above", optionC: "over", optionD: "under", correctOption: "A", explanation: "walk through: đi xuyên qua.", translation: "Họ đã đi xuyên qua công viên.", tips: "through = xuyên qua" },
  { question: "I will finish the work ________ 5 PM.", optionA: "in", optionB: "on", optionC: "by", optionD: "at", correctOption: "C", explanation: "by + mốc thời gian: trước lúc.", translation: "Tôi sẽ hoàn thành công việc trước 5 giờ chiều.", tips: "by + giờ = trước lúc" },
  { question: "He is afraid ________ spiders.", optionA: "of", optionB: "from", optionC: "with", optionD: "about", correctOption: "A", explanation: "afraid of: sợ cái gì.", translation: "Anh ấy sợ nhện.", tips: "afraid of" },
  { question: "We talked ________ the upcoming project.", optionA: "about", optionB: "with", optionC: "to", optionD: "for", correctOption: "A", explanation: "talk about: nói về cái gì.", translation: "Chúng tôi đã nói chuyện về dự án sắp tới.", tips: "talk about" },
  { question: "The book is ________ the table and the chair.", optionA: "between", optionB: "among", optionC: "in", optionD: "next to", correctOption: "A", explanation: "between: ở giữa (2 vật).", translation: "Quyển sách nằm giữa cái bàn và cái ghế.", tips: "between = giữa 2 vật" },
  { question: "She works ________ a hospital.", optionA: "in", optionB: "on", optionC: "at", optionD: "for", correctOption: "A", explanation: "in a hospital: làm việc trong bệnh viện. (Hoặc at a hospital).", translation: "Cô ấy làm việc trong một bệnh viện.", tips: "in/at a hospital" }
];

const mediumLesson1 = [
  { question: "I am entirely dependent ________ my parents.", optionA: "in", optionB: "on", optionC: "of", optionD: "with", correctOption: "B", explanation: "dependent on: phụ thuộc vào.", translation: "Tôi hoàn toàn phụ thuộc vào cha mẹ mình.", tips: "dependent on" },
  { question: "He apologized ________ his teacher for his bad behavior.", optionA: "with", optionB: "to", optionC: "for", optionD: "about", correctOption: "B", explanation: "apologize to sb: xin lỗi ai.", translation: "Anh ấy đã xin lỗi giáo viên vì hành vi tồi tệ của mình.", tips: "apologize to sb" },
  { question: "She is capable ________ doing it by herself.", optionA: "of", optionB: "in", optionC: "for", optionD: "to", correctOption: "A", explanation: "capable of + V-ing: có khả năng làm gì.", translation: "Cô ấy có khả năng tự mình làm việc đó.", tips: "capable of" },
  { question: "The manager is responsible ________ hiring new staff.", optionA: "for", optionB: "about", optionC: "of", optionD: "with", correctOption: "A", explanation: "responsible for: chịu trách nhiệm về.", translation: "Người quản lý chịu trách nhiệm tuyển dụng nhân viên mới.", tips: "responsible for" },
  { question: "I am looking forward ________ hearing from you.", optionA: "to", optionB: "for", optionC: "about", optionD: "at", correctOption: "A", explanation: "look forward to + V-ing: mong đợi điều gì.", translation: "Tôi mong đợi nhận được tin từ bạn.", tips: "look forward to" },
  { question: "The train departs ________ platform 3.", optionA: "from", optionB: "at", optionC: "on", optionD: "in", correctOption: "A", explanation: "depart from: khởi hành từ.", translation: "Chuyến tàu khởi hành từ sân ga số 3.", tips: "depart from" },
  { question: "This coat belongs ________ my grandfather.", optionA: "with", optionB: "to", optionC: "for", optionD: "of", correctOption: "B", explanation: "belong to: thuộc về.", translation: "Chiếc áo khoác này thuộc về ông tôi.", tips: "belong to" },
  { question: "She congratulated him ________ passing the exam.", optionA: "on", optionB: "for", optionC: "about", optionD: "with", correctOption: "A", explanation: "congratulate sb on sth: chúc mừng ai về điều gì.", translation: "Cô ấy đã chúc mừng anh ấy vì đã qua kỳ thi.", tips: "congratulate sb on" },
  { question: "I object ________ your plan.", optionA: "to", optionB: "against", optionC: "for", optionD: "with", correctOption: "A", explanation: "object to + N/V-ing: phản đối điều gì.", translation: "Tôi phản đối kế hoạch của bạn.", tips: "object to" },
  { question: "The committee consists ________ 5 members.", optionA: "of", optionB: "in", optionC: "from", optionD: "with", correctOption: "A", explanation: "consist of: bao gồm.", translation: "Ủy ban bao gồm 5 thành viên.", tips: "consist of" }
];

const mediumLesson2 = [
  { question: "We arrived ________ London at midnight.", optionA: "in", optionB: "at", optionC: "on", optionD: "to", correctOption: "A", explanation: "arrive in + thành phố/quốc gia lớn.", translation: "Chúng tôi đến London vào lúc nửa đêm.", tips: "arrive in (nơi lớn)" },
  { question: "They arrived ________ the airport early.", optionA: "in", optionB: "at", optionC: "on", optionD: "to", correctOption: "B", explanation: "arrive at + địa điểm nhỏ (sân bay, nhà ga...).", translation: "Họ đến sân bay sớm.", tips: "arrive at (nơi nhỏ)" },
  { question: "She prevented him ________ making a huge mistake.", optionA: "from", optionB: "against", optionC: "of", optionD: "with", correctOption: "A", explanation: "prevent sb from + V-ing: ngăn cản ai làm gì.", translation: "Cô ấy đã ngăn anh ta mắc phải một sai lầm lớn.", tips: "prevent sb from" },
  { question: "I am very proud ________ my son's achievements.", optionA: "of", optionB: "about", optionC: "for", optionD: "with", correctOption: "A", explanation: "proud of: tự hào về.", translation: "Tôi rất tự hào về thành tích của con trai tôi.", tips: "proud of" },
  { question: "He succeeded ________ solving the complex puzzle.", optionA: "in", optionB: "on", optionC: "at", optionD: "with", correctOption: "A", explanation: "succeed in + V-ing: thành công trong việc gì.", translation: "Anh ấy đã thành công trong việc giải câu đố phức tạp.", tips: "succeed in" },
  { question: "Don't lean ________ the freshly painted wall.", optionA: "against", optionB: "on", optionC: "to", optionD: "over", correctOption: "A", explanation: "lean against: dựa vào.", translation: "Đừng dựa vào bức tường mới sơn.", tips: "lean against" },
  { question: "The book was translated ________ English to Vietnamese.", optionA: "from", optionB: "into", optionC: "in", optionD: "to", correctOption: "A", explanation: "translate from X into Y: dịch từ X sang Y.", translation: "Cuốn sách được dịch từ tiếng Anh sang tiếng Việt.", tips: "translate from... into..." },
  { question: "He was accused ________ stealing the money.", optionA: "of", optionB: "for", optionC: "with", optionD: "about", correctOption: "A", explanation: "accuse sb of sth: buộc tội ai về việc gì.", translation: "Anh ta bị buộc tội ăn cắp tiền.", tips: "accuse of" },
  { question: "I prefer coffee ________ tea.", optionA: "than", optionB: "to", optionC: "over", optionD: "more than", correctOption: "B", explanation: "prefer X to Y: thích X hơn Y.", translation: "Tôi thích cà phê hơn trà.", tips: "prefer to" },
  { question: "She is accustomed ________ waking up early.", optionA: "to", optionB: "with", optionC: "for", optionD: "in", correctOption: "A", explanation: "accustomed to + V-ing: quen với việc gì.", translation: "Cô ấy quen với việc dậy sớm.", tips: "accustomed to" }
];

const hardLesson1 = [
  { question: "His views are totally opposed ________ mine.", optionA: "to", optionB: "against", optionC: "with", optionD: "of", correctOption: "A", explanation: "opposed to: trái ngược với, phản đối.", translation: "Quan điểm của anh ấy hoàn toàn trái ngược với tôi.", tips: "opposed to" },
  { question: "She insisted ________ paying for the meal.", optionA: "on", optionB: "in", optionC: "for", optionD: "about", correctOption: "A", explanation: "insist on + V-ing: khăng khăng đòi làm gì.", translation: "Cô ấy khăng khăng đòi trả tiền cho bữa ăn.", tips: "insist on" },
  { question: "He was absent ________ school yesterday.", optionA: "from", optionB: "in", optionC: "at", optionD: "of", correctOption: "A", explanation: "absent from: vắng mặt khỏi.", translation: "Anh ấy đã vắng mặt ở trường ngày hôm qua.", tips: "absent from" },
  { question: "I am entirely ignorant ________ this matter.", optionA: "of", optionB: "about", optionC: "in", optionD: "with", correctOption: "A", explanation: "ignorant of/about: không biết về.", translation: "Tôi hoàn toàn không biết gì về vấn đề này.", tips: "ignorant of" },
  { question: "The house is infested ________ mice.", optionA: "with", optionB: "by", optionC: "of", optionD: "in", correctOption: "A", explanation: "infested with: đầy, tràn ngập (côn trùng, chuột...).", translation: "Ngôi nhà tràn ngập chuột.", tips: "infested with" },
  { question: "He dedicated his life ________ helping the poor.", optionA: "to", optionB: "for", optionC: "in", optionD: "on", correctOption: "A", explanation: "dedicate sth to + V-ing: cống hiến cho việc gì.", translation: "Ông đã cống hiến cuộc đời mình để giúp đỡ người nghèo.", tips: "dedicate to + V-ing" },
  { question: "We had to comply ________ the new regulations.", optionA: "with", optionB: "to", optionC: "by", optionD: "in", correctOption: "A", explanation: "comply with: tuân thủ.", translation: "Chúng tôi phải tuân thủ các quy định mới.", tips: "comply with = tuân thủ" },
  { question: "She is endowed ________ great musical talent.", optionA: "with", optionB: "by", optionC: "of", optionD: "in", correctOption: "A", explanation: "endowed with: được trời phú cho.", translation: "Cô ấy được trời phú cho tài năng âm nhạc tuyệt vời.", tips: "endowed with" },
  { question: "He was deprived ________ his rights.", optionA: "of", optionB: "from", optionC: "with", optionD: "off", correctOption: "A", explanation: "deprive sb of sth: tước đoạt của ai cái gì.", translation: "Anh ta đã bị tước đoạt quyền lợi của mình.", tips: "deprive of" },
  { question: "The medicine is exempt ________ tax.", optionA: "from", optionB: "of", optionC: "with", optionD: "for", correctOption: "A", explanation: "exempt from: được miễn khỏi.", translation: "Thuốc này được miễn thuế.", tips: "exempt from" }
];

const hardLesson2 = [
  { question: "I am averse ________ taking risks.", optionA: "to", optionB: "from", optionC: "against", optionD: "of", correctOption: "A", explanation: "averse to: không thích, phản đối.", translation: "Tôi không thích chấp nhận rủi ro.", tips: "averse to" },
  { question: "This chemical is derived ________ petroleum.", optionA: "from", optionB: "of", optionC: "by", optionD: "with", correctOption: "A", explanation: "derived from: có nguồn gốc từ, chiết xuất từ.", translation: "Hóa chất này có nguồn gốc từ dầu mỏ.", tips: "derived from" },
  { question: "She was indifferent ________ his suffering.", optionA: "to", optionB: "about", optionC: "with", optionD: "for", correctOption: "A", explanation: "indifferent to: thờ ơ với.", translation: "Cô ấy thờ ơ với sự đau khổ của anh ta.", tips: "indifferent to" },
  { question: "The speech was fraught ________ errors.", optionA: "with", optionB: "of", optionC: "by", optionD: "in", correctOption: "A", explanation: "fraught with: đầy (những điều không tốt).", translation: "Bài phát biểu đầy lỗi.", tips: "fraught with" },
  { question: "He is vulnerable ________ criticism.", optionA: "to", optionB: "against", optionC: "from", optionD: "with", correctOption: "A", explanation: "vulnerable to: dễ bị tổn thương bởi.", translation: "Anh ấy dễ bị tổn thương bởi những lời chỉ trích.", tips: "vulnerable to" },
  { question: "The decision is subject ________ the board's approval.", optionA: "to", optionB: "with", optionC: "of", optionD: "for", correctOption: "A", explanation: "subject to: tùy thuộc vào, phải chịu.", translation: "Quyết định này tùy thuộc vào sự chấp thuận của hội đồng quản trị.", tips: "subject to" },
  { question: "She is well versed ________ ancient history.", optionA: "in", optionB: "about", optionC: "with", optionD: "of", correctOption: "A", explanation: "versed in: thông thạo về.", translation: "Cô ấy rất thông thạo về lịch sử cổ đại.", tips: "versed in" },
  { question: "He attributed his success ________ hard work.", optionA: "to", optionB: "for", optionC: "with", optionD: "by", correctOption: "A", explanation: "attribute sth to sth: quy cho, gán cho.", translation: "Anh ấy cho rằng thành công của mình là do làm việc chăm chỉ.", tips: "attribute to" },
  { question: "They have a monopoly ________ the production of this drug.", optionA: "on", optionB: "in", optionC: "over", optionD: "of", correctOption: "A", explanation: "monopoly on/over/in/of đều có thể dùng, nhưng phổ biến trong TOEIC là 'on'.", translation: "Họ có thế độc quyền trong việc sản xuất loại thuốc này.", tips: "monopoly on" },
  { question: "I am allergic ________ penicillin.", optionA: "to", optionB: "with", optionC: "from", optionD: "against", correctOption: "A", explanation: "allergic to: dị ứng với.", translation: "Tôi bị dị ứng với penicillin.", tips: "allergic to" }
];

async function run() {
  const slug = "gioi-tu";
  const title = "20. Giới từ (Prepositions)";
  
  let topic = await prisma.toeicGrammarTopic.findUnique({ where: { slug } });
  if (topic) {
    console.log("Topic 20 already exists!");
    return;
  }
  
  topic = await prisma.toeicGrammarTopic.create({
    data: {
      title,
      subtitle: "Các giới từ chỉ thời gian, nơi chốn và giới từ đi kèm",
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
        title: `${l.title}: Giới từ`,
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

  console.log("Created Topic 20: Prepositions with 6 lessons (60 questions).");
}

run().catch(console.error).finally(() => prisma.$disconnect());
