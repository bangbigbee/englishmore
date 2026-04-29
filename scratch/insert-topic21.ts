import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const easyLesson1 = [
  { question: "He said, 'I live in New York.' \n→ He said that he ________ in New York.", optionA: "lives", optionB: "lived", optionC: "has lived", optionD: "living", correctOption: "B", explanation: "Lùi thì: Hiện tại đơn (live) lùi thành Quá khứ đơn (lived).", translation: "Anh ấy nói rằng anh ấy sống ở New York.", tips: "Lùi 1 thì về quá khứ" },
  { question: "She said, 'I am reading a book.' \n→ She said that she ________ a book.", optionA: "is reading", optionB: "reads", optionC: "was reading", optionD: "has read", correctOption: "C", explanation: "Lùi thì: Hiện tại tiếp diễn (am reading) lùi thành Quá khứ tiếp diễn (was reading).", translation: "Cô ấy nói rằng cô ấy đang đọc một cuốn sách.", tips: "HTTD -> QKTD" },
  { question: "They said, 'We will go to the cinema.' \n→ They said that they ________ to the cinema.", optionA: "will go", optionB: "would go", optionC: "go", optionD: "went", correctOption: "B", explanation: "Lùi thì: will lùi thành would.", translation: "Họ nói rằng họ sẽ đi xem phim.", tips: "will -> would" },
  { question: "He asked me, 'Where do you live?' \n→ He asked me where I ________.", optionA: "live", optionB: "lived", optionC: "do live", optionD: "did live", correctOption: "B", explanation: "Câu hỏi dạng Wh- gián tiếp: từ để hỏi + S + V (lùi thì). do live -> lived.", translation: "Anh ấy hỏi tôi sống ở đâu.", tips: "Bỏ trợ ĐT, lùi thì" },
  { question: "Mary said, 'I have finished my homework.' \n→ Mary said that she ________ her homework.", optionA: "finished", optionB: "has finished", optionC: "had finished", optionD: "finishes", correctOption: "C", explanation: "Lùi thì: Hiện tại hoàn thành (have finished) lùi thành Quá khứ hoàn thành (had finished).", translation: "Mary nói rằng cô ấy đã hoàn thành bài tập về nhà.", tips: "HTHT -> QKHT" },
  { question: "John said, 'I can speak English.' \n→ John said that he ________ speak English.", optionA: "can", optionB: "could", optionC: "would", optionD: "should", correctOption: "B", explanation: "Lùi thì: can lùi thành could.", translation: "John nói rằng anh ấy có thể nói tiếng Anh.", tips: "can -> could" },
  { question: "She told me, 'Close the door!' \n→ She told me ________ the door.", optionA: "close", optionB: "to close", optionC: "closing", optionD: "closed", correctOption: "B", explanation: "Câu mệnh lệnh gián tiếp: tell/ask sb to V.", translation: "Cô ấy bảo tôi đóng cửa lại.", tips: "Mệnh lệnh: to V" },
  { question: "The teacher said, 'Don't talk in class!' \n→ The teacher told us ________ in class.", optionA: "not talk", optionB: "don't talk", optionC: "not to talk", optionD: "to not talk", correctOption: "C", explanation: "Câu mệnh lệnh phủ định gián tiếp: tell/ask sb not to V.", translation: "Giáo viên bảo chúng tôi không được nói chuyện trong lớp.", tips: "Phủ định: not to V" },
  { question: "He said, 'I must go now.' \n→ He said that he ________ go then.", optionA: "must", optionB: "had to", optionC: "have to", optionD: "has to", correctOption: "B", explanation: "Lùi thì: must lùi thành had to. (now -> then).", translation: "Anh ấy nói rằng anh ấy phải đi ngay lúc đó.", tips: "must -> had to" },
  { question: "She asked, 'Are you tired?' \n→ She asked me ________ I was tired.", optionA: "if", optionB: "that", optionC: "what", optionD: "who", correctOption: "A", explanation: "Câu hỏi Yes/No gián tiếp dùng if hoặc whether.", translation: "Cô ấy hỏi tôi liệu tôi có mệt không.", tips: "Yes/No dùng If/Whether" }
];

