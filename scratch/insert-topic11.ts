import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// LEVEL 1: CƠ BẢN
// ==========================================
const cbLesson1 = [
  {
    question: "You _____ wear a helmet when riding a motorcycle; it's the law.",
    optionA: "can", optionB: "may", optionC: "must", optionD: "might",
    correctOption: "C",
    explanation: "Từ 'must' diễn đạt một sự bắt buộc mang tính luật lệ (it's the law) hoặc nội quy.",
    translation: "Bạn phải đội mũ bảo hiểm khi đi xe máy; đó là luật.",
    tips: "must = bắt buộc."
  },
  {
    question: "_____ you please help me carry these heavy boxes?",
    optionA: "Must", optionB: "Could", optionC: "Should", optionD: "May",
    correctOption: "B",
    explanation: "'Could' được dùng để đưa ra một lời yêu cầu lịch sự. 'May' dùng để xin phép, không dùng để nhờ vả.",
    translation: "Bạn có thể vui lòng giúp tôi bê những chiếc hộp nặng này không?",
    tips: "Could you please + V? (Lời yêu cầu lịch sự)."
  },
  {
    question: "I _____ swim very well when I was a child.",
    optionA: "can", optionB: "could", optionC: "must", optionD: "should",
    correctOption: "B",
    explanation: "Để diễn tả một khả năng trong quá khứ (when I was a child), ta dùng 'could' thay vì 'can'.",
    translation: "Tôi có thể bơi rất giỏi khi tôi còn là một đứa trẻ.",
    tips: "could = khả năng trong quá khứ."
  },
  {
    question: "Students _____ submit their assignments by Friday afternoon.",
    optionA: "can", optionB: "might", optionC: "should", optionD: "must",
    correctOption: "D",
    explanation: "Diễn tả một nội quy hay sự bắt buộc từ phía giáo viên/nhà trường, dùng 'must' (hoặc 'have to'). 'Should' chỉ mang tính khuyên bảo.",
    translation: "Sinh viên phải nộp bài tập trước chiều thứ Sáu.",
    tips: "must = sự bắt buộc."
  },
  {
    question: "It looks like it _____ rain later today, so take an umbrella.",
    optionA: "must", optionB: "will", optionC: "should", optionD: "ought to",
    correctOption: "B",
    explanation: "Dự đoán tương lai hoặc đưa ra một quyết định (take an umbrella), dùng 'will'. Ở đây 'might/may' cũng đúng nhưng không có trong đáp án, nên dùng 'will' diễn tả tương lai.",
    translation: "Trời có vẻ sẽ mưa vào cuối ngày hôm nay, vì vậy hãy mang theo ô.",
    tips: "will = dự đoán tương lai."
  },
  {
    question: "You _____ eat so much fast food; it's bad for your health.",
    optionA: "mustn't", optionB: "shouldn't", optionC: "couldn't", optionD: "wouldn't",
    correctOption: "B",
    explanation: "Đưa ra lời khuyên (không nên làm gì) dùng 'shouldn't'. 'mustn't' mang nghĩa cấm đoán mạnh hơn.",
    translation: "Bạn không nên ăn quá nhiều thức ăn nhanh; nó có hại cho sức khỏe của bạn.",
    tips: "shouldn't = không nên (lời khuyên)."
  },
  {
    question: "_____ I borrow your pen for a moment?",
    optionA: "Must", optionB: "Will", optionC: "May", optionD: "Would",
    correctOption: "C",
    explanation: "Dùng 'May I...' để xin phép một cách lịch sự.",
    translation: "Tôi có thể mượn bút của bạn một lát được không?",
    tips: "May I + V? = Xin phép lịch sự."
  },
  {
    question: "We _____ be at the meeting at 9:00 AM sharp.",
    optionA: "must", optionB: "can", optionC: "may", optionD: "might",
    correctOption: "A",
    explanation: "Thể hiện sự cần thiết, bắt buộc phải có mặt đúng giờ (9:00 AM sharp), dùng 'must'.",
    translation: "Chúng ta phải có mặt tại cuộc họp đúng 9 giờ sáng.",
    tips: "must = bắt buộc."
  },
  {
    question: "She _____ speak three languages fluently.",
    optionA: "must", optionB: "can", optionC: "should", optionD: "may",
    correctOption: "B",
    explanation: "Diễn tả khả năng ở hiện tại (speak fluently), dùng 'can'.",
    translation: "Cô ấy có thể nói trôi chảy ba ngôn ngữ.",
    tips: "can = khả năng ở hiện tại."
  },
  {
    question: "If you want to pass the exam, you _____ study harder.",
    optionA: "can", optionB: "would", optionC: "must", optionD: "may",
    correctOption: "C",
    explanation: "Trong câu điều kiện loại 1, mệnh đề chính có thể dùng 'must' hoặc 'should' để đưa ra mệnh lệnh, lời khuyên mạnh mẽ.",
    translation: "Nếu bạn muốn vượt qua kỳ thi, bạn phải học chăm chỉ hơn.",
    tips: "must = phải (điều kiện tất yếu)."
  }
];

