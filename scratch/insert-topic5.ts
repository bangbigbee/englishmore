import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cbLesson1 = [
  {
    question: "_____ is my favorite colleague in the accounting department.",
    optionA: "Her", optionB: "She", optionC: "Hers", optionD: "Herself",
    correctOption: "B",
    explanation: "Chỗ trống cần một đại từ nhân xưng làm chủ ngữ cho động từ 'is'. Đại từ nhân xưng chủ ngữ là 'She'.",
    translation: "Cô ấy là đồng nghiệp yêu thích của tôi ở bộ phận kế toán.",
    tips: "Đứng trước động từ to be / động từ thường -> dùng đại từ chủ ngữ (I, you, we, they, he, she, it)."
  },
  {
    question: "The manager asked _____ to prepare the presentation for the meeting.",
    optionA: "we", optionB: "our", optionC: "us", optionD: "ourselves",
    correctOption: "C",
    explanation: "Chỗ trống đứng sau động từ 'asked', đóng vai trò làm tân ngữ. Đại từ tân ngữ của 'we' là 'us'.",
    translation: "Người quản lý yêu cầu chúng tôi chuẩn bị bài thuyết trình cho cuộc họp.",
    tips: "Đứng sau động từ thường (ask, tell, invite...) -> dùng đại từ tân ngữ (me, you, us, them, him, her, it)."
  },
  {
    question: "Please submit _____ travel expense reports by Friday.",
    optionA: "you", optionB: "your", optionC: "yours", optionD: "yourself",
    correctOption: "B",
    explanation: "Chỗ trống đứng trước cụm danh từ 'travel expense reports'. Cần một tính từ sở hữu để bổ nghĩa. Tính từ sở hữu của 'you' là 'your'.",
    translation: "Vui lòng nộp báo cáo chi phí đi lại của bạn trước thứ Sáu.",
    tips: "Đứng trước danh từ -> dùng tính từ sở hữu (my, your, our, their, his, her, its)."
  },
  {
    question: "The new software system is very intuitive, so you can learn it _____.",
    optionA: "you", optionB: "your", optionC: "yours", optionD: "yourself",
    correctOption: "D",
    explanation: "Đại từ phản thân 'yourself' được dùng để nhấn mạnh chủ ngữ tự thực hiện hành động (learn it yourself = tự bạn học nó).",
    translation: "Hệ thống phần mềm mới rất trực quan, vì vậy bạn có thể tự mình học cách sử dụng nó.",
    tips: "Nhấn mạnh chủ thể tự làm hành động (không cần ai giúp) -> Đại từ phản thân (myself, yourself...)."
  },
  {
    question: "Mr. Lee parked _____ car in the reserved space near the entrance.",
    optionA: "he", optionB: "him", optionC: "his", optionD: "himself",
    correctOption: "C",
    explanation: "Cần tính từ sở hữu đứng trước danh từ 'car' để chỉ chiếc xe của ông Lee (nam).",
    translation: "Ông Lee đã đỗ xe của mình ở khu vực dành riêng gần lối vào.",
    tips: "Sở hữu của người nam -> his + Noun."
  },
  {
    question: "The company takes pride in _____ innovative products.",
    optionA: "it", optionB: "its", optionC: "itself", optionD: "they",
    correctOption: "B",
    explanation: "Cần tính từ sở hữu bổ nghĩa cho cụm danh từ 'innovative products'. Chủ ngữ 'The company' (vật/tổ chức số ít) -> its.",
    translation: "Công ty tự hào về các sản phẩm sáng tạo của mình.",
    tips: "Tính từ sở hữu của danh từ vật/tổ chức số ít -> its."
  },
  {
    question: "Could you send the contract to _____ as soon as possible?",
    optionA: "I", optionB: "my", optionC: "me", optionD: "mine",
    correctOption: "C",
    explanation: "Sau giới từ 'to' cần một đại từ tân ngữ.",
    translation: "Bạn có thể gửi hợp đồng cho tôi càng sớm càng tốt được không?",
    tips: "Sau giới từ (to, for, with...) -> Đại từ tân ngữ (me, him, us...)."
  },
  {
    question: "That blue folder on the desk is _____.",
    optionA: "my", optionB: "me", optionC: "mine", optionD: "myself",
    correctOption: "C",
    explanation: "Đại từ sở hữu 'mine' (= my folder) thay thế cho cụm danh từ để tránh lặp lại.",
    translation: "Cái bìa hồ sơ màu xanh trên bàn là của tôi.",
    tips: "Đứng một mình không có danh từ theo sau -> Đại từ sở hữu (mine, yours, ours, theirs, his, hers)."
  },
  {
    question: "_____ are planning to launch a new marketing campaign next month.",
    optionA: "They", optionB: "Them", optionC: "Their", optionD: "Theirs",
    correctOption: "A",
    explanation: "Cần một đại từ nhân xưng làm chủ ngữ cho động từ 'are planning'.",
    translation: "Họ đang lên kế hoạch khởi động một chiến dịch tiếp thị mới vào tháng tới.",
    tips: "Làm chủ ngữ đầu câu -> They / We / I / He / She / It."
  },
  {
    question: "The clients were highly satisfied with the proposal _____ submitted.",
    optionA: "we", optionB: "us", optionC: "our", optionD: "ours",
    correctOption: "A",
    explanation: "Cần đại từ chủ ngữ cho động từ 'submitted' trong mệnh đề quan hệ rút gọn (which/that we submitted).",
    translation: "Các khách hàng rất hài lòng với bản đề xuất mà chúng tôi đã nộp.",
    tips: "Cần chủ ngữ cho mệnh đề phụ -> dùng đại từ chủ ngữ (we, I, they...)."
  }
];

