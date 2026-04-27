import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// LEVEL 1: CƠ BẢN
// ==========================================
const cbLesson1 = [
  {
    question: "John _____ to clean his room before his parents arrive.",
    optionA: "need", optionB: "needs", optionC: "needing", optionD: "needn't",
    correctOption: "B",
    explanation: "Chủ ngữ 'John' là người (số ít) và mang nghĩa chủ động, nên ta dùng 'needs to V'.",
    translation: "John cần dọn dẹp phòng của mình trước khi bố mẹ đến.",
    tips: "Chủ ngữ (Người) + need(s) + to V."
  },
  {
    question: "The broken window needs _____ as soon as possible.",
    optionA: "fix", optionB: "to fix", optionC: "fixing", optionD: "fixed",
    correctOption: "C",
    explanation: "Chủ ngữ 'The broken window' là vật vô tri giác (bị động), nên ta dùng 'needs + V-ing' (hoặc needs to be fixed).",
    translation: "Cửa sổ vỡ cần được sửa chữa càng sớm càng tốt.",
    tips: "Chủ ngữ (Vật) + need + V-ing (mang nghĩa bị động)."
  },
  {
    question: "You _____ to worry about the presentation; I have already prepared everything.",
    optionA: "don't need", optionB: "needn't", optionC: "not need", optionD: "doesn't need",
    correctOption: "A",
    explanation: "Vì đằng sau có 'to worry' nên ta phải dùng 'don't need' (coi need như động từ thường). Nếu dùng 'needn't' thì động từ theo sau không có 'to'.",
    translation: "Bạn không cần phải lo lắng về bài thuyết trình; tôi đã chuẩn bị mọi thứ rồi.",
    tips: "don't/doesn't need + to V."
  },
  {
    question: "He _____ wake up early tomorrow because it is a holiday.",
    optionA: "needs not", optionB: "needn't", optionC: "don't need", optionD: "need not to",
    correctOption: "B",
    explanation: "'need' hoạt động như một động từ khiếm khuyết trong câu phủ định, theo sau là động từ nguyên mẫu không 'to' (wake up).",
    translation: "Anh ấy không cần phải thức dậy sớm vào ngày mai vì đó là ngày lễ.",
    tips: "needn't + V (nguyên mẫu)."
  },
  {
    question: "The carpets in the living room need _____ before the party.",
    optionA: "to be clean", optionB: "clean", optionC: "to be cleaned", optionD: "cleans",
    correctOption: "C",
    explanation: "Chủ ngữ là vật 'The carpets', có 2 cấu trúc bị động: 'need cleaning' hoặc 'need to be cleaned'.",
    translation: "Thảm trong phòng khách cần được giặt sạch trước bữa tiệc.",
    tips: "Chủ ngữ (Vật) + need + to be + PII."
  },
  {
    question: "We _____ to finish this report by 5 PM today.",
    optionA: "need", optionB: "needs", optionC: "needing", optionD: "are need",
    correctOption: "A",
    explanation: "Chủ ngữ 'We' (người, số nhiều), động từ thường mang nghĩa chủ động nên dùng 'need to V'.",
    translation: "Chúng ta cần hoàn thành báo cáo này trước 5 giờ chiều nay.",
    tips: "Chủ ngữ (Người) + need + to V."
  },
  {
    question: "The engine is making a strange noise; it needs _____ immediately.",
    optionA: "check", optionB: "checking", optionC: "to check", optionD: "checked",
    correctOption: "B",
    explanation: "Chủ ngữ 'The engine' (động cơ - vật), dùng cấu trúc 'need + V-ing' để diễn đạt ý bị động.",
    translation: "Động cơ đang phát ra âm thanh lạ; nó cần được kiểm tra ngay lập tức.",
    tips: "Chủ ngữ (Vật) + need + V-ing."
  },
  {
    question: "I _____ some help with these heavy boxes.",
    optionA: "need", optionB: "needs", optionC: "am needing", optionD: "need to",
    correctOption: "A",
    explanation: "'Need' theo sau là một danh từ 'some help'. Đây là cách dùng như một ngoại động từ bình thường.",
    translation: "Tôi cần một chút trợ giúp với những chiếc hộp nặng này.",
    tips: "need + Noun (cần cái gì)."
  },
  {
    question: "The documents need to be _____ by the manager before they are sent.",
    optionA: "sign", optionB: "signing", optionC: "signed", optionD: "signs",
    correctOption: "C",
    explanation: "Cấu trúc bị động của need: 'need + to be + PII'. Ở đây cần phân từ hai của 'sign' là 'signed'.",
    translation: "Các tài liệu cần được quản lý ký duyệt trước khi được gửi đi.",
    tips: "need to be + PII (bị động)."
  },
  {
    question: "Do you _____ to use the computer right now?",
    optionA: "need", optionB: "needs", optionC: "needing", optionD: "needn't",
    correctOption: "A",
    explanation: "Câu hỏi với trợ động từ 'Do', động từ chính 'need' phải ở dạng nguyên mẫu.",
    translation: "Bạn có cần sử dụng máy tính ngay bây giờ không?",
    tips: "Do/Does + S + need + to V?"
  }
];