const cbLesson2 = [
  {
    question: "_____ you like a cup of coffee or tea?",
    optionA: "Can", optionB: "Will", optionC: "Would", optionD: "Could",
    correctOption: "C",
    explanation: "Cấu trúc 'Would you like...?' dùng để đưa ra lời mời một cách lịch sự.",
    translation: "Bạn muốn một tách cà phê hay trà?",
    tips: "Would you like = Lời mời lịch sự."
  },
  {
    question: "Visitors _____ take photos inside the museum; it is strictly prohibited.",
    optionA: "cannot", optionB: "mustn't", optionC: "needn't", optionD: "shouldn't",
    correctOption: "B",
    explanation: "'Mustn't' được dùng để chỉ sự cấm đoán (strictly prohibited).",
    translation: "Du khách không được chụp ảnh bên trong bảo tàng; việc này bị nghiêm cấm.",
    tips: "mustn't = cấm đoán."
  },
  {
    question: "I _____ go to the party tonight because I have too much work to do.",
    optionA: "can't", optionB: "mustn't", optionC: "shouldn't", optionD: "needn't",
    correctOption: "A",
    explanation: "Chỉ sự không có khả năng ở hiện tại/tương lai (vì có quá nhiều việc), dùng 'can't'.",
    translation: "Tôi không thể đến bữa tiệc tối nay vì tôi có quá nhiều việc phải làm.",
    tips: "can't = không thể (không có khả năng)."
  },
  {
    question: "We _____ to leave early if we want to catch the first train.",
    optionA: "must", optionB: "should", optionC: "have", optionD: "ought",
    correctOption: "C",
    explanation: "Chỉ có 'have' đi với 'to' (have to) để diễn tả sự bắt buộc khách quan. 'Ought to' là lời khuyên. 'Must' và 'Should' không đi với 'to'.",
    translation: "Chúng ta phải rời đi sớm nếu muốn bắt chuyến tàu đầu tiên.",
    tips: "have to = phải (bắt buộc khách quan)."
  },
  {
    question: "_____ you pass me the salt, please?",
    optionA: "Will", optionB: "Must", optionC: "Should", optionD: "May",
    correctOption: "A",
    explanation: "'Will you...' dùng để yêu cầu ai đó làm gì cho mình (Can/Will/Could/Would).",
    translation: "Bạn làm ơn đưa cho tôi lọ muối được không?",
    tips: "Will you + V? = Lời yêu cầu."
  },
  {
    question: "You _____ apologize to her; it wasn't your fault.",
    optionA: "mustn't", optionB: "can't", optionC: "needn't", optionD: "wouldn't",
    correctOption: "C",
    explanation: "'needn't' (không cần thiết) được dùng vì việc đó không phải lỗi của bạn nên bạn không cần xin lỗi.",
    translation: "Bạn không cần phải xin lỗi cô ấy; đó không phải là lỗi của bạn.",
    tips: "needn't = không cần thiết."
  },
  {
    question: "He looks very tired. He _____ get some rest.",
    optionA: "ought to", optionB: "can", optionC: "would", optionD: "may",
    correctOption: "A",
    explanation: "'Ought to' tương đương với 'should', dùng để đưa ra lời khuyên.",
    translation: "Anh ấy trông rất mệt. Anh ấy nên nghỉ ngơi một chút.",
    tips: "ought to = nên (khuyên bảo)."
  },
  {
    question: "If it rains tomorrow, we _____ stay at home.",
    optionA: "will", optionB: "must", optionC: "can", optionD: "would",
    correctOption: "A",
    explanation: "Câu điều kiện loại 1 diễn tả sự việc có thể xảy ra ở tương lai: If + Hiện tại đơn, S + will + V.",
    translation: "Nếu ngày mai trời mưa, chúng tôi sẽ ở nhà.",
    tips: "Câu điều kiện loại 1 dùng 'will'."
  },
  {
    question: "_____ I open the window for some fresh air?",
    optionA: "Will", optionB: "Shall", optionC: "Would", optionD: "Must",
    correctOption: "B",
    explanation: "'Shall I / Shall we' dùng để đưa ra lời đề nghị hoặc gợi ý giúp đỡ ai đó.",
    translation: "Tôi mở cửa sổ cho thoáng nhé?",
    tips: "Shall I + V? = Lời đề nghị."
  },
  {
    question: "They _____ be at home right now; their car is in the driveway.",
    optionA: "must", optionB: "can", optionC: "will", optionD: "could",
    correctOption: "A",
    explanation: "'must' được dùng để đưa ra một suy luận hợp lý, có căn cứ chắc chắn ở hiện tại (chắc hẳn là).",
    translation: "Họ chắc hẳn đang ở nhà lúc này; xe của họ đang ở trên đường lái xe vào nhà.",
    tips: "must + V = suy luận chắc chắn ở hiện tại."
  }
];

