import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// LEVEL 1: CƠ BẢN
// ==========================================
const cbLesson1 = [
  {
    question: "_____ the door before you leave the office.",
    optionA: "To lock", optionB: "Locking", optionC: "Lock", optionD: "Locked",
    correctOption: "C",
    explanation: "Đây là câu mệnh lệnh thức trực tiếp, động từ luôn ở dạng nguyên thể không to (V-bare) đứng đầu câu.",
    translation: "Hãy khóa cửa trước khi bạn rời khỏi văn phòng.",
    tips: "Đứng đầu câu mệnh lệnh: V-bare."
  },
  {
    question: "Please _____ not hesitate to contact our support team if you have any questions.",
    optionA: "do", optionB: "does", optionC: "did", optionD: "doing",
    correctOption: "A",
    explanation: "Câu mệnh lệnh phủ định với 'Please' được thành lập bằng cấu trúc: Please + do not (don't) + V-bare.",
    translation: "Vui lòng đừng ngần ngại liên hệ với nhóm hỗ trợ của chúng tôi nếu bạn có bất kỳ câu hỏi nào.",
    tips: "Please + do not + V."
  },
  {
    question: "The manager asked the assistant _____ a copy of the report.",
    optionA: "make", optionB: "to make", optionC: "making", optionD: "made",
    correctOption: "B",
    explanation: "Cấu trúc mệnh lệnh gián tiếp: ask somebody TO do something (yêu cầu ai đó làm gì).",
    translation: "Người quản lý đã yêu cầu trợ lý tạo một bản sao của báo cáo.",
    tips: "ask smb + to V."
  },
  {
    question: "_____ your mobile phones during the presentation, please.",
    optionA: "Turn off", optionB: "Turning off", optionC: "To turn off", optionD: "Turned off",
    correctOption: "A",
    explanation: "Câu mệnh lệnh trực tiếp, động từ ở dạng nguyên thể không 'to' đứng đầu câu. 'please' có thể đứng đầu hoặc cuối.",
    translation: "Vui lòng tắt điện thoại di động của bạn trong buổi thuyết trình.",
    tips: "Đứng đầu câu mệnh lệnh: V-bare."
  },
  {
    question: "John told Mary _____ touch the fragile items on the shelf.",
    optionA: "to not", optionB: "not to", optionC: "don't", optionD: "no",
    correctOption: "B",
    explanation: "Cấu trúc mệnh lệnh gián tiếp dạng phủ định: tell somebody NOT TO do something (bảo ai đừng làm gì).",
    translation: "John bảo Mary đừng chạm vào những món đồ dễ vỡ trên kệ.",
    tips: "tell smb + not to V."
  },
  {
    question: "Let's _____ a brief meeting tomorrow morning to discuss the plan.",
    optionA: "having", optionB: "to have", optionC: "have", optionD: "has",
    correctOption: "C",
    explanation: "Cấu trúc rủ rê 'Let's' (Let us) luôn đi với động từ nguyên thể không to (V-bare).",
    translation: "Chúng ta hãy tổ chức một cuộc họp ngắn vào sáng mai để thảo luận về kế hoạch nhé.",
    tips: "Let's + V-bare."
  },
  {
    question: "_____ patient while the software is installing.",
    optionA: "Being", optionB: "To be", optionC: "Are", optionD: "Be",
    correctOption: "D",
    explanation: "Câu mệnh lệnh trực tiếp với tính từ (patient), ta dùng động từ to be ở dạng nguyên thể 'Be' đứng đầu câu.",
    translation: "Hãy kiên nhẫn trong khi phần mềm đang cài đặt.",
    tips: "Be + tính từ (Mệnh lệnh thức)."
  },
  {
    question: "The security guard ordered the visitors _____ in the lobby.",
    optionA: "wait", optionB: "waiting", optionC: "to wait", optionD: "waited",
    correctOption: "C",
    explanation: "Cấu trúc mệnh lệnh gián tiếp: order somebody TO do something (ra lệnh cho ai làm gì).",
    translation: "Nhân viên bảo vệ ra lệnh cho các du khách chờ ở sảnh.",
    tips: "order smb + to V."
  },
  {
    question: "If you need further assistance, _____ extension 104.",
    optionA: "dial", optionB: "to dial", optionC: "dialing", optionD: "dialed",
    correctOption: "A",
    explanation: "Câu điều kiện loại 1 kết hợp với câu mệnh lệnh ở mệnh đề chính. Mệnh đề chính bắt đầu bằng V-bare.",
    translation: "Nếu bạn cần hỗ trợ thêm, hãy bấm số máy lẻ 104.",
    tips: "If S+V, V-bare (Câu mệnh lệnh)."
  },
  {
    question: "Please _____ to sign the visitor log at the front desk.",
    optionA: "not forget", optionB: "don't forget", optionC: "doesn't forget", optionD: "no forget",
    correctOption: "B",
    explanation: "Câu mệnh lệnh phủ định kết hợp với 'Please' thường dùng 'Please don't + V'.",
    translation: "Vui lòng đừng quên ký tên vào sổ lưu khách ở quầy lễ tân.",
    tips: "Please don't + V."
  }
];