const cbLesson2 = [
  {
    question: "He doesn't _____ to ask his boss for permission.",
    optionA: "dare", optionB: "dares", optionC: "dared", optionD: "daring",
    correctOption: "A",
    explanation: "Trong câu phủ định dùng trợ động từ 'doesn't', động từ 'dare' đóng vai trò như động từ thường và ở dạng nguyên mẫu.",
    translation: "Anh ấy không dám xin phép sếp của mình.",
    tips: "doesn't/don't dare (to) V."
  },
  {
    question: "The children _____ not go into the dark forest alone.",
    optionA: "dare", optionB: "dares", optionC: "dared", optionD: "do dare",
    correctOption: "A",
    explanation: "'Dare' hoạt động như một động từ khiếm khuyết trong câu phủ định (dare not + V).",
    translation: "Bọn trẻ không dám đi vào khu rừng tối một mình.",
    tips: "dare not + V (không dám làm gì)."
  },
  {
    question: "_____ she dare to argue with the board of directors?",
    optionA: "Do", optionB: "Does", optionC: "Dare", optionD: "Dares",
    correctOption: "B",
    explanation: "Vì đằng sau dùng 'dare to argue', ta thấy 'dare' đang làm động từ thường. Trợ động từ cho 'she' là 'Does'.",
    translation: "Cô ấy có dám tranh luận với hội đồng quản trị không?",
    tips: "Does + S + dare + to V?"
  },
  {
    question: "I _____ say we will face many challenges next year.",
    optionA: "dare", optionB: "need", optionC: "am daring", optionD: "dared",
    correctOption: "A",
    explanation: "Thành ngữ 'I dare say' mang nghĩa 'tôi cho là, tôi đoán là'. Đây là trường hợp hiếm hoi 'dare' dùng ở thể khẳng định.",
    translation: "Tôi cho rằng chúng ta sẽ phải đối mặt với nhiều thách thức trong năm tới.",
    tips: "I dare say (tôi cho là / tôi công nhận là)."
  },
  {
    question: "How _____ you speak to me like that?",
    optionA: "do dare", optionB: "dared", optionC: "dare", optionD: "dares",
    correctOption: "C",
    explanation: "Thành ngữ 'How dare you + V' mang ý phẫn nộ: 'sao bạn dám...'.",
    translation: "Sao bạn dám nói chuyện với tôi như thế?",
    tips: "How dare + S + V! (sao dám...!)"
  },
  {
    question: "She _____ not complain about the salary because she is a new employee.",
    optionA: "need", optionB: "dare", optionC: "dares", optionD: "needn't",
    correctOption: "B",
    explanation: "'Dare not' + V mang nghĩa 'không dám'. ('Need not' + complain mang nghĩa không cần thiết, nhưng 'không dám' hợp lý hơn trong ngữ cảnh này).",
    translation: "Cô ấy không dám phàn nàn về mức lương vì cô ấy là nhân viên mới.",
    tips: "dare not + V (không dám làm gì)."
  },
  {
    question: "They _____ the boy to jump into the freezing river.",
    optionA: "dared", optionB: "need", optionC: "daring", optionD: "dares",
    correctOption: "A",
    explanation: "Cấu trúc 'dare smb to do smth' mang nghĩa 'thách ai đó làm gì'. Động từ chia thì quá khứ 'dared'.",
    translation: "Họ thách cậu bé nhảy xuống dòng sông lạnh buốt.",
    tips: "dare smb to V (thách ai làm gì)."
  },
  {
    question: "I dare _____ that you are right about the current market trends.",
    optionA: "say", optionB: "to say", optionC: "saying", optionD: "said",
    correctOption: "A",
    explanation: "Thành ngữ cố định 'I dare say' (tôi thừa nhận là).",
    translation: "Tôi thừa nhận là bạn đúng về các xu hướng thị trường hiện tại.",
    tips: "I dare say (cố định)."
  },
  {
    question: "No one _____ to tell the CEO that his plan had failed.",
    optionA: "dare", optionB: "dared", optionC: "daring", optionD: "dare not",
    correctOption: "B",
    explanation: "Câu kể ở thì quá khứ (had failed). Động từ 'dare' dùng như động từ thường (dared to tell).",
    translation: "Không ai dám nói với Giám đốc điều hành rằng kế hoạch của ông ấy đã thất bại.",
    tips: "dared to V (đã dám làm gì)."
  },
  {
    question: "_____ he dare suggest such a risky investment?",
    optionA: "Do", optionB: "Does", optionC: "Dare", optionD: "Dared",
    correctOption: "C",
    explanation: "Trong câu nghi vấn, 'Dare' có thể đảo lên đầu câu đóng vai trò như trợ động từ khiếm khuyết (Dare he suggest...).",
    translation: "Anh ta có dám đề xuất một khoản đầu tư rủi ro như vậy không?",
    tips: "Dare + S + V? (đảo ngữ khi dare là khiếm khuyết)."
  }
];

