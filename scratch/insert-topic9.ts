import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// LEVEL 1: CƠ BẢN
// ==========================================
const cbLesson1 = [
  {
    question: "Jane likes to drink coffee in the morning, and her brother _____ too.",
    optionA: "does", optionB: "is", optionC: "do", optionD: "has",
    correctOption: "A",
    explanation: "Câu trước dùng động từ thường 'likes' (thì hiện tại đơn), nên phần phụ họa dùng trợ động từ 'does' cho chủ ngữ số ít 'her brother'.",
    translation: "Jane thích uống cà phê vào buổi sáng, và anh trai cô ấy cũng vậy.",
    tips: "S + trợ động từ + too."
  },
  {
    question: "I have finished my homework, and _____ has Mary.",
    optionA: "too", optionB: "so", optionC: "either", optionD: "neither",
    correctOption: "B",
    explanation: "Cấu trúc phụ họa khẳng định đảo ngữ: 'so + trợ động từ + S'.",
    translation: "Tôi đã làm xong bài tập về nhà, và Mary cũng vậy.",
    tips: "so + trợ động từ + S."
  },
  {
    question: "They didn't attend the meeting yesterday, and I didn't _____.",
    optionA: "too", optionB: "so", optionC: "either", optionD: "neither",
    correctOption: "C",
    explanation: "Cấu trúc phụ họa phủ định đứng cuối câu: 'S + trợ động từ phủ định + either'.",
    translation: "Họ đã không tham dự cuộc họp hôm qua, và tôi cũng vậy.",
    tips: "not ... either."
  },
  {
    question: "My father is not very fond of spicy food, and _____ is my mother.",
    optionA: "so", optionB: "too", optionC: "either", optionD: "neither",
    correctOption: "D",
    explanation: "Cấu trúc phụ họa phủ định đứng đầu mệnh đề (đảo ngữ): 'neither + trợ động từ + S'. Lưu ý trợ động từ đi sau 'neither' luôn ở thể khẳng định.",
    translation: "Bố tôi không thích đồ ăn cay cho lắm, và mẹ tôi cũng không.",
    tips: "neither + trợ động từ (khẳng định) + S."
  },
  {
    question: "We will go to the beach this weekend, and so _____ they.",
    optionA: "do", optionB: "are", optionC: "will", optionD: "have",
    correctOption: "C",
    explanation: "Mệnh đề trước dùng trợ động từ 'will', nên mệnh đề phụ họa cũng dùng 'will'.",
    translation: "Chúng tôi sẽ đi biển vào cuối tuần này, và họ cũng vậy.",
    tips: "so + will + S."
  },
  {
    question: "He can't swim, and _____ can his sister.",
    optionA: "so", optionB: "neither", optionC: "either", optionD: "too",
    correctOption: "B",
    explanation: "Câu phủ định 'can't', phụ họa phủ định đảo ngữ dùng 'neither + can + S'.",
    translation: "Anh ấy không biết bơi, và chị gái anh ấy cũng vậy.",
    tips: "neither + can + S."
  },
  {
    question: "She is a doctor, and her husband is _____.",
    optionA: "too", optionB: "so", optionC: "either", optionD: "neither",
    correctOption: "A",
    explanation: "Cấu trúc khẳng định: S + be + too.",
    translation: "Cô ấy là bác sĩ, và chồng cô ấy cũng vậy.",
    tips: "S + be + too."
  },
  {
    question: "I don't like horror movies, and my friends don't _____.",
    optionA: "too", optionB: "either", optionC: "neither", optionD: "so",
    correctOption: "B",
    explanation: "Cấu trúc phụ họa phủ định: trợ động từ phủ định (don't) + either.",
    translation: "Tôi không thích phim kinh dị, và bạn bè tôi cũng không.",
    tips: "don't ... either."
  },
  {
    question: "The first applicant was not qualified, and _____ was the second one.",
    optionA: "either", optionB: "neither", optionC: "so", optionD: "too",
    correctOption: "B",
    explanation: "Phụ họa mang nghĩa phủ định 'cũng không', đảo ngữ to be: 'neither + was + S'.",
    translation: "Ứng viên đầu tiên không đủ tiêu chuẩn, và ứng viên thứ hai cũng vậy.",
    tips: "neither + be + S."
  },
  {
    question: "You should study hard for the exam, and so _____ I.",
    optionA: "should", optionB: "do", optionC: "am", optionD: "have",
    correctOption: "A",
    explanation: "Mệnh đề trước dùng khiếm khuyết 'should', phụ họa cũng dùng 'should'.",
    translation: "Bạn nên học hành chăm chỉ cho kỳ thi, và tôi cũng vậy.",
    tips: "so + should + S."
  }
];