const cbLesson2 = [
  {
    question: "_____ sure that all windows are closed before leaving.",
    optionA: "Making", optionB: "Make", optionC: "To make", optionD: "Made",
    correctOption: "B",
    explanation: "Cấu trúc mệnh lệnh: V-bare đứng đầu câu. Cụm từ cố định 'Make sure' (đảm bảo chắc chắn).",
    translation: "Hãy đảm bảo rằng tất cả các cửa sổ đều được đóng trước khi rời đi.",
    tips: "Make sure (Hãy đảm bảo)."
  },
  {
    question: "The supervisor asked everyone _____ early for the shift.",
    optionA: "arrive", optionB: "arrives", optionC: "arriving", optionD: "to arrive",
    correctOption: "D",
    explanation: "Mệnh lệnh gián tiếp: ask somebody TO do something.",
    translation: "Người giám sát yêu cầu mọi người đến sớm cho ca làm việc.",
    tips: "ask smb to V."
  },
  {
    question: "Don't _____ the confidential files on your desk.",
    optionA: "leave", optionB: "leaving", optionC: "to leave", optionD: "left",
    correctOption: "A",
    explanation: "Câu mệnh lệnh phủ định: Don't + V-bare.",
    translation: "Đừng để các tập tin mật trên bàn làm việc của bạn.",
    tips: "Don't + V-bare."
  },
  {
    question: "Let me _____ you with those heavy boxes.",
    optionA: "helping", optionB: "to help", optionC: "helped", optionD: "help",
    correctOption: "D",
    explanation: "Cấu trúc 'Let + Object + V-bare' (Để ai đó làm gì). Lưu ý: 'Let us' khác với 'Let's'. Tuy nhiên cả hai đều theo sau bởi V-bare.",
    translation: "Để tôi giúp bạn với những chiếc hộp nặng đó.",
    tips: "Let sb + V-bare."
  },
  {
    question: "If the alarm rings, _____ the building immediately through the nearest exit.",
    optionA: "evacuating", optionB: "to evacuate", optionC: "evacuate", optionD: "evacuated",
    correctOption: "C",
    explanation: "Mệnh đề If kết hợp với câu mệnh lệnh thức (evacuate: sơ tán).",
    translation: "Nếu chuông báo động reo, hãy sơ tán khỏi tòa nhà ngay lập tức qua lối ra gần nhất.",
    tips: "If ..., V-bare."
  },
  {
    question: "She told him _____ worry about the deadline.",
    optionA: "don't", optionB: "not to", optionC: "to not", optionD: "no",
    correctOption: "B",
    explanation: "Mệnh lệnh gián tiếp phủ định: tell smb NOT TO do something.",
    translation: "Cô ấy bảo anh ta đừng lo lắng về thời hạn.",
    tips: "tell smb + not to V."
  },
  {
    question: "_____ quiet in the library, please.",
    optionA: "Being", optionB: "Are", optionC: "Is", optionD: "Be",
    correctOption: "D",
    explanation: "Câu mệnh lệnh với tính từ (quiet) phải dùng động từ to be nguyên thể 'Be'.",
    translation: "Vui lòng giữ trật tự trong thư viện.",
    tips: "Be + tính từ."
  },
  {
    question: "The doctor advised the patient _____ more vegetables.",
    optionA: "eat", optionB: "eating", optionC: "to eat", optionD: "ate",
    correctOption: "C",
    explanation: "Mặc dù 'advise' là khuyên bảo, nhưng nó tuân theo cấu trúc tương tự mệnh lệnh gián tiếp: advise somebody TO do something.",
    translation: "Bác sĩ khuyên bệnh nhân nên ăn nhiều rau hơn.",
    tips: "advise smb + to V."
  },
  {
    question: "Please _____ me know if you need any further information.",
    optionA: "let", optionB: "letting", optionC: "to let", optionD: "lets",
    correctOption: "A",
    explanation: "Câu mệnh lệnh trực tiếp đi sau 'Please' dùng V-bare 'let'.",
    translation: "Vui lòng cho tôi biết nếu bạn cần thêm bất kỳ thông tin nào.",
    tips: "Please + V-bare."
  },
  {
    question: "Never _____ up on your dreams, no matter how hard it gets.",
    optionA: "giving", optionB: "give", optionC: "to give", optionD: "gave",
    correctOption: "B",
    explanation: "Từ 'Never' có thể đứng đầu câu mệnh lệnh thay cho 'Don't' để nhấn mạnh ý phủ định tuyệt đối. Theo sau là V-bare.",
    translation: "Đừng bao giờ từ bỏ ước mơ của bạn, cho dù có khó khăn đến đâu.",
    tips: "Never + V-bare (Câu mệnh lệnh)."
  }
];