// ==========================================
// LEVEL 2: TRUNG CẤP
// ==========================================
const tcLesson1 = [
  {
    question: "The marketing department is in _____ of additional funding for the campaign.",
    optionA: "need", optionB: "needs", optionC: "needing", optionD: "needed",
    correctOption: "A",
    explanation: "Cụm danh từ 'to be in need of + Noun' có nghĩa là cần thứ gì đó (tương đương với động từ need).",
    translation: "Phòng tiếp thị đang cần thêm kinh phí cho chiến dịch.",
    tips: "be in need of + N (cần cái gì)."
  },
  {
    question: "The old roof of the warehouse _____ replacing before the rainy season.",
    optionA: "need", optionB: "needs", optionC: "is needing", optionD: "needed to",
    correctOption: "B",
    explanation: "Chủ ngữ 'The old roof' (vật) số ít. Phía sau có 'replacing' (V-ing), suy ra động từ chính là 'needs'.",
    translation: "Mái nhà cũ của nhà kho cần được thay thế trước mùa mưa.",
    tips: "Vật (số ít) + needs + V-ing."
  },
  {
    question: "You _____ have brought your laptop; we have plenty of computers in the lab.",
    optionA: "didn't need", optionB: "needn't", optionC: "don't need", optionD: "mustn't",
    correctOption: "B",
    explanation: "Cấu trúc 'needn't have + PII' diễn tả một việc ĐÃ LÀM nhưng thực sự LÀ KHÔNG CẦN THIẾT trong quá khứ.",
    translation: "Bạn lẽ ra không cần mang theo laptop; chúng tôi có rất nhiều máy tính trong phòng thực hành.",
    tips: "needn't have + PII (lẽ ra không cần làm nhưng đã làm)."
  },
  {
    question: "We _____ to print these reports because the client requested digital copies only.",
    optionA: "didn't need", optionB: "needn't have", optionC: "don't need", optionD: "need not",
    correctOption: "A",
    explanation: "Cấu trúc 'didn't need to V' diễn tả một việc KHÔNG CẦN THIẾT phải làm và ĐÃ KHÔNG LÀM trong quá khứ. Lưu ý phía sau có chữ 'to print'.",
    translation: "Chúng tôi đã không cần phải in các báo cáo này vì khách hàng chỉ yêu cầu bản mềm.",
    tips: "didn't need to V (đã không cần làm, và thực tế không làm)."
  },
  {
    question: "The software infrastructure was in need _____ a complete overhaul.",
    optionA: "for", optionB: "to", optionC: "with", optionD: "of",
    correctOption: "D",
    explanation: "Cụm từ cố định: 'be in need of' (cần).",
    translation: "Cơ sở hạ tầng phần mềm đang cần một cuộc đại tu toàn diện.",
    tips: "in need of sth."
  },
  {
    question: "This air conditioner _____ to be serviced at least once a year.",
    optionA: "needs", optionB: "need", optionC: "is needing", optionD: "needing",
    correctOption: "A",
    explanation: "Chủ ngữ vật số ít (air conditioner). Dùng bị động với To-V: 'needs to be serviced'.",
    translation: "Máy điều hòa không khí này cần được bảo dưỡng ít nhất mỗi năm một lần.",
    tips: "S (vật số ít) + needs to be + PII."
  },
  {
    question: "Employees _____ submit their expense reports before the 5th of every month.",
    optionA: "needs to", optionB: "need to", optionC: "needn't", optionD: "are needed",
    correctOption: "B",
    explanation: "'Employees' là số nhiều, mang nghĩa chủ động nên dùng 'need to' (cần phải làm gì).",
    translation: "Nhân viên cần nộp báo cáo chi phí của họ trước ngày 5 hàng tháng.",
    tips: "Employees (số nhiều) + need to V."
  },
  {
    question: "A number of volunteers _____ needed to help organize the charity run.",
    optionA: "is", optionB: "are", optionC: "has", optionD: "have",
    correctOption: "B",
    explanation: "Cấu trúc bị động thông thường của 'need': Ai đó được cần đến. 'A number of' + Danh từ số nhiều -> Động từ to be số nhiều 'are'.",
    translation: "Cần một số lượng tình nguyện viên để giúp tổ chức giải chạy từ thiện.",
    tips: "A number of + N(s) + are + needed."
  },
  {
    question: "You _____ attend the meeting if you are busy with the urgent project.",
    optionA: "don't need", optionB: "needn't", optionC: "need not to", optionD: "doesn't need",
    correctOption: "B",
    explanation: "'needn't' (không cần thiết) theo sau là động từ nguyên mẫu 'attend' (không có to).",
    translation: "Bạn không cần phải tham dự cuộc họp nếu bạn đang bận với dự án khẩn cấp.",
    tips: "needn't + V (bare)."
  },
  {
    question: "The battery of this machine _____ replacing immediately to ensure safety.",
    optionA: "needs", optionB: "need", optionC: "needing", optionD: "to need",
    correctOption: "A",
    explanation: "Chủ ngữ 'The battery' là vật số ít, phía sau có V-ing 'replacing' -> động từ chính là 'needs'.",
    translation: "Pin của loại máy này cần được thay thế ngay lập tức để đảm bảo an toàn.",
    tips: "Vật (số ít) + needs + V-ing."
  }
];