const cbLesson2 = [
  {
    question: "Peter bought a new car last week, and his brother _____ too.",
    optionA: "bought", optionB: "did", optionC: "does", optionD: "was",
    correctOption: "B",
    explanation: "Mệnh đề trước thì quá khứ đơn 'bought', nên mượn trợ động từ quá khứ 'did'.",
    translation: "Peter đã mua một chiếc xe mới vào tuần trước, và anh trai cậu ấy cũng vậy.",
    tips: "Quá khứ đơn -> trợ động từ did."
  },
  {
    question: "She hasn't seen that movie yet, and neither _____ we.",
    optionA: "have", optionB: "haven't", optionC: "do", optionD: "are",
    correctOption: "A",
    explanation: "Mệnh đề trước dùng thì hiện tại hoàn thành 'hasn't', phần phụ họa dùng 'have' (vì chủ ngữ là 'we').",
    translation: "Cô ấy chưa xem bộ phim đó, và chúng tôi cũng chưa.",
    tips: "neither + have + S."
  },
  {
    question: "I am going to the supermarket, and _____ is my roommate.",
    optionA: "too", optionB: "either", optionC: "neither", optionD: "so",
    correctOption: "D",
    explanation: "Phụ họa cho câu khẳng định có đảo ngữ: so + be + S.",
    translation: "Tôi đang đi siêu thị, và bạn cùng phòng của tôi cũng đi.",
    tips: "so + be + S."
  },
  {
    question: "My laptop isn't working properly, and yours _____ either.",
    optionA: "isn't", optionB: "is", optionC: "doesn't", optionD: "aren't",
    correctOption: "A",
    explanation: "Cấu trúc phụ họa phủ định đứng cuối: S + be (phủ định) + either. Chủ ngữ 'yours' (của bạn - ám chỉ laptop số ít) -> isn't.",
    translation: "Máy tính xách tay của tôi không hoạt động bình thường, và của bạn cũng vậy.",
    tips: "isn't ... either."
  },
  {
    question: "He plays tennis very well, and so _____ his children.",
    optionA: "does", optionB: "do", optionC: "is", optionD: "are",
    correctOption: "B",
    explanation: "Động từ chính 'plays' (hiện tại đơn). Chủ ngữ ở phần phụ họa là 'his children' (số nhiều) -> dùng trợ động từ 'do'.",
    translation: "Anh ấy chơi quần vợt rất giỏi, và các con anh ấy cũng vậy.",
    tips: "so + do + S (nhiều)."
  },
  {
    question: "I wouldn't accept that offer, and _____ would my colleagues.",
    optionA: "either", optionB: "neither", optionC: "so", optionD: "too",
    correctOption: "B",
    explanation: "Câu trước dùng 'wouldn't' (phủ định). Đảo ngữ phủ định dùng 'neither'.",
    translation: "Tôi sẽ không chấp nhận lời đề nghị đó, và các đồng nghiệp của tôi cũng không.",
    tips: "neither + would + S."
  },
  {
    question: "Mary didn't finish the report, and John didn't _____.",
    optionA: "too", optionB: "so", optionC: "neither", optionD: "either",
    correctOption: "D",
    explanation: "Đứng sau trợ động từ phủ định (didn't) ở cuối câu phụ họa phải là 'either'.",
    translation: "Mary đã không hoàn thành báo cáo, và John cũng không.",
    tips: "didn't + either."
  },
  {
    question: "We were extremely tired after the trip, and they were _____.",
    optionA: "so", optionB: "too", optionC: "either", optionD: "neither",
    correctOption: "B",
    explanation: "Câu phụ họa khẳng định, động từ to be, từ nằm ở cuối câu là 'too'.",
    translation: "Chúng tôi vô cùng mệt mỏi sau chuyến đi, và họ cũng vậy.",
    tips: "S + be + too."
  },
  {
    question: "Tom could speak Spanish, and so _____ Sarah.",
    optionA: "can", optionB: "could", optionC: "did", optionD: "does",
    correctOption: "B",
    explanation: "Câu trước dùng động từ khiếm khuyết 'could', phụ họa dùng lại 'could'.",
    translation: "Tom có thể nói tiếng Tây Ban Nha, và Sarah cũng vậy.",
    tips: "so + could + S."
  },
  {
    question: "I have never been to Paris, and _____ has my sister.",
    optionA: "neither", optionB: "either", optionC: "so", optionD: "too",
    correctOption: "A",
    explanation: "'never' làm cho mệnh đề trước mang nghĩa phủ định. Đảo ngữ phụ họa phủ định dùng 'neither'.",
    translation: "Tôi chưa bao giờ đến Paris, và em gái tôi cũng vậy.",
    tips: "never (phủ định) -> neither."
  }
];

