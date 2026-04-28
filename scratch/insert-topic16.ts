import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const easyLesson1 = [
  { question: "The letter ________ by Mary yesterday.", optionA: "wrote", optionB: "was written", optionC: "has written", optionD: "writes", correctOption: "B", explanation: "Bị động quá khứ đơn: was/were + PII.", translation: "Bức thư được viết bởi Mary hôm qua.", tips: "yesterday -> QKĐ bị động" },
  { question: "English ________ all over the world.", optionA: "speaks", optionB: "is speaking", optionC: "is spoken", optionD: "has spoken", correctOption: "C", explanation: "Sự thật hiển nhiên -> Bị động hiện tại đơn.", translation: "Tiếng Anh được nói trên toàn thế giới.", tips: "Hiện tại đơn bị động: am/is/are + PII" },
  { question: "A new supermarket ________ next year.", optionA: "will build", optionB: "will be built", optionC: "builds", optionD: "is built", correctOption: "B", explanation: "next year -> Tương lai đơn bị động.", translation: "Một siêu thị mới sẽ được xây vào năm tới.", tips: "TLĐ bị động: will be + PII" },
  { question: "My car ________ right now.", optionA: "is repairing", optionB: "repairs", optionC: "is being repaired", optionD: "was repaired", correctOption: "C", explanation: "right now -> Bị động hiện tại tiếp diễn.", translation: "Xe của tôi đang được sửa chữa ngay bây giờ.", tips: "HTTD bị động: am/is/are being + PII" },
  { question: "The room ________ every day.", optionA: "cleans", optionB: "is cleaned", optionC: "cleaned", optionD: "is cleaning", correctOption: "B", explanation: "every day -> Bị động hiện tại đơn.", translation: "Căn phòng được dọn dẹp mỗi ngày.", tips: "every day -> HTĐ bị động" },
  { question: "The report ________ by the manager tomorrow.", optionA: "will review", optionB: "will be reviewed", optionC: "reviews", optionD: "is reviewed", correctOption: "B", explanation: "tomorrow -> Bị động tương lai đơn.", translation: "Bản báo cáo sẽ được quản lý xem xét vào ngày mai.", tips: "tomorrow -> will be + PII" },
  { question: "Many houses ________ by the storm last week.", optionA: "destroyed", optionB: "were destroyed", optionC: "have destroyed", optionD: "destroy", correctOption: "B", explanation: "last week -> Bị động quá khứ đơn.", translation: "Nhiều ngôi nhà đã bị phá hủy bởi cơn bão tuần trước.", tips: "last week -> was/were + PII" },
  { question: "The cake ________ by my mother.", optionA: "is baking", optionB: "was baking", optionC: "was baked", optionD: "bakes", correctOption: "C", explanation: "Hành động đã xảy ra -> quá khứ bị động.", translation: "Chiếc bánh được nướng bởi mẹ tôi.", tips: "Bị động: be + PII" },
  { question: "The meeting ________ at 8 AM tomorrow.", optionA: "will hold", optionB: "will be held", optionC: "is held", optionD: "holds", correctOption: "B", explanation: "tomorrow -> Bị động tương lai đơn.", translation: "Cuộc họp sẽ được tổ chức lúc 8 giờ sáng mai.", tips: "will be held" },
  { question: "These shoes ________ in Italy.", optionA: "make", optionB: "made", optionC: "are made", optionD: "making", correctOption: "C", explanation: "Sự thật hiển nhiên -> Bị động hiện tại đơn.", translation: "Đôi giày này được sản xuất tại Ý.", tips: "are made" }
];