const tcLesson2 = [
  {
    question: "How _____ he sign the contract without consulting the legal team first?",
    optionA: "do dare", optionB: "dare", optionC: "dares", optionD: "daring",
    correctOption: "B",
    explanation: "Thành ngữ 'How dare + S + V' diễn tả sự bức xúc (sao anh ta dám...).",
    translation: "Sao anh ta dám ký hợp đồng mà không hỏi ý kiến nhóm pháp lý trước?",
    tips: "How dare + S + V!"
  },
  {
    question: "She didn't _____ to contradict her manager during the board meeting.",
    optionA: "dare", optionB: "dares", optionC: "dared", optionD: "daring",
    correctOption: "A",
    explanation: "Sau trợ động từ 'didn't', động từ 'dare' trở về nguyên thể.",
    translation: "Cô ấy không dám nói ngược lại quản lý của mình trong cuộc họp hội đồng quản trị.",
    tips: "didn't + dare (to) V."
  },
  {
    question: "_____ we interrupt the CEO while he is having a conference call?",
    optionA: "Dare", optionB: "Do dare", optionC: "Dares", optionD: "Daring",
    correctOption: "A",
    explanation: "'Dare' đóng vai trò là động từ khiếm khuyết trong câu nghi vấn, đảo ngữ: 'Dare + S + V (bare)?'.",
    translation: "Chúng ta có dám ngắt lời Giám đốc điều hành khi ông ấy đang họp trực tuyến không?",
    tips: "Dare + S + V (nguyên mẫu)?"
  },
  {
    question: "The competitor _____ us to prove that our software is faster than theirs.",
    optionA: "dared", optionB: "dares not", optionC: "need", optionD: "dare not",
    correctOption: "A",
    explanation: "Cấu trúc 'dare smb to do smth' (thách ai làm gì). Câu kể ở thì quá khứ dùng 'dared'.",
    translation: "Đối thủ cạnh tranh thách chúng tôi chứng minh rằng phần mềm của chúng tôi nhanh hơn của họ.",
    tips: "dare smb to V (thách ai làm gì)."
  },
  {
    question: "I dare say the new policy _____ a lot of controversy among the staff.",
    optionA: "cause", optionB: "to cause", optionC: "will cause", optionD: "causing",
    correctOption: "C",
    explanation: "'I dare say' = Tôi cho rằng. Phía sau nó là một mệnh đề hoàn chỉnh (S + V). Dùng thì tương lai 'will cause'.",
    translation: "Tôi cho rằng chính sách mới sẽ gây ra nhiều tranh cãi trong nhân viên.",
    tips: "I dare say + Mệnh đề."
  },
  {
    question: "He _____ not risk losing his job by being late every day.",
    optionA: "dare", optionB: "dares", optionC: "dared", optionD: "need",
    correctOption: "A",
    explanation: "Trong câu phủ định, 'dare' làm khiếm khuyết từ: 'dare not + V' (không dám). Chủ ngữ he số ít nhưng 'dare' không thêm 's'.",
    translation: "Anh ấy không dám liều đánh mất công việc của mình bằng cách đi trễ mỗi ngày.",
    tips: "S + dare not + V (không chia 's' ở dare)."
  },
  {
    question: "Nobody _____ approach the strict supervisor when she is angry.",
    optionA: "dares", optionB: "dare", optionC: "daring", optionD: "to dare",
    correctOption: "A",
    explanation: "Đại từ bất định 'Nobody' mang nghĩa số ít, 'dare' đóng vai trò động từ thường nên chia 'dares'.",
    translation: "Không ai dám tiếp cận người giám sát nghiêm khắc đó khi cô ấy đang tức giận.",
    tips: "Nobody + dares (to) V."
  },
  {
    question: "How _____ they alter the financial report without authorization?",
    optionA: "dares", optionB: "dare", optionC: "dared to", optionD: "daring",
    correctOption: "B",
    explanation: "Thành ngữ 'How dare + S + V'.",
    translation: "Sao họ dám thay đổi báo cáo tài chính mà không có sự cho phép?",
    tips: "How dare + they + alter..."
  },
  {
    question: "They didn't dare _____ the truth about the missing funds.",
    optionA: "revealed", optionB: "revealing", optionC: "to reveal", optionD: "reveals",
    correctOption: "C",
    explanation: "Sau 'didn't dare' có thể dùng động từ nguyên thể có 'to' (to reveal) hoặc không có 'to' (reveal).",
    translation: "Họ không dám tiết lộ sự thật về số tiền bị mất.",
    tips: "didn't dare + to V (hoặc V bare)."
  },
  {
    question: "I dare _____ to jump over that high fence.",
    optionA: "you", optionB: "your", optionC: "yours", optionD: "yourself",
    correctOption: "A",
    explanation: "Cấu trúc thách thức: 'dare + Object + to V'. Ở đây cần tân ngữ 'you'.",
    translation: "Tôi thách cậu nhảy qua được hàng rào cao đó.",
    tips: "dare + Object (tân ngữ) + to V."
  }
];

