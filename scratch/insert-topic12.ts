import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// LEVEL 1: CƠ BẢN
// ==========================================
const cbLesson1 = [
  {
    question: "If it _____ tomorrow, we will cancel the picnic.",
    optionA: "rain", optionB: "rains", optionC: "rained", optionD: "will rain",
    correctOption: "B",
    explanation: "Câu điều kiện loại 1 (diễn tả khả năng ở hiện tại hoặc tương lai): If + Hiện tại đơn, S + will + V-bare.",
    translation: "Nếu ngày mai trời mưa, chúng tôi sẽ hủy bỏ chuyến dã ngoại.",
    tips: "If + HTĐ, S + will + V."
  },
  {
    question: "If I _____ you, I would study harder for the final exam.",
    optionA: "am", optionB: "was", optionC: "were", optionD: "been",
    correctOption: "C",
    explanation: "Câu điều kiện loại 2 (trái với thực tế ở hiện tại): If S + V-quá khứ (to be thường dùng 'were' cho mọi ngôi), S + would + V.",
    translation: "Nếu tôi là bạn, tôi sẽ học chăm chỉ hơn cho kỳ thi cuối kỳ.",
    tips: "If I were you (Câu ĐK loại 2)."
  },
  {
    question: "I will call you as soon as I _____ at the airport.",
    optionA: "arriving", optionB: "arrived", optionC: "will arrive", optionD: "arrive",
    correctOption: "D",
    explanation: "Mệnh đề chỉ thời gian/điều kiện bắt đầu bằng 'as soon as', 'when', 'if' luôn dùng thì hiện tại đơn để chỉ tương lai.",
    translation: "Tôi sẽ gọi cho bạn ngay khi tôi đến sân bay.",
    tips: "As soon as + Hiện tại đơn."
  },
  {
    question: "If she had more time, she _____ to the gym every day.",
    optionA: "goes", optionB: "will go", optionC: "would go", optionD: "went",
    correctOption: "C",
    explanation: "Câu điều kiện loại 2: If S + V-quá khứ (had), S + would + V-bare.",
    translation: "Nếu cô ấy có nhiều thời gian hơn, cô ấy sẽ đi tập thể dục mỗi ngày.",
    tips: "If ..., would V."
  },
  {
    question: "Unless you _____ now, you will miss the train.",
    optionA: "leave", optionB: "don't leave", optionC: "left", optionD: "will leave",
    correctOption: "A",
    explanation: "'Unless' = 'If ... not' (Trừ khi). Sau 'unless' luôn dùng mệnh đề khẳng định nhưng mang nghĩa phủ định. Ở đây là câu điều kiện loại 1.",
    translation: "Trừ khi bạn rời đi bây giờ, bạn sẽ lỡ chuyến tàu.",
    tips: "Unless + Khẳng định (HTĐ)."
  },
  {
    question: "If water reaches 100 degrees Celsius, it _____.",
    optionA: "boil", optionB: "boils", optionC: "boiled", optionD: "will boil",
    correctOption: "B",
    explanation: "Câu điều kiện loại 0 (diễn tả một sự thật hiển nhiên, quy luật tự nhiên): If + HTĐ, S + HTĐ.",
    translation: "Nếu nước đạt 100 độ C, nó sẽ sôi.",
    tips: "If HTĐ, HTĐ (Sự thật hiển nhiên)."
  },
  {
    question: "What _____ you do if you won the lottery?",
    optionA: "will", optionB: "do", optionC: "would", optionD: "can",
    correctOption: "C",
    explanation: "Câu điều kiện loại 2: Mệnh đề if dùng quá khứ đơn (won), mệnh đề chính dùng 'would' + V.",
    translation: "Bạn sẽ làm gì nếu bạn trúng xổ số?",
    tips: "If V-past, would V."
  },
  {
    question: "If he _____ earlier, he wouldn't be late for the meeting now.",
    optionA: "wakes up", optionB: "woke up", optionC: "had woken up", optionD: "wake up",
    correctOption: "B",
    explanation: "Câu điều kiện loại 2 (giả định trái thực tế ở hiện tại): Mệnh đề If dùng quá khứ đơn.",
    translation: "Nếu anh ấy thức dậy sớm hơn, anh ấy đã không bị trễ cuộc họp bây giờ.",
    tips: "If V-past, wouldn't V."
  },
  {
    question: "I will buy that car provided that it _____ in good condition.",
    optionA: "is", optionB: "be", optionC: "was", optionD: "will be",
    correctOption: "A",
    explanation: "'provided that' = 'if' (với điều kiện là). Theo sau là mệnh đề điều kiện loại 1 chia thì hiện tại đơn.",
    translation: "Tôi sẽ mua chiếc xe đó với điều kiện nó còn trong tình trạng tốt.",
    tips: "provided that = if."
  },
  {
    question: "If you don't wear a coat, you _____ catch a cold.",
    optionA: "would", optionB: "will", optionC: "must", optionD: "are",
    correctOption: "B",
    explanation: "Câu điều kiện loại 1: Mệnh đề if ở hiện tại (don't wear), mệnh đề chính dùng 'will'.",
    translation: "Nếu bạn không mặc áo khoác, bạn sẽ bị cảm lạnh.",
    tips: "If HTĐ, will V."
  }
];