const easyLesson2 = [
  { question: "Peter said, 'I saw her yesterday.' \n→ Peter said that he had seen her ________.", optionA: "yesterday", optionB: "the previous day", optionC: "tomorrow", optionD: "today", correctOption: "B", explanation: "Đổi trạng từ thời gian: yesterday -> the previous day / the day before.", translation: "Peter nói rằng anh ấy đã gặp cô ấy vào ngày hôm trước.", tips: "yesterday -> the previous day" },
  { question: "She said, 'I will do it tomorrow.' \n→ She said that she would do it ________.", optionA: "tomorrow", optionB: "the following day", optionC: "yesterday", optionD: "now", correctOption: "B", explanation: "Đổi trạng từ thời gian: tomorrow -> the following day / the next day.", translation: "Cô ấy nói rằng cô ấy sẽ làm điều đó vào ngày hôm sau.", tips: "tomorrow -> the following day" },
  { question: "He said, 'I am busy today.' \n→ He said that he was busy ________.", optionA: "today", optionB: "yesterday", optionC: "that day", optionD: "this day", correctOption: "C", explanation: "Đổi trạng từ thời gian: today -> that day.", translation: "Anh ấy nói rằng hôm đó anh ấy bận.", tips: "today -> that day" },
  { question: "They said, 'We came here last week.' \n→ They said that they had gone ________ the previous week.", optionA: "here", optionB: "there", optionC: "now", optionD: "then", correctOption: "B", explanation: "Đổi trạng từ nơi chốn: here -> there.", translation: "Họ nói rằng họ đã đến đó vào tuần trước.", tips: "here -> there" },
  { question: "She said, 'I like this book.' \n→ She said that she liked ________ book.", optionA: "this", optionB: "that", optionC: "these", optionD: "those", correctOption: "B", explanation: "Đổi đại từ chỉ định: this -> that.", translation: "Cô ấy nói rằng cô ấy thích cuốn sách đó.", tips: "this -> that" },
  { question: "He asked me, 'Do you speak French?' \n→ He asked me if I ________ French.", optionA: "speak", optionB: "spoke", optionC: "spoken", optionD: "speaking", correctOption: "B", explanation: "Câu hỏi Yes/No lùi thì: speak -> spoke.", translation: "Anh ấy hỏi tôi có nói tiếng Pháp không.", tips: "Lùi 1 thì" },
  { question: "The boss said, 'Send me the report now.' \n→ The boss ordered me to send him the report ________.", optionA: "now", optionB: "then", optionC: "today", optionD: "soon", correctOption: "B", explanation: "Đổi trạng từ thời gian: now -> then.", translation: "Sếp ra lệnh cho tôi gửi báo cáo cho ông ấy ngay lúc đó.", tips: "now -> then" },
  { question: "She said, 'I may arrive late.' \n→ She said that she ________ arrive late.", optionA: "may", optionB: "might", optionC: "can", optionD: "will", correctOption: "B", explanation: "Lùi thì: may lùi thành might.", translation: "Cô ấy nói rằng cô ấy có thể đến muộn.", tips: "may -> might" },
  { question: "He said, 'We are buying these shoes.' \n→ He said that they were buying ________ shoes.", optionA: "this", optionB: "that", optionC: "these", optionD: "those", correctOption: "D", explanation: "Đổi đại từ chỉ định: these -> those.", translation: "Anh ấy nói rằng họ đang mua những đôi giày đó.", tips: "these -> those" },
  { question: "The doctor said, 'You should rest.' \n→ The doctor advised me that I ________ rest.", optionA: "should", optionB: "shall", optionC: "will", optionD: "can", correctOption: "A", explanation: "should không bị lùi thì trong câu gián tiếp.", translation: "Bác sĩ khuyên tôi nên nghỉ ngơi.", tips: "should giữ nguyên" }
];

