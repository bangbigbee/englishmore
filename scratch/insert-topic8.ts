import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// LEVEL 1: CƠ BẢN
// ==========================================
const cbLesson1 = [
  {
    question: "_____ Mr. Smith attend the marketing conference last week?",
    optionA: "Do", optionB: "Did", optionC: "Does", optionD: "Is",
    correctOption: "B",
    explanation: "Câu có dấu hiệu 'last week' (tuần trước), câu hỏi dạng Yes/No ở thì quá khứ đơn cần mượn trợ động từ 'Did'.",
    translation: "Ông Smith có tham dự hội nghị tiếp thị vào tuần trước không?",
    tips: "last week -> thì quá khứ đơn -> mượn trợ động từ Did."
  },
  {
    question: "The new software is extremely user-friendly, _____?",
    optionA: "isn't it", optionB: "is it", optionC: "doesn't it", optionD: "does it",
    correctOption: "A",
    explanation: "Câu hỏi đuôi: Mệnh đề chính ở thể khẳng định với to be 'is', nên phần đuôi dùng phủ định 'isn't'. Chủ ngữ 'The new software' -> 'it'.",
    translation: "Phần mềm mới cực kỳ dễ sử dụng, đúng không?",
    tips: "is -> isn't; The new software -> it."
  },
  {
    question: "_____ will the new CEO arrive at the headquarters?",
    optionA: "What", optionB: "When", optionC: "Who", optionD: "Which",
    correctOption: "B",
    explanation: "Hỏi về thời gian ('will arrive' - sẽ đến), đại từ nghi vấn phù hợp nhất là 'When'.",
    translation: "Khi nào tân Giám đốc điều hành sẽ đến trụ sở chính?",
    tips: "Hỏi về thời gian dùng When."
  },
  {
    question: "Do you know where the main conference room _____?",
    optionA: "is", optionB: "are", optionC: "does", optionD: "be",
    correctOption: "A",
    explanation: "Đây là câu hỏi gián tiếp (embedded question). Cấu trúc: Do you know + Question word + S + V. 'the main conference room' là số ít nên dùng 'is'. Không đảo ngữ 'is' lên trước chủ ngữ.",
    translation: "Bạn có biết phòng hội nghị chính ở đâu không?",
    tips: "Q-word + S + V (không đảo ngữ trong câu hỏi gián tiếp)."
  },
  {
    question: "They haven't finalized the budget for the next quarter, _____?",
    optionA: "have they", optionB: "haven't they", optionC: "do they", optionD: "did they",
    correctOption: "A",
    explanation: "Câu chính ở dạng phủ định của thì hiện tại hoàn thành 'haven't finalized', câu hỏi đuôi sẽ ở dạng khẳng định 'have they'.",
    translation: "Họ vẫn chưa chốt ngân sách cho quý tới, đúng không?",
    tips: "haven't -> have."
  },
  {
    question: "_____ of the candidates do you think is best suited for the position?",
    optionA: "Who", optionB: "Whom", optionC: "Which", optionD: "Whose",
    correctOption: "C",
    explanation: "Khi hỏi về sự lựa chọn trong một nhóm hữu hạn (các ứng viên này), ta dùng 'Which'. Cụm 'Which of the candidates' có nghĩa là 'Ai trong số các ứng viên'.",
    translation: "Bạn nghĩ ứng viên nào phù hợp nhất với vị trí này?",
    tips: "Which of + N (lựa chọn trong một nhóm)."
  },
  {
    question: "Ms. Davis can speak fluent Japanese, _____?",
    optionA: "can she", optionB: "can't she", optionC: "does she", optionD: "doesn't she",
    correctOption: "B",
    explanation: "Động từ khiếm khuyết 'can' ở mệnh đề chính (khẳng định), đuôi phải dùng 'can't' (phủ định).",
    translation: "Cô Davis có thể nói trôi chảy tiếng Nhật, đúng không?",
    tips: "can -> can't."
  },
  {
    question: "I would like to ask _____ you are planning to organize the workshop.",
    optionA: "that", optionB: "what", optionC: "how", optionD: "which",
    correctOption: "C",
    explanation: "Cần một từ nghi vấn để tạo câu hỏi gián tiếp hợp nghĩa: 'how' (như thế nào / cách thức tổ chức).",
    translation: "Tôi muốn hỏi bạn dự định tổ chức hội thảo như thế nào.",
    tips: "how + S + V (cách thức làm gì)."
  },
  {
    question: "_____ long does it take to process a visa application?",
    optionA: "How", optionB: "What", optionC: "When", optionD: "Where",
    correctOption: "A",
    explanation: "Để hỏi về thời gian bao lâu, ta dùng 'How long'.",
    translation: "Mất bao lâu để xử lý một đơn xin thị thực?",
    tips: "How long: hỏi khoảng thời gian."
  },
  {
    question: "The director is not in the office right now, _____?",
    optionA: "is he", optionB: "isn't he", optionC: "does he", optionD: "doesn't he",
    correctOption: "A",
    explanation: "Mệnh đề chính phủ định 'is not', phần đuôi dùng khẳng định 'is he'.",
    translation: "Giám đốc hiện không có ở văn phòng, đúng không?",
    tips: "is not -> is."
  }
];