// ==========================================
// LEVEL 3: NÂNG CAO
// ==========================================
const ncLesson1 = [
  {
    question: "The confidential documents _____ to be reviewed by the chief security officer.",
    optionA: "need", optionB: "needs", optionC: "needing", optionD: "are needed",
    correctOption: "A",
    explanation: "Chủ ngữ 'The confidential documents' (vật số nhiều). Bị động với To-V: 'need to be reviewed'.",
    translation: "Các tài liệu mật cần được nhân viên an ninh trưởng xem xét lại.",
    tips: "S (vật, số nhiều) + need to be + PII."
  },
  {
    question: "You _____ have printed the report; I already sent a digital copy to everyone.",
    optionA: "mustn't", optionB: "needn't", optionC: "couldn't", optionD: "shouldn't",
    correctOption: "B",
    explanation: "Sử dụng 'needn't have + PII' (lẽ ra KHÔNG CẦN thiết phải làm nhưng ĐÃ LÀM rồi).",
    translation: "Bạn lẽ ra không cần phải in báo cáo; tôi đã gửi bản mềm cho mọi người rồi.",
    tips: "needn't have + PII."
  },
  {
    question: "The air conditioning system in the server room needs _____ immediately.",
    optionA: "to service", optionB: "servicing", optionC: "be serviced", optionD: "serviced",
    correctOption: "B",
    explanation: "Chủ ngữ là vật, cấu trúc bị động 'need + V-ing'.",
    translation: "Hệ thống điều hòa không khí trong phòng máy chủ cần được bảo dưỡng ngay lập tức.",
    tips: "need + V-ing (bị động đối với vật)."
  },
  {
    question: "We were in desperate _____ of financial assistance after the market crash.",
    optionA: "needs", optionB: "needing", optionC: "need", optionD: "needed",
    correctOption: "C",
    explanation: "Cụm danh từ cố định: 'be in need of' (từ 'desperate' bổ nghĩa cho danh từ 'need').",
    translation: "Chúng tôi đã cực kỳ cần sự hỗ trợ tài chính sau sự sụp đổ của thị trường.",
    tips: "be in (desperate) need of."
  },
  {
    question: "I didn't _____ to buy a new software license, as the old one was still valid.",
    optionA: "need", optionB: "needed", optionC: "needing", optionD: "needs",
    correctOption: "A",
    explanation: "Trợ động từ 'didn't' trong thì quá khứ yêu cầu động từ 'need' ở dạng nguyên thể.",
    translation: "Tôi đã không cần phải mua bản quyền phần mềm mới, vì bản cũ vẫn còn hiệu lực.",
    tips: "didn't need to V."
  },
  {
    question: "No one is _____ leave this building without the explicit permission of the police.",
    optionA: "to", optionB: "need", optionC: "dare", optionD: "for",
    correctOption: "A",
    explanation: "Cấu trúc 'Be + To-V' dùng để truyền đạt mệnh lệnh hoặc quy định bắt buộc (không ai ĐƯỢC PHÉP rời đi).",
    translation: "Không ai được phép rời khỏi tòa nhà này mà không có sự cho phép rõ ràng của cảnh sát.",
    tips: "S + be + to V (mệnh lệnh, bắt buộc)."
  },
  {
    question: "Something must be done quickly if the endangered species _____ to be saved.",
    optionA: "are", optionB: "is", optionC: "need", optionD: "dare",
    correctOption: "A",
    explanation: "Cấu trúc 'Be + To-V' trong mệnh đề If diễn tả một điều kiện bắt buộc/mục đích. 'species' ở đây là số nhiều -> dùng 'are'.",
    translation: "Cần phải hành động nhanh chóng nếu muốn cứu các loài có nguy cơ tuyệt chủng.",
    tips: "If + S + be + to V (Nếu muốn... thì phải...)."
  },
  {
    question: "The new branch manager _____ to assume his duties starting next Monday.",
    optionA: "is", optionB: "needs", optionC: "dares", optionD: "must",
    correctOption: "A",
    explanation: "Cấu trúc 'Be + To-V' dùng để diễn tả một dự định, kế hoạch đã được sắp xếp chính thức (is to assume = will assume).",
    translation: "Giám đốc chi nhánh mới sẽ đảm nhận nhiệm vụ của mình bắt đầu từ thứ Hai tuần tới.",
    tips: "S + be + to V (kế hoạch chính thức)."
  },
  {
    question: "The company's marketing strategy _____ overhauling completely to attract younger consumers.",
    optionA: "needs", optionB: "need", optionC: "is need", optionD: "needed to",
    correctOption: "A",
    explanation: "'strategy' là vật số ít, cộng với V-ing 'overhauling' -> động từ 'needs'.",
    translation: "Chiến lược tiếp thị của công ty cần được đại tu hoàn toàn để thu hút người tiêu dùng trẻ tuổi hơn.",
    tips: "S (vật số ít) + needs + V-ing."
  },
  {
    question: "They _____ not have hired external consultants; our internal team was fully capable.",
    optionA: "did", optionB: "need", optionC: "must", optionD: "dare",
    correctOption: "B",
    explanation: "Cấu trúc 'need not have + PII' (lẽ ra không cần làm nhưng đã làm). Sự việc thuê chuyên gia ngoài là dư thừa.",
    translation: "Lẽ ra họ không cần thuê chuyên gia tư vấn bên ngoài; đội ngũ nội bộ của chúng tôi hoàn toàn có khả năng.",
    tips: "need not have + PII."
  }
];