// ==========================================
// LEVEL 2: TRUNG CẤP
// ==========================================
const tcLesson1 = [
  {
    question: "_____ reference to the manual before attempting to fix the machine.",
    optionA: "Make", optionB: "Making", optionC: "To make", optionD: "Made",
    correctOption: "A",
    explanation: "Câu mệnh lệnh thức yêu cầu V-bare đứng đầu câu. 'Make reference to' có nghĩa là tham khảo.",
    translation: "Hãy tham khảo sách hướng dẫn trước khi cố gắng sửa chữa máy.",
    tips: "Đứng đầu câu mệnh lệnh: V-bare."
  },
  {
    question: "The CEO ordered all department heads _____ a strategic plan by Friday.",
    optionA: "submit", optionB: "submitting", optionC: "to submit", optionD: "submitted",
    correctOption: "C",
    explanation: "Cấu trúc mệnh lệnh gián tiếp: order smb TO do smth.",
    translation: "Giám đốc điều hành đã ra lệnh cho tất cả các trưởng bộ phận nộp một kế hoạch chiến lược trước thứ Sáu.",
    tips: "order smb + to V."
  },
  {
    question: "Under no circumstances _____ the server room without proper authorization.",
    optionA: "enter", optionB: "entering", optionC: "to enter", optionD: "entered",
    correctOption: "A",
    explanation: "Mặc dù có cụm giới từ 'Under no circumstances' (Trong bất kỳ hoàn cảnh nào cũng không), nhưng đây là một biển cấm mang tính mệnh lệnh trực tiếp nếu không có cấu trúc đảo ngữ với trợ động từ. Trong trường hợp này, nó dùng như một cụm trạng từ bổ nghĩa cho câu mệnh lệnh: '[You must] enter...' -> mệnh lệnh thức: 'Enter...'. Tuy nhiên 'Under no circumstances' đứng đầu câu đòi hỏi đảo ngữ nếu có mệnh đề (Under no circumstances should you enter...). Ở đây không có S, nên ta có thể dùng mệnh lệnh trực tiếp 'Enter' với nghĩa: (Do not) enter... Thực tế cấu trúc mệnh lệnh chuẩn là: 'Do not enter... under any circumstances'. Nếu 'Under no circumstances' đứng đầu mà không có S, động từ đi theo nó ở dạng V-bare mệnh lệnh là hợp lý nhất trong các lựa chọn.",
    translation: "Trong bất kỳ hoàn cảnh nào cũng không được vào phòng máy chủ mà không có sự ủy quyền hợp lệ.",
    tips: "Mệnh lệnh thức: V-bare."
  },
  {
    question: "If you encounter an error message on the screen, _____ the system immediately.",
    optionA: "rebooting", optionB: "to reboot", optionC: "reboot", optionD: "rebooted",
    correctOption: "C",
    explanation: "Mệnh đề điều kiện kết hợp câu mệnh lệnh (V-bare: reboot = khởi động lại).",
    translation: "Nếu bạn gặp thông báo lỗi trên màn hình, hãy khởi động lại hệ thống ngay lập tức.",
    tips: "If ..., V-bare."
  },
  {
    question: "The client expressly asked us _____ disclose the details of the merger.",
    optionA: "not to", optionB: "to not", optionC: "don't", optionD: "never",
    correctOption: "A",
    explanation: "Mệnh lệnh gián tiếp phủ định: ask smb NOT TO do smth.",
    translation: "Khách hàng đã yêu cầu chúng tôi một cách rõ ràng là không tiết lộ thông tin chi tiết về việc sáp nhập.",
    tips: "ask smb + not to V."
  },
  {
    question: "_____ mindful of your tone when communicating with disgruntled customers.",
    optionA: "Are", optionB: "Being", optionC: "Be", optionD: "To be",
    correctOption: "C",
    explanation: "'mindful' là tính từ. Câu mệnh lệnh dùng 'Be + tính từ' (Hãy lưu tâm/chú ý).",
    translation: "Hãy chú ý đến giọng điệu của bạn khi giao tiếp với những khách hàng đang bực bội.",
    tips: "Be + Adj."
  },
  {
    question: "Let's _____ this issue until we have more concrete data, shall we?",
    optionA: "postponing", optionB: "postpone", optionC: "to postpone", optionD: "postponed",
    correctOption: "B",
    explanation: "Cấu trúc Let's (chúng ta hãy) + V-bare. Phần đuôi 'shall we?' không làm thay đổi cấu trúc này.",
    translation: "Chúng ta hãy hoãn vấn đề này lại cho đến khi chúng ta có dữ liệu cụ thể hơn, được chứ?",
    tips: "Let's + V-bare."
  },
  {
    question: "Please _____ me an email as soon as you arrive at the hotel.",
    optionA: "sending", optionB: "to send", optionC: "send", optionD: "sends",
    correctOption: "C",
    explanation: "Câu mệnh lệnh trực tiếp với Please + V-bare.",
    translation: "Vui lòng gửi email cho tôi ngay khi bạn đến khách sạn.",
    tips: "Please + V-bare."
  },
  {
    question: "He told his subordinates _____ working on the project until further notice.",
    optionA: "stop", optionB: "stopping", optionC: "to stop", optionD: "stopped",
    correctOption: "C",
    explanation: "Cấu trúc mệnh lệnh gián tiếp: tell smb TO do smth.",
    translation: "Ông ấy bảo cấp dưới của mình ngừng làm việc với dự án cho đến khi có thông báo mới.",
    tips: "tell smb to V."
  },
  {
    question: "_____ your seat belts securely during takeoff and landing.",
    optionA: "Fasten", optionB: "Fastening", optionC: "To fasten", optionD: "Fastens",
    correctOption: "A",
    explanation: "Câu mệnh lệnh trực tiếp, động từ nguyên mẫu (Fasten = thắt chặt) đứng đầu câu.",
    translation: "Vui lòng thắt dây an toàn chặt chẽ trong quá trình cất cánh và hạ cánh.",
    tips: "Đứng đầu câu mệnh lệnh: V-bare."
  }
];