const cbLesson2 = [
  {
    question: "If they _____ the map, they wouldn't have gotten lost.",
    optionA: "check", optionB: "checked", optionC: "have checked", optionD: "had checked",
    correctOption: "D",
    explanation: "Câu điều kiện loại 3 (trái với thực tế trong quá khứ): If S + had + PII, S + would have + PII.",
    translation: "Nếu họ đã xem bản đồ, họ đã không bị lạc.",
    tips: "If S had PII, S would have PII."
  },
  {
    question: "I would have helped you if you _____ me.",
    optionA: "ask", optionB: "asked", optionC: "had asked", optionD: "would ask",
    correctOption: "C",
    explanation: "Câu điều kiện loại 3. Mệnh đề chính là 'would have helped', mệnh đề If dùng Quá khứ hoàn thành (had asked).",
    translation: "Tôi đã có thể giúp bạn nếu bạn yêu cầu tôi.",
    tips: "If S had PII, S would have PII."
  },
  {
    question: "We won't go to the beach tomorrow _____ the weather is sunny.",
    optionA: "if", optionB: "unless", optionC: "provided", optionD: "when",
    correctOption: "B",
    explanation: "'Unless' = 'If...not' (Trừ khi). 'Chúng tôi sẽ không đi... trừ khi thời tiết nắng'.",
    translation: "Chúng tôi sẽ không đi đến bãi biển vào ngày mai trừ khi thời tiết nắng.",
    tips: "Unless = Trừ khi."
  },
  {
    question: "If I _____ his phone number, I would call him right away.",
    optionA: "know", optionB: "knew", optionC: "had known", optionD: "will know",
    correctOption: "B",
    explanation: "Câu điều kiện loại 2 (would call), mệnh đề if chia quá khứ đơn (knew).",
    translation: "Nếu tôi biết số điện thoại của anh ấy, tôi sẽ gọi cho anh ấy ngay lập tức.",
    tips: "If V(past), would V."
  },
  {
    question: "You can go out to play as long as you _____ your homework first.",
    optionA: "finish", optionB: "finishes", optionC: "finished", optionD: "will finish",
    correctOption: "A",
    explanation: "'as long as' (miễn là) có chức năng tương tự 'if' trong điều kiện loại 1. Theo sau là thì hiện tại đơn.",
    translation: "Bạn có thể ra ngoài chơi miễn là bạn hoàn thành bài tập về nhà trước.",
    tips: "as long as = miễn là (đi với HTĐ)."
  },
  {
    question: "If she had studied harder, she _____ the exam easily.",
    optionA: "will pass", optionB: "would pass", optionC: "passed", optionD: "would have passed",
    correctOption: "D",
    explanation: "Câu điều kiện loại 3 (If S had PII). Mệnh đề chính dùng 'would have + PII'.",
    translation: "Nếu cô ấy học chăm chỉ hơn, cô ấy đã vượt qua kỳ thi dễ dàng.",
    tips: "would have PII (ĐK loại 3)."
  },
  {
    question: "I _____ completely surprised if he actually shows up.",
    optionA: "am", optionB: "will be", optionC: "would be", optionD: "was",
    correctOption: "B",
    explanation: "Mệnh đề if (if he actually shows up) dùng thì hiện tại đơn -> Câu ĐK loại 1 -> Mệnh đề chính dùng 'will be'.",
    translation: "Tôi sẽ hoàn toàn ngạc nhiên nếu anh ấy thực sự xuất hiện.",
    tips: "If HTĐ, will V."
  },
  {
    question: "Suppose you _____ a ghost, what would you do?",
    optionA: "see", optionB: "saw", optionC: "had seen", optionD: "have seen",
    correctOption: "B",
    explanation: "'Suppose' (Giả sử) dùng như 'If'. Mệnh đề chính là 'would you do' (loại 2) -> Mệnh đề giả sử dùng quá khứ đơn (saw).",
    translation: "Giả sử bạn nhìn thấy một con ma, bạn sẽ làm gì?",
    tips: "Suppose = If."
  },
  {
    question: "If I _____ enough money, I will buy a new laptop.",
    optionA: "have", optionB: "had", optionC: "will have", optionD: "have had",
    correctOption: "A",
    explanation: "Mệnh đề chính dùng 'will buy' (loại 1) -> Mệnh đề If dùng thì hiện tại đơn (have).",
    translation: "Nếu tôi có đủ tiền, tôi sẽ mua một chiếc máy tính xách tay mới.",
    tips: "If HTĐ, will V."
  },
  {
    question: "He would be happier if he _____ in a quiet neighborhood.",
    optionA: "live", optionB: "lives", optionC: "lived", optionD: "had lived",
    correctOption: "C",
    explanation: "Mệnh đề chính 'would be' (loại 2) -> Mệnh đề If dùng quá khứ đơn (lived).",
    translation: "Anh ấy sẽ hạnh phúc hơn nếu anh ấy sống trong một khu phố yên tĩnh.",
    tips: "If V(past), would V."
  }
];