const cbLesson2 = [
  {
    question: "If you have any questions, please contact the HR department or _____.",
    optionA: "I", optionB: "me", optionC: "my", optionD: "mine",
    correctOption: "B",
    explanation: "Đứng sau liên từ 'or' và là tân ngữ của động từ 'contact' -> đại từ tân ngữ 'me' (contact the HR department or me).",
    translation: "Nếu bạn có bất kỳ câu hỏi nào, vui lòng liên hệ với bộ phận nhân sự hoặc tôi.",
    tips: "Đóng vai trò làm tân ngữ -> dùng đại từ tân ngữ (me, us, him...)."
  },
  {
    question: "Ms. Adams reviewed the quarterly report by _____.",
    optionA: "her", optionB: "hers", optionC: "herself", optionD: "she",
    correctOption: "C",
    explanation: "Cấu trúc 'by + đại từ phản thân' (by oneself) mang nghĩa là 'tự mình làm, làm một mình không ai giúp'.",
    translation: "Cô Adams đã tự mình xem xét báo cáo hàng quý.",
    tips: "by oneself = alone (tự làm một mình)."
  },
  {
    question: "This umbrella is not _____. I left mine at the office.",
    optionA: "your", optionB: "you", optionC: "yours", optionD: "yourself",
    correctOption: "C",
    explanation: "Đại từ sở hữu 'yours' (= your umbrella) đứng một mình làm vị ngữ.",
    translation: "Chiếc ô này không phải của bạn. Tôi đã để quên chiếc của mình ở văn phòng.",
    tips: "Đại từ sở hữu đứng độc lập, không có danh từ đi kèm."
  },
  {
    question: "The CEO thanked all employees for _____ hard work and dedication.",
    optionA: "they", optionB: "them", optionC: "their", optionD: "theirs",
    correctOption: "C",
    explanation: "Cần tính từ sở hữu bổ nghĩa cho cụm danh từ 'hard work and dedication'. 'employees' số nhiều -> their.",
    translation: "Giám đốc điều hành cảm ơn tất cả nhân viên vì sự chăm chỉ và cống hiến của họ.",
    tips: "Tính từ sở hữu của danh từ số nhiều -> their."
  },
  {
    question: "We should introduce _____ to the new clients at the reception.",
    optionA: "we", optionB: "us", optionC: "our", optionD: "ourselves",
    correctOption: "D",
    explanation: "Đại từ phản thân 'ourselves' làm tân ngữ cho động từ 'introduce', vì chủ ngữ (We) và tân ngữ (ourselves) cùng chỉ một đối tượng.",
    translation: "Chúng ta nên tự giới thiệu mình với các khách hàng mới tại buổi tiệc chiêu đãi.",
    tips: "Chủ ngữ và tân ngữ là cùng một người/nhóm người -> Đại từ phản thân."
  },
  {
    question: "_____ needs to sign the registration form before entering the building.",
    optionA: "Everyone", optionB: "All", optionC: "Many", optionD: "Few",
    correctOption: "A",
    explanation: "Động từ 'needs' chia số ít, chỉ có đại từ bất định 'Everyone' đi với động từ số ít.",
    translation: "Mọi người cần ký vào mẫu đăng ký trước khi vào tòa nhà.",
    tips: "Động từ số ít (needs) -> Chủ ngữ Everyone/Someone/Nobody."
  },
  {
    question: "The supervisor gave _____ some useful advice on improving productivity.",
    optionA: "we", optionB: "our", optionC: "us", optionD: "ourselves",
    correctOption: "C",
    explanation: "Sau động từ 'gave' cần tân ngữ gián tiếp (gave somebody something).",
    translation: "Người giám sát đã cho chúng tôi một số lời khuyên hữu ích về việc nâng cao năng suất.",
    tips: "Sau give/show/tell/send -> Đại từ tân ngữ (me, you, us, them...)."
  },
  {
    question: "These laptops are for the interns, and those are _____.",
    optionA: "our", optionB: "we", optionC: "us", optionD: "ours",
    correctOption: "D",
    explanation: "Đại từ sở hữu 'ours' (= our laptops) đóng vai trò vị ngữ.",
    translation: "Những chiếc máy tính xách tay này dành cho thực tập sinh, và những chiếc kia là của chúng tôi.",
    tips: "Đại từ sở hữu thay thế cho Tính từ sở hữu + Noun."
  },
  {
    question: "The committee has finally reached _____ decision after a long debate.",
    optionA: "its", optionB: "it", optionC: "their", optionD: "theirs",
    correctOption: "A",
    explanation: "'The committee' đóng vai trò là một đơn vị thống nhất đưa ra một quyết định chung -> tính từ sở hữu số ít 'its' (mặc dù 'their' đôi khi được chấp nhận trong Anh-Anh, TOEIC thường ưu tiên 'its' cho danh từ tập hợp số ít khi là 1 khối).",
    translation: "Ủy ban cuối cùng đã đưa ra quyết định của mình sau một cuộc tranh luận dài.",
    tips: "Danh từ tập hợp (committee, team, company) -> its."
  },
  {
    question: "To protect _____, always wear safety goggles in the laboratory.",
    optionA: "you", optionB: "your", optionC: "yours", optionD: "yourself",
    correctOption: "D",
    explanation: "Câu mệnh lệnh ẩn chủ ngữ 'You'. Phản thân của 'You' là 'yourself' (hoặc yourselves).",
    translation: "Để tự bảo vệ mình, hãy luôn đeo kính bảo hộ trong phòng thí nghiệm.",
    tips: "Trong câu mệnh lệnh, tân ngữ phản thân luôn là yourself/yourselves."
  }
];