const tcLesson2 = [
  {
    question: "If the temperature exceeds 40 degrees, _____ the emergency cooling system.",
    optionA: "activates", optionB: "activate", optionC: "activating", optionD: "to activate",
    correctOption: "B",
    explanation: "Mệnh đề điều kiện kết hợp câu mệnh lệnh (V-bare).",
    translation: "Nếu nhiệt độ vượt quá 40 độ, hãy kích hoạt hệ thống làm mát khẩn cấp.",
    tips: "If ..., V-bare."
  },
  {
    question: "The director specifically ordered them _____ the press before the official announcement.",
    optionA: "not to contact", optionB: "to not contact", optionC: "don't contact", optionD: "not contact",
    correctOption: "A",
    explanation: "Mệnh lệnh gián tiếp phủ định: order smb NOT TO do smth.",
    translation: "Giám đốc đặc biệt ra lệnh cho họ không được liên hệ với báo chí trước khi có thông báo chính thức.",
    tips: "order smb + not to V."
  },
  {
    question: "Always _____ the terms and conditions before signing a contract.",
    optionA: "read", optionB: "reading", optionC: "to read", optionD: "reads",
    correctOption: "A",
    explanation: "'Always' đóng vai trò trạng từ nhấn mạnh trong câu mệnh lệnh, theo sau vẫn là V-bare.",
    translation: "Hãy luôn đọc các điều khoản và điều kiện trước khi ký hợp đồng.",
    tips: "Always + V-bare (Câu mệnh lệnh)."
  },
  {
    question: "Please _____ sure that the invoice is paid by the end of the month.",
    optionA: "making", optionB: "to make", optionC: "make", optionD: "made",
    correctOption: "C",
    explanation: "Please + V-bare.",
    translation: "Vui lòng đảm bảo rằng hóa đơn được thanh toán trước cuối tháng.",
    tips: "Please + V-bare."
  },
  {
    question: "Let the technicians _____ the installation without any interference.",
    optionA: "to handle", optionB: "handling", optionC: "handle", optionD: "handled",
    correctOption: "C",
    explanation: "Cấu trúc 'Let + Object + V-bare' (Để ai đó làm việc gì).",
    translation: "Hãy để các kỹ thuật viên xử lý việc cài đặt mà không có bất kỳ sự can thiệp nào.",
    tips: "Let sb + V-bare."
  },
  {
    question: "The police officer asked the driver _____ out of the vehicle.",
    optionA: "step", optionB: "stepping", optionC: "to step", optionD: "stepped",
    correctOption: "C",
    explanation: "Mệnh lệnh gián tiếp: ask smb TO do smth.",
    translation: "Viên cảnh sát yêu cầu người lái xe bước ra khỏi xe.",
    tips: "ask smb to V."
  },
  {
    question: "_____ considerate of others when using the shared workspace.",
    optionA: "Be", optionB: "To be", optionC: "Being", optionD: "Are",
    correctOption: "A",
    explanation: "Câu mệnh lệnh thức dùng với tính từ 'considerate' (chu đáo, ý tứ) -> dùng 'Be'.",
    translation: "Hãy chú ý đến người khác khi sử dụng không gian làm việc chung.",
    tips: "Be + tính từ."
  },
  {
    question: "In the event of a fire, _____ use the elevators.",
    optionA: "not", optionB: "no", optionC: "don't", optionD: "doesn't",
    correctOption: "C",
    explanation: "Câu mệnh lệnh phủ định: Don't + V-bare.",
    translation: "Trong trường hợp hỏa hoạn, đừng sử dụng thang máy.",
    tips: "Don't + V-bare."
  },
  {
    question: "The instructor told us _____ talking and focus on the assignment.",
    optionA: "stop", optionB: "stopping", optionC: "to stop", optionD: "stopped",
    correctOption: "C",
    explanation: "Mệnh lệnh gián tiếp: tell smb TO do smth.",
    translation: "Người hướng dẫn bảo chúng tôi ngừng nói chuyện và tập trung vào bài tập.",
    tips: "tell smb to V."
  },
  {
    question: "Kindly _____ the attached document for your reference.",
    optionA: "reviewing", optionB: "review", optionC: "to review", optionD: "reviewed",
    correctOption: "B",
    explanation: "'Kindly' có chức năng giống như 'Please' trong câu mệnh lệnh, theo sau là V-bare.",
    translation: "Vui lòng xem lại tài liệu đính kèm để biết thông tin chi tiết.",
    tips: "Kindly + V-bare."
  }
];