// ==========================================
// LEVEL 2: TRUNG CẤP
// ==========================================
const tcLesson1 = [
  {
    question: "The package _____ have arrived by now, but I haven't received any notification.",
    optionA: "should", optionB: "must", optionC: "could", optionD: "will",
    correctOption: "A",
    explanation: "Cấu trúc 'should have + PII' diễn tả một việc lẽ ra đã phải xảy ra theo dự kiến nhưng lại không xảy ra.",
    translation: "Đáng lẽ gói hàng đã phải đến vào lúc này rồi, nhưng tôi chưa nhận được bất kỳ thông báo nào.",
    tips: "should have PII = lẽ ra đã."
  },
  {
    question: "If the company had launched the product earlier, they _____ have dominated the market.",
    optionA: "would", optionB: "will", optionC: "can", optionD: "must",
    correctOption: "A",
    explanation: "Câu điều kiện loại 3 diễn tả sự việc không có thật trong quá khứ: If + Quá khứ hoàn thành, S + would have + PII.",
    translation: "Nếu công ty ra mắt sản phẩm sớm hơn, họ đã có thể thống trị thị trường.",
    tips: "would have PII dùng trong câu ĐK loại 3."
  },
  {
    question: "You _____ not smoke in the laboratory under any circumstances.",
    optionA: "may", optionB: "might", optionC: "will", optionD: "must",
    correctOption: "D",
    explanation: "'Must not' chỉ sự cấm đoán mạnh mẽ, đặc biệt khi kèm cụm 'under any circumstances' (trong bất kỳ hoàn cảnh nào).",
    translation: "Bạn tuyệt đối không được hút thuốc trong phòng thí nghiệm trong bất kỳ hoàn cảnh nào.",
    tips: "must not = cấm đoán."
  },
  {
    question: "I can't find my keys anywhere; I _____ have left them at the office.",
    optionA: "must", optionB: "should", optionC: "would", optionD: "ought to",
    correctOption: "A",
    explanation: "Cấu trúc 'must have + PII' dùng để diễn tả một suy luận logic, chắc chắn về một sự việc đã xảy ra trong quá khứ.",
    translation: "Tôi không thể tìm thấy chìa khóa của mình ở đâu cả; chắc hẳn tôi đã để quên chúng ở văn phòng.",
    tips: "must have PII = chắc hẳn đã."
  },
  {
    question: "We _____ better leave early if we want to avoid the traffic jam.",
    optionA: "would", optionB: "should", optionC: "had", optionD: "could",
    correctOption: "C",
    explanation: "Cấu trúc 'had better + V-bare' mang nghĩa 'tốt hơn là nên', dùng để khuyên răn một cách mạnh mẽ.",
    translation: "Tốt hơn là chúng ta nên rời đi sớm nếu muốn tránh kẹt xe.",
    tips: "had better + V-bare = tốt hơn là nên."
  },
  {
    question: "She _____ be the new manager; she looks too young and inexperienced.",
    optionA: "mustn't", optionB: "can't", optionC: "shouldn't", optionD: "wouldn't",
    correctOption: "B",
    explanation: "'Can't be' được dùng làm phủ định của 'must be' để suy luận chắc chắn điều gì KHÔNG thể xảy ra (chắc là không phải).",
    translation: "Cô ấy không thể là người quản lý mới được; cô ấy trông quá trẻ và thiếu kinh nghiệm.",
    tips: "can't be = chắc chắn không phải."
  },
  {
    question: "Employees _____ submit their expense reports by the 5th of each month.",
    optionA: "are to", optionB: "would", optionC: "may", optionD: "might",
    correctOption: "A",
    explanation: "Cấu trúc 'be to + V' dùng để diễn tả một quy định, mệnh lệnh hoặc chỉ thị mang tính chính thức.",
    translation: "Nhân viên phải nộp báo cáo chi phí của họ trước ngày mùng 5 hàng tháng.",
    tips: "be to + V = quy định/chỉ thị."
  },
  {
    question: "I _____ like to speak to the person in charge, please.",
    optionA: "will", optionB: "could", optionC: "should", optionD: "would",
    correctOption: "D",
    explanation: "'Would like to + V' là cách diễn đạt lịch sự của 'want to' (muốn làm gì).",
    translation: "Tôi muốn nói chuyện với người phụ trách, làm ơn.",
    tips: "would like to = muốn (lịch sự)."
  },
  {
    question: "If you _____ see Mr. Smith, tell him the meeting has been rescheduled.",
    optionA: "should", optionB: "would", optionC: "could", optionD: "might",
    correctOption: "A",
    explanation: "Cấu trúc 'If you should + V' (hoặc 'Should you + V') dùng trong câu điều kiện loại 1 để chỉ một khả năng ít xảy ra (Nếu tình cờ).",
    translation: "Nếu tình cờ bạn gặp ông Smith, hãy nói với ông ấy rằng cuộc họp đã được dời lịch.",
    tips: "If you should = Nếu tình cờ."
  },
  {
    question: "They _____ have finished the project yesterday, but they ran out of materials.",
    optionA: "could", optionB: "must", optionC: "will", optionD: "shall",
    correctOption: "A",
    explanation: "Cấu trúc 'could have + PII' diễn tả một việc có khả năng đã làm được trong quá khứ nhưng thực tế lại không làm.",
    translation: "Họ đáng lẽ đã có thể hoàn thành dự án vào ngày hôm qua, nhưng họ đã hết vật liệu.",
    tips: "could have PII = có thể đã."
  }
];