const tcLesson1 = [
  {
    question: "The director commended the marketing team for _____ successful campaign.",
    optionA: "they", optionB: "them", optionC: "their", optionD: "theirs",
    correctOption: "C",
    explanation: "Tính từ sở hữu 'their' bổ nghĩa cho cụm danh từ 'successful campaign'. 'their' thay thế cho 'the marketing team'.",
    translation: "Giám đốc khen ngợi nhóm tiếp thị vì chiến dịch thành công của họ.",
    tips: "Đứng trước (adj) + Noun -> Tính từ sở hữu."
  },
  {
    question: "Please ensure that _____ who have not registered do so immediately.",
    optionA: "those", optionB: "them", optionC: "they", optionD: "these",
    correctOption: "A",
    explanation: "Cấu trúc 'those who' (những người mà). 'Those' làm đại từ chỉ định thay cho 'the people'.",
    translation: "Vui lòng đảm bảo rằng những người chưa đăng ký hãy làm điều đó ngay lập tức.",
    tips: "Those who = The people who (Những người mà)."
  },
  {
    question: "The responsibility for organizing the event is entirely _____.",
    optionA: "your", optionB: "yours", optionC: "you", optionD: "yourself",
    correctOption: "B",
    explanation: "Đại từ sở hữu 'yours' (= your responsibility) đứng cuối câu đóng vai trò vị ngữ.",
    translation: "Trách nhiệm tổ chức sự kiện hoàn toàn thuộc về bạn.",
    tips: "Đại từ sở hữu (yours, mine, hers) không đi kèm danh từ."
  },
  {
    question: "Mr. Henderson bought a new coffee machine for the office using _____ own money.",
    optionA: "he", optionB: "him", optionC: "his", optionD: "himself",
    correctOption: "C",
    explanation: "Cấu trúc 'one's own + Noun' (tiền của chính anh ấy). Cần tính từ sở hữu 'his'.",
    translation: "Ông Henderson đã mua một máy pha cà phê mới cho văn phòng bằng chính tiền của mình.",
    tips: "Tính từ sở hữu + own + N (của chính ai đó)."
  },
  {
    question: "Customers can return defective items and get _____ money back within 30 days.",
    optionA: "their", optionB: "theirs", optionC: "them", optionD: "they",
    correctOption: "A",
    explanation: "Cần tính từ sở hữu bổ nghĩa cho danh từ 'money'.",
    translation: "Khách hàng có thể trả lại các mặt hàng bị lỗi và lấy lại tiền trong vòng 30 ngày.",
    tips: "Tính từ sở hữu (their) + Noun (money)."
  },
  {
    question: "_____ of the candidates met all the requirements for the managerial position.",
    optionA: "None", optionB: "No", optionC: "Nothing", optionD: "Nobody",
    correctOption: "A",
    explanation: "'None of' + the + Noun/Pronoun (Không ai trong số...). 'No' đứng trước danh từ trực tiếp (No candidates).",
    translation: "Không có ứng viên nào đáp ứng được tất cả các yêu cầu cho vị trí quản lý.",
    tips: "None of the + Noun (Không ai/không cái gì trong số...)."
  },
  {
    question: "The software updates automatically, so you don't need to do it _____.",
    optionA: "you", optionB: "your", optionC: "yours", optionD: "yourself",
    correctOption: "D",
    explanation: "Đại từ phản thân 'yourself' dùng để nhấn mạnh chủ thể tự thực hiện (do it yourself = tự bạn làm việc đó).",
    translation: "Phần mềm tự động cập nhật, vì vậy bạn không cần phải tự mình làm việc đó.",
    tips: "Do something + oneself (tự mình làm việc gì)."
  },
  {
    question: "The financial advisor suggested investing in bonds rather than stocks _____.",
    optionA: "them", optionB: "their", optionC: "themselves", optionD: "they",
    correctOption: "C",
    explanation: "Đại từ phản thân 'themselves' đặt sau 'stocks' để nhấn mạnh chính bản thân các cổ phiếu đó.",
    translation: "Cố vấn tài chính đề nghị đầu tư vào trái phiếu thay vì chính bản thân các cổ phiếu.",
    tips: "Đại từ phản thân đứng sau danh từ để nhấn mạnh danh từ đó."
  },
  {
    question: "If there are any problems with the network, please report _____ to the IT department.",
    optionA: "it", optionB: "them", optionC: "they", optionD: "their",
    correctOption: "B",
    explanation: "Tân ngữ 'them' thay thế cho danh từ số nhiều 'problems' được nhắc đến phía trước.",
    translation: "Nếu có bất kỳ vấn đề nào với mạng, vui lòng báo cáo chúng cho bộ phận CNTT.",
    tips: "Đại từ tân ngữ thay thế cho danh từ số nhiều -> them."
  },
  {
    question: "The CEO was very impressed with _____ handling the crisis so professionally.",
    optionA: "you", optionB: "your", optionC: "yours", optionD: "yourself",
    correctOption: "B",
    explanation: "Trước Danh động từ (V-ing - handling) đóng vai trò danh từ, ta dùng Tính từ sở hữu (your). Việc bạn xử lý...",
    translation: "Giám đốc điều hành rất ấn tượng với việc bạn xử lý khủng hoảng một cách chuyên nghiệp như vậy.",
    tips: "Tính từ sở hữu + V-ing (danh động từ)."
  }
];