const easyLesson2 = [
  { question: "The window ________ by the boy.", optionA: "was broken", optionB: "breaks", optionC: "is breaking", optionD: "broke", correctOption: "A", explanation: "Hành động ở quá khứ -> Bị động QKĐ.", translation: "Cửa sổ đã bị cậu bé làm vỡ.", tips: "was broken" },
  { question: "All tickets ________ before the concert started.", optionA: "were sold", optionB: "sold", optionC: "had been sold", optionD: "have sold", correctOption: "C", explanation: "Hành động xảy ra trước 1 hành động quá khứ (started) -> Bị động QKHT.", translation: "Tất cả vé đã được bán hết trước khi buổi hòa nhạc bắt đầu.", tips: "Bị động QKHT: had been + PII" },
  { question: "This song ________ by millions of people.", optionA: "loves", optionB: "is loved", optionC: "loved", optionD: "is loving", correctOption: "B", explanation: "Sự thật hiển nhiên -> Bị động HTĐ.", translation: "Bài hát này được hàng triệu người yêu thích.", tips: "is loved" },
  { question: "The problem ________ already.", optionA: "has solved", optionB: "has been solved", optionC: "is solved", optionD: "was solving", correctOption: "B", explanation: "already -> Bị động HTHT.", translation: "Vấn đề đã được giải quyết.", tips: "Bị động HTHT: have/has been + PII" },
  { question: "The document ________ by the secretary now.", optionA: "is typing", optionB: "types", optionC: "is being typed", optionD: "typed", correctOption: "C", explanation: "now -> Bị động HTTD.", translation: "Tài liệu đang được thư ký đánh máy.", tips: "is being typed" },
  { question: "The dog ________ twice a day.", optionA: "feeds", optionB: "is fed", optionC: "is feeding", optionD: "fed", correctOption: "B", explanation: "twice a day -> Bị động HTĐ.", translation: "Con chó được cho ăn hai lần một ngày.", tips: "is fed" },
  { question: "The truth ________ to everyone soon.", optionA: "will reveal", optionB: "will be revealed", optionC: "reveals", optionD: "revealed", correctOption: "B", explanation: "soon -> Bị động TLĐ.", translation: "Sự thật sẽ sớm được tiết lộ cho mọi người.", tips: "will be revealed" },
  { question: "The keys ________ on the table.", optionA: "were left", optionB: "left", optionC: "were leaving", optionD: "have left", correctOption: "A", explanation: "Hành động quá khứ -> Bị động QKĐ.", translation: "Những chiếc chìa khóa đã bị bỏ lại trên bàn.", tips: "were left" },
  { question: "The bill ________ by credit card.", optionA: "must pay", optionB: "must be paid", optionC: "must paid", optionD: "pays", correctOption: "B", explanation: "Bị động với modal verb: modal + be + PII.", translation: "Hóa đơn phải được thanh toán bằng thẻ tín dụng.", tips: "must be paid" },
  { question: "New trees ________ in the park next month.", optionA: "will plant", optionB: "will be planted", optionC: "plant", optionD: "planted", correctOption: "B", explanation: "next month -> Bị động TLĐ.", translation: "Cây mới sẽ được trồng trong công viên vào tháng tới.", tips: "will be planted" }
];