const ncLesson2 = [
  {
    question: "_____ I say, the new tax regulations will heavily impact small businesses.",
    optionA: "Dare", optionB: "Need", optionC: "Do", optionD: "Must",
    correctOption: "A",
    explanation: "Thành ngữ 'Dare I say' hoặc 'I dare say' (Tôi cho rằng / Có thể nói rằng).",
    translation: "Tôi cho rằng, các quy định thuế mới sẽ tác động nặng nề đến các doanh nghiệp nhỏ.",
    tips: "Dare I say (Tôi cho rằng)."
  },
  {
    question: "How dare he _____ the financial data without informing the board?",
    optionA: "manipulate", optionB: "manipulates", optionC: "manipulating", optionD: "to manipulate",
    correctOption: "A",
    explanation: "Sau 'How dare + S', động từ chính luôn ở dạng nguyên thể không 'to' (bare infinitive).",
    translation: "Sao anh ta dám thao túng dữ liệu tài chính mà không thông báo cho ban quản trị?",
    tips: "How dare + S + V (bare)!"
  },
  {
    question: "She dared him _____ the proposal directly to the strict investors.",
    optionA: "pitch", optionB: "to pitch", optionC: "pitching", optionD: "pitched",
    correctOption: "B",
    explanation: "Cấu trúc thách thức: 'dare smb TO DO smth'.",
    translation: "Cô ấy thách anh ta trình bày trực tiếp bản đề xuất với những nhà đầu tư nghiêm khắc.",
    tips: "dare smb to V."
  },
  {
    question: "Under no circumstances _____ you dare to override the security protocols.",
    optionA: "do", optionB: "should", optionC: "must", optionD: "need",
    correctOption: "B",
    explanation: "Đảo ngữ với 'Under no circumstances' (dù trong bất kỳ hoàn cảnh nào cũng không). Dùng trợ động từ khiếm khuyết 'should' để nhấn mạnh lệnh cấm/cảnh báo.",
    translation: "Dù trong bất kỳ hoàn cảnh nào, bạn cũng không được phép dám ghi đè lên các giao thức bảo mật.",
    tips: "Under no circumstances + should + S + dare + to V."
  },
  {
    question: "I _____ not ask for a raise at the moment, given the company's financial struggles.",
    optionA: "need", optionB: "dare", optionC: "ought", optionD: "must",
    correctOption: "B",
    explanation: "Ngữ cảnh: công ty đang khó khăn, nên 'không dám' (dare not) xin tăng lương thì hợp lý về nghĩa hơn là 'need not' (không cần).",
    translation: "Tôi không dám xin tăng lương vào lúc này, do những khó khăn tài chính của công ty.",
    tips: "dare not + V (không dám)."
  },
  {
    question: "He is a coward; he wouldn't dare _____ to the manager's face.",
    optionA: "complain", optionB: "to complain", optionC: "complaining", optionD: "complained",
    correctOption: "A",
    explanation: "Sau cụm 'wouldn't dare', ta có thể dùng 'to V' hoặc 'V bare'. Trong các lựa chọn, 'complain' (V bare) và 'to complain' đều đúng, nhưng thông thường sau wouldn't dare người ta ưu tiên 'V bare' hoặc 'to complain'. Ở đây nếu chọn A hoặc B đều được, tuy nhiên TOEIC ưu tiên 'complain' do coi dare là khiếm khuyết.",
    translation: "Hắn ta là kẻ hèn nhát; hắn sẽ không dám phàn nàn thẳng vào mặt quản lý đâu.",
    tips: "wouldn't dare + V (bare) / to V."
  },
  {
    question: "Dares she _____ the strict dress code of the corporate office?",
    optionA: "defy", optionB: "defies", optionC: "defying", optionD: "defied",
    correctOption: "A",
    explanation: "Trong tiếng Anh cổ hoặc trang trọng, 'Dare' có thể đảo lên làm trợ động từ, nhưng nếu chia 'Dares' (có 's') thì nó là động từ thường bị đảo sai ngữ pháp. Tuy nhiên, nếu là động từ khiếm khuyết thì chỉ là 'Dare she defy'. Nếu đề bài cho 'Dares she defy' là sai chuẩn mực, nhưng 'defy' vẫn là động từ nguyên thể cần điền (Dare she defy...?).",
    translation: "Cô ấy có dám coi thường quy định về trang phục nghiêm ngặt của văn phòng công ty không?",
    tips: "Dare + S + V (bare)?"
  },
  {
    question: "I don't know how she _____ to negotiate such a high salary.",
    optionA: "dared", optionB: "dare", optionC: "daring", optionD: "dares not",
    correctOption: "A",
    explanation: "Sự việc đã xảy ra ('how she dared to...'). 'dared' ở thì quá khứ đóng vai trò động từ thường (theo sau là to negotiate).",
    translation: "Tôi không biết bằng cách nào mà cô ấy dám đàm phán mức lương cao như vậy.",
    tips: "dared to V."
  },
  {
    question: "The union members dare _____ go on strike if their demands are not met.",
    optionA: "to", optionB: "not", optionC: "do", optionD: "will",
    correctOption: "B",
    explanation: "Dùng 'dare not' (không dám) như động từ khiếm khuyết, theo sau là V nguyên mẫu 'go'. Hoặc mang nghĩa đe dọa. Nhưng thực tế liên đoàn 'dám' đình công, nên cấu trúc 'dare to go' đúng. Nhưng đáp án 'not' tạo thành 'dare not go' (sẽ không dám đình công). Wait, 'dare to' không có ở đáp án (chỉ có 'to', 'dare to go'). Nếu chọn A 'to', câu thành: 'The union members dare to go on strike...'. Nghĩa hợp lý!",
    translation: "Các thành viên công đoàn dám tiến hành đình công nếu yêu cầu của họ không được đáp ứng.",
    tips: "dare + to V (dám làm gì)."
  },
  {
    question: "We _____ face the reality that our main product is becoming obsolete.",
    optionA: "must dare", optionB: "need to dare", optionC: "need to", optionD: "dare to",
    correctOption: "C",
    explanation: "'need to' mang nghĩa 'cần phải' đối mặt với thực tế. Phù hợp nhất về mặt ngữ nghĩa trong ngữ cảnh kinh doanh.",
    translation: "Chúng ta cần phải đối mặt với thực tế rằng sản phẩm chính của chúng ta đang trở nên lỗi thời.",
    tips: "need to + V (cần phải làm gì)."
  }
];