// ==========================================
// LEVEL 3: NÂNG CAO
// ==========================================
const ncLesson1 = [
  {
    question: "Should you have any queries regarding the policy, _____ human resources directly.",
    optionA: "contacting", optionB: "contact", optionC: "to contact", optionD: "contacted",
    correctOption: "B",
    explanation: "Đây là câu điều kiện loại 1 đảo ngữ (Should + S + V-bare), mệnh đề chính vẫn sử dụng câu mệnh lệnh thức (V-bare).",
    translation: "Nếu bạn có bất kỳ thắc mắc nào về chính sách, hãy liên hệ trực tiếp với bộ phận nhân sự.",
    tips: "Should S V, V-bare (Đảo ngữ điều kiện loại 1)."
  },
  {
    question: "The supervisor strictly ordered the crew _____ any safety protocols during the demolition.",
    optionA: "not bypassing", optionB: "don't bypass", optionC: "not to bypass", optionD: "to not bypass",
    correctOption: "C",
    explanation: "Mệnh lệnh gián tiếp phủ định: order smb NOT TO do smth.",
    translation: "Người giám sát đã nghiêm khắc ra lệnh cho phi hành đoàn không được bỏ qua bất kỳ quy trình an toàn nào trong quá trình phá dỡ.",
    tips: "order smb + not to V."
  },
  {
    question: "_____ the utmost caution when operating the heavy machinery.",
    optionA: "Exercise", optionB: "Exercising", optionC: "To exercise", optionD: "Exercised",
    correctOption: "A",
    explanation: "Câu mệnh lệnh trực tiếp, động từ 'Exercise' (thực hiện/sử dụng) ở dạng nguyên thể đứng đầu câu.",
    translation: "Hãy hết sức thận trọng khi vận hành máy móc hạng nặng.",
    tips: "Đứng đầu câu mệnh lệnh: V-bare."
  },
  {
    question: "Let it _____ known that any violation of the code of conduct will result in immediate termination.",
    optionA: "is", optionB: "be", optionC: "to be", optionD: "being",
    correctOption: "B",
    explanation: "Cấu trúc Let + O + V-bare. Bị động của nó là Let + O + be + V-ed/PII. 'Let it be known' = Hãy để mọi người biết rằng (Một câu mệnh lệnh trịnh trọng).",
    translation: "Xin thông báo để mọi người biết rằng bất kỳ vi phạm nào đối với quy tắc ứng xử sẽ dẫn đến việc sa thải ngay lập tức.",
    tips: "Let + O + be + PII."
  },
  {
    question: "I urge you _____ proactive measures to mitigate the potential risks.",
    optionA: "take", optionB: "taking", optionC: "to take", optionD: "taken",
    correctOption: "C",
    explanation: "Động từ 'urge' (thúc giục) mang sắc thái mệnh lệnh gián tiếp. Cấu trúc: urge smb TO do smth.",
    translation: "Tôi thúc giục bạn thực hiện các biện pháp chủ động để giảm thiểu rủi ro tiềm ẩn.",
    tips: "urge smb to V."
  },
  {
    question: "Never _____ your password with anyone, not even the IT administrators.",
    optionA: "share", optionB: "sharing", optionC: "to share", optionD: "shared",
    correctOption: "A",
    explanation: "Từ 'Never' đứng trước câu mệnh lệnh thay cho 'Don't', theo sau là V-bare.",
    translation: "Đừng bao giờ chia sẻ mật khẩu của bạn với bất kỳ ai, ngay cả với quản trị viên CNTT.",
    tips: "Never + V-bare."
  },
  {
    question: "Please ensure that all proprietary information _____ securely encrypted.",
    optionA: "is", optionB: "be", optionC: "being", optionD: "to be",
    correctOption: "A",
    explanation: "Đây không phải là câu giả định. Động từ 'ensure that' theo sau là mệnh đề bình thường (S + V). 'information' là danh từ không đếm được nên dùng 'is'. (Nếu dùng giả định, có thể dùng 'be', nhưng 'is' là đáp án chuẩn nhất trong tiếng Anh hiện đại).",
    translation: "Vui lòng đảm bảo rằng tất cả thông tin độc quyền đều được mã hóa an toàn.",
    tips: "ensure that + Mệnh đề bình thường."
  },
  {
    question: "They demanded that the supplier _____ the defective products within 24 hours.",
    optionA: "replace", optionB: "replaces", optionC: "replaced", optionD: "to replace",
    correctOption: "A",
    explanation: "Động từ 'demand' yêu cầu mệnh đề theo sau phải ở dạng giả định (Subjunctive mood): S + V-bare (bất kể chủ ngữ số ít hay nhiều). Đây là một dạng mệnh lệnh gián tiếp cấp cao.",
    translation: "Họ yêu cầu nhà cung cấp thay thế các sản phẩm bị lỗi trong vòng 24 giờ.",
    tips: "demand that + S + V-bare (Câu giả định)."
  },
  {
    question: "Under penalty of law, do not _____ with the smoke detectors in this room.",
    optionA: "tamper", optionB: "tampering", optionC: "to tamper", optionD: "tampered",
    correctOption: "A",
    explanation: "Câu mệnh lệnh phủ định: do not + V-bare (tamper with = táy máy, can thiệp vào).",
    translation: "Dưới hình phạt của pháp luật, không được can thiệp vào các máy dò khói trong phòng này.",
    tips: "do not + V-bare."
  },
  {
    question: "The commanding officer ordered the troops _____ position along the perimeter.",
    optionA: "take", optionB: "to take", optionC: "taking", optionD: "taken",
    correctOption: "B",
    explanation: "Mệnh lệnh gián tiếp: order smb TO do smth.",
    translation: "Sĩ quan chỉ huy đã ra lệnh cho quân đội chiếm lĩnh vị trí dọc theo vành đai.",
    tips: "order smb to V."
  }
];

