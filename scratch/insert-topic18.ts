import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const easyLesson1 = [
  { question: "The woman ________ lives next door is a doctor.", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "A", explanation: "Đại từ quan hệ thay thế cho người làm chủ ngữ -> who.", translation: "Người phụ nữ sống cạnh nhà là một bác sĩ.", tips: "who + V (chủ ngữ chỉ người)" },
  { question: "The book ________ I bought yesterday is very interesting.", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "C", explanation: "Đại từ quan hệ thay thế cho vật -> which/that.", translation: "Cuốn sách mà tôi mua hôm qua rất thú vị.", tips: "which + S + V (tân ngữ chỉ vật)" },
  { question: "He is the man ________ car was stolen.", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "D", explanation: "Đại từ quan hệ chỉ sở hữu -> whose + danh từ.", translation: "Anh ấy là người đàn ông mà xe ô tô bị trộm.", tips: "whose + N (sở hữu)" },
  { question: "This is the restaurant ________ we had dinner last night.", optionA: "which", optionB: "where", optionC: "when", optionD: "why", correctOption: "B", explanation: "Đại từ quan hệ chỉ nơi chốn -> where.", translation: "Đây là nhà hàng nơi chúng tôi đã ăn tối hôm qua.", tips: "where = in/at which (nơi chốn)" },
  { question: "Do you remember the day ________ we first met?", optionA: "which", optionB: "where", optionC: "when", optionD: "why", correctOption: "C", explanation: "Đại từ quan hệ chỉ thời gian -> when.", translation: "Bạn có nhớ cái ngày mà chúng ta lần đầu gặp nhau không?", tips: "when = on which (thời gian)" },
  { question: "The boy ________ you saw is my cousin.", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "B", explanation: "Đại từ quan hệ thay cho người làm tân ngữ -> whom (hoặc who).", translation: "Cậu bé mà bạn đã gặp là anh họ của tôi.", tips: "whom + S + V (tân ngữ chỉ người)" },
  { question: "The reason ________ he came late is unknown.", optionA: "which", optionB: "where", optionC: "when", optionD: "why", correctOption: "D", explanation: "Đại từ quan hệ chỉ lý do -> why.", translation: "Lý do tại sao anh ấy đến muộn vẫn chưa được biết.", tips: "reason why" },
  { question: "The dog ________ is barking loudly belongs to my neighbor.", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "C", explanation: "Thay thế cho con vật làm chủ ngữ -> which/that.", translation: "Con chó đang sủa ầm ĩ thuộc về hàng xóm của tôi.", tips: "which + V (vật/con vật)" },
  { question: "The girl ________ mother is a teacher is very smart.", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "D", explanation: "Sở hữu cách của 'the girl' đối với 'mother'.", translation: "Cô gái có mẹ là giáo viên rất thông minh.", tips: "whose + N" },
  { question: "I don't like people ________ tell lies.", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "A", explanation: "Thay thế cho người làm chủ ngữ -> who.", translation: "Tôi không thích những người nói dối.", tips: "who + V" }
];