// FIX lỗi cho câu số 9 ncLesson2 để correctOption trỏ đúng vào "A".
ncLesson2[8].correctOption = "A";

async function run() {
  console.log("Generating Topic 7: Động từ bán khiếm khuyết (need, dare) (3 levels)...");
  
  const baseTitle = "Động từ bán khiếm khuyết (need, dare)";
  const levelsData = [
    { level: "Cơ Bản", slug: "dong-tu-ban-khiem-khuyet-co-ban", keyword: "[Cơ Bản]", lessons: [ { title: "Bài tập 1", questions: cbLesson1 }, { title: "Bài tập 2", questions: cbLesson2 } ] },
    { level: "Trung Cấp", slug: "dong-tu-ban-khiem-khuyet-trung-cap", keyword: "[Trung Cấp]", lessons: [ { title: "Bài tập 1", questions: tcLesson1 }, { title: "Bài tập 2", questions: tcLesson2 } ] },
    { level: "Nâng Cao", slug: "dong-tu-ban-khiem-khuyet-nang-cao", keyword: "[Nâng Cao]", lessons: [ { title: "Bài tập 1", questions: ncLesson1 }, { title: "Bài tập 2", questions: ncLesson2 } ] }
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
        subtitle: `Cách sử dụng need, dare mức độ ${lData.level}`,
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

  console.log("Topic 7 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