const cbLesson2 = [
  {
    question: "Please let me know _____ time the meeting starts.",
    optionA: "when", optionB: "what", optionC: "which", optionD: "how",
    correctOption: "B",
    explanation: "Đi với từ 'time' để hỏi giờ ta dùng 'what time'.",
    translation: "Vui lòng cho tôi biết mấy giờ cuộc họp bắt đầu.",
    tips: "what time = mấy giờ."
  },
  {
    question: "You submitted the weekly report on Friday, _____?",
    optionA: "didn't you", optionB: "did you", optionC: "haven't you", optionD: "don't you",
    correctOption: "A",
    explanation: "'submitted' là thì quá khứ đơn (khẳng định), mượn trợ động từ 'did' cho câu hỏi đuôi -> 'didn't you'.",
    translation: "Bạn đã nộp báo cáo tuần vào thứ Sáu, đúng không?",
    tips: "V (quá khứ) -> didn't."
  },
  {
    question: "_____ will replace Mr. Johnson after he retires next month?",
    optionA: "Who", optionB: "Whom", optionC: "Whose", optionD: "Which",
    correctOption: "A",
    explanation: "Cần chủ ngữ chỉ người cho động từ 'will replace', nên dùng 'Who'.",
    translation: "Ai sẽ thay thế ông Johnson sau khi ông ấy nghỉ hưu vào tháng tới?",
    tips: "Who làm chủ ngữ chỉ người."
  },
  {
    question: "Could you tell me _____ the nearest subway station is?",
    optionA: "when", optionB: "how", optionC: "where", optionD: "who",
    correctOption: "C",
    explanation: "Hỏi về vị trí (nearest station), dùng từ để hỏi 'where'.",
    translation: "Bạn có thể cho tôi biết trạm tàu điện ngầm gần nhất ở đâu không?",
    tips: "where: ở đâu."
  },
  {
    question: "There are no empty seats left in the auditorium, _____?",
    optionA: "are there", optionB: "aren't there", optionC: "are they", optionD: "aren't they",
    correctOption: "A",
    explanation: "Cấu trúc 'There are no...' mang nghĩa phủ định, nên phần đuôi phải dùng khẳng định 'are there'.",
    translation: "Không còn chỗ trống nào trong khán phòng, đúng không?",
    tips: "There are no -> are there."
  },
  {
    question: "_____ reason did they give for cancelling the partnership?",
    optionA: "What", optionB: "How", optionC: "Why", optionD: "When",
    correctOption: "A",
    explanation: "Đi với danh từ 'reason' (lý do) thường dùng 'What reason' (Lý do gì). Dùng 'Why' không kết hợp trực tiếp với danh từ phía sau.",
    translation: "Họ đưa ra lý do gì cho việc hủy bỏ quan hệ đối tác?",
    tips: "What reason = lý do gì."
  },
  {
    question: "The new guidelines were distributed yesterday, _____?",
    optionA: "weren't they", optionB: "wasn't it", optionC: "didn't they", optionD: "weren't it",
    correctOption: "A",
    explanation: "Động từ 'were' (khẳng định) -> phần đuôi là 'weren't'. Chủ ngữ 'guidelines' (số nhiều) -> 'they'.",
    translation: "Các hướng dẫn mới đã được phân phát vào ngày hôm qua, đúng không?",
    tips: "were -> weren't; guidelines -> they."
  },
  {
    question: "_____ often do you have performance evaluations at your company?",
    optionA: "How", optionB: "What", optionC: "Which", optionD: "Where",
    correctOption: "A",
    explanation: "Để hỏi về tần suất, dùng 'How often'.",
    translation: "Công ty của bạn bao lâu thì có đợt đánh giá hiệu suất một lần?",
    tips: "How often: hỏi tần suất."
  },
  {
    question: "I am wondering _____ we should invest in the new technology.",
    optionA: "whether", optionB: "that", optionC: "which", optionD: "whom",
    correctOption: "A",
    explanation: "Câu hỏi gián tiếp dạng Yes/No được bắt đầu bằng 'if' hoặc 'whether' (liệu rằng).",
    translation: "Tôi đang tự hỏi liệu chúng ta có nên đầu tư vào công nghệ mới này không.",
    tips: "wonder whether/if: tự hỏi liệu rằng."
  },
  {
    question: "Everybody is ready for the presentation, _____?",
    optionA: "aren't they", optionB: "isn't everybody", optionC: "is he", optionD: "are they",
    correctOption: "A",
    explanation: "Đại từ bất định chỉ người (Everybody, Everyone...) khi sang phần đuôi dùng chủ ngữ 'they'. Vì là 'they' nên động từ to be phải dùng 'are', chuyển thành phủ định là 'aren't they'.",
    translation: "Mọi người đều đã sẵn sàng cho bài thuyết trình, đúng không?",
    tips: "Everybody is -> aren't they."
  }
];