const mediumLesson1 = [
  { question: "He asked me, 'What time does the train leave?' \n→ He asked me what time ________.", optionA: "does the train leave", optionB: "the train left", optionC: "did the train leave", optionD: "the train leaves", correctOption: "B", explanation: "Đổi thành câu trần thuật (không đảo ngữ) và lùi thì: the train left.", translation: "Anh ấy hỏi tôi mấy giờ chuyến tàu khởi hành.", tips: "Wh- + S + V lùi thì" },
  { question: "She said, 'If I had money, I would buy a car.' \n→ She said that if she ________ money, she would buy a car.", optionA: "has", optionB: "had", optionC: "had had", optionD: "having", correctOption: "B", explanation: "Câu điều kiện loại 2 không bị lùi thì trong câu gián tiếp.", translation: "Cô ấy nói rằng nếu cô ấy có tiền, cô ấy sẽ mua một chiếc xe hơi.", tips: "Câu ĐK loại 2, 3 giữ nguyên" },
  { question: "The manager asked, 'Have you finished the report yet?' \n→ The manager asked me if I ________ the report yet.", optionA: "have finished", optionB: "had finished", optionC: "finished", optionD: "was finishing", correctOption: "B", explanation: "HTHT lùi thành QKHT.", translation: "Quản lý hỏi tôi đã hoàn thành báo cáo chưa.", tips: "HTHT -> QKHT" },
  { question: "He asked, 'Why didn't you come to the party?' \n→ He asked me why I ________ to the party.", optionA: "didn't come", optionB: "haven't come", optionC: "hadn't come", optionD: "wouldn't come", correctOption: "C", explanation: "Quá khứ đơn (didn't come) lùi thành Quá khứ hoàn thành (hadn't come).", translation: "Anh ấy hỏi tôi tại sao tôi không đến dự tiệc.", tips: "QKĐ -> QKHT" },
  { question: "She said, 'Water boils at 100 degrees Celsius.' \n→ She said that water ________ at 100 degrees Celsius.", optionA: "boil", optionB: "boiled", optionC: "boils", optionD: "is boiling", correctOption: "C", explanation: "Chân lý, sự thật hiển nhiên không lùi thì.", translation: "Cô ấy nói rằng nước sôi ở 100 độ C.", tips: "Sự thật hiển nhiên không lùi thì" },
  { question: "He said, 'I was sleeping when the phone rang.' \n→ He said that he ________ when the phone had rung.", optionA: "was sleeping", optionB: "had been sleeping", optionC: "slept", optionD: "has been sleeping", correctOption: "B", explanation: "Quá khứ tiếp diễn lùi thành Quá khứ hoàn thành tiếp diễn.", translation: "Anh ấy nói rằng anh ấy đang ngủ khi điện thoại reo.", tips: "QKTD -> QKHTTD" },
  { question: "The teacher told us, 'Open your books to page 50.' \n→ The teacher told us ________ our books to page 50.", optionA: "open", optionB: "opening", optionC: "to open", optionD: "opened", correctOption: "C", explanation: "Mệnh lệnh gián tiếp dùng to V.", translation: "Giáo viên bảo chúng tôi mở sách ra trang 50.", tips: "Mệnh lệnh -> to V" },
  { question: "He promised, 'I will pay you back tomorrow.' \n→ He promised that he ________ me back the following day.", optionA: "will pay", optionB: "would pay", optionC: "paid", optionD: "pays", correctOption: "B", explanation: "will lùi thành would.", translation: "Anh ấy hứa rằng anh ấy sẽ trả tiền lại cho tôi vào ngày hôm sau.", tips: "will -> would" },
  { question: "She suggested, 'Let's go for a walk.' \n→ She suggested ________ for a walk.", optionA: "to go", optionB: "going", optionC: "go", optionD: "gone", correctOption: "B", explanation: "suggest + V-ing.", translation: "Cô ấy đề nghị đi dạo.", tips: "suggest + V-ing" },
  { question: "He asked, 'Can you help me with this?' \n→ He asked me if I ________ him with that.", optionA: "can help", optionB: "could help", optionC: "helped", optionD: "will help", correctOption: "B", explanation: "can -> could, this -> that.", translation: "Anh ấy hỏi tôi có thể giúp anh ấy việc đó không.", tips: "can -> could" }
];