const tcLesson2 = [
  {
    question: "He _____ have been exhausted after working a 12-hour shift without a break.",
    optionA: "must", optionB: "can", optionC: "will", optionD: "should",
    correctOption: "A",
    explanation: "'must have + PII' (chắc hẳn đã) dùng để suy luận chắc chắn về một sự việc trong quá khứ dựa trên bằng chứng (làm 12 tiếng không nghỉ).",
    translation: "Anh ấy chắc hẳn đã kiệt sức sau khi làm việc ca 12 tiếng không nghỉ.",
    tips: "must have PII = suy luận chắc chắn."
  },
  {
    question: "_____ you mind closing the window? It's getting a bit chilly in here.",
    optionA: "Would", optionB: "Could", optionC: "Should", optionD: "Will",
    correctOption: "A",
    explanation: "Cấu trúc 'Would you mind + V-ing?' dùng để nhờ vả một cách lịch sự (Bạn có phiền...).",
    translation: "Bạn có phiền đóng cửa sổ lại không? Ở đây hơi lạnh rồi.",
    tips: "Would you mind + V-ing?"
  },
  {
    question: "You _____ have brought an umbrella; the weather forecast said it would be sunny all day.",
    optionA: "needn't", optionB: "mustn't", optionC: "couldn't", optionD: "wouldn't",
    correctOption: "A",
    explanation: "'needn't have + PII' diễn tả một hành động đã làm trong quá khứ nhưng thực ra là không cần thiết.",
    translation: "Bạn không cần phải mang theo ô đâu; dự báo thời tiết nói trời sẽ nắng cả ngày.",
    tips: "needn't have PII = đáng lẽ không cần."
  },
  {
    question: "If I were the CEO, I _____ invest more heavily in employee training.",
    optionA: "will", optionB: "would", optionC: "shall", optionD: "can",
    correctOption: "B",
    explanation: "Câu điều kiện loại 2 diễn tả sự việc trái ngược với thực tế ở hiện tại: If S + V(past), S + would + V-bare.",
    translation: "Nếu tôi là Giám đốc điều hành, tôi sẽ đầu tư nhiều hơn vào việc đào tạo nhân viên.",
    tips: "If ..., would V (Câu ĐK loại 2)."
  },
  {
    question: "He is so arrogant. He _____ be the least popular person in the office.",
    optionA: "must", optionB: "could", optionC: "should", optionD: "may",
    correctOption: "A",
    explanation: "Suy luận logic ở hiện tại 'chắc hẳn là' dùng 'must'.",
    translation: "Anh ta quá kiêu ngạo. Anh ta chắc hẳn là người ít được yêu thích nhất trong văn phòng.",
    tips: "must be = chắc hẳn là."
  },
  {
    question: "I'd rather you _____ me the truth about the missing funds.",
    optionA: "tell", optionB: "told", optionC: "telling", optionD: "to tell",
    correctOption: "B",
    explanation: "Cấu trúc 'would rather' với 2 chủ ngữ khác nhau: S1 + would rather + S2 + V(quá khứ đơn) diễn tả mong muốn ở hiện tại/tương lai.",
    translation: "Tôi thà rằng bạn nói cho tôi sự thật về số tiền bị thiếu.",
    tips: "would rather + S + V(past)."
  },
  {
    question: "You _____ report the incident to the supervisor immediately; it's mandatory.",
    optionA: "must", optionB: "ought to", optionC: "should", optionD: "might",
    correctOption: "A",
    explanation: "'Must' dùng để chỉ sự bắt buộc (mandatory = bắt buộc). 'ought to' và 'should' chỉ là lời khuyên.",
    translation: "Bạn phải báo cáo sự cố cho người giám sát ngay lập tức; đó là điều bắt buộc.",
    tips: "must = bắt buộc (mandatory)."
  },
  {
    question: "We _____ have taken the wrong turn; this doesn't look like the right address.",
    optionA: "must", optionB: "should", optionC: "will", optionD: "can",
    correctOption: "A",
    explanation: "Suy luận chắc chắn về một sự việc trong quá khứ (chắc hẳn chúng ta đã rẽ nhầm), dùng 'must have + PII'.",
    translation: "Chúng ta chắc hẳn đã rẽ nhầm; đây không giống địa chỉ đúng.",
    tips: "must have PII = suy luận trong quá khứ."
  },
  {
    question: "_____ you need any further assistance, please contact our help desk.",
    optionA: "Should", optionB: "If", optionC: "Would", optionD: "Could",
    correctOption: "A",
    explanation: "Cấu trúc đảo ngữ câu điều kiện loại 1: Should + S + V-bare.",
    translation: "Nếu bạn cần bất kỳ hỗ trợ nào thêm, vui lòng liên hệ với bộ phận hỗ trợ của chúng tôi.",
    tips: "Should S V, ... (Đảo ngữ điều kiện)."
  },
  {
    question: "By this time next year, they _____ have completed the construction of the new headquarters.",
    optionA: "will", optionB: "would", optionC: "must", optionD: "can",
    correctOption: "A",
    explanation: "Thì tương lai hoàn thành: will have + PII diễn tả hành động sẽ hoàn tất trước một thời điểm trong tương lai (By this time next year).",
    translation: "Vào thời điểm này năm sau, họ sẽ hoàn thành việc xây dựng trụ sở mới.",
    tips: "will have PII = tương lai hoàn thành."
  }
];