// ==========================================
// LEVEL 2: TRUNG CẤP
// ==========================================
const tcLesson1 = [
  {
    question: "I am supposed to lead the training session today, _____?",
    optionA: "am not I", optionB: "aren't I", optionC: "isn't it", optionD: "don't I",
    correctOption: "B",
    explanation: "Câu hỏi đuôi của 'I am' theo quy tắc ngoại lệ là 'aren't I?'.",
    translation: "Tôi có nhiệm vụ hướng dẫn buổi đào tạo hôm nay, phải không?",
    tips: "I am -> aren't I?"
  },
  {
    question: "Management has not yet determined _____ will oversee the expansion project.",
    optionA: "who", optionB: "whom", optionC: "which", optionD: "whose",
    correctOption: "A",
    explanation: "Câu hỏi gián tiếp cần một chủ ngữ cho cụm động từ 'will oversee'. Đại từ 'who' đóng vai trò chủ ngữ.",
    translation: "Ban quản lý vẫn chưa xác định được ai sẽ giám sát dự án mở rộng.",
    tips: "who + V (ai làm gì)."
  },
  {
    question: "Let's review the financial statements before submitting them, _____?",
    optionA: "shall we", optionB: "will you", optionC: "don't we", optionD: "do we",
    correctOption: "A",
    explanation: "Câu hỏi đuôi cho câu rủ rê 'Let's + V' luôn là 'shall we?'.",
    translation: "Chúng ta hãy xem lại các báo cáo tài chính trước khi nộp, được chứ?",
    tips: "Let's -> shall we?"
  },
  {
    question: "_____ of the two proposals do you consider more feasible?",
    optionA: "What", optionB: "Which", optionC: "Who", optionD: "How",
    correctOption: "B",
    explanation: "Khi lựa chọn giữa một số lượng xác định (the two proposals), ta dùng 'Which'.",
    translation: "Bạn cho rằng bản đề xuất nào trong hai bản khả thi hơn?",
    tips: "Which of the two... (lựa chọn giữa 2)."
  },
  {
    question: "He hardly ever takes a day off during the peak season, _____?",
    optionA: "does he", optionB: "doesn't he", optionC: "is he", optionD: "isn't he",
    correctOption: "A",
    explanation: "'hardly ever' mang nghĩa phủ định (hầu như không bao giờ). Do đó mệnh đề chính được coi là phủ định, câu hỏi đuôi phải ở dạng khẳng định 'does he'.",
    translation: "Anh ấy hầu như không bao giờ nghỉ một ngày nào trong mùa cao điểm, đúng không?",
    tips: "hardly (phủ định) -> đuôi khẳng định."
  },
  {
    question: "Could you please explain _____ the new software updates will affect our daily operations?",
    optionA: "that", optionB: "how", optionC: "what", optionD: "which",
    correctOption: "B",
    explanation: "Câu hỏi gián tiếp cần một trạng từ chỉ cách thức: 'how' (như thế nào).",
    translation: "Bạn có thể giải thích các bản cập nhật phần mềm mới sẽ ảnh hưởng như thế nào đến hoạt động hàng ngày của chúng ta không?",
    tips: "explain how + S + V."
  },
  {
    question: "Nothing was mentioned about the budget cuts during the meeting, _____?",
    optionA: "was it", optionB: "wasn't it", optionC: "were they", optionD: "weren't they",
    correctOption: "A",
    explanation: "Đại từ 'Nothing' mang ý nghĩa phủ định, nên câu hỏi đuôi phải là khẳng định. 'Nothing' chuyển thành đại từ 'it' ở phần đuôi -> 'was it'.",
    translation: "Không có thông tin nào về việc cắt giảm ngân sách được đề cập trong cuộc họp, đúng không?",
    tips: "Nothing (phủ định) -> was it."
  },
  {
    question: "I would like to know _____ signature is required on these forms.",
    optionA: "who", optionB: "whom", optionC: "whose", optionD: "which",
    correctOption: "C",
    explanation: "Cần một từ sở hữu đi với danh từ 'signature'. 'Whose signature' (chữ ký của ai).",
    translation: "Tôi muốn biết các biểu mẫu này cần chữ ký của ai.",
    tips: "Whose + Noun (của ai)."
  },
  {
    question: "Don't forget to lock the warehouse before you leave, _____?",
    optionA: "do you", optionB: "will you", optionC: "shall we", optionD: "have you",
    correctOption: "B",
    explanation: "Đối với câu mệnh lệnh (khẳng định hay phủ định), câu hỏi đuôi thường được dùng là 'will you?'.",
    translation: "Đừng quên khóa nhà kho trước khi bạn rời đi nhé, được không?",
    tips: "Câu mệnh lệnh -> will you?"
  },
  {
    question: "_____ did the board of directors decide to appoint as the new vice president?",
    optionA: "Who", optionB: "Whom", optionC: "Whose", optionD: "What",
    correctOption: "B",
    explanation: "Từ nghi vấn đóng vai trò tân ngữ của động từ 'appoint' (appoint someone as...). Trong văn phong trang trọng của bài thi TOEIC, dùng 'Whom' làm tân ngữ.",
    translation: "Hội đồng quản trị đã quyết định bổ nhiệm ai làm phó chủ tịch mới?",
    tips: "Whom làm tân ngữ chỉ người."
  }
];