const mediumLesson2 = [
  { question: "Mary said, 'I used to live in Paris.' \n→ Mary said that she ________ in Paris.", optionA: "used to live", optionB: "had used to live", optionC: "lives", optionD: "lived", correctOption: "A", explanation: "used to V không bị lùi thì trong câu gián tiếp.", translation: "Mary nói rằng cô ấy đã từng sống ở Paris.", tips: "used to không lùi thì" },
  { question: "He said, 'It's time we left.' \n→ He said that it was time they ________.", optionA: "leave", optionB: "left", optionC: "had left", optionD: "would leave", correctOption: "B", explanation: "Động từ sau It's time không lùi thì (vẫn giữ nguyên QKĐ).", translation: "Anh ấy nói rằng đã đến lúc họ rời đi.", tips: "It's time S V(qk) không lùi" },
  { question: "The policeman asked the driver, 'Show me your license.' \n→ The policeman ordered the driver ________ his license.", optionA: "show", optionB: "to show", optionC: "showing", optionD: "showed", correctOption: "B", explanation: "order sb to V: ra lệnh cho ai làm gì.", translation: "Cảnh sát ra lệnh cho tài xế xuất trình giấy phép lái xe.", tips: "order sb to V" },
  { question: "She asked me, 'How long have you been waiting?' \n→ She asked me how long I ________ waiting.", optionA: "have been", optionB: "had been", optionC: "was", optionD: "am", correctOption: "B", explanation: "HTHT tiếp diễn lùi thành QKHT tiếp diễn.", translation: "Cô ấy hỏi tôi đã đợi bao lâu rồi.", tips: "HTHTTD -> QKHTTD" },
  { question: "He apologized, 'I'm sorry I broke the vase.' \n→ He apologized for ________ the vase.", optionA: "break", optionB: "breaking", optionC: "to break", optionD: "broke", correctOption: "B", explanation: "apologize for + V-ing.", translation: "Anh ấy xin lỗi vì đã làm vỡ bình hoa.", tips: "apologize for V-ing" },
  { question: "She accused him, 'You stole my money!' \n→ She accused him of ________ her money.", optionA: "steal", optionB: "stole", optionC: "stealing", optionD: "stolen", correctOption: "C", explanation: "accuse sb of + V-ing.", translation: "Cô ấy buộc tội anh ta ăn cắp tiền của cô ấy.", tips: "accuse sb of V-ing" },
  { question: "He advised me, 'You should stop smoking.' \n→ He advised me ________ smoking.", optionA: "stop", optionB: "to stop", optionC: "stopping", optionD: "stopped", correctOption: "B", explanation: "advise sb to V.", translation: "Anh ấy khuyên tôi nên bỏ thuốc lá.", tips: "advise sb to V" },
  { question: "She denied, 'I didn't take the document.' \n→ She denied ________ the document.", optionA: "to take", optionB: "taking", optionC: "take", optionD: "took", correctOption: "B", explanation: "deny + V-ing.", translation: "Cô ấy phủ nhận việc đã lấy tài liệu.", tips: "deny + V-ing" },
  { question: "He admitted, 'I made a mistake.' \n→ He admitted ________ a mistake.", optionA: "making", optionB: "to make", optionC: "make", optionD: "made", correctOption: "A", explanation: "admit + V-ing.", translation: "Anh ấy thừa nhận đã mắc sai lầm.", tips: "admit + V-ing" },
  { question: "She offered, 'Shall I carry your bag?' \n→ She offered ________ my bag.", optionA: "carrying", optionB: "to carry", optionC: "carry", optionD: "carried", correctOption: "B", explanation: "offer to V.", translation: "Cô ấy đề nghị xách túi cho tôi.", tips: "offer to V" }
];