const easyLesson2 = [
  { question: "Can you see the cat ________ is sleeping on the sofa?", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "C", explanation: "Thay thế cho vật/con vật làm chủ ngữ.", translation: "Bạn có thấy con mèo đang ngủ trên ghế không?", tips: "which + V" },
  { question: "The student ________ I talked to yesterday is very friendly.", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "B", explanation: "Thay thế cho người làm tân ngữ (talked to him/her).", translation: "Người học sinh mà tôi nói chuyện hôm qua rất thân thiện.", tips: "whom + S + V" },
  { question: "The house ________ roof is red is mine.", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "D", explanation: "whose có thể dùng cho cả người và vật (sở hữu).", translation: "Ngôi nhà có mái màu đỏ là của tôi.", tips: "whose + N" },
  { question: "Summer is the season ________ I like best.", optionA: "which", optionB: "where", optionC: "when", optionD: "why", correctOption: "A", explanation: "Ở đây 'the season' làm tân ngữ cho 'like' (like it best), nên dùng which/that.", translation: "Mùa hè là mùa mà tôi thích nhất.", tips: "which làm tân ngữ" },
  { question: "The hotel ________ we stayed was very clean.", optionA: "which", optionB: "where", optionC: "when", optionD: "why", correctOption: "B", explanation: "Chỉ nơi chốn (stayed there).", translation: "Khách sạn nơi chúng tôi ở rất sạch sẽ.", tips: "where + S + V" },
  { question: "Tell me the reason ________ you didn't do your homework.", optionA: "which", optionB: "where", optionC: "when", optionD: "why", correctOption: "D", explanation: "reason + why.", translation: "Hãy cho tôi biết lý do tại sao bạn không làm bài tập.", tips: "reason why" },
  { question: "The man ________ lives here is a famous singer.", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "A", explanation: "Thay cho người làm chủ ngữ.", translation: "Người đàn ông sống ở đây là một ca sĩ nổi tiếng.", tips: "who + V" },
  { question: "The letters ________ I sent arrived yesterday.", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "C", explanation: "Thay cho vật làm tân ngữ.", translation: "Những lá thư mà tôi gửi đã đến vào ngày hôm qua.", tips: "which + S + V" },
  { question: "1990 was the year ________ my brother was born.", optionA: "which", optionB: "where", optionC: "when", optionD: "why", correctOption: "C", explanation: "Chỉ thời gian.", translation: "Năm 1990 là năm mà anh trai tôi ra đời.", tips: "when + S + V" },
  { question: "The woman ________ bag was stolen called the police.", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "D", explanation: "Sở hữu (túi của cô ấy).", translation: "Người phụ nữ bị trộm túi đã gọi cảnh sát.", tips: "whose + N" }
];

const mediumLesson1 = [
  { question: "The picture ________ was painted by Picasso was sold for millions.", optionA: "who", optionB: "which", optionC: "whom", optionD: "whose", correctOption: "B", explanation: "Mệnh đề quan hệ xác định thay cho vật.", translation: "Bức tranh được vẽ bởi Picasso đã được bán với giá hàng triệu đô.", tips: "which + V" },
  { question: "Mr. Smith, ________ I spoke to on the phone, is the manager.", optionA: "who", optionB: "whom", optionC: "that", optionD: "whose", correctOption: "B", explanation: "Mệnh đề quan hệ không xác định, sau dấu phẩy, làm tân ngữ -> whom.", translation: "Ông Smith, người mà tôi đã nói chuyện qua điện thoại, là quản lý.", tips: "whom (sau dấu phẩy)" },
  { question: "The car ________ we are traveling in is very old.", optionA: "which", optionB: "where", optionC: "when", optionD: "who", correctOption: "A", explanation: "Có giới từ 'in' ở cuối mệnh đề, nên dùng which làm tân ngữ chỉ vật.", translation: "Chiếc xe mà chúng tôi đang đi rất cũ.", tips: "which ... in" },
  { question: "The house in ________ he lives is very large.", optionA: "which", optionB: "where", optionC: "that", optionD: "whom", correctOption: "A", explanation: "Sau giới từ (in) chỉ dùng whom (cho người) hoặc which (cho vật). Không dùng that/where.", translation: "Ngôi nhà nơi anh ấy sống rất rộng.", tips: "Giới từ + which/whom" },
  { question: "I respect people ________ opinions are different from mine.", optionA: "who", optionB: "whom", optionC: "whose", optionD: "which", correctOption: "C", explanation: "whose + danh từ (ý kiến của họ).", translation: "Tôi tôn trọng những người có ý kiến khác với tôi.", tips: "whose + N" },
  { question: "He failed the exam, ________ disappointed his parents.", optionA: "who", optionB: "which", optionC: "that", optionD: "what", correctOption: "B", explanation: "which thay thế cho toàn bộ mệnh đề phía trước (sự việc anh ấy thi trượt).", translation: "Anh ấy thi trượt, điều này làm cha mẹ anh ấy thất vọng.", tips: "which thay cho cả câu" },
  { question: "The day on ________ they arrived was Sunday.", optionA: "when", optionB: "which", optionC: "where", optionD: "that", correctOption: "B", explanation: "Sau giới từ 'on' dùng 'which'. (on which = when).", translation: "Ngày mà họ đến là Chủ nhật.", tips: "on which = when" },
  { question: "The girl ________ is sitting next to you is my sister.", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "A", explanation: "Chủ ngữ chỉ người.", translation: "Cô gái đang ngồi cạnh bạn là chị gái của tôi.", tips: "who + V" },
  { question: "This is the town ________ I grew up.", optionA: "which", optionB: "where", optionC: "in that", optionD: "when", correctOption: "B", explanation: "Nơi chốn (grew up there).", translation: "Đây là thị trấn nơi tôi lớn lên.", tips: "where = in which" },
  { question: "Is there anything ________ I can do to help?", optionA: "who", optionB: "what", optionC: "that", optionD: "whom", correctOption: "C", explanation: "Sau các đại từ bất định (anything, nothing, everything,...) luôn dùng 'that'.", translation: "Có điều gì tôi có thể làm để giúp không?", tips: "anything/nothing + that" }
];