const tcLesson2 = [
  {
    question: "Neither of the candidates passed the final interview, _____?",
    optionA: "did they", optionB: "didn't they", optionC: "did neither", optionD: "didn't either",
    correctOption: "A",
    explanation: "'Neither' là từ mang nghĩa phủ định (không ai trong số...). Vì vậy, câu hỏi đuôi dùng thể khẳng định 'did they'.",
    translation: "Không có ứng viên nào vượt qua cuộc phỏng vấn cuối cùng, đúng không?",
    tips: "Neither (phủ định) -> did they."
  },
  {
    question: "The supervisor wants to figure out _____ caused the sudden drop in sales last month.",
    optionA: "what", optionB: "why", optionC: "how", optionD: "when",
    correctOption: "A",
    explanation: "Từ nghi vấn 'what' đóng vai trò chủ ngữ trong mệnh đề danh từ (what caused... = điều gì đã gây ra).",
    translation: "Người giám sát muốn tìm hiểu nguyên nhân (điều gì) đã gây ra sự sụt giảm doanh số đột ngột vào tháng trước.",
    tips: "what + V (điều gì làm gì)."
  },
  {
    question: "You've never met the regional director in person, _____?",
    optionA: "have you", optionB: "haven't you", optionC: "do you", optionD: "don't you",
    correctOption: "A",
    explanation: "Câu có từ 'never' mang nghĩa phủ định, nên đuôi dùng khẳng định 'have you'.",
    translation: "Bạn chưa bao giờ gặp trực tiếp giám đốc khu vực, đúng không?",
    tips: "never (phủ định) -> đuôi khẳng định."
  },
  {
    question: "They asked me _____ I would be willing to relocate to the overseas branch.",
    optionA: "that", optionB: "whether", optionC: "which", optionD: "whom",
    correctOption: "B",
    explanation: "Câu hỏi gián tiếp Yes/No bắt đầu bằng 'if' hoặc 'whether'.",
    translation: "Họ đã hỏi tôi liệu tôi có sẵn sàng chuyển đến chi nhánh ở nước ngoài hay không.",
    tips: "ask whether/if (hỏi liệu rằng)."
  },
  {
    question: "Open the window to let some fresh air in, _____?",
    optionA: "do you", optionB: "will you", optionC: "shall we", optionD: "don't you",
    correctOption: "B",
    explanation: "Phần đuôi cho câu mệnh lệnh thức luôn là 'will you?'.",
    translation: "Mở cửa sổ ra để đón chút không khí trong lành, được chứ?",
    tips: "Câu mệnh lệnh -> will you?"
  },
  {
    question: "It is essential to clarify _____ responsibilities each team member will hold.",
    optionA: "who", optionB: "what", optionC: "that", optionD: "how",
    correctOption: "B",
    explanation: "Cần từ nghi vấn đi chung với danh từ 'responsibilities' -> 'what responsibilities' (những trách nhiệm gì).",
    translation: "Điều quan trọng là phải làm rõ mỗi thành viên trong nhóm sẽ giữ những trách nhiệm gì.",
    tips: "what + N (cái gì)."
  },
  {
    question: "Everyone has received their login credentials by now, _____?",
    optionA: "haven't they", optionB: "hasn't he", optionC: "haven't everyone", optionD: "have they",
    correctOption: "A",
    explanation: "Đại từ 'Everyone' trong mệnh đề chính dùng động từ số ít 'has', nhưng khi sang câu hỏi đuôi phải dùng 'they' và động từ tương ứng là 'haven't'.",
    translation: "Mọi người đều đã nhận được thông tin đăng nhập của mình, đúng không?",
    tips: "Everyone -> they, has -> haven't."
  },
  {
    question: "We are still uncertain about _____ to approach the disgruntled client.",
    optionA: "what", optionB: "how", optionC: "which", optionD: "why",
    correctOption: "B",
    explanation: "Cụm 'uncertain about how to do something' (không chắc về CÁCH làm điều gì). Cấu trúc: Q-word + to V.",
    translation: "Chúng tôi vẫn không chắc chắn về cách tiếp cận khách hàng đang bực bội đó.",
    tips: "how to V (cách làm gì)."
  },
  {
    question: "This printer rarely breaks down when we need it most, _____?",
    optionA: "does it", optionB: "doesn't it", optionC: "is it", optionD: "isn't it",
    correctOption: "A",
    explanation: "Từ 'rarely' mang nghĩa phủ định (hiếm khi). Mệnh đề coi như phủ định, nên câu hỏi đuôi là khẳng định 'does it'.",
    translation: "Máy in này hiếm khi bị hỏng khi chúng ta cần nó nhất, đúng không?",
    tips: "rarely (phủ định) -> does it."
  },
  {
    question: "Have you decided _____ venue we should book for the annual gala?",
    optionA: "who", optionB: "where", optionC: "which", optionD: "how",
    correctOption: "C",
    explanation: "Từ nghi vấn kết hợp với danh từ 'venue' -> 'which venue' (địa điểm nào). Dùng 'which' vì có sự lựa chọn giữa các địa điểm có sẵn.",
    translation: "Bạn đã quyết định chúng ta nên đặt địa điểm nào cho buổi dạ tiệc thường niên chưa?",
    tips: "which + Noun (sự lựa chọn)."
  }
];