const hardLesson1 = [
  { question: "He wondered, 'Where should I go now?' \n→ He wondered where ________ then.", optionA: "should he go", optionB: "he should go", optionC: "to go", optionD: "Both B and C", correctOption: "D", explanation: "Có 2 cách: where he should go (S + V) hoặc where to go (từ để hỏi + to V).", translation: "Anh ấy tự hỏi nên đi đâu lúc đó.", tips: "Wh- + to V hoặc Wh- + S + V" },
  { question: "She exclaimed, 'What a beautiful dress!' \n→ She exclaimed that ________ a beautiful dress.", optionA: "it is", optionB: "is it", optionC: "it was", optionD: "was it", correctOption: "C", explanation: "Câu cảm thán chuyển sang gián tiếp: S + exclaimed that + S + V (lùi thì).", translation: "Cô ấy thốt lên rằng đó là một chiếc váy đẹp.", tips: "exclaim that S V lùi thì" },
  { question: "He said, 'I wish I were rich.' \n→ He said that he wished he ________ rich.", optionA: "was", optionB: "were", optionC: "had been", optionD: "Both B and C are correct", correctOption: "B", explanation: "Câu điều ước (wish) dùng were/qk giả định không bị lùi thì trong câu gián tiếp.", translation: "Anh ấy nói rằng anh ấy ước mình giàu có.", tips: "Wish không lùi thì" },
  { question: "She reminded me, 'Don't forget to lock the door.' \n→ She reminded me ________ the door.", optionA: "not forget to lock", optionB: "to lock", optionC: "not locking", optionD: "locking", correctOption: "B", explanation: "remind sb to V (nhắc nhở ai làm gì).", translation: "Cô ấy nhắc tôi khóa cửa.", tips: "remind sb to V" },
  { question: "He congratulated her, 'Congratulations on passing the exam!' \n→ He congratulated her ________ passing the exam.", optionA: "for", optionB: "on", optionC: "about", optionD: "with", correctOption: "B", explanation: "congratulate sb on V-ing.", translation: "Anh ấy chúc mừng cô ấy vì đã qua kỳ thi.", tips: "congratulate on V-ing" },
  { question: "She threatened, 'I will call the police if you don't leave.' \n→ She threatened ________ the police if I didn't leave.", optionA: "calling", optionB: "to call", optionC: "call", optionD: "called", correctOption: "B", explanation: "threaten to V.", translation: "Cô ấy đe dọa sẽ gọi cảnh sát nếu tôi không rời đi.", tips: "threaten to V" },
  { question: "He warned us, 'Don't touch the wire.' \n→ He warned us ________ the wire.", optionA: "not to touch", optionB: "against touching", optionC: "to not touch", optionD: "Both A and B", correctOption: "D", explanation: "warn sb not to V hoặc warn sb against V-ing.", translation: "Anh ấy cảnh báo chúng tôi không được chạm vào dây điện.", tips: "warn not to V / against V-ing" },
  { question: "She suggested, 'Why don't we go out for dinner?' \n→ She suggested that we ________ out for dinner.", optionA: "go", optionB: "should go", optionC: "went", optionD: "Both A and B", correctOption: "D", explanation: "suggest that S + (should) + V-bare.", translation: "Cô ấy đề nghị chúng tôi nên đi ăn tối ở ngoài.", tips: "suggest that S (should) V-bare" },
  { question: "He insisted, 'I will pay for the meal.' \n→ He insisted ________ paying for the meal.", optionA: "on", optionB: "in", optionC: "about", optionD: "for", correctOption: "A", explanation: "insist on V-ing (khăng khăng đòi làm gì).", translation: "Anh ấy khăng khăng đòi trả tiền cho bữa ăn.", tips: "insist on V-ing" },
  { question: "She blamed him, 'It's your fault that we are late.' \n→ She blamed him ________ late.", optionA: "to be", optionB: "for being", optionC: "of being", optionD: "about being", correctOption: "B", explanation: "blame sb for V-ing.", translation: "Cô ấy đổ lỗi cho anh ta vì việc đến muộn.", tips: "blame for V-ing" }
];