// ==========================================
// LEVEL 2: TRUNG CẤP
// ==========================================
const tcLesson1 = [
  {
    question: "The new marketing strategy was not successful, and neither _____ the previous one.",
    optionA: "was", optionB: "were", optionC: "did", optionD: "had",
    correctOption: "A",
    explanation: "Mệnh đề trước dùng to be 'was'. Chủ ngữ mệnh đề sau 'the previous one' (số ít) -> to be 'was'.",
    translation: "Chiến lược tiếp thị mới đã không thành công, và chiến lược trước đó cũng vậy.",
    tips: "neither + was + S."
  },
  {
    question: "The board members have reviewed the financial report, and _____ the CEO.",
    optionA: "so did", optionB: "so has", optionC: "so have", optionD: "has so",
    correctOption: "B",
    explanation: "Câu trước dùng thì hiện tại hoàn thành 'have reviewed'. Chủ ngữ mệnh đề sau là 'the CEO' (số ít) -> trợ động từ 'has'.",
    translation: "Các thành viên hội đồng quản trị đã xem xét báo cáo tài chính, và Giám đốc điều hành cũng vậy.",
    tips: "so + has + S (số ít)."
  },
  {
    question: "Our competitors are expanding their operations, and we _____ too.",
    optionA: "are", optionB: "do", optionC: "have", optionD: "will",
    correctOption: "A",
    explanation: "Câu trước dùng thì hiện tại tiếp diễn với to be 'are'. Phần phụ họa cùng loại trợ động từ là 'are'.",
    translation: "Các đối thủ cạnh tranh của chúng ta đang mở rộng hoạt động và chúng ta cũng vậy.",
    tips: "S + are + too."
  },
  {
    question: "He seldom arrives at the office on time, and _____ do his subordinates.",
    optionA: "so", optionB: "neither", optionC: "too", optionD: "either",
    correctOption: "B",
    explanation: "'seldom' mang nghĩa phủ định. Vì vậy câu này coi như câu phủ định, cấu trúc đảo ngữ phụ họa phủ định dùng 'neither'.",
    translation: "Anh ấy hiếm khi đến văn phòng đúng giờ, và cấp dưới của anh ấy cũng vậy.",
    tips: "seldom (phủ định) -> neither."
  },
  {
    question: "The budget proposal shouldn't be approved without revision, and _____ should the timeline.",
    optionA: "either", optionB: "so", optionC: "neither", optionD: "too",
    correctOption: "C",
    explanation: "Câu phủ định 'shouldn't', đảo ngữ dùng 'neither'.",
    translation: "Đề xuất ngân sách không nên được phê duyệt nếu không được sửa đổi, và lịch trình cũng vậy.",
    tips: "neither + should + S."
  },
  {
    question: "The director hardly ever attends these minor meetings, and I _____ either.",
    optionA: "do", optionB: "don't", optionC: "am not", optionD: "am",
    correctOption: "B",
    explanation: "'hardly ever' là thể phủ định. Phụ họa bằng 'either' cần trợ động từ phủ định. Vì động từ chính 'attends' ở hiện tại đơn -> dùng 'don't'.",
    translation: "Giám đốc hầu như không bao giờ tham dự những cuộc họp nhỏ này, và tôi cũng vậy.",
    tips: "don't + either."
  },
  {
    question: "They had already left by the time we arrived, and so _____ everyone else.",
    optionA: "did", optionB: "had", optionC: "have", optionD: "were",
    correctOption: "B",
    explanation: "Thì quá khứ hoàn thành 'had left', trợ động từ phụ họa là 'had'.",
    translation: "Họ đã rời đi khi chúng tôi đến nơi, và những người khác cũng vậy.",
    tips: "so + had + S."
  },
  {
    question: "Mr. Lee won't be participating in the workshop, and _____ will Ms. Kim.",
    optionA: "either", optionB: "so", optionC: "neither", optionD: "too",
    correctOption: "C",
    explanation: "Mệnh đề trước mang ý phủ định 'won't'. Phụ họa đảo ngữ phủ định dùng 'neither'.",
    translation: "Ông Lee sẽ không tham gia hội thảo, và cô Kim cũng vậy.",
    tips: "neither + will + S."
  },
  {
    question: "The new accounting software is significantly more efficient, and _____.",
    optionA: "so is the CRM system", optionB: "so does the CRM system", optionC: "the CRM system is so", optionD: "the CRM system does too",
    correctOption: "A",
    explanation: "Câu trước dùng to be 'is'. Cấu trúc phụ họa khẳng định: 'so + be + S'.",
    translation: "Phần mềm kế toán mới hiệu quả hơn đáng kể và hệ thống CRM cũng vậy.",
    tips: "so + is + S."
  },
  {
    question: "We haven't received any updates regarding the merger, and our partners haven't _____.",
    optionA: "too", optionB: "either", optionC: "neither", optionD: "so",
    correctOption: "B",
    explanation: "Mệnh đề phụ họa có trợ động từ phủ định 'haven't' đứng trước chỗ trống ở cuối câu, nên dùng 'either'.",
    translation: "Chúng tôi chưa nhận được bất kỳ thông tin cập nhật nào về việc sáp nhập và các đối tác của chúng tôi cũng vậy.",
    tips: "haven't + either."
  }
];