// ==========================================
// LEVEL 3: NÂNG CAO
// ==========================================
const ncLesson1 = [
  {
    question: "Little did they know about the impending merger, _____?",
    optionA: "didn't they", optionB: "did they", optionC: "knew they", optionD: "didn't little",
    correctOption: "B",
    explanation: "Mệnh đề có đảo ngữ với 'Little' (hầu như không) mang ý nghĩa phủ định mạnh. Do đó câu hỏi đuôi ở dạng khẳng định 'did they'.",
    translation: "Họ hầu như không biết gì về vụ sáp nhập sắp tới, phải không?",
    tips: "Little (phủ định) -> did they."
  },
  {
    question: "The investigators couldn't ascertain _____ the confidential data had been leaked.",
    optionA: "that", optionB: "how", optionC: "what", optionD: "which",
    correctOption: "B",
    explanation: "Mệnh đề danh từ làm tân ngữ, ngữ nghĩa yêu cầu một trạng từ chỉ cách thức 'how' (làm thế nào mà dữ liệu bị rò rỉ).",
    translation: "Các nhà điều tra không thể xác định được làm thế nào mà dữ liệu mật lại bị rò rỉ.",
    tips: "how (làm thế nào)."
  },
  {
    question: "Seldom have we witnessed such a rapid economic recovery, _____?",
    optionA: "haven't we", optionB: "have we", optionC: "did we", optionD: "didn't we",
    correctOption: "B",
    explanation: "Đảo ngữ với 'Seldom' (hiếm khi) -> câu mang nghĩa phủ định. Phần đuôi dùng khẳng định 'have we'.",
    translation: "Hiếm khi chúng ta chứng kiến sự phục hồi kinh tế nhanh chóng như vậy, phải không?",
    tips: "Seldom (phủ định) -> have we."
  },
  {
    question: "The board is currently debating _____ to acquire the struggling startup or not.",
    optionA: "whether", optionB: "if", optionC: "that", optionD: "why",
    correctOption: "A",
    explanation: "Cấu trúc 'whether... or not' (liệu có... hay không) có thể đứng ngay trước động từ nguyên thể có To. Không dùng 'if to V'.",
    translation: "Hội đồng quản trị hiện đang tranh luận về việc liệu có nên mua lại công ty khởi nghiệp đang gặp khó khăn đó hay không.",
    tips: "whether to V (or not)."
  },
  {
    question: "I don't suppose the clients will agree to these revised terms, _____?",
    optionA: "do I", optionB: "don't I", optionC: "will they", optionD: "won't they",
    correctOption: "C",
    explanation: "Khi chủ ngữ là I + think/believe/suppose (phủ định), câu hỏi đuôi được chia theo mệnh đề phụ nhưng ở dạng khẳng định. 'the clients will agree' -> đuôi là 'will they'.",
    translation: "Tôi không cho rằng các khách hàng sẽ đồng ý với các điều khoản sửa đổi này, phải không?",
    tips: "I don't think/suppose S + will V -> will they?"
  },
  {
    question: "The HR manager enquired as to _____ candidate had the most extensive background in IT.",
    optionA: "who", optionB: "whose", optionC: "which", optionD: "what",
    correctOption: "C",
    explanation: "Cấu trúc hỏi sự lựa chọn giữa những ứng viên: 'which candidate'.",
    translation: "Giám đốc nhân sự đã hỏi xem ứng viên nào có kinh nghiệm chuyên sâu nhất về CNTT.",
    tips: "which + Noun (sự lựa chọn giữa một tập hợp)."
  },
  {
    question: "Scarcely had the president finished his speech when the power went out, _____?",
    optionA: "had he", optionB: "hadn't he", optionC: "did it", didnD: "didn't it",
    correctOption: "A",
    explanation: "Câu đảo ngữ với 'Scarcely' mang nghĩa phủ định ở mệnh đề chính (had finished). Câu hỏi đuôi được chia theo mệnh đề chính nhưng ở thể khẳng định: 'had he'. (Lưu ý: Một số tài liệu coi đuôi theo mệnh đề chính).",
    translation: "Tổng thống vừa kết thúc bài phát biểu thì mất điện, phải không?",
    tips: "Scarcely... had S + PII -> had + S?"
  },
  {
    question: "It is still a mystery _____ managed to bypass the company's firewall.",
    optionA: "who", optionB: "whom", optionC: "that", optionD: "which",
    correctOption: "A",
    explanation: "Đại từ 'who' làm chủ ngữ cho động từ 'managed' trong mệnh đề danh từ (người mà đã xâm nhập).",
    translation: "Vẫn còn là một bí ẩn về việc ai đã tìm cách vượt qua tường lửa của công ty.",
    tips: "who + V (ai làm gì)."
  },
  {
    question: "You'd rather work remotely than commute two hours every day, _____?",
    optionA: "hadn't you", optionB: "wouldn't you", optionC: "didn't you", optionD: "don't you",
    correctOption: "B",
    explanation: "You'd rather = You would rather. Vậy phần đuôi sẽ dùng trợ động từ 'would' -> 'wouldn't you'.",
    translation: "Bạn thà làm việc từ xa còn hơn đi lại hai tiếng mỗi ngày, đúng không?",
    tips: "would rather -> wouldn't."
  },
  {
    question: "The authorities cannot figure out _____ the cargo was delayed at the customs checkpoint.",
    optionA: "what", optionB: "why", optionC: "which", optionD: "how come",
    correctOption: "B",
    explanation: "Từ nghi vấn phù hợp nghĩa nhất là 'why' (lý do tại sao hàng bị trễ).",
    translation: "Các nhà chức trách không thể tìm ra lý do tại sao lô hàng bị trì hoãn tại trạm kiểm soát hải quan.",
    tips: "why + S + V (lý do tại sao)."
  }
];