const mediumLesson2 = [
  { question: "The man ________ wallet I found gave me a reward.", optionA: "who", optionB: "whom", optionC: "which", optionD: "whose", correctOption: "D", explanation: "Sở hữu (ví của ông ấy).", translation: "Người đàn ông mà tôi tìm thấy ví đã tặng tôi phần thưởng.", tips: "whose + N" },
  { question: "Paris, ________ is the capital of France, is very beautiful.", optionA: "which", optionB: "that", optionC: "where", optionD: "what", correctOption: "A", explanation: "Mệnh đề không xác định (có dấu phẩy), thay cho vật -> which. Không dùng 'that' sau dấu phẩy.", translation: "Paris, thủ đô của nước Pháp, rất đẹp.", tips: "which (sau dấu phẩy)" },
  { question: "The people with ________ I was working were very helpful.", optionA: "who", optionB: "whom", optionC: "which", optionD: "that", correctOption: "B", explanation: "Sau giới từ 'with' thay cho người -> whom.", translation: "Những người mà tôi làm việc cùng rất hay giúp đỡ.", tips: "with whom" },
  { question: "I'll never forget the time ________ I spent in London.", optionA: "when", optionB: "which", optionC: "where", optionD: "whom", correctOption: "B", explanation: "Ở đây 'the time' làm tân ngữ cho động từ 'spent' (spent time), nên dùng which/that, không dùng when.", translation: "Tôi sẽ không bao giờ quên khoảng thời gian mà tôi đã dành ở London.", tips: "which làm tân ngữ" },
  { question: "She is the only person ________ can solve this problem.", optionA: "who", optionB: "which", optionC: "whom", optionD: "that", correctOption: "D", explanation: "Sau 'the only', 'the first', 'the last' luôn dùng 'that' hoặc 'to V'. (who cũng chấp nhận được nhưng 'that' là tốt nhất).", translation: "Cô ấy là người duy nhất có thể giải quyết vấn đề này.", tips: "the only + that" },
  { question: "He gave me a book, ________ I have already read.", optionA: "which", optionB: "that", optionC: "who", optionD: "what", correctOption: "A", explanation: "Mệnh đề không xác định, thay cho vật -> which.", translation: "Anh ấy đưa tôi một cuốn sách, thứ mà tôi đã đọc rồi.", tips: "which (sau dấu phẩy)" },
  { question: "The reason for ________ he was absent is unknown.", optionA: "why", optionB: "which", optionC: "that", optionD: "whom", correctOption: "B", explanation: "Sau giới từ 'for' dùng which. (for which = why).", translation: "Lý do anh ấy vắng mặt vẫn chưa rõ.", tips: "for which = why" },
  { question: "The team ________ won the match celebrated enthusiastically.", optionA: "who", optionB: "which", optionC: "whom", optionD: "whose", correctOption: "B", explanation: "Tập hợp (team) xem như vật/tổ chức -> which (hoặc that).", translation: "Đội thắng trận đấu đã ăn mừng nhiệt tình.", tips: "which/that (chỉ tổ chức/tập thể)" },
  { question: "My mother, ________ you met yesterday, is a doctor.", optionA: "who", optionB: "whom", optionC: "that", optionD: "which", correctOption: "B", explanation: "Tân ngữ chỉ người trong MĐQH không xác định -> whom.", translation: "Mẹ tôi, người mà bạn gặp hôm qua, là bác sĩ.", tips: "whom (sau dấu phẩy)" },
  { question: "This is the best movie ________ I have ever seen.", optionA: "which", optionB: "who", optionC: "that", optionD: "what", correctOption: "C", explanation: "Sau so sánh nhất (the best) luôn dùng 'that'.", translation: "Đây là bộ phim hay nhất mà tôi từng xem.", tips: "So sánh nhất + that" }
];