const tcLesson2 = [
  {
    question: "The two companies have decided to merge, bringing _____ resources together.",
    optionA: "their", optionB: "theirs", optionC: "them", optionD: "they",
    correctOption: "A",
    explanation: "Tính từ sở hữu 'their' bổ nghĩa cho danh từ 'resources'.",
    translation: "Hai công ty đã quyết định sáp nhập, gom các nguồn lực của họ lại với nhau.",
    tips: "Tính từ sở hữu (their) + Noun (resources)."
  },
  {
    question: "_____ interested in the workshop should sign up at the front desk.",
    optionA: "Anyone", optionB: "Who", optionC: "These", optionD: "Those",
    correctOption: "A",
    explanation: "Đại từ bất định 'Anyone' (Bất cứ ai) phù hợp nhất. (Lưu ý: Nếu có 'Those', thì cấu trúc rút gọn mệnh đề quan hệ 'Those interested' cũng đúng, nhưng 'Anyone' phổ biến hơn khi đi với động từ số ít. Tuy nhiên, 'should sign' không phân biệt số, cả A và D đều có lý, nhưng 'Anyone' thường được dùng trong các thông báo kiểu này).",
    translation: "Bất cứ ai quan tâm đến hội thảo nên đăng ký ở quầy lễ tân.",
    tips: "Anyone interested = Bất cứ ai quan tâm."
  },
  {
    question: "Ms. Tanaka designed the entire website _____ without any external help.",
    optionA: "she", optionB: "her", optionC: "hers", optionD: "herself",
    correctOption: "D",
    explanation: "Nhấn mạnh chủ ngữ 'Ms. Tanaka' tự làm (không nhờ ai), dùng đại từ phản thân 'herself'.",
    translation: "Cô Tanaka đã tự mình thiết kế toàn bộ trang web mà không cần bất kỳ sự trợ giúp nào từ bên ngoài.",
    tips: "Nhấn mạnh tính độc lập -> Đại từ phản thân."
  },
  {
    question: "The new policy applies to all employees, including _____ in the overseas branches.",
    optionA: "this", optionB: "that", optionC: "these", optionD: "those",
    correctOption: "D",
    explanation: "Đại từ chỉ định 'those' thay thế cho danh từ số nhiều 'employees' để tránh lặp từ.",
    translation: "Chính sách mới áp dụng cho tất cả nhân viên, bao gồm cả những nhân viên ở các chi nhánh nước ngoài.",
    tips: "Those = những người / những vật (thay thế danh từ số nhiều)."
  },
  {
    question: "Before leaving the office, make sure you have all of _____ belongings.",
    optionA: "you", optionB: "your", optionC: "yours", optionD: "yourself",
    correctOption: "B",
    explanation: "Tính từ sở hữu 'your' đứng trước danh từ 'belongings'.",
    translation: "Trước khi rời văn phòng, hãy đảm bảo rằng bạn đã có tất cả đồ đạc của mình.",
    tips: "your + belongings (đồ đạc cá nhân)."
  },
  {
    question: "The proposals from the marketing team are much more detailed than _____ from the sales team.",
    optionA: "this", optionB: "that", optionC: "these", optionD: "those",
    correctOption: "D",
    explanation: "'those' thay thế cho danh từ số nhiều 'proposals'.",
    translation: "Các đề xuất từ nhóm tiếp thị chi tiết hơn nhiều so với các đề xuất từ nhóm bán hàng.",
    tips: "that of (số ít) / those of, those from (số nhiều)."
  },
  {
    question: "The manager asked Mr. Kim and _____ to attend the seminar next week.",
    optionA: "I", optionB: "me", optionC: "my", optionD: "mine",
    correctOption: "B",
    explanation: "Sau động từ 'asked', cần tân ngữ. Đại từ tân ngữ là 'me'. ('Mr. Kim and me' đóng vai trò tân ngữ).",
    translation: "Người quản lý đã yêu cầu ông Kim và tôi tham dự hội thảo vào tuần tới.",
    tips: "Làm tân ngữ -> dùng 'me' (không dùng 'I')."
  },
  {
    question: "After reviewing the two applicants, the committee decided to hire _____ of them.",
    optionA: "none", optionB: "neither", optionC: "nothing", optionD: "nobody",
    correctOption: "B",
    explanation: "Khi nhắc đến 2 đối tượng (the two applicants) và muốn nói 'không ai trong hai người', ta dùng 'neither'. 'None' dùng cho 3 đối tượng trở lên.",
    translation: "Sau khi xem xét hai ứng viên, ủy ban quyết định không thuê ai trong số họ.",
    tips: "Neither of: Không ai trong 2. None of: Không ai trong số 3+."
  },
  {
    question: "The company encourages _____ employees to participate in professional development courses.",
    optionA: "it", optionB: "its", optionC: "their", optionD: "they",
    correctOption: "B",
    explanation: "'The company' là danh từ tổ chức số ít -> tính từ sở hữu là 'its'.",
    translation: "Công ty khuyến khích nhân viên của mình tham gia các khóa học phát triển chuyên môn.",
    tips: "Company, organization, firm -> Tính từ sở hữu 'its'."
  },
  {
    question: "We need someone to lead the project, but _____ seems willing to take on the responsibility.",
    optionA: "nobody", optionB: "anybody", optionC: "somebody", optionD: "everybody",
    correctOption: "A",
    explanation: "Liên từ 'but' chỉ sự đối lập. Chúng ta cần ai đó, NHƯNG 'không ai' sẵn sàng -> nobody.",
    translation: "Chúng ta cần ai đó dẫn dắt dự án, nhưng không ai có vẻ sẵn sàng gánh vác trách nhiệm.",
    tips: "nobody = không có ai."
  }
];