const mediumLesson1 = [
  { question: "The new bridge ________ by the end of this year.", optionA: "will have completed", optionB: "will have been completed", optionC: "will complete", optionD: "completes", correctOption: "B", explanation: "by the end of + tương lai -> Bị động Tương lai hoàn thành.", translation: "Cây cầu mới sẽ được hoàn thành trước cuối năm nay.", tips: "will have been + PII" },
  { question: "I remember ________ to the zoo when I was a child.", optionA: "taking", optionB: "being taken", optionC: "to take", optionD: "to be taken", correctOption: "B", explanation: "remember + V-ing (nhớ đã làm gì). Bị động: remember + being PII.", translation: "Tôi nhớ đã được đưa đi sở thú khi còn nhỏ.", tips: "remember + being PII" },
  { question: "The package ________ to your house by 5 PM.", optionA: "will deliver", optionB: "will be delivered", optionC: "delivers", optionD: "is delivered", correctOption: "B", explanation: "by 5 PM -> Bị động TLĐ.", translation: "Gói hàng sẽ được giao đến nhà bạn trước 5 giờ chiều.", tips: "will be delivered" },
  { question: "He wants his car ________ before weekend.", optionA: "to repair", optionB: "repairing", optionC: "to be repaired", optionD: "repaired", correctOption: "C", explanation: "want sth to be done: muốn cái gì được làm.", translation: "Anh ấy muốn xe của mình được sửa trước cuối tuần.", tips: "want sth to be PII" },
  { question: "A lot of money ________ on advertising every year.", optionA: "spends", optionB: "is spent", optionC: "are spent", optionD: "spend", correctOption: "B", explanation: "Money là danh từ không đếm được -> động từ số ít. every year -> Bị động HTĐ.", translation: "Rất nhiều tiền được chi cho quảng cáo mỗi năm.", tips: "is spent" },
  { question: "The thief ________ by the police right now.", optionA: "is chasing", optionB: "is being chased", optionC: "has chased", optionD: "chases", correctOption: "B", explanation: "right now -> Bị động HTTD.", translation: "Tên trộm đang bị cảnh sát đuổi theo ngay lúc này.", tips: "is being chased" },
  { question: "Nothing ________ about this issue so far.", optionA: "has done", optionB: "has been done", optionC: "is done", optionD: "was done", correctOption: "B", explanation: "so far -> Bị động HTHT. Nothing là chủ ngữ số ít.", translation: "Cho đến nay vẫn chưa có gì được thực hiện về vấn đề này.", tips: "has been done" },
  { question: "They expect the project ________ early.", optionA: "to finish", optionB: "to be finished", optionC: "finishing", optionD: "finished", correctOption: "B", explanation: "expect sth to be done.", translation: "Họ hy vọng dự án sẽ được hoàn thành sớm.", tips: "expect to be PII" },
  { question: "My computer ________ right now.", optionA: "is fixing", optionB: "is being fixed", optionC: "fixes", optionD: "has fixed", correctOption: "B", explanation: "right now -> Bị động HTTD.", translation: "Máy tính của tôi đang được sửa chữa ngay bây giờ.", tips: "is being fixed" },
  { question: "The contract ________ before the manager arrived.", optionA: "signed", optionB: "had signed", optionC: "had been signed", optionD: "was signing", correctOption: "C", explanation: "Hành động trước 1 thời điểm QK -> Bị động QKHT.", translation: "Hợp đồng đã được ký trước khi người quản lý đến.", tips: "had been signed" }
];

const mediumLesson2 = [
  { question: "Children should ________ how to swim.", optionA: "teach", optionB: "be taught", optionC: "teaching", optionD: "have taught", correctOption: "B", explanation: "Bị động modal verb: should be + PII.", translation: "Trẻ em nên được dạy bơi.", tips: "should be taught" },
  { question: "I don't like ________ what to do.", optionA: "telling", optionB: "being told", optionC: "to tell", optionD: "to be telling", correctOption: "B", explanation: "like + V-ing. Bị động: like + being PII.", translation: "Tôi không thích bị bảo phải làm gì.", tips: "like being told" },
  { question: "The building ________ when the fire broke out.", optionA: "evacuated", optionB: "was evacuating", optionC: "was being evacuated", optionD: "had evacuated", correctOption: "C", explanation: "Hành động đang xảy ra trong quá khứ -> Bị động QKTD.", translation: "Tòa nhà đang được sơ tán khi hỏa hoạn bùng phát.", tips: "was being evacuated" },
  { question: "This machine needs ________.", optionA: "to repair", optionB: "repairing", optionC: "repaired", optionD: "be repaired", correctOption: "B", explanation: "need + V-ing mang nghĩa bị động.", translation: "Cái máy này cần được sửa chữa.", tips: "need + V-ing = need to be PII" },
  { question: "It is said that the earth ________ round.", optionA: "is", optionB: "was", optionC: "be", optionD: "has been", correctOption: "A", explanation: "Sự thật hiển nhiên -> HTĐ.", translation: "Người ta nói rằng trái đất hình tròn.", tips: "Sự thật -> HTĐ" },
  { question: "The work ________ by 5 o'clock.", optionA: "must finish", optionB: "must be finished", optionC: "must have finished", optionD: "finishes", correctOption: "B", explanation: "Bị động modal verb: must be + PII.", translation: "Công việc phải được hoàn thành trước 5 giờ.", tips: "must be finished" },
  { question: "The test ________ next week.", optionA: "is going to take", optionB: "is going to be taken", optionC: "takes", optionD: "will take", correctOption: "B", explanation: "Bị động tương lai gần: be going to be + PII.", translation: "Bài kiểm tra sẽ được thực hiện vào tuần tới.", tips: "is going to be taken" },
  { question: "The email ________ yesterday.", optionA: "was sent", optionB: "sent", optionC: "has been sent", optionD: "is sent", correctOption: "A", explanation: "yesterday -> Bị động QKĐ.", translation: "Email đã được gửi ngày hôm qua.", tips: "was sent" },
  { question: "The novel ________ into many languages.", optionA: "has translated", optionB: "has been translated", optionC: "translates", optionD: "is translating", correctOption: "B", explanation: "Sự việc bắt đầu từ QK đến hiện tại -> Bị động HTHT.", translation: "Cuốn tiểu thuyết đã được dịch ra nhiều thứ tiếng.", tips: "has been translated" },
  { question: "The room looks nice. It ________.", optionA: "was cleaned", optionB: "has just been cleaned", optionC: "is cleaned", optionD: "had been cleaned", correctOption: "B", explanation: "Kết quả ở hiện tại (looks nice) -> Hành động vừa mới xảy ra (HTHT bị động).", translation: "Căn phòng trông rất đẹp. Nó vừa mới được dọn dẹp.", tips: "has just been cleaned" }
];