// ==========================================
// LEVEL 2: TRUNG CẤP
// ==========================================
const tcLesson1 = [
  {
    question: "_____ I known about the meeting, I would have prepared the presentation.",
    optionA: "If", optionB: "Were", optionC: "Had", optionD: "Should",
    correctOption: "C",
    explanation: "Đảo ngữ câu điều kiện loại 3: Had + S + PII. (Thay cho 'If I had known').",
    translation: "Nếu tôi biết về cuộc họp, tôi đã chuẩn bị bài thuyết trình.",
    tips: "Had S PII = If S had PII."
  },
  {
    question: "If you _____ so much last night, you wouldn't feel so sick today.",
    optionA: "didn't eat", optionB: "haven't eaten", optionC: "wouldn't eat", optionD: "hadn't eaten",
    correctOption: "D",
    explanation: "Câu điều kiện hỗn hợp (Mixed Conditional): Sự việc trái thực tế ở quá khứ (last night) -> mệnh đề if dùng Quá khứ hoàn thành (hadn't eaten), kết quả ở hiện tại (today) -> mệnh đề chính dùng 'would + V-bare' (wouldn't feel).",
    translation: "Nếu tối qua bạn không ăn quá nhiều, hôm nay bạn đã không cảm thấy buồn nôn thế này.",
    tips: "If had PII, would V (Điều kiện hỗn hợp)."
  },
  {
    question: "Should you _____ any assistance, please do not hesitate to contact our customer service.",
    optionA: "require", optionB: "requires", optionC: "required", optionD: "requiring",
    correctOption: "A",
    explanation: "Đảo ngữ câu điều kiện loại 1: Should + S + V-bare. (Thay cho 'If you should require').",
    translation: "Nếu bạn cần bất kỳ sự hỗ trợ nào, vui lòng đừng ngần ngại liên hệ với dịch vụ khách hàng của chúng tôi.",
    tips: "Should S V-bare = If S should V."
  },
  {
    question: "If the company _____ a new marketing strategy, their sales would have improved significantly.",
    optionA: "adopted", optionB: "has adopted", optionC: "had adopted", optionD: "would adopt",
    correctOption: "C",
    explanation: "Mệnh đề chính dùng 'would have improved' (loại 3) -> mệnh đề If dùng quá khứ hoàn thành (had adopted).",
    translation: "Nếu công ty áp dụng một chiến lược tiếp thị mới, doanh số bán hàng của họ đã được cải thiện đáng kể.",
    tips: "If S had PII, S would have PII."
  },
  {
    question: "_____ he to arrive early, he would be able to catch the manager before the meeting.",
    optionA: "If", optionB: "Were", optionC: "Had", optionD: "Should",
    correctOption: "B",
    explanation: "Đảo ngữ câu điều kiện loại 2: Were + S + to V, S + would + V. (Thay cho 'If he arrived / were to arrive').",
    translation: "Nếu anh ấy đến sớm, anh ấy sẽ có thể gặp người quản lý trước cuộc họp.",
    tips: "Were S to V = If S V-past."
  },
  {
    question: "I will sign the contract on the condition that the terms _____ slightly modified.",
    optionA: "are", optionB: "will be", optionC: "would be", optionD: "were",
    correctOption: "A",
    explanation: "'on the condition that' có chức năng giống 'if'. Đây là điều kiện loại 1 nên mệnh đề điều kiện dùng thì hiện tại đơn (are).",
    translation: "Tôi sẽ ký hợp đồng với điều kiện các điều khoản được sửa đổi đôi chút.",
    tips: "on the condition that = if (câu ĐK 1)."
  },
  {
    question: "If it hadn't been for the heavy traffic, we _____ the opening speech.",
    optionA: "wouldn't miss", optionB: "didn't miss", optionC: "wouldn't have missed", optionD: "hadn't missed",
    correctOption: "C",
    explanation: "'If it hadn't been for + N' (Nếu không vì) là mệnh đề giả định quá khứ (loại 3). Mệnh đề chính dùng 'would have + PII'.",
    translation: "Nếu không vì tình trạng kẹt xe nghiêm trọng, chúng tôi đã không bỏ lỡ bài phát biểu khai mạc.",
    tips: "If it hadn't been for N, S would have PII."
  },
  {
    question: "But for his extensive experience, he _____ the job as general manager.",
    optionA: "won't get", optionB: "wouldn't get", optionC: "wouldn't have got", optionD: "didn't get",
    correctOption: "C",
    explanation: "'But for + Noun' = 'If it hadn't been for + Noun'. Đây là giả định trái thực tế ở quá khứ (loại 3) vì nói về việc anh ta (đã) nhận được việc làm. Mệnh đề chính dùng 'would have + PII'.",
    translation: "Nếu không nhờ kinh nghiệm phong phú của anh ấy, anh ấy đã không nhận được công việc làm tổng giám đốc.",
    tips: "But for N = If it hadn't been for N."
  },
  {
    question: "You can use my car tomorrow _____ you return it by 6 PM.",
    optionA: "as if", optionB: "provided that", optionC: "unless", optionD: "even if",
    correctOption: "B",
    explanation: "'provided that' = 'as long as' = 'nếu/miễn là'. Câu mang ý nghĩa điều kiện.",
    translation: "Bạn có thể sử dụng xe của tôi vào ngày mai miễn là bạn trả lại trước 6 giờ chiều.",
    tips: "provided that = miễn là."
  },
  {
    question: "If she _____ the email, she would have replied immediately.",
    optionA: "saw", optionB: "sees", optionC: "would see", optionD: "had seen",
    correctOption: "D",
    explanation: "Câu điều kiện loại 3, mệnh đề chính 'would have replied' -> Mệnh đề If dùng quá khứ hoàn thành 'had seen'.",
    translation: "Nếu cô ấy đã xem email, cô ấy đã trả lời ngay lập tức.",
    tips: "If S had PII, S would have PII."
  }
];