const hardLesson1 = [
  { question: "The man ________ to you yesterday is my uncle.", optionA: "talking", optionB: "talked", optionC: "who talking", optionD: "was talking", correctOption: "A", explanation: "Rút gọn mệnh đề quan hệ chủ động dùng V-ing (= who talked).", translation: "Người đàn ông nói chuyện với bạn hôm qua là chú tôi.", tips: "Rút gọn MĐQH chủ động (V-ing)" },
  { question: "The cars ________ in Japan are of high quality.", optionA: "make", optionB: "making", optionC: "made", optionD: "to make", correctOption: "C", explanation: "Rút gọn mệnh đề quan hệ bị động dùng PII (= which are made).", translation: "Những chiếc xe được sản xuất tại Nhật Bản có chất lượng cao.", tips: "Rút gọn MĐQH bị động (PII)" },
  { question: "Yuri Gagarin was the first man ________ into space.", optionA: "flew", optionB: "flying", optionC: "to fly", optionD: "flown", correctOption: "C", explanation: "Rút gọn MĐQH sau 'the first', 'the second', 'the only'... dùng to-V.", translation: "Yuri Gagarin là người đầu tiên bay vào không gian.", tips: "the first/last/only + to V" },
  { question: "He has three brothers, all of ________ are engineers.", optionA: "who", optionB: "whom", optionC: "that", optionD: "which", correctOption: "B", explanation: "Đại từ chỉ số lượng (all, some, both...) + of + whom/which.", translation: "Anh ấy có ba người anh trai, tất cả họ đều là kỹ sư.", tips: "all/some/many + of whom/which" },
  { question: "She bought a lot of books, most of ________ she hasn't read.", optionA: "which", optionB: "that", optionC: "whom", optionD: "them", correctOption: "A", explanation: "Đại từ chỉ số lượng + of + which (thay cho vật).", translation: "Cô ấy đã mua rất nhiều sách, phần lớn trong số đó cô ấy chưa đọc.", tips: "most of which" },
  { question: "They didn't tell me the reason ________ they were late.", optionA: "why", optionB: "for which", optionC: "which", optionD: "Both A and B", correctOption: "D", explanation: "why = for which.", translation: "Họ không cho tôi biết lý do tại sao họ đến muộn.", tips: "why = for which" },
  { question: "The students ________ late will be punished.", optionA: "come", optionB: "coming", optionC: "to come", optionD: "came", correctOption: "B", explanation: "Rút gọn MĐQH chủ động dùng V-ing.", translation: "Những học sinh đến muộn sẽ bị phạt.", tips: "V-ing (chủ động)" },
  { question: "I have some letters ________.", optionA: "to type", optionB: "typing", optionC: "typed", optionD: "type", correctOption: "A", explanation: "Rút gọn MĐQH chỉ mục đích (have sth to do).", translation: "Tôi có vài bức thư cần phải đánh máy.", tips: "have sth to V" },
  { question: "The bridge ________ in 2000 is now being repaired.", optionA: "building", optionB: "built", optionC: "which built", optionD: "to build", correctOption: "B", explanation: "Rút gọn MĐQH bị động dùng PII.", translation: "Cây cầu được xây năm 2000 hiện đang được sửa chữa.", tips: "PII (bị động)" },
  { question: "There were 50 people at the party, many of ________ I had never met.", optionA: "who", optionB: "them", optionC: "which", optionD: "whom", correctOption: "D", explanation: "many of + whom.", translation: "Có 50 người tại bữa tiệc, nhiều người trong số họ tôi chưa từng gặp.", tips: "many of whom" }
];