const ncLesson2 = [
  {
    question: "You'd better finalize the logistics arrangement by tomorrow, _____?",
    optionA: "hadn't you", optionB: "wouldn't you", optionC: "didn't you", optionD: "shouldn't you",
    correctOption: "A",
    explanation: "You'd better = You had better. Vậy phần đuôi phải dùng 'hadn't you'.",
    translation: "Bạn nên hoàn tất việc sắp xếp hậu cần trước ngày mai, đúng không?",
    tips: "had better -> hadn't you."
  },
  {
    question: "The consultants suggested a complete restructuring, but they didn't specify _____.",
    optionA: "when", optionB: "how", optionC: "that", optionD: "what",
    correctOption: "B",
    explanation: "Đây là dạng câu hỏi gián tiếp rút gọn. 'didn't specify how' = không nói rõ làm như thế nào.",
    translation: "Các chuyên gia tư vấn đề xuất tái cơ cấu toàn diện, nhưng họ không nêu rõ phải làm thế nào.",
    tips: "didn't specify how (làm thế nào)."
  },
  {
    question: "Nobody in the accounting department was aware of the anomaly, _____?",
    optionA: "was he", optionB: "were they", optionC: "wasn't he", optionD: "weren't they",
    correctOption: "B",
    explanation: "Nobody mang ý nghĩa phủ định -> đuôi khẳng định. Nobody chuyển thành 'they' -> động từ 'were'. -> 'were they'.",
    translation: "Không ai trong bộ phận kế toán biết về sự bất thường đó, đúng không?",
    tips: "Nobody -> they, phủ định -> khẳng định (were they)."
  },
  {
    question: "The primary concern is _____ we can secure sufficient funding for the next phase.",
    optionA: "that", optionB: "whether", optionC: "why", optionD: "how",
    correctOption: "B",
    explanation: "Mệnh đề danh từ đóng vai trò bổ ngữ: 'is whether we can...' (là LIỆU CHÚNG TA CÓ THỂ...).",
    translation: "Mối quan tâm hàng đầu là liệu chúng ta có thể đảm bảo đủ kinh phí cho giai đoạn tiếp theo hay không.",
    tips: "whether (liệu rằng)."
  },
  {
    question: "There is hardly any paper left in the copier, _____?",
    optionA: "is there", optionB: "isn't there", optionC: "is it", optionD: "isn't it",
    correctOption: "A",
    explanation: "'hardly any' mang ý phủ định (hầu như không có). Cấu trúc 'There is' -> đuôi 'is there'.",
    translation: "Hầu như không còn giấy trong máy photocopy, đúng không?",
    tips: "hardly (phủ định) -> is there."
  },
  {
    question: "Please be aware of _____ items are strictly prohibited in the facility.",
    optionA: "what", optionB: "which", optionC: "that", optionD: "how",
    correctOption: "A",
    explanation: "'what items' = những vật phẩm nào (hỏi mở). ('Which items' dùng khi có danh sách lựa chọn cụ thể, nhưng 'what' phổ biến hơn cho những quy định cấm chung chung).",
    translation: "Xin lưu ý về những vật phẩm nào bị nghiêm cấm mang vào cơ sở.",
    tips: "what + Noun."
  },
  {
    question: "Let me assist you with those heavy cartons, _____?",
    optionA: "may I", optionB: "shall I", optionC: "will you", optionD: "don't I",
    correctOption: "A",
    explanation: "Câu hỏi đuôi cho 'Let me' thường là 'may I?' hoặc 'will you?'. Tuy nhiên, với lời đề nghị giúp đỡ 'Let me do sth', dùng 'may I' tỏ ý lịch sự.",
    translation: "Để tôi giúp bạn với những thùng các tông nặng đó nhé, được không?",
    tips: "Let me... -> may I?"
  },
  {
    question: "He claims to have extensive knowledge of the local market, _____?",
    optionA: "doesn't he", optionB: "hasn't he", optionC: "does he", optionD: "isn't it",
    correctOption: "A",
    explanation: "Động từ chính là 'claims' (hiện tại đơn, khẳng định). Câu hỏi đuôi là 'doesn't he'.",
    translation: "Anh ta khẳng định có kiến thức sâu rộng về thị trường địa phương, đúng không?",
    tips: "claims -> doesn't."
  },
  {
    question: "It is crucial to determine _____ fault it was that the network crashed.",
    optionA: "who", optionB: "whom", optionC: "whose", optionD: "which",
    correctOption: "C",
    explanation: "Sở hữu đi với danh từ 'fault'. 'whose fault' (lỗi của ai).",
    translation: "Việc xác định mạng bị sập là lỗi của ai đóng vai trò rất quan trọng.",
    tips: "whose + Noun (của ai)."
  },
  {
    question: "Only by implementing these changes can we remain competitive, _____?",
    optionA: "can we", optionB: "can't we", optionC: "do we", optionD: "don't we",
    correctOption: "B",
    explanation: "Đảo ngữ với 'Only by', cấu trúc chính là 'we can remain competitive'. Câu hỏi đuôi mượn khiếm khuyết 'can' đổi thành 'can't we'. (Mặc dù đảo ngữ, ý nghĩa vẫn là khẳng định).",
    translation: "Chỉ bằng cách thực hiện những thay đổi này, chúng ta mới có thể duy trì sức cạnh tranh, phải không?",
    tips: "can we remain (ý khẳng định) -> can't we."
  }
];

async function run() {
  console.log("Generating Topic 8: Câu hỏi (Yes/No, Wh-, Tag questions) (3 levels)...");
  
  const baseTitle = "Câu hỏi (Yes/No, Wh-, Tag questions)";
  const levelsData = [
    { level: "Cơ Bản", slug: "cau-hoi-co-ban", keyword: "[Cơ Bản]", lessons: [ { title: "Bài tập 1", questions: cbLesson1 }, { title: "Bài tập 2", questions: cbLesson2 } ] },
    { level: "Trung Cấp", slug: "cau-hoi-trung-cap", keyword: "[Trung Cấp]", lessons: [ { title: "Bài tập 1", questions: tcLesson1 }, { title: "Bài tập 2", questions: tcLesson2 } ] },
    { level: "Nâng Cao", slug: "cau-hoi-nang-cao", keyword: "[Nâng Cao]", lessons: [ { title: "Bài tập 1", questions: ncLesson1 }, { title: "Bài tập 2", questions: ncLesson2 } ] }
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
        subtitle: `Các loại câu hỏi mức độ ${lData.level}`,
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

  console.log("Topic 8 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