const ncLesson2 = [
  {
    question: "_____ assured that your feedback will be handled with the utmost confidentiality.",
    optionA: "Rest", optionB: "Resting", optionC: "To rest", optionD: "Rested",
    correctOption: "A",
    explanation: "Cụm từ cố định mang tính mệnh lệnh: 'Rest assured' (Hãy yên tâm rằng). 'Rest' là động từ nguyên thể đứng đầu câu.",
    translation: "Hãy yên tâm rằng phản hồi của bạn sẽ được xử lý một cách bảo mật tối đa.",
    tips: "Rest assured (Hãy yên tâm)."
  },
  {
    question: "It is imperative that the final draft _____ submitted prior to the deadline.",
    optionA: "be", optionB: "is", optionC: "was", optionD: "are",
    correctOption: "A",
    explanation: "Tính từ 'imperative' (bắt buộc, cấp bách) yêu cầu mệnh đề 'that' theo sau sử dụng giả định cách (Subjunctive): S + V-bare (be).",
    translation: "Bắt buộc bản nháp cuối cùng phải được nộp trước thời hạn.",
    tips: "It is imperative that S + V-bare."
  },
  {
    question: "_____ the instructions carefully, lest you make a critical error.",
    optionA: "Following", optionB: "Follow", optionC: "To follow", optionD: "Followed",
    correctOption: "B",
    explanation: "Câu mệnh lệnh trực tiếp, dùng V-bare đứng đầu câu. 'Lest' mang nghĩa 'kẻo không thì'.",
    translation: "Hãy làm theo các hướng dẫn một cách cẩn thận, kẻo bạn mắc phải một lỗi nghiêm trọng.",
    tips: "Đứng đầu câu mệnh lệnh: V-bare."
  },
  {
    question: "The board recommends that he _____ down from his position immediately.",
    optionA: "step", optionB: "steps", optionC: "stepped", optionD: "stepping",
    correctOption: "A",
    explanation: "Động từ 'recommend' yêu cầu mệnh đề 'that' sử dụng câu giả định: S + V-bare. (he step, không có 's').",
    translation: "Hội đồng quản trị khuyến nghị ông ấy nên từ chức ngay lập tức.",
    tips: "recommend that S + V-bare."
  },
  {
    question: "Please refrain _____ using flash photography inside the museum exhibits.",
    optionA: "to", optionB: "from", optionC: "for", optionD: "in",
    correctOption: "B",
    explanation: "Câu mệnh lệnh trực tiếp. Cấu trúc đi với động từ 'refrain' là: refrain FROM doing smth (hạn chế/tránh làm gì).",
    translation: "Vui lòng không sử dụng đèn flash khi chụp ảnh bên trong các khu vực triển lãm của bảo tàng.",
    tips: "refrain from V-ing (hạn chế/tránh làm gì)."
  },
  {
    question: "Let no one _____ you that achieving this goal will be easy.",
    optionA: "telling", optionB: "tell", optionC: "to tell", optionD: "tells",
    correctOption: "B",
    explanation: "Cấu trúc Let + O + V-bare. Trong câu này tân ngữ là 'no one', động từ V-bare là 'tell'.",
    translation: "Đừng để ai nói với bạn rằng việc đạt được mục tiêu này sẽ dễ dàng.",
    tips: "Let O + V-bare."
  },
  {
    question: "The regulations dictate that every employee _____ a mandatory background check.",
    optionA: "undergo", optionB: "undergoes", optionC: "underwent", optionD: "undergoing",
    correctOption: "A",
    explanation: "Động từ 'dictate' (quy định) mang tính bắt buộc, mệnh đề 'that' theo sau sử dụng câu giả định: S + V-bare.",
    translation: "Các quy định bắt buộc mọi nhân viên phải trải qua một cuộc kiểm tra lý lịch bắt buộc.",
    tips: "dictate that S + V-bare."
  },
  {
    question: "Should an emergency arise, _____ calm and proceed to the assembly point.",
    optionA: "remaining", optionB: "remain", optionC: "to remain", optionD: "remained",
    correctOption: "B",
    explanation: "Đảo ngữ câu điều kiện loại 1 (Should + S + V), mệnh đề chính dùng câu mệnh lệnh trực tiếp (V-bare).",
    translation: "Nếu có trường hợp khẩn cấp xảy ra, hãy giữ bình tĩnh và đi đến điểm tập kết.",
    tips: "Should S V, V-bare."
  },
  {
    question: "The judge commanded the witness _____ the court with accurate testimony.",
    optionA: "provide", optionB: "to provide", optionC: "providing", optionD: "provided",
    correctOption: "B",
    explanation: "Cấu trúc mệnh lệnh gián tiếp: command smb TO do smth.",
    translation: "Thẩm phán đã ra lệnh cho nhân chứng phải cung cấp lời khai chính xác cho tòa án.",
    tips: "command smb to V."
  },
  {
    question: "Be it _____ that we will not tolerate any form of discrimination.",
    optionA: "know", optionB: "knew", optionC: "known", optionD: "knowing",
    correctOption: "C",
    explanation: "Thành ngữ giả định cổ 'Be it known that' = 'Let it be known that' (Xin thông báo rằng). Về mặt ngữ pháp, nó là thể bị động.",
    translation: "Xin thông báo rằng chúng tôi sẽ không dung thứ cho bất kỳ hình thức phân biệt đối xử nào.",
    tips: "Be it known that (Xin thông báo rằng)."
  }
];

async function run() {
  console.log("Generating Topic 10: Mệnh lệnh thức (3 levels)...");
  
  const baseTitle = "Mệnh lệnh thức";
  const levelsData = [
    { level: "Cơ Bản", slug: "menh-lenh-thuc-co-ban", keyword: "[Cơ Bản]", lessons: [ { title: "Bài tập 1", questions: cbLesson1 }, { title: "Bài tập 2", questions: cbLesson2 } ] },
    { level: "Trung Cấp", slug: "menh-lenh-thuc-trung-cap", keyword: "[Trung Cấp]", lessons: [ { title: "Bài tập 1", questions: tcLesson1 }, { title: "Bài tập 2", questions: tcLesson2 } ] },
    { level: "Nâng Cao", slug: "menh-lenh-thuc-nang-cao", keyword: "[Nâng Cao]", lessons: [ { title: "Bài tập 1", questions: ncLesson1 }, { title: "Bài tập 2", questions: ncLesson2 } ] }
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
        subtitle: `Cách sử dụng mệnh lệnh thức mức độ ${lData.level}`,
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

  console.log("Topic 10 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