const hardLesson2 = [
  { question: "The house ________ at the corner is for sale.", optionA: "standing", optionB: "stood", optionC: "is standing", optionD: "to stand", correctOption: "A", explanation: "Rút gọn MĐQH chủ động (which stands/is standing).", translation: "Ngôi nhà nằm ở góc đường đang được rao bán.", tips: "V-ing (chủ động)" },
  { question: "The last person ________ the room must turn off the lights.", optionA: "leaving", optionB: "left", optionC: "leaves", optionD: "to leave", correctOption: "D", explanation: "Sau 'the last' dùng to-V.", translation: "Người cuối cùng rời khỏi phòng phải tắt đèn.", tips: "the last + to V" },
  { question: "He asked me a question ________ I couldn't answer.", optionA: "to which", optionB: "which", optionC: "that", optionD: "Both B and C", correctOption: "D", explanation: "which hoặc that đóng vai trò tân ngữ đều đúng.", translation: "Anh ấy hỏi tôi một câu hỏi mà tôi không thể trả lời.", tips: "which/that làm tân ngữ" },
  { question: "The company ________ I have worked for 10 years is going bankrupt.", optionA: "where", optionB: "for which", optionC: "which", optionD: "Both B and C", correctOption: "B", explanation: "work for -> for which (hoặc which ... for).", translation: "Công ty nơi tôi làm việc 10 năm đang phá sản.", tips: "for which" },
  { question: "He passed the exam, ________ surprised everyone.", optionA: "who", optionB: "which", optionC: "that", optionD: "what", correctOption: "B", explanation: "which thay thế cho cả mệnh đề phía trước.", translation: "Anh ấy đã thi đỗ, điều này làm mọi người ngạc nhiên.", tips: "which (thay cho mệnh đề)" },
  { question: "The ideas ________ in this book are very complicated.", optionA: "presented", optionB: "presenting", optionC: "to present", optionD: "present", correctOption: "A", explanation: "Rút gọn MĐQH bị động (which are presented).", translation: "Những ý tưởng được trình bày trong cuốn sách này rất phức tạp.", tips: "PII (bị động)" },
  { question: "I have two sisters, neither of ________ is married.", optionA: "who", optionB: "whom", optionC: "which", optionD: "them", correctOption: "B", explanation: "neither of whom.", translation: "Tôi có hai chị gái, không ai trong số họ đã kết hôn.", tips: "neither of whom" },
  { question: "The package ________ yesterday has not arrived yet.", optionA: "sent", optionB: "sending", optionC: "to send", optionD: "which sent", correctOption: "A", explanation: "Rút gọn MĐQH bị động (which was sent).", translation: "Gói hàng được gửi đi ngày hôm qua vẫn chưa đến.", tips: "PII (bị động)" },
  { question: "The man ________ to the hospital is recovering.", optionA: "taking", optionB: "taken", optionC: "who took", optionD: "was taken", correctOption: "B", explanation: "Rút gọn MĐQH bị động (who was taken).", translation: "Người đàn ông được đưa đến bệnh viện đang hồi phục.", tips: "PII (bị động)" },
  { question: "Anyone ________ in the trip should register before Friday.", optionA: "interested", optionB: "interesting", optionC: "who interest", optionD: "interests", correctOption: "A", explanation: "Rút gọn MĐQH chứa tính từ (who is interested in).", translation: "Bất cứ ai quan tâm đến chuyến đi nên đăng ký trước thứ Sáu.", tips: "Rút gọn còn tính từ" }
];

async function run() {
  const slug = "menh-de-quan-he";
  const title = "18. Mệnh đề quan hệ (Relative Clauses)";
  
  let topic = await prisma.toeicGrammarTopic.findUnique({ where: { slug } });
  if (topic) {
    console.log("Topic 18 already exists!");
    return;
  }
  
  topic = await prisma.toeicGrammarTopic.create({
    data: {
      title,
      subtitle: "Đại từ quan hệ và rút gọn mệnh đề quan hệ",
      slug,
      level: "Nâng Cao",
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
        title: `${l.title}: Mệnh đề quan hệ`,
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

  console.log("Created Topic 18: Relative Clauses with 6 lessons (60 questions).");
}

run().catch(console.error).finally(() => prisma.$disconnect());