const hardLesson1 = [
  { question: "She objected to ________ like a child.", optionA: "treat", optionB: "treating", optionC: "being treated", optionD: "be treated", correctOption: "C", explanation: "object to + V-ing. Bị động: object to + being PII.", translation: "Cô ấy phản đối việc bị đối xử như một đứa trẻ.", tips: "object to being PII" },
  { question: "It is essential that the documents ________ immediately.", optionA: "are sent", optionB: "be sent", optionC: "will be sent", optionD: "sent", correctOption: "B", explanation: "Câu giả định (essential that... S + V-inf). Bị động: be + PII.", translation: "Điều cần thiết là các tài liệu phải được gửi ngay lập tức.", tips: "Giả định: be PII" },
  { question: "The man ________ to have stolen the car was arrested.", optionA: "believed", optionB: "was believed", optionC: "believing", optionD: "who believes", correctOption: "A", explanation: "Mệnh đề quan hệ rút gọn mang nghĩa bị động -> dùng PII (believed).", translation: "Người đàn ông được cho là đã ăn cắp chiếc xe đã bị bắt.", tips: "Rút gọn mệnh đề bị động -> PII" },
  { question: "The house needs ________ before we move in.", optionA: "to paint", optionB: "painting", optionC: "painted", optionD: "paint", correctOption: "B", explanation: "need + V-ing mang nghĩa bị động.", translation: "Ngôi nhà cần được sơn lại trước khi chúng ta chuyển vào.", tips: "need + V-ing" },
  { question: "I had my hair ________ yesterday.", optionA: "cut", optionB: "cutting", optionC: "to cut", optionD: "cuts", correctOption: "A", explanation: "Cấu trúc nhờ vả bị động: have sth PII.", translation: "Tôi đã đi cắt tóc ngày hôm qua.", tips: "have sth PII" },
  { question: "He got his car ________ by the mechanic.", optionA: "fix", optionB: "fixing", optionC: "fixed", optionD: "to fix", correctOption: "C", explanation: "Cấu trúc nhờ vả bị động: get sth PII.", translation: "Anh ấy đã nhờ thợ sửa xe của mình.", tips: "get sth PII" },
  { question: "The project is expected ________ by next month.", optionA: "to complete", optionB: "to be completed", optionC: "completing", optionD: "completed", correctOption: "B", explanation: "expect sth to be done.", translation: "Dự án dự kiến sẽ được hoàn thành vào tháng tới.", tips: "to be completed" },
  { question: "________ that the company is losing money.", optionA: "It reports", optionB: "It is reported", optionC: "Reporting", optionD: "Reported", correctOption: "B", explanation: "Bị động khách quan: It is reported that...", translation: "Người ta báo cáo rằng công ty đang thua lỗ.", tips: "It is reported that" },
  { question: "The suspect is believed ________ the country.", optionA: "to leave", optionB: "to have left", optionC: "leaving", optionD: "left", correctOption: "B", explanation: "Hành động leave xảy ra trước hành động believe -> to have PII.", translation: "Nghi phạm được cho là đã rời khỏi đất nước.", tips: "to have left (xảy ra trước)" },
  { question: "Not a single word ________ since the meeting started.", optionA: "was spoken", optionB: "has been spoken", optionC: "is spoken", optionD: "spoke", correctOption: "B", explanation: "since -> Bị động HTHT.", translation: "Không một lời nào được nói ra kể từ khi cuộc họp bắt đầu.", tips: "has been spoken" }
];