const tcLesson2 = [
  {
    question: "Had the weather been better, we _____ the outdoor event.",
    optionA: "will hold", optionB: "would hold", optionC: "would have held", optionD: "held",
    correctOption: "C",
    explanation: "Đảo ngữ điều kiện loại 3 (Had S PII), mệnh đề chính dùng 'would have PII'.",
    translation: "Nếu thời tiết tốt hơn, chúng tôi đã tổ chức sự kiện ngoài trời.",
    tips: "Had S PII, S would have PII."
  },
  {
    question: "_____ you need further information, please visit our website.",
    optionA: "If", optionB: "Should", optionC: "Were", optionD: "Had",
    correctOption: "B",
    explanation: "Đảo ngữ điều kiện loại 1: Should S V-bare.",
    translation: "Nếu bạn cần thêm thông tin, vui lòng truy cập trang web của chúng tôi.",
    tips: "Should S V-bare."
  },
  {
    question: "If I _____ a map with me, I wouldn't have asked for directions.",
    optionA: "have", optionB: "had", optionC: "had had", optionD: "would have",
    correctOption: "C",
    explanation: "Câu điều kiện loại 3. Động từ chính là 'have', ở dạng quá khứ hoàn thành là 'had had' (trợ động từ had + PII của have là had).",
    translation: "Nếu tôi có mang theo bản đồ, tôi đã không phải hỏi đường.",
    tips: "had had = quá khứ hoàn thành của động từ 'have'."
  },
  {
    question: "Suppose the flight is delayed, what _____ we do?",
    optionA: "will", optionB: "would", optionC: "did", optionD: "have",
    correctOption: "A",
    explanation: "'Suppose' (giả sử) có mệnh đề 'the flight is delayed' (thì hiện tại đơn) -> tương tự câu ĐK loại 1 -> mệnh đề chính dùng 'will'.",
    translation: "Giả sử chuyến bay bị hoãn, chúng ta sẽ làm gì?",
    tips: "Suppose + HTĐ, will V."
  },
  {
    question: "He acts as if he _____ everything about the project, but he actually knows very little.",
    optionA: "know", optionB: "knows", optionC: "knew", optionD: "had known",
    correctOption: "C",
    explanation: "Cấu trúc 'as if' (cứ như thể là). Trái với thực tế ở hiện tại (he actually knows very little) -> dùng thì quá khứ đơn (knew).",
    translation: "Anh ta hành động cứ như thể anh ta biết mọi thứ về dự án, nhưng thực ra anh ta biết rất ít.",
    tips: "as if + V-past (trái thực tế HT)."
  },
  {
    question: "_____ the manager not intervened, the dispute would have escalated into a strike.",
    optionA: "If", optionB: "Were", optionC: "Had", optionD: "Should",
    correctOption: "C",
    explanation: "Đảo ngữ loại 3 dạng phủ định: Had + S + not + PII. (Had the manager not intervened).",
    translation: "Nếu người quản lý không can thiệp, cuộc tranh chấp đã leo thang thành một cuộc đình công.",
    tips: "Had S not PII (Đảo ngữ loại 3 phủ định)."
  },
  {
    question: "They won't accept your application _____ you provide all the required documents.",
    optionA: "if", optionB: "unless", optionC: "provided that", optionD: "as long as",
    correctOption: "B",
    explanation: "'unless' = 'trừ khi'. 'Họ sẽ không chấp nhận... trừ khi bạn cung cấp...'",
    translation: "Họ sẽ không chấp nhận đơn đăng ký của bạn trừ khi bạn cung cấp tất cả các tài liệu được yêu cầu.",
    tips: "unless = trừ khi."
  },
  {
    question: "If I were you, I _____ accept that job offer; it's a great opportunity.",
    optionA: "will", optionB: "would", optionC: "can", optionD: "shall",
    correctOption: "B",
    explanation: "Câu ĐK loại 2 diễn tả lời khuyên: If I were you, I would + V.",
    translation: "Nếu tôi là bạn, tôi sẽ chấp nhận lời mời làm việc đó; đó là một cơ hội tuyệt vời.",
    tips: "If I were you, I would V."
  },
  {
    question: "I wish I _____ harder when I was in university.",
    optionA: "study", optionB: "studied", optionC: "have studied", optionD: "had studied",
    correctOption: "D",
    explanation: "Cấu trúc câu ước 'wish' trái với thực tế ở quá khứ (when I was in university) -> mệnh đề wish dùng quá khứ hoàn thành (had studied).",
    translation: "Tôi ước gì mình đã học chăm chỉ hơn khi còn học đại học.",
    tips: "wish + quá khứ hoàn thành (ước cho QK)."
  },
  {
    question: "If she had taken the medication regularly, she _____ completely recovered by now.",
    optionA: "will be", optionB: "would be", optionC: "would have been", optionD: "had been",
    correctOption: "B",
    explanation: "Câu ĐK hỗn hợp (Mixed condition): nguyên nhân ở quá khứ (had taken) -> kết quả ở hiện tại (by now) -> mệnh đề chính dùng 'would + V-bare' (would be).",
    translation: "Nếu cô ấy uống thuốc đều đặn, bây giờ cô ấy đã hoàn toàn hồi phục.",
    tips: "If had PII, would V (ĐK hỗn hợp)."
  }
];