const ncLesson1 = [
  {
    question: "The board of directors expressed _____ satisfaction with the annual revenue growth.",
    optionA: "their", optionB: "its", optionC: "them", optionD: "theirs",
    correctOption: "A",
    explanation: "'The board of directors' (Hội đồng quản trị) có thể được coi là số ít hoặc số nhiều. Khi nhấn mạnh đến các thành viên, người ta thường dùng 'their'. (Tuy nhiên, 'its' cũng đúng nếu xem là 1 khối. TOEIC thường có 'their' nếu đi với nhóm người có ý kiến/cảm xúc cá nhân như 'satisfaction').",
    translation: "Hội đồng quản trị bày tỏ sự hài lòng của họ với sự tăng trưởng doanh thu hàng năm.",
    tips: "Nhóm người (board, staff) có cảm xúc/ý kiến -> their."
  },
  {
    question: "Employees are responsible for keeping _____ work areas clean and organized.",
    optionA: "them", optionB: "their", optionC: "theirs", optionD: "themselves",
    correctOption: "B",
    explanation: "Tính từ sở hữu 'their' bổ nghĩa cho 'work areas'.",
    translation: "Nhân viên có trách nhiệm giữ gìn khu vực làm việc của họ sạch sẽ và ngăn nắp.",
    tips: "their + Noun."
  },
  {
    question: "Only those individuals with a security clearance _____ allowed access to the server room.",
    optionA: "is", optionB: "are", optionC: "who are", optionD: "they are",
    correctOption: "B",
    explanation: "Chủ ngữ là 'those individuals' (số nhiều). Động từ chính cần chia ở số nhiều là 'are allowed'. (Chú ý: 'those individuals' = S, 'with a security clearance' = cụm giới từ, 'are allowed' = V).",
    translation: "Chỉ những cá nhân có giấy phép an ninh mới được phép vào phòng máy chủ.",
    tips: "Chủ ngữ số nhiều -> Động từ to be 'are'."
  },
  {
    question: "The newly hired accountant proved _____ to be a valuable asset to the firm.",
    optionA: "he", optionB: "him", optionC: "himself", optionD: "his",
    correctOption: "C",
    explanation: "Cấu trúc 'prove oneself to be' (chứng tỏ bản thân là...). Chủ ngữ 'accountant' tác động lên chính mình -> Đại từ phản thân.",
    translation: "Kế toán mới được thuê đã chứng tỏ bản thân là một tài sản quý giá của công ty.",
    tips: "prove oneself (to be) + N/Adj."
  },
  {
    question: "We appreciate _____ taking the time to meet with us on such short notice.",
    optionA: "you", optionB: "your", optionC: "yours", optionD: "yourself",
    correctOption: "B",
    explanation: "Sau 'appreciate' dùng Tính từ sở hữu + V-ing (danh động từ). 'your taking' (việc bạn dành thời gian...). Trong văn nói, 'you taking' cũng dùng nhưng 'your taking' chuẩn ngữ pháp formal hơn.",
    translation: "Chúng tôi trân trọng việc bạn đã dành thời gian gặp chúng tôi trong thời gian ngắn như vậy.",
    tips: "appreciate + possessive adj (your/his/her) + V-ing."
  },
  {
    question: "The instructions in this manual are more complicated than _____ in the previous version.",
    optionA: "this", optionB: "that", optionC: "these", optionD: "those",
    correctOption: "D",
    explanation: "Đại từ chỉ định 'those' thay thế cho danh từ số nhiều 'instructions' để tránh lặp từ trong câu so sánh.",
    translation: "Các hướng dẫn trong sách hướng dẫn này phức tạp hơn so với các hướng dẫn trong phiên bản trước.",
    tips: "So sánh: those in... / those of... (thay cho N số nhiều)."
  },
  {
    question: "Should you need further assistance, please address your inquiries to the manager or _____.",
    optionA: "I", optionB: "me", optionC: "my", optionD: "mine",
    correctOption: "B",
    explanation: "Sau giới từ 'to', cần tân ngữ. Đại từ tân ngữ là 'me'.",
    translation: "Nếu bạn cần hỗ trợ thêm, vui lòng gửi câu hỏi của bạn đến người quản lý hoặc tôi.",
    tips: "address to + somebody (tân ngữ -> me)."
  },
  {
    question: "The warranty covers the product and _____ accessories for a period of one year.",
    optionA: "it", optionB: "its", optionC: "they", optionD: "their",
    correctOption: "B",
    explanation: "Cần tính từ sở hữu bổ nghĩa cho 'accessories'. Thuộc về 'the product' (số ít) -> its.",
    translation: "Bảo hành bao gồm sản phẩm và các phụ kiện của nó trong thời gian một năm.",
    tips: "its + Noun (của vật số ít)."
  },
  {
    question: "Many of the delegates brought _____ own laptops to the conference.",
    optionA: "them", optionB: "their", optionC: "theirs", optionD: "themselves",
    correctOption: "B",
    explanation: "Cấu trúc 'their own + Noun' (của riêng họ).",
    translation: "Nhiều đại biểu đã mang theo máy tính xách tay của riêng họ đến hội nghị.",
    tips: "possessive adj + own + Noun."
  },
  {
    question: "Because of the tight deadline, the design team had to complete the project by _____.",
    optionA: "them", optionB: "their", optionC: "theirs", optionD: "themselves",
    correctOption: "D",
    explanation: "Cấu trúc 'by + đại từ phản thân' (tự mình làm, không ai giúp).",
    translation: "Vì thời hạn gấp rút, đội ngũ thiết kế đã phải tự mình hoàn thành dự án.",
    tips: "by themselves = tự mình."
  }
];