// ==========================================
// LEVEL 3: NÂNG CAO
// ==========================================
const ncLesson1 = [
  {
    question: "Had the management listened to the warnings, the financial crisis _____ have been averted.",
    optionA: "might", optionB: "will", optionC: "must", optionD: "should",
    correctOption: "A",
    explanation: "Đảo ngữ câu điều kiện loại 3 (Had S PII, S + would/could/might + have + PII). 'might have been' = có lẽ đã được.",
    translation: "Nếu ban quản lý lắng nghe những lời cảnh báo, cuộc khủng hoảng tài chính có lẽ đã được ngăn chặn.",
    tips: "Had S PII, S might have PII."
  },
  {
    question: "The proposal is excellent, but it _____ cost more than our current budget allows.",
    optionA: "may", optionB: "must", optionC: "should", optionD: "ought to",
    correctOption: "A",
    explanation: "Dùng 'may' (hoặc might) để chỉ một khả năng có thể xảy ra trong tương lai (có thể sẽ tốn kém hơn). 'must' là bắt buộc/suy luận chắc chắn không hợp ngữ cảnh.",
    translation: "Đề xuất này rất tuyệt vời, nhưng nó có thể tốn kém hơn mức ngân sách hiện tại của chúng ta cho phép.",
    tips: "may = có thể (chỉ khả năng)."
  },
  {
    question: "It is essential that every committee member _____ present at the emergency meeting.",
    optionA: "be", optionB: "is", optionC: "are", optionD: "must be",
    correctOption: "A",
    explanation: "Cấu trúc giả định (Subjunctive) sau tính từ chỉ sự cần thiết (essential): It is essential that S + V-bare (be).",
    translation: "Điều cần thiết là mọi thành viên ủy ban phải có mặt tại cuộc họp khẩn cấp.",
    tips: "essential that S + V-bare."
  },
  {
    question: "You _____ have paid for the tickets in advance; the entrance was completely free.",
    optionA: "needn't", optionB: "mustn't", optionC: "shouldn't", optionD: "couldn't",
    correctOption: "A",
    explanation: "'needn't have + PII' diễn tả một việc đã làm nhưng đáng lẽ ra không cần phải làm (vì vé miễn phí).",
    translation: "Đáng lẽ bạn không cần phải trả tiền vé trước; cổng vào hoàn toàn miễn phí.",
    tips: "needn't have PII = đáng lẽ không cần."
  },
  {
    question: "_____ he fail the examination, he will not be eligible for the scholarship.",
    optionA: "Should", optionB: "If", optionC: "Were", optionD: "Had",
    correctOption: "A",
    explanation: "Đảo ngữ câu điều kiện loại 1 (chỉ khả năng xảy ra trong tương lai): Should + S + V-bare.",
    translation: "Nếu anh ấy thi trượt, anh ấy sẽ không đủ điều kiện nhận học bổng.",
    tips: "Should S V (Đảo ngữ đk loại 1)."
  },
  {
    question: "The suspect _____ have committed the crime, as he was seen out of the country at that exact time.",
    optionA: "can't", optionB: "mustn't", optionC: "shouldn't", optionD: "wouldn't",
    correctOption: "A",
    explanation: "'can't have + PII' diễn tả một sự phủ định chắc chắn trong quá khứ (chắc chắn đã không thể).",
    translation: "Kẻ tình nghi chắc chắn đã không thể thực hiện tội ác, vì hắn được nhìn thấy ở ngoài nước vào đúng thời điểm đó.",
    tips: "can't have PII = chắc chắn không."
  },
  {
    question: "I'd rather you _____ mention this to anyone until the official press release.",
    optionA: "didn't", optionB: "don't", optionC: "wouldn't", optionD: "shouldn't",
    correctOption: "A",
    explanation: "Cấu trúc 'would rather' với 2 chủ ngữ, diễn tả ý muốn ở hiện tại/tương lai dùng quá khứ đơn: S1 + would rather + S2 + didn't + V.",
    translation: "Tôi muốn bạn không đề cập chuyện này với bất kỳ ai cho đến khi có thông cáo báo chí chính thức.",
    tips: "would rather sb didn't V."
  },
  {
    question: "The old bridge is on the verge of collapsing; it _____ be repaired immediately.",
    optionA: "must", optionB: "can", optionC: "may", optionD: "would",
    correctOption: "A",
    explanation: "Diễn tả sự bắt buộc, cấp bách (phải được sửa chữa ngay), dùng 'must'.",
    translation: "Cây cầu cũ đang trên bờ vực sụp đổ; nó phải được sửa chữa ngay lập tức.",
    tips: "must = phải (bắt buộc/cấp bách)."
  },
  {
    question: "They _____ have reached a compromise, but neither side was willing to concede.",
    optionA: "might", optionB: "must", optionC: "will", optionD: "shall",
    correctOption: "A",
    explanation: "Cấu trúc 'might have + PII' diễn tả một việc có lẽ đã xảy ra trong quá khứ nhưng thực tế thì không.",
    translation: "Có lẽ họ đã đạt được thỏa hiệp, nhưng không bên nào chịu nhượng bộ.",
    tips: "might have PII = có lẽ đã."
  },
  {
    question: "_____ it not been for his timely intervention, the project would have failed completely.",
    optionA: "Had", optionB: "Should", optionC: "Were", optionD: "If",
    correctOption: "A",
    explanation: "Cấu trúc đảo ngữ câu điều kiện loại 3 kết hợp thành ngữ: Had it not been for + Noun (Nếu không vì...).",
    translation: "Nếu không có sự can thiệp kịp thời của anh ấy, dự án đã thất bại hoàn toàn.",
    tips: "Had it not been for = Nếu không vì."
  }
];