// ==========================================
// LEVEL 3: NÂNG CAO
// ==========================================
const ncLesson1 = [
  {
    question: "Had it not been for the generous donation from the sponsors, the charity event _____ place.",
    optionA: "could not take", optionB: "would not have taken", optionC: "did not take", optionD: "cannot take",
    correctOption: "B",
    explanation: "Cấu trúc đảo ngữ loại 3 'Had it not been for + N', mệnh đề chính dùng 'would/could not have + PII'.",
    translation: "Nếu không có sự đóng góp hào phóng từ các nhà tài trợ, sự kiện từ thiện đã không thể diễn ra.",
    tips: "Had it not been for N, S would have PII."
  },
  {
    question: "_____ you to change your mind, please notify the organizing committee immediately.",
    optionA: "Should", optionB: "If", optionC: "Were", optionD: "Had",
    correctOption: "C",
    explanation: "Đảo ngữ điều kiện loại 2 dạng 'Were S to V' (Were you to change). Dù dùng loại 2 nhưng để lịch sự, mệnh đề chính ở dạng mệnh lệnh (notify). Đây là một cấu trúc trang trọng trong tiếng Anh.",
    translation: "Nếu bạn thay đổi quyết định, vui lòng thông báo cho ban tổ chức ngay lập tức.",
    tips: "Were S to V (Đảo ngữ loại 2 lịch sự)."
  },
  {
    question: "Without their expert guidance, we _____ the project on schedule last month.",
    optionA: "wouldn't finish", optionB: "didn't finish", optionC: "couldn't have finished", optionD: "won't finish",
    correctOption: "C",
    explanation: "'Without + Noun' = 'If it hadn't been for' (trong ngữ cảnh quá khứ - last month). Mệnh đề chính dùng 'couldn't have + PII' (loại 3).",
    translation: "Nếu không có sự hướng dẫn chuyên môn của họ, chúng ta đã không thể hoàn thành dự án đúng tiến độ vào tháng trước.",
    tips: "Without N, S would/could have PII."
  },
  {
    question: "If he _____ his promotion, he would be celebrating with his colleagues right now.",
    optionA: "gets", optionB: "got", optionC: "had got", optionD: "has got",
    correctOption: "C",
    explanation: "Câu điều kiện hỗn hợp: mệnh đề chính 'would be celebrating... right now' (hiện tại), mệnh đề if chỉ sự việc xảy ra ở quá khứ 'If he had got/gotten' (quá khứ hoàn thành).",
    translation: "Nếu anh ấy nhận được sự thăng chức, anh ấy sẽ đang ăn mừng cùng đồng nghiệp ngay lúc này.",
    tips: "If had PII, would be V-ing (hỗn hợp)."
  },
  {
    question: "I would rather you _____ the proposal before submitting it to the board.",
    optionA: "review", optionB: "reviewed", optionC: "had reviewed", optionD: "reviewing",
    correctOption: "B",
    explanation: "Cấu trúc 'would rather' với 2 chủ ngữ, diễn tả ý muốn ở hiện tại/tương lai (before submitting - việc chưa xảy ra) -> động từ sau chủ ngữ 2 chia ở quá khứ đơn (reviewed).",
    translation: "Tôi thà rằng bạn xem lại đề xuất trước khi trình cho hội đồng quản trị.",
    tips: "S1 would rather S2 V(past)."
  },
  {
    question: "But for the unforeseen complications during the surgery, the patient _____ a full recovery.",
    optionA: "would make", optionB: "would have made", optionC: "will make", optionD: "makes",
    correctOption: "B",
    explanation: "'But for' (nếu không vì) + danh từ chỉ một việc trong quá khứ (during the surgery). Đây là điều kiện loại 3 ngầm. Mệnh đề chính dùng 'would have + PII'.",
    translation: "Nếu không vì những biến chứng không lường trước trong quá trình phẫu thuật, bệnh nhân đã hồi phục hoàn toàn.",
    tips: "But for N, S would have PII."
  },
  {
    question: "He spoke confidently, as though he _____ the leading expert in the field.",
    optionA: "is", optionB: "be", optionC: "were", optionD: "has been",
    correctOption: "C",
    explanation: "Cấu trúc 'as though' (cứ như thể là). Mệnh đề sau 'as though' giả định trái thực tế nên dùng quá khứ đơn (to be dùng were cho mọi ngôi).",
    translation: "Anh ấy nói một cách tự tin, cứ như thể anh ấy là chuyên gia hàng đầu trong lĩnh vực này.",
    tips: "as though + S + were."
  },
  {
    question: "Should there _____ any discrepancies in the report, please return it for revision.",
    optionA: "be", optionB: "is", optionC: "are", optionD: "will be",
    correctOption: "A",
    explanation: "Đảo ngữ với 'Should': Should + S + V-bare. Ở đây 'Should there be...' thay cho 'If there should be...'.",
    translation: "Nếu có bất kỳ sự khác biệt nào trong báo cáo, vui lòng trả lại để chỉnh sửa.",
    tips: "Should there be = If there should be."
  },
  {
    question: "Only if you have an official invitation _____ allowed to enter the VIP lounge.",
    optionA: "you will be", optionB: "will you be", optionC: "you are", optionD: "are you",
    correctOption: "B",
    explanation: "Cấu trúc đảo ngữ với 'Only if' đứng đầu câu: Only if + Mệnh đề phụ, Trợ động từ + S + V (mệnh đề chính). Mệnh đề chính bị đảo ngữ nên dùng 'will you be'.",
    translation: "Chỉ khi bạn có giấy mời chính thức, bạn mới được phép vào phòng chờ VIP.",
    tips: "Only if + clause, Trợ ĐT + S + V."
  },
  {
    question: "It is high time the government _____ strict measures to curb inflation.",
    optionA: "takes", optionB: "took", optionC: "should take", optionD: "is taking",
    correctOption: "B",
    explanation: "Cấu trúc 'It's high time S + V(quá khứ đơn)' mang nghĩa 'Đã đến lúc ai đó nên làm gì' (giả định chưa làm).",
    translation: "Đã đến lúc chính phủ phải thực hiện các biện pháp nghiêm ngặt để kiềm chế lạm phát.",
    tips: "It is high time S + V(past)."
  }
];