const tcLesson2 = [
  {
    question: "She used to work in the headquarters, and _____ did her manager.",
    optionA: "so", optionB: "too", optionC: "neither", optionD: "either",
    correctOption: "A",
    explanation: "Cấu trúc 'used to V' mang nghĩa khẳng định ở quá khứ, trợ động từ đảo ngữ là 'did', dùng 'so'.",
    translation: "Cô ấy từng làm việc ở trụ sở chính và quản lý của cô ấy cũng vậy.",
    tips: "so + did + S."
  },
  {
    question: "The regional director doesn't support the new policy, and _____ do the employees.",
    optionA: "neither", optionB: "either", optionC: "so", optionD: "too",
    correctOption: "A",
    explanation: "Mệnh đề mang ý phủ định 'doesn't support'. Đảo ngữ phụ họa dùng 'neither'.",
    translation: "Giám đốc khu vực không ủng hộ chính sách mới, và các nhân viên cũng vậy.",
    tips: "neither + do + S."
  },
  {
    question: "I would appreciate an early reply, and _____.",
    optionA: "so would my colleagues", optionB: "my colleagues would so", optionC: "so did my colleagues", optionD: "my colleagues did too",
    correctOption: "A",
    explanation: "Mệnh đề dùng 'would'. Cấu trúc phụ họa khẳng định đảo ngữ là 'so + would + S'.",
    translation: "Tôi rất mong nhận được hồi âm sớm và các đồng nghiệp của tôi cũng vậy.",
    tips: "so + would + S."
  },
  {
    question: "The shipment was delayed due to bad weather, and _____ the flight.",
    optionA: "so was", optionB: "so did", optionC: "was so", optionD: "did so",
    correctOption: "A",
    explanation: "Câu bị động dùng to be 'was delayed', nên mệnh đề phụ họa dùng 'so was'.",
    translation: "Lô hàng bị trì hoãn do thời tiết xấu và chuyến bay cũng vậy.",
    tips: "so + was + S."
  },
  {
    question: "No one from the HR department attended the seminar, and _____ did anyone from marketing.",
    optionA: "either", optionB: "neither", optionC: "so", optionD: "too",
    correctOption: "B",
    explanation: "'No one' mang nghĩa phủ định. Cấu trúc phụ họa phủ định dùng 'neither'.",
    translation: "Không có ai từ bộ phận nhân sự tham dự hội thảo, và cũng không có ai từ bộ phận tiếp thị.",
    tips: "No one (phủ định) -> neither."
  },
  {
    question: "The supplier can hardly meet the current demand, and we _____ either.",
    optionA: "can't", optionB: "can", optionC: "couldn't", optionD: "don't",
    correctOption: "A",
    explanation: "'hardly' mang nghĩa phủ định. Để đi với 'either' ở cuối câu, trợ động từ phải ở dạng phủ định 'can't'.",
    translation: "Nhà cung cấp hầu như không thể đáp ứng nhu cầu hiện tại và chúng tôi cũng không thể.",
    tips: "can't + either."
  },
  {
    question: "The marketing campaign has generated impressive results, and our new product line _____ too.",
    optionA: "has", optionB: "does", optionC: "is", optionD: "have",
    correctOption: "A",
    explanation: "Mệnh đề trước dùng thì hiện tại hoàn thành 'has generated'. Chủ ngữ mệnh đề sau 'product line' (số ít) -> 'has'.",
    translation: "Chiến dịch tiếp thị đã tạo ra kết quả ấn tượng và dòng sản phẩm mới của chúng tôi cũng vậy.",
    tips: "S + has + too."
  },
  {
    question: "If you don't submit the application by Friday, you will lose the opportunity, and _____ will your partner.",
    optionA: "neither", optionB: "so", optionC: "either", optionD: "too",
    correctOption: "B",
    explanation: "Mệnh đề kết quả 'you will lose...' là câu khẳng định, nên phần phụ họa dùng 'so'.",
    translation: "Nếu bạn không nộp đơn trước thứ Sáu, bạn sẽ mất cơ hội và đối tác của bạn cũng vậy.",
    tips: "so + will + S."
  },
  {
    question: "Our company hasn't dealt with international clients before, and _____.",
    optionA: "neither has theirs", optionB: "neither have theirs", optionC: "theirs hasn't neither", optionD: "theirs doesn't either",
    correctOption: "A",
    explanation: "Mệnh đề phủ định 'hasn't dealt'. 'theirs' (công ty của họ - ám chỉ số ít) -> 'neither has theirs'.",
    translation: "Công ty chúng tôi chưa từng làm việc với khách hàng quốc tế trước đây, và công ty của họ cũng vậy.",
    tips: "neither + has + S."
  },
  {
    question: "They must adhere to the safety guidelines strictly, and all visitors _____.",
    optionA: "must too", optionB: "so must", optionC: "too must", optionD: "must either",
    correctOption: "A",
    explanation: "Cấu trúc phụ họa khẳng định không đảo ngữ: S + trợ động từ + too.",
    translation: "Họ phải tuân thủ nghiêm ngặt các hướng dẫn an toàn và tất cả khách truy cập cũng vậy.",
    tips: "S + must + too."
  }
];