const hardLesson2 = [
  { question: "By the time we arrive, the preparations ________.", optionA: "will finish", optionB: "will be finished", optionC: "will have been finished", optionD: "have finished", correctOption: "C", explanation: "By the time + HTĐ, TLHT. Bị động: will have been PII.", translation: "Vào thời điểm chúng ta đến, công việc chuẩn bị sẽ được hoàn thành.", tips: "will have been finished" },
  { question: "He was made ________ the whole document again.", optionA: "type", optionB: "to type", optionC: "typing", optionD: "typed", correctOption: "B", explanation: "Bị động của make: be made to V.", translation: "Anh ấy bị buộc phải đánh máy lại toàn bộ tài liệu.", tips: "be made to V" },
  { question: "She resents ________ what to do.", optionA: "telling", optionB: "being told", optionC: "to tell", optionD: "to be told", correctOption: "B", explanation: "resent + V-ing. Bị động: resent + being PII.", translation: "Cô ấy bực tức vì bị bảo phải làm gì.", tips: "resent being PII" },
  { question: "The instructions must ________ carefully.", optionA: "follow", optionB: "be followed", optionC: "followed", optionD: "following", correctOption: "B", explanation: "Modal verb bị động: must be + PII.", translation: "Các hướng dẫn phải được tuân theo cẩn thận.", tips: "must be followed" },
  { question: "I remember ________ to Paris when I was very young.", optionA: "taking", optionB: "to take", optionC: "being taken", optionD: "to be taken", correctOption: "C", explanation: "remember + V-ing. Bị động: remember being PII.", translation: "Tôi nhớ đã được đưa đến Paris khi còn rất nhỏ.", tips: "remember being taken" },
  { question: "The books ________ on the top shelf belong to him.", optionA: "placed", optionB: "placing", optionC: "were placed", optionD: "are placed", correctOption: "A", explanation: "Mệnh đề quan hệ rút gọn bị động -> PII.", translation: "Những cuốn sách được đặt trên kệ trên cùng thuộc về anh ấy.", tips: "Rút gọn MĐQH bị động (PII)" },
  { question: "He prefers ________ by his nickname.", optionA: "calling", optionB: "being called", optionC: "to call", optionD: "call", correctOption: "B", explanation: "prefer + V-ing. Bị động: prefer + being PII.", translation: "Anh ấy thích được gọi bằng biệt danh của mình hơn.", tips: "prefer being called" },
  { question: "The letter is supposed ________ yesterday.", optionA: "to send", optionB: "to be sent", optionC: "to have been sent", optionD: "sending", correctOption: "C", explanation: "Hành động gửi (send) xảy ra trong quá khứ (yesterday) -> to have been PII.", translation: "Lá thư lẽ ra phải được gửi vào ngày hôm qua.", tips: "to have been sent" },
  { question: "There is nothing ________.", optionA: "to do", optionB: "to be done", optionC: "doing", optionD: "done", correctOption: "B", explanation: "Nothing to be done: Không có gì để được thực hiện (cấu trúc bị động của to V).", translation: "Không có gì để làm cả.", tips: "to be done" },
  { question: "It is rumored that the CEO ________ next month.", optionA: "will replace", optionB: "will be replaced", optionC: "replaces", optionD: "is replaced", correctOption: "B", explanation: "next month -> Bị động tương lai đơn.", translation: "Có tin đồn rằng CEO sẽ được thay thế vào tháng tới.", tips: "will be replaced" }
];

async function run() {
  const slug = "cau-bi-dong";
  const title = "16. Câu bị động (Passive Voice)";
  
  let topic = await prisma.toeicGrammarTopic.findUnique({ where: { slug } });
  if (topic) {
    console.log("Topic already exists!");
    return;
  }
  
  topic = await prisma.toeicGrammarTopic.create({
    data: {
      title,
      subtitle: "Cách nhận biết và chia động từ ở thể bị động",
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
        title: `${l.title}: Câu bị động`,
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

  console.log("Created Topic 16: Passive Voice with 6 lessons (60 questions).");
}

run().catch(console.error).finally(() => prisma.$disconnect());