const ncLesson2 = [
  {
    question: "If you _____ the instruction manual thoroughly, you wouldn't be having trouble setting up the device now.",
    optionA: "read", optionB: "were reading", optionC: "had read", optionD: "have read",
    correctOption: "C",
    explanation: "Điều kiện hỗn hợp (Mixed Conditionals): hành động ở quá khứ (had read) dẫn đến kết quả ở hiện tại (wouldn't be having).",
    translation: "Nếu bạn đã đọc kỹ sách hướng dẫn, bây giờ bạn đã không gặp khó khăn trong việc thiết lập thiết bị.",
    tips: "If S had PII, S would V."
  },
  {
    question: "Were the proposal _____ approved by the board, we would immediately commence the project.",
    optionA: "to be", optionB: "being", optionC: "been", optionD: "be",
    correctOption: "A",
    explanation: "Đảo ngữ loại 2 ở thể bị động: Were + S + to be + PII (Were the proposal to be approved).",
    translation: "Nếu đề xuất được hội đồng quản trị phê duyệt, chúng tôi sẽ ngay lập tức bắt đầu dự án.",
    tips: "Were S to be PII."
  },
  {
    question: "I would rather you _____ those confidential files without authorization yesterday.",
    optionA: "didn't access", optionB: "hadn't accessed", optionC: "wouldn't access", optionD: "haven't accessed",
    correctOption: "B",
    explanation: "Cấu trúc 'would rather' chỉ sự nuối tiếc ở quá khứ (yesterday) dùng quá khứ hoàn thành: S1 would rather S2 had/hadn't PII.",
    translation: "Tôi ước gì ngày hôm qua bạn đã không truy cập vào những tài liệu mật đó mà không có sự cho phép.",
    tips: "would rather S2 hadn't PII (quá khứ)."
  },
  {
    question: "_____ his wealthy family, he would never have been able to afford such an expensive education.",
    optionA: "If it were not for", optionB: "Had it not been for", optionC: "Were it not for", optionD: "But that",
    correctOption: "B",
    explanation: "Mệnh đề chính dùng 'would never have been able to' (loại 3) -> giả định quá khứ. Cụm 'Had it not been for + N' là đảo ngữ loại 3.",
    translation: "Nếu không nhờ gia đình giàu có của anh ấy, anh ấy đã không bao giờ có thể chi trả cho một nền giáo dục đắt đỏ như vậy.",
    tips: "Had it not been for N (loại 3)."
  },
  {
    question: "She looks as though she _____ a ghost.",
    optionA: "saw", optionB: "has seen", optionC: "had seen", optionD: "sees",
    correctOption: "C",
    explanation: "'as though' diễn tả sự việc xảy ra trước hành động ở hiện tại (looks) -> giả định lùi 1 thì thành quá khứ hoàn thành (had seen). Trông cô ấy (bây giờ) cứ như thể (trước đó) đã nhìn thấy ma.",
    translation: "Trông cô ấy cứ như thể cô ấy vừa nhìn thấy ma.",
    tips: "as though + had PII."
  },
  {
    question: "Given the circumstances, if I _____ you, I wouldn't accept their initial offer.",
    optionA: "am", optionB: "was", optionC: "were", optionD: "have been",
    correctOption: "C",
    explanation: "Câu điều kiện loại 2 'If I were you'. (Giả định luôn dùng were cho mọi ngôi).",
    translation: "Với hoàn cảnh này, nếu tôi là bạn, tôi sẽ không chấp nhận lời đề nghị ban đầu của họ.",
    tips: "If I were you (luôn dùng were)."
  },
  {
    question: "Provided that the weather conditions _____ favorable, the rocket launch will proceed as scheduled.",
    optionA: "are", optionB: "will be", optionC: "were", optionD: "be",
    correctOption: "A",
    explanation: "'Provided that' dùng như 'If' trong ĐK loại 1 -> Mệnh đề ĐK chia thì hiện tại đơn (are).",
    translation: "Miễn là điều kiện thời tiết thuận lợi, việc phóng tên lửa sẽ tiến hành theo đúng lịch trình.",
    tips: "Provided that = If (HTĐ)."
  },
  {
    question: "If he _____ more attention during the training sessions, he wouldn't make so many mistakes now.",
    optionA: "paid", optionB: "has paid", optionC: "would pay", optionD: "had paid",
    correctOption: "D",
    explanation: "Câu ĐK hỗn hợp: Quá khứ (had paid) dẫn đến kết quả hiện tại (wouldn't make... now).",
    translation: "Nếu anh ấy chú ý hơn trong các buổi đào tạo, bây giờ anh ấy đã không mắc nhiều sai lầm như vậy.",
    tips: "If had PII, would V (Hỗn hợp)."
  },
  {
    question: "Suppose you _____ the competition, how would you have celebrated?",
    optionA: "won", optionB: "had won", optionC: "win", optionD: "have won",
    correctOption: "B",
    explanation: "'Suppose' tương đương với 'If'. Mệnh đề chính là 'would you have celebrated' (loại 3) -> Mệnh đề if dùng quá khứ hoàn thành (had won).",
    translation: "Giả sử bạn đã chiến thắng cuộc thi, bạn sẽ ăn mừng như thế nào?",
    tips: "Suppose = If (loại 3 dùng had PII)."
  },
  {
    question: "I wish I _____ to my parents' advice when I was younger.",
    optionA: "listen", optionB: "listened", optionC: "have listened", optionD: "had listened",
    correctOption: "D",
    explanation: "Câu ước 'wish' trái ngược thực tế ở quá khứ (when I was younger) dùng thì Quá khứ hoàn thành (had listened).",
    translation: "Tôi ước gì tôi đã nghe lời khuyên của cha mẹ khi tôi còn trẻ.",
    tips: "wish + had PII (điều ước trong QK)."
  }
];

async function run() {
  console.log("Generating Topic 12: Câu điều kiện và Câu giả định (3 levels)...");
  
  const baseTitle = "Câu điều kiện và Câu giả định";
  const levelsData = [
    { level: "Cơ Bản", slug: "cau-dieu-kien-co-ban", keyword: "[Cơ Bản]", lessons: [ { title: "Bài tập 1", questions: cbLesson1 }, { title: "Bài tập 2", questions: cbLesson2 } ] },
    { level: "Trung Cấp", slug: "cau-dieu-kien-trung-cap", keyword: "[Trung Cấp]", lessons: [ { title: "Bài tập 1", questions: tcLesson1 }, { title: "Bài tập 2", questions: tcLesson2 } ] },
    { level: "Nâng Cao", slug: "cau-dieu-kien-nang-cao", keyword: "[Nâng Cao]", lessons: [ { title: "Bài tập 1", questions: ncLesson1 }, { title: "Bài tập 2", questions: ncLesson2 } ] }
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
        subtitle: `Cách sử dụng Conditionals và Subjunctive mức độ ${lData.level}`,
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

  console.log("Topic 12 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