// ==========================================
// LEVEL 3: NÂNG CAO
// ==========================================
const ncLesson1 = [
  {
    question: "The revised contract lacks clarity regarding termination clauses, and _____ the original draft.",
    optionA: "so did", optionB: "so does", optionC: "neither did", optionD: "neither does",
    correctOption: "B",
    explanation: "Động từ 'lacks' ở hiện tại đơn (khẳng định). Phụ họa khẳng định dùng 'so'. Chủ ngữ 'the original draft' (số ít) -> 'so does'.",
    translation: "Hợp đồng sửa đổi thiếu sự rõ ràng về các điều khoản chấm dứt, và bản dự thảo ban đầu cũng vậy.",
    tips: "lacks -> so does."
  },
  {
    question: "Seldom have the shareholders agreed on a dividend policy so quickly, and _____ the board of directors.",
    optionA: "neither have", optionB: "so have", optionC: "neither do", optionD: "so do",
    correctOption: "A",
    explanation: "Đảo ngữ với 'Seldom' mang ý nghĩa phủ định mạnh. Phụ họa phủ định cho thì hiện tại hoàn thành dùng 'neither have'.",
    translation: "Hiếm khi các cổ đông thống nhất được chính sách cổ tức nhanh như vậy, và hội đồng quản trị cũng không.",
    tips: "Seldom (phủ định) -> neither."
  },
  {
    question: "Had the firm invested in renewable energy earlier, it would be highly profitable now, and _____ its subsidiaries.",
    optionA: "so would", optionB: "so had", optionC: "so did", optionD: "would too",
    correctOption: "A",
    explanation: "Mệnh đề chính của câu điều kiện hỗn hợp là 'it would be...' (khẳng định). Phụ họa dùng 'so would'.",
    translation: "Nếu công ty đầu tư vào năng lượng tái tạo sớm hơn thì giờ đây công ty đã có lợi nhuận cao, và các công ty con của nó cũng vậy.",
    tips: "would be -> so would."
  },
  {
    question: "Not only did the CEO resign abruptly, but the Chief Financial Officer _____.",
    optionA: "did too", optionB: "so did", optionC: "did either", optionD: "neither did",
    correctOption: "A",
    explanation: "Cấu trúc 'Not only... but (also)'. Mệnh đề sau 'but' mang ý khẳng định. Chủ ngữ 'the CFO' + trợ động từ + too -> 'did too'. ('so did' thường đứng đầu mệnh đề độc lập sau dấu phẩy và 'and').",
    translation: "Không những Giám đốc điều hành từ chức đột ngột mà Giám đốc Tài chính cũng vậy.",
    tips: "S + did + too."
  },
  {
    question: "Under no circumstances should confidential client data be disclosed, and _____ proprietary algorithms.",
    optionA: "neither should", optionB: "so should", optionC: "nor should", optionD: "either should",
    correctOption: "A",
    explanation: "'Under no circumstances' là cụm phủ định. Phụ họa phủ định đảo ngữ dùng 'neither should' (hoặc 'nor should'). Trong tiếng Anh chuẩn, 'neither' hoặc 'nor' đều được, nhưng 'neither' phổ biến hơn trong ngữ cảnh 'and neither'. (Thực tế 'and nor should' cũng được chấp nhận, nhưng A là đáp án TOEIC tiêu chuẩn).",
    translation: "Trong mọi trường hợp, không được phép tiết lộ dữ liệu bảo mật của khách hàng, và các thuật toán độc quyền cũng vậy.",
    tips: "Phủ định -> neither should."
  },
  {
    question: "The newly implemented protocols are designed to minimize risks, and _____.",
    optionA: "so is the auditing process", optionB: "so does the auditing process", optionC: "neither is the auditing process", optionD: "the auditing process does too",
    correctOption: "A",
    explanation: "Động từ chính là to be 'are designed'. Phụ họa khẳng định dùng 'so is'.",
    translation: "Các giao thức mới được triển khai được thiết kế để giảm thiểu rủi ro và quá trình kiểm toán cũng vậy.",
    tips: "are -> so is."
  },
  {
    question: "They have yet to secure the necessary permits for the construction site, and _____.",
    optionA: "neither have the contractors", optionB: "neither do the contractors", optionC: "so have the contractors", optionD: "the contractors haven't too",
    correctOption: "A",
    explanation: "Cấu trúc 'have yet to V' mang nghĩa CHƯA LÀM GÌ (phủ định). Phụ họa phủ định đảo ngữ dùng 'neither have'.",
    translation: "Họ vẫn chưa xin được các giấy phép cần thiết cho công trường xây dựng, và các nhà thầu cũng vậy.",
    tips: "have yet to (phủ định) -> neither have."
  },
  {
    question: "Much of the existing infrastructure requires immediate maintenance, and _____ the outdated software systems.",
    optionA: "so do", optionB: "so does", optionC: "so require", optionD: "so requires",
    correctOption: "A",
    explanation: "Động từ 'requires' (hiện tại đơn, khẳng định). Chủ ngữ phụ họa là 'systems' (số nhiều) -> dùng trợ động từ 'do'.",
    translation: "Phần lớn cơ sở hạ tầng hiện tại cần được bảo trì ngay lập tức và các hệ thống phần mềm lỗi thời cũng vậy.",
    tips: "systems (nhiều) -> so do."
  },
  {
    question: "Few analysts predicted the sudden market downturn, and _____ the institutional investors.",
    optionA: "neither did", optionB: "so did", optionC: "neither do", optionD: "so do",
    correctOption: "A",
    explanation: "'Few' mang nghĩa phủ định (hầu như không có). Động từ 'predicted' ở quá khứ. Đảo ngữ phụ họa phủ định -> 'neither did'.",
    translation: "Rất ít nhà phân tích dự đoán được sự suy thoái đột ngột của thị trường, và các nhà đầu tư tổ chức cũng vậy.",
    tips: "Few (phủ định) -> neither did."
  },
  {
    question: "The prototype failed to meet the rigorous safety standards, and we _____.",
    optionA: "didn't either", optionB: "failed too", optionC: "did too", optionD: "neither did",
    correctOption: "C",
    explanation: "'failed' là động từ khẳng định mang nghĩa tiêu cực (không đạt). Ngữ pháp câu là khẳng định, nên phụ họa phải dùng khẳng định 'did too'.",
    translation: "Nguyên mẫu đã không đáp ứng được các tiêu chuẩn an toàn nghiêm ngặt và chúng tôi cũng vậy.",
    tips: "failed (ngữ pháp khẳng định) -> did too."
  }
];