const hardLesson2 = [
  { question: "He said, 'I had already left when you called.' \n→ He said that he ________ when I had called.", optionA: "left", optionB: "had left", optionC: "was leaving", optionD: "has left", correctOption: "B", explanation: "Quá khứ hoàn thành không thể lùi thì được nữa nên giữ nguyên.", translation: "Anh ấy nói rằng anh ấy đã rời đi khi tôi gọi.", tips: "QKHT giữ nguyên" },
  { question: "She agreed, 'Yes, I'll help you.' \n→ She agreed ________ me.", optionA: "to help", optionB: "helping", optionC: "help", optionD: "helped", correctOption: "A", explanation: "agree to V.", translation: "Cô ấy đồng ý giúp tôi.", tips: "agree to V" },
  { question: "He promised, 'I won't tell anyone.' \n→ He promised ________ anyone.", optionA: "not telling", optionB: "not to tell", optionC: "to not tell", optionD: "won't tell", correctOption: "B", explanation: "promise not to V.", translation: "Anh ấy hứa sẽ không nói với ai.", tips: "promise not to V" },
  { question: "She complained, 'The service here is terrible.' \n→ She complained that the service ________ terrible.", optionA: "here is", optionB: "there was", optionC: "here was", optionD: "there is", correctOption: "B", explanation: "here -> there, is -> was.", translation: "Cô ấy phàn nàn rằng dịch vụ ở đó rất tệ.", tips: "here -> there, lùi thì" },
  { question: "He said to her, 'I would rather you stayed at home.' \n→ He told her that he would rather she ________ at home.", optionA: "stay", optionB: "stayed", optionC: "had stayed", optionD: "stays", correctOption: "B", explanation: "Động từ sau would rather (câu giả định) không bị lùi thì.", translation: "Anh ấy nói với cô ấy rằng anh ấy thà cô ấy ở nhà còn hơn.", tips: "would rather giả định không lùi" },
  { question: "She objected, 'I don't want to work late.' \n→ She objected ________ late.", optionA: "to work", optionB: "working", optionC: "to working", optionD: "work", correctOption: "C", explanation: "object to + V-ing.", translation: "Cô ấy phản đối việc làm thêm giờ.", tips: "object to V-ing" },
  { question: "He confessed, 'I broke the window.' \n→ He confessed to ________ the window.", optionA: "break", optionB: "breaking", optionC: "have broken", optionD: "Both B and C", correctOption: "D", explanation: "confess to + V-ing / have PII.", translation: "Anh ấy thú nhận đã làm vỡ cửa sổ.", tips: "confess to V-ing" },
  { question: "She urged him, 'Please, please apply for the job.' \n→ She urged him ________ for the job.", optionA: "applying", optionB: "to apply", optionC: "apply", optionD: "applied", correctOption: "B", explanation: "urge sb to V (thúc giục ai làm gì).", translation: "Cô ấy thúc giục anh ta nộp đơn xin việc.", tips: "urge sb to V" },
  { question: "He thanked her, 'Thank you for helping me.' \n→ He thanked her ________ helping him.", optionA: "about", optionB: "for", optionC: "with", optionD: "on", correctOption: "B", explanation: "thank sb for V-ing.", translation: "Anh ấy cảm ơn cô ấy vì đã giúp đỡ.", tips: "thank for V-ing" },
  { question: "She proposed, 'We could rent a car.' \n→ She proposed ________ a car.", optionA: "rent", optionB: "to rent", optionC: "renting", optionD: "rented", correctOption: "C", explanation: "propose + V-ing (đề xuất).", translation: "Cô ấy đề xuất thuê một chiếc xe hơi.", tips: "propose V-ing" }
];

async function run() {
  const slug = "cau-truc-tiep-gian-tiep";
  const title = "21. Câu trực tiếp và câu gián tiếp (Reported Speech)";
  
  let topic = await prisma.toeicGrammarTopic.findUnique({ where: { slug } });
  if (topic) {
    console.log("Topic 21 already exists!");
    return;
  }
  
  topic = await prisma.toeicGrammarTopic.create({
    data: {
      title,
      subtitle: "Cách chuyển đổi câu, lùi thì, đổi trạng từ và đại từ",
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
        title: `${l.title}: Câu gián tiếp`,
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

  console.log("Created Topic 21: Reported Speech with 6 lessons (60 questions).");
}

run().catch(console.error).finally(() => prisma.$disconnect().then(() => process.exit(0)));