const ncLesson2 = [
  {
    question: "The director demanded that the marketing team _____ a revised strategy by Monday.",
    optionA: "submit", optionB: "submits", optionC: "submitted", optionD: "submitting",
    correctOption: "A",
    explanation: "Cấu trúc giả định (Subjunctive) sau động từ demand: demand that + S + V-bare.",
    translation: "Giám đốc yêu cầu nhóm tiếp thị phải nộp chiến lược sửa đổi trước thứ Hai.",
    tips: "demand that S V-bare."
  },
  {
    question: "He _____ have known about the policy change; an email was sent to all employees last week.",
    optionA: "should", optionB: "could", optionC: "might", optionD: "would",
    correctOption: "A",
    explanation: "Cấu trúc 'should have + PII' (lẽ ra đã phải) - trách móc hoặc mong đợi một việc đáng lẽ phải xảy ra hợp lý trong quá khứ.",
    translation: "Đáng lẽ anh ta phải biết về sự thay đổi chính sách; một email đã được gửi đến tất cả nhân viên vào tuần trước.",
    tips: "should have PII = lẽ ra đã phải."
  },
  {
    question: "Only by implementing strict cost-cutting measures _____ we save the company from bankruptcy.",
    optionA: "can", optionB: "we can", optionC: "could", optionD: "we could",
    correctOption: "A",
    explanation: "Cấu trúc đảo ngữ với 'Only by + V-ing': Only by + V-ing + Trợ động từ + S + V. (Chỉ bằng cách... mới có thể...).",
    translation: "Chỉ bằng cách thực hiện các biện pháp cắt giảm chi phí nghiêm ngặt, chúng ta mới có thể cứu công ty khỏi phá sản.",
    tips: "Only by ..., trợ ĐT + S + V."
  },
  {
    question: "I would sooner you _____ out the arrangements yourself rather than relying on others.",
    optionA: "sorted", optionB: "sort", optionC: "sorting", optionD: "to sort",
    correctOption: "A",
    explanation: "Cấu trúc 'would sooner' hoàn toàn giống 'would rather'. Khi có 2 chủ ngữ ở hiện tại, động từ chia ở quá khứ đơn (sorted).",
    translation: "Tôi thà rằng bạn tự mình sắp xếp các thỏa thuận thay vì phụ thuộc vào người khác.",
    tips: "would sooner S + V(past)."
  },
  {
    question: "Were I _____ in your position, I would negotiate for a higher salary.",
    optionA: "to be", optionB: "be", optionC: "being", optionD: "been",
    correctOption: "A",
    explanation: "Đảo ngữ câu điều kiện loại 2: Were + S + to V, S + would + V.",
    translation: "Nếu tôi ở vị trí của bạn, tôi sẽ thương lượng để có mức lương cao hơn.",
    tips: "Were S to V (Đảo ngữ loại 2)."
  },
  {
    question: "The missing documents _____ have been misplaced during the office relocation.",
    optionA: "must", optionB: "should", optionC: "will", optionD: "ought to",
    correctOption: "A",
    explanation: "Suy luận logic, chắc chắn trong quá khứ dùng 'must have + PII'.",
    translation: "Các tài liệu bị mất chắc hẳn đã bị đặt sai chỗ trong quá trình chuyển văn phòng.",
    tips: "must have PII = chắc hẳn đã."
  },
  {
    question: "No sooner had the presentation started than the fire alarm _____ off.",
    optionA: "went", optionB: "goes", optionC: "has gone", optionD: "had gone",
    correctOption: "A",
    explanation: "Cấu trúc đảo ngữ 'No sooner... than...': No sooner + had + S + PII + than + S + V(quá khứ đơn). (vừa mới... thì...).",
    translation: "Bài thuyết trình vừa mới bắt đầu thì chuông báo cháy reo lên.",
    tips: "No sooner ... than S + V(past)."
  },
  {
    question: "It is recommended that pregnant women _____ intense physical exertion.",
    optionA: "avoid", optionB: "avoids", optionC: "avoided", optionD: "avoiding",
    correctOption: "A",
    explanation: "Cấu trúc giả định: It is recommended that S + V-bare.",
    translation: "Người ta khuyến cáo phụ nữ mang thai nên tránh gắng sức về thể chất.",
    tips: "recommended that S V-bare."
  },
  {
    question: "The suspect claimed he was at home, but he _____ have been; the security cameras caught him at the scene.",
    optionA: "couldn't", optionB: "mustn't", optionC: "shouldn't", optionD: "needn't",
    correctOption: "A",
    explanation: "'couldn't have been' (hoặc 'can't have been') dùng để phủ định một cách chắc chắn một khả năng trong quá khứ.",
    translation: "Nghi phạm khai rằng hắn ở nhà, nhưng chắc chắn không thể như vậy; camera an ninh đã ghi lại hình ảnh hắn tại hiện trường.",
    tips: "couldn't have = chắc chắn không."
  },
  {
    question: "If we _____ to invest heavily in renewable energy, our dependence on fossil fuels would decrease.",
    optionA: "were", optionB: "was", optionC: "are", optionD: "would be",
    correctOption: "A",
    explanation: "Câu điều kiện loại 2 giả định về hiện tại/tương lai (If S were to V).",
    translation: "Nếu chúng ta đầu tư mạnh vào năng lượng tái tạo, sự phụ thuộc của chúng ta vào nhiên liệu hóa thạch sẽ giảm.",
    tips: "If S were to V (ĐK loại 2)."
  }
];