const ncLesson2 = [
  {
    question: "Between you and _____, I don't think the new merger will be successful.",
    optionA: "I", optionB: "me", optionC: "my", optionD: "mine",
    correctOption: "B",
    explanation: "Sau giới từ 'Between' bắt buộc dùng đại từ làm tân ngữ (Between you and me). Không dùng 'Between you and I'.",
    translation: "Nói riêng giữa bạn và tôi nhé, tôi không nghĩ việc sáp nhập mới sẽ thành công.",
    tips: "Between you and me (Nói nhỏ giữa hai ta)."
  },
  {
    question: "The software glitch fixed _____ after the system was rebooted.",
    optionA: "it", optionB: "its", optionC: "itself", optionD: "itselves",
    correctOption: "C",
    explanation: "Đại từ phản thân 'itself' chỉ ra rằng sự cố (vật) tự được khắc phục (tự sửa lỗi).",
    translation: "Lỗi phần mềm đã tự động khắc phục sau khi hệ thống được khởi động lại.",
    tips: "S vật + V + itself."
  },
  {
    question: "The CEO was impressed by _____ having managed the entire portfolio independently.",
    optionA: "she", optionB: "her", optionC: "hers", optionD: "herself",
    correctOption: "B",
    explanation: "Trước Danh động từ (having managed) dùng tính từ sở hữu 'her'. (Việc cô ấy đã quản lý...).",
    translation: "Giám đốc điều hành rất ấn tượng bởi việc cô ấy đã tự mình quản lý toàn bộ danh mục đầu tư một cách độc lập.",
    tips: "Tính từ sở hữu + V-ing/having V3."
  },
  {
    question: "The equipment in our laboratory is much more advanced than _____ in the competitor's facility.",
    optionA: "this", optionB: "that", optionC: "these", optionD: "those",
    correctOption: "B",
    explanation: "Đại từ chỉ định 'that' thay thế cho danh từ không đếm được 'equipment' để tránh lặp từ.",
    translation: "Thiết bị trong phòng thí nghiệm của chúng tôi tiên tiến hơn nhiều so với thiết bị trong cơ sở của đối thủ cạnh tranh.",
    tips: "that of / that in (thay thế cho N số ít/không đếm được)."
  },
  {
    question: "All attendees are requested to turn off _____ mobile devices during the keynote speech.",
    optionA: "their", optionB: "theirs", optionC: "them", optionD: "themselves",
    correctOption: "A",
    explanation: "Tính từ sở hữu 'their' bổ nghĩa cho 'mobile devices'.",
    translation: "Tất cả những người tham dự được yêu cầu tắt thiết bị di động của họ trong suốt bài phát biểu chính.",
    tips: "their + Noun."
  },
  {
    question: "Any employee who fails to submit _____ timesheet by Friday will experience a delay in payment.",
    optionA: "his or her", optionB: "their", optionC: "his", optionD: "its",
    correctOption: "A",
    explanation: "'Any employee' (bất kỳ nhân viên nào - số ít). Tính từ sở hữu chuẩn mực formal là 'his or her'. (Trong văn phong hiện đại 'their' số ít cũng được chấp nhận, nhưng TOEIC thường ưu tiên 'his or her' hoặc 'his/her' cho danh từ số ít chỉ người chung chung, hoặc 'their' nếu không có lựa chọn kia. Ở đây A rõ ràng nhất).",
    translation: "Bất kỳ nhân viên nào không nộp bảng chấm công của mình trước thứ Sáu sẽ bị chậm thanh toán.",
    tips: "Employee/Person (số ít) -> his or her / his / her."
  },
  {
    question: "To fully maximize _____ potential, the company must invest heavily in R&D.",
    optionA: "it", optionB: "its", optionC: "their", optionD: "they",
    correctOption: "B",
    explanation: "Tính từ sở hữu 'its' (của công ty) bổ nghĩa cho danh từ 'potential'.",
    translation: "Để phát huy tối đa tiềm năng của mình, công ty phải đầu tư mạnh vào R&D.",
    tips: "Company's potential -> its potential."
  },
  {
    question: "We will hire whoever proves _____ capable of handling high-stress situations.",
    optionA: "them", optionB: "themselves", optionC: "himself or herself", optionD: "they",
    correctOption: "C",
    explanation: "Tương tự như trên, 'whoever' (bất cứ ai - số ít). Tân ngữ phản thân chuẩn là 'himself or herself' (hoặc themselves trong văn phong informal).",
    translation: "Chúng tôi sẽ thuê bất cứ ai chứng tỏ được bản thân họ có khả năng xử lý các tình huống căng thẳng cao độ.",
    tips: "whoever (số ít) -> himself or herself."
  },
  {
    question: "The director _____ reviewed all the financial statements before signing the approval.",
    optionA: "he", optionB: "him", optionC: "his", optionD: "himself",
    correctOption: "D",
    explanation: "Đại từ phản thân 'himself' đặt ngay sau chủ ngữ (hoặc cuối mệnh đề) để NHẤN MẠNH (chính giám đốc đã làm, không phải ai khác).",
    translation: "Chính giám đốc đã xem xét tất cả các báo cáo tài chính trước khi ký phê duyệt.",
    tips: "Chủ ngữ + Đại từ phản thân (nhấn mạnh chính chủ ngữ làm)."
  },
  {
    question: "It is strictly forbidden for anyone to use the corporate email for _____ personal business.",
    optionA: "his or her", optionB: "their", optionC: "one's", optionD: "yours",
    correctOption: "A",
    explanation: "Đại từ bất định 'anyone' (số ít). Tính từ sở hữu chuẩn xác là 'his or her'.",
    translation: "Nghiêm cấm mọi người sử dụng email công ty cho công việc kinh doanh cá nhân của mình.",
    tips: "anyone / someone / everyone -> his or her."
  }
];

async function run() {
  console.log("Generating Topic 5: Đại từ (3 levels)...");
  
  const baseTitle = "Đại từ";
  const levelsData = [
    { level: "Cơ Bản", slug: "dai-tu-co-ban", keyword: "[Cơ Bản]", lessons: [ { title: "Bài tập 1", questions: cbLesson1 }, { title: "Bài tập 2", questions: cbLesson2 } ] },
    { level: "Trung Cấp", slug: "dai-tu-trung-cap", keyword: "[Trung Cấp]", lessons: [ { title: "Bài tập 1", questions: tcLesson1 }, { title: "Bài tập 2", questions: tcLesson2 } ] },
    { level: "Nâng Cao", slug: "dai-tu-nang-cao", keyword: "[Nâng Cao]", lessons: [ { title: "Bài tập 1", questions: ncLesson1 }, { title: "Bài tập 2", questions: ncLesson2 } ] }
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
        subtitle: `Ôn tập Đại từ Nhân xưng, Tân ngữ, Sở hữu, Phản thân mức độ ${lData.level}`,
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

  console.log("Topic 5 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