const ncLesson2 = [
  {
    question: "The management is considering a merger to expand its market share, and _____ our main competitor.",
    optionA: "so is", optionB: "so does", optionC: "so are", optionD: "is so",
    correctOption: "A",
    explanation: "Động từ to be 'is considering'. Phụ họa khẳng định dùng 'so is' vì chủ ngữ 'competitor' số ít.",
    translation: "Ban quản lý đang cân nhắc việc sáp nhập để mở rộng thị phần và đối thủ cạnh tranh chính của chúng ta cũng vậy.",
    tips: "is -> so is."
  },
  {
    question: "By no means is the current financial situation sustainable, and _____ the proposed strategy.",
    optionA: "neither is", optionB: "so is", optionC: "nor does", optionD: "neither does",
    correctOption: "A",
    explanation: "'By no means' (hoàn toàn không) mang ý phủ định. Phụ họa phủ định dùng 'neither is'.",
    translation: "Tình hình tài chính hiện tại hoàn toàn không bền vững và chiến lược được đề xuất cũng vậy.",
    tips: "By no means (phủ định) -> neither is."
  },
  {
    question: "The board's decision to outsource operations met with strong opposition, and _____ the salary cuts.",
    optionA: "so did", optionB: "so was", optionC: "neither did", optionD: "neither was",
    correctOption: "A",
    explanation: "Động từ 'met' (quá khứ đơn, khẳng định). Phụ họa dùng 'so did'.",
    translation: "Quyết định thuê ngoài hoạt động của hội đồng quản trị vấp phải sự phản đối mạnh mẽ và việc cắt giảm lương cũng vậy.",
    tips: "met -> so did."
  },
  {
    question: "Without your invaluable assistance, we could not have finalized the deal, and they _____.",
    optionA: "couldn't have either", optionB: "couldn't either", optionC: "neither could have", optionD: "couldn't have neither",
    correctOption: "A",
    explanation: "Phụ họa phủ định đứng cuối câu: S + couldn't have + either.",
    translation: "Nếu không có sự hỗ trợ vô giá của bạn, chúng tôi đã không thể hoàn tất thỏa thuận và họ cũng vậy.",
    tips: "couldn't have ... either."
  },
  {
    question: "Scarcely does the CEO approve such unconventional marketing campaigns, and _____ the CFO.",
    optionA: "neither does", optionB: "so does", optionC: "neither is", optionD: "so is",
    correctOption: "A",
    explanation: "'Scarcely' mang nghĩa phủ định. Phụ họa dùng 'neither does'.",
    translation: "Giám đốc điều hành hầu như không chấp thuận các chiến dịch tiếp thị độc đáo như vậy, và CFO cũng vậy.",
    tips: "Scarcely (phủ định) -> neither does."
  },
  {
    question: "The preliminary findings warrant further investigation, and _____.",
    optionA: "so does the secondary data", optionB: "so do the secondary data", optionC: "so warrant the secondary data", optionD: "neither does the secondary data",
    correctOption: "A",
    explanation: "'warrant' (hiện tại đơn). 'data' có thể dùng như số ít hoặc nhiều (thường số ít trong ngữ cảnh hiện đại). Nếu 'data' số ít -> 'so does'. Nếu số nhiều -> 'so do'. Tuy nhiên, 'secondary data' thường được chia số ít như một tập hợp. Đáp án chuẩn TOEIC hay dùng 'so does'.",
    translation: "Những phát hiện sơ bộ cần được điều tra thêm và dữ liệu thứ cấp cũng vậy.",
    tips: "warrant -> so does/do."
  },
  {
    question: "She would rather resign than compromise her professional ethics, and _____.",
    optionA: "so would I", optionB: "so did I", optionC: "neither would I", optionD: "I would either",
    correctOption: "A",
    explanation: "'would rather' (khẳng định). Phụ họa 'so would I'.",
    translation: "Cô ấy thà từ chức còn hơn là thỏa hiệp với đạo đức nghề nghiệp của mình, và tôi cũng vậy.",
    tips: "would rather -> so would."
  },
  {
    question: "Rarely have we encountered such a sophisticated cyber-attack, and _____ our security vendors.",
    optionA: "neither have", optionB: "so have", optionC: "neither did", optionD: "so did",
    correctOption: "A",
    explanation: "'Rarely' mang nghĩa phủ định. Phụ họa phủ định cho thì hiện tại hoàn thành -> 'neither have'.",
    translation: "Hiếm khi chúng ta gặp phải một cuộc tấn công mạng tinh vi như vậy, và các nhà cung cấp dịch vụ bảo mật của chúng ta cũng không.",
    tips: "Rarely (phủ định) -> neither have."
  },
  {
    question: "The previous administration neglected infrastructure maintenance, and the current one _____ too.",
    optionA: "did", optionB: "has", optionC: "was", optionD: "does",
    correctOption: "A",
    explanation: "Động từ 'neglected' (quá khứ đơn). Trợ động từ phụ họa là 'did'.",
    translation: "Chính quyền trước đây đã bỏ bê việc bảo trì cơ sở hạ tầng, và chính quyền hiện tại cũng vậy.",
    tips: "neglected -> did."
  },
  {
    question: "No longer will the company tolerate workplace harassment, and _____ the labor union.",
    optionA: "neither will", optionB: "so will", optionC: "neither does", optionD: "nor will",
    correctOption: "A",
    explanation: "'No longer' là thể phủ định. Phụ họa dùng 'neither will' (hoặc nor will). Cả A và D đều có lý, nhưng 'neither will' là lựa chọn phổ biến nhất trong dạng trắc nghiệm.",
    translation: "Công ty sẽ không còn dung túng cho hành vi quấy rối nơi làm việc nữa, và công đoàn cũng vậy.",
    tips: "No longer (phủ định) -> neither will."
  }
];

async function run() {
  console.log("Generating Topic 9: Lối nói phụ họa (So/Too, Neither/Either) (3 levels)...");
  
  const baseTitle = "Lối nói phụ họa (So/Too, Neither/Either)";
  const levelsData = [
    { level: "Cơ Bản", slug: "phu-hoa-co-ban", keyword: "[Cơ Bản]", lessons: [ { title: "Bài tập 1", questions: cbLesson1 }, { title: "Bài tập 2", questions: cbLesson2 } ] },
    { level: "Trung Cấp", slug: "phu-hoa-trung-cap", keyword: "[Trung Cấp]", lessons: [ { title: "Bài tập 1", questions: tcLesson1 }, { title: "Bài tập 2", questions: tcLesson2 } ] },
    { level: "Nâng Cao", slug: "phu-hoa-nang-cao", keyword: "[Nâng Cao]", lessons: [ { title: "Bài tập 1", questions: ncLesson1 }, { title: "Bài tập 2", questions: ncLesson2 } ] }
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
        subtitle: `Cách sử dụng lối nói phụ họa mức độ ${lData.level}`,
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

  console.log("Topic 9 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