async function run() {
  console.log("Generating Topic 11: Động từ khiếm khuyết (3 levels)...");
  
  const baseTitle = "Động từ khiếm khuyết";
  const levelsData = [
    { level: "Cơ Bản", slug: "dong-tu-khiem-khuyet-co-ban", keyword: "[Cơ Bản]", lessons: [ { title: "Bài tập 1", questions: cbLesson1 }, { title: "Bài tập 2", questions: cbLesson2 } ] },
    { level: "Trung Cấp", slug: "dong-tu-khiem-khuyet-trung-cap", keyword: "[Trung Cấp]", lessons: [ { title: "Bài tập 1", questions: tcLesson1 }, { title: "Bài tập 2", questions: tcLesson2 } ] },
    { level: "Nâng Cao", slug: "dong-tu-khiem-khuyet-nang-cao", keyword: "[Nâng Cao]", lessons: [ { title: "Bài tập 1", questions: ncLesson1 }, { title: "Bài tập 2", questions: ncLesson2 } ] }
  ];

  for (const lData of levelsData) {
    let topic = await prisma.toeicGrammarTopic.findUnique({ where: { slug: lData.slug } });
    
    if (topic) {
        console.log(`Topic ${lData.slug} already exists. Skipping creation...`);
        continue;
    }

    topic = await prisma.toeicGrammarTopic.create({
      data: {
        title: baseTitle,
        subtitle: `Cách sử dụng các modal verbs mức độ ${lData.level}`,
        slug: lData.slug,
        level: lData.level,
        type: 'GRAMMAR',
        part: 5
      }
    });

    let order = 1;
    for (const lessonData of lData.lessons) {
      const lesson = await prisma.toeicGrammarLesson.create({
        data: {
          topicId: topic.id,
          title: `${lessonData.title}: ${baseTitle}`,
          order: order++,
          accessTier: 'FREE'
        }
      });

      for (const q of lessonData.questions) {
        await prisma.toeicQuestion.create({
          data: {
            lessonId: lesson.id,
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctOption: q.correctOption,
            explanation: q.explanation,
            translation: q.translation,
            tips: q.tips
          }
        });
      }
    }
    console.log(`Created Topic: ${lData.slug} with 2 lessons and 20 questions total.`);
  }

  console.log("Topic 11 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
