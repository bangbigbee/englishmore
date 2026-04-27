import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// LEVEL 1: CƠ BẢN
// ==========================================
const cbLesson1 = [
  {
    question: "We enjoyed _____ the new product presentation yesterday.",
    optionA: "watch", optionB: "to watch", optionC: "watching", optionD: "watched",
    correctOption: "C",
    explanation: "Động từ 'enjoy' luôn theo sau bởi một danh động từ (V-ing).",
    translation: "Chúng tôi rất thích thú khi xem buổi thuyết trình sản phẩm mới vào ngày hôm qua.",
    tips: "enjoy + V-ing (thích thú làm gì)."
  },
  {
    question: "The manager has decided _____ a new assistant next month.",
    optionA: "hire", optionB: "to hire", optionC: "hiring", optionD: "hired",
    correctOption: "B",
    explanation: "Động từ 'decide' yêu cầu một động từ nguyên thể có 'to' (To-V) theo sau.",
    translation: "Người quản lý đã quyết định thuê một trợ lý mới vào tháng tới.",
    tips: "decide + to V (quyết định làm gì)."
  },
  {
    question: "Please avoid _____ personal emails during working hours.",
    optionA: "read", optionB: "to read", optionC: "reading", optionD: "reads",
    correctOption: "C",
    explanation: "Động từ 'avoid' luôn yêu cầu danh động từ (V-ing) theo sau.",
    translation: "Vui lòng tránh đọc email cá nhân trong giờ làm việc.",
    tips: "avoid + V-ing (tránh làm việc gì)."
  },
  {
    question: "We plan _____ a new branch in Tokyo by the end of the year.",
    optionA: "open", optionB: "to open", optionC: "opening", optionD: "opened",
    correctOption: "B",
    explanation: "Động từ 'plan' kết hợp với động từ nguyên thể có 'to' (To-V).",
    translation: "Chúng tôi dự định mở một chi nhánh mới ở Tokyo vào cuối năm nay.",
    tips: "plan + to V (lên kế hoạch làm gì)."
  },
  {
    question: "She finished _____ the annual financial report late last night.",
    optionA: "write", optionB: "to write", optionC: "writing", optionD: "written",
    correctOption: "C",
    explanation: "Động từ 'finish' phải đi kèm với V-ing.",
    translation: "Cô ấy đã hoàn thành việc viết báo cáo tài chính thường niên vào đêm khuya hôm qua.",
    tips: "finish + V-ing (hoàn thành việc gì)."
  },
  {
    question: "I want _____ you for your excellent performance this quarter.",
    optionA: "thank", optionB: "to thank", optionC: "thanking", optionD: "thanked",
    correctOption: "B",
    explanation: "Động từ 'want' yêu cầu To-V theo sau.",
    translation: "Tôi muốn cảm ơn bạn vì hiệu suất làm việc xuất sắc trong quý này.",
    tips: "want + to V (muốn làm gì)."
  },
  {
    question: "The construction workers delayed _____ the road due to heavy rain.",
    optionA: "repair", optionB: "to repair", optionC: "repairing", optionD: "repaired",
    correctOption: "C",
    explanation: "Động từ 'delay' theo sau bởi V-ing.",
    translation: "Các công nhân xây dựng đã trì hoãn việc sửa chữa con đường do mưa lớn.",
    tips: "delay + V-ing (trì hoãn làm gì)."
  },
  {
    question: "They hope _____ the contract negotiations by Friday.",
    optionA: "complete", optionB: "to complete", optionC: "completing", optionD: "completed",
    correctOption: "B",
    explanation: "Động từ 'hope' theo sau bởi động từ nguyên thể có 'to' (To-V).",
    translation: "Họ hy vọng sẽ hoàn tất các cuộc đàm phán hợp đồng trước thứ Sáu.",
    tips: "hope + to V (hi vọng làm gì)."
  },
  {
    question: "Would you mind _____ the window? It is very hot in here.",
    optionA: "open", optionB: "to open", optionC: "opening", optionD: "opened",
    correctOption: "C",
    explanation: "Cấu trúc 'mind' (phiền) luôn đi kèm với V-ing.",
    translation: "Bạn có phiền mở cửa sổ không? Ở đây rất nóng.",
    tips: "mind + V-ing (phiền khi làm việc gì)."
  },
  {
    question: "The CEO promised _____ the employees an extra bonus.",
    optionA: "give", optionB: "to give", optionC: "giving", optionD: "given",
    correctOption: "B",
    explanation: "Động từ 'promise' luôn đi kèm với To-V.",
    translation: "Giám đốc điều hành đã hứa sẽ tặng thêm tiền thưởng cho nhân viên.",
    tips: "promise + to V (hứa làm gì)."
  }
];

const cbLesson2 = [
  {
    question: "The company cannot afford _____ new computers this year.",
    optionA: "buy", optionB: "to buy", optionC: "buying", optionD: "bought",
    correctOption: "B",
    explanation: "Cấu trúc 'afford' (đủ khả năng chi trả) đi kèm với To-V.",
    translation: "Công ty không đủ khả năng mua máy tính mới trong năm nay.",
    tips: "afford + to V (đủ khả năng làm gì)."
  },
  {
    question: "I suggest _____ the marketing meeting until next week.",
    optionA: "postpone", optionB: "to postpone", optionC: "postponing", optionD: "postponed",
    correctOption: "C",
    explanation: "Động từ 'suggest' (đề nghị, gợi ý) luôn theo sau bởi V-ing.",
    translation: "Tôi đề nghị trì hoãn cuộc họp tiếp thị cho đến tuần sau.",
    tips: "suggest + V-ing (gợi ý làm gì)."
  },
  {
    question: "He needs _____ his password before accessing the system.",
    optionA: "update", optionB: "to update", optionC: "updating", optionD: "updated",
    correctOption: "B",
    explanation: "Động từ 'need' mang nghĩa chủ động yêu cầu To-V theo sau.",
    translation: "Anh ấy cần cập nhật mật khẩu trước khi truy cập hệ thống.",
    tips: "need + to V (cần làm gì - chủ động)."
  },
  {
    question: "The client refused _____ the document without his lawyer present.",
    optionA: "sign", optionB: "to sign", optionC: "signing", optionD: "signed",
    correctOption: "B",
    explanation: "Động từ 'refuse' (từ chối) đi kèm với động từ nguyên thể có 'to' (To-V).",
    translation: "Khách hàng từ chối ký tài liệu nếu không có luật sư của mình tham dự.",
    tips: "refuse + to V (từ chối làm gì)."
  },
  {
    question: "You should keep _____ until you find a solution to the problem.",
    optionA: "try", optionB: "to try", optionC: "trying", optionD: "tried",
    correctOption: "C",
    explanation: "Cấu trúc 'keep' (tiếp tục) luôn đi kèm với V-ing.",
    translation: "Bạn nên tiếp tục cố gắng cho đến khi tìm ra giải pháp cho vấn đề.",
    tips: "keep + V-ing (tiếp tục làm gì)."
  },
  {
    question: "Many employees agreed _____ overtime to finish the urgent project.",
    optionA: "work", optionB: "to work", optionC: "working", optionD: "worked",
    correctOption: "B",
    explanation: "Động từ 'agree' (đồng ý) đi kèm với To-V.",
    translation: "Nhiều nhân viên đồng ý làm thêm giờ để hoàn thành dự án khẩn cấp.",
    tips: "agree + to V (đồng ý làm gì)."
  },
  {
    question: "I look forward to _____ from you soon regarding the job offer.",
    optionA: "hear", optionB: "to hear", optionC: "hearing", optionD: "heard",
    correctOption: "C",
    explanation: "Cụm từ 'look forward to' (mong đợi) luôn đi kèm với V-ing, trong đó 'to' là một giới từ.",
    translation: "Tôi mong sớm nhận được tin từ bạn về lời mời làm việc.",
    tips: "look forward to + V-ing (mong đợi điều gì)."
  },
  {
    question: "She seems _____ very happy with her new position in the marketing department.",
    optionA: "be", optionB: "to be", optionC: "being", optionD: "been",
    correctOption: "B",
    explanation: "Động từ 'seem' (có vẻ) đi kèm với To-V.",
    translation: "Cô ấy có vẻ rất vui với vị trí mới ở phòng tiếp thị.",
    tips: "seem + to V (có vẻ như làm gì)."
  },
  {
    question: "Mr. Brown is responsible for _____ the new staff members.",
    optionA: "train", optionB: "to train", optionC: "training", optionD: "trained",
    correctOption: "C",
    explanation: "Sau giới từ 'for' (và mọi giới từ khác) luôn là một V-ing.",
    translation: "Ông Brown chịu trách nhiệm đào tạo các nhân viên mới.",
    tips: "Giới từ (for, in, on, about...) + V-ing."
  },
  {
    question: "We expect the delivery _____ by Friday afternoon at the latest.",
    optionA: "arrive", optionB: "to arrive", optionC: "arriving", optionD: "arrived",
    correctOption: "B",
    explanation: "Động từ 'expect' đi kèm với tân ngữ và To-V (expect sth to do sth).",
    translation: "Chúng tôi kỳ vọng việc giao hàng sẽ đến nơi muộn nhất vào chiều thứ Sáu.",
    tips: "expect + Object + to V (kỳ vọng ai/cái gì làm gì)."
  }
];

// ==========================================
// LEVEL 2: TRUNG CẤP
// ==========================================
const tcLesson1 = [
  {
    question: "The board of directors is considering _____ the company's operations to Europe.",
    optionA: "expand", optionB: "to expand", optionC: "expanding", optionD: "expanded",
    correctOption: "C",
    explanation: "Động từ 'consider' (cân nhắc) phải được theo sau bởi một V-ing.",
    translation: "Hội đồng quản trị đang cân nhắc việc mở rộng hoạt động của công ty sang Châu Âu.",
    tips: "consider + V-ing (cân nhắc làm gì)."
  },
  {
    question: "We deeply appreciate _____ the opportunity to present our proposal to your team.",
    optionA: "have", optionB: "to have", optionC: "having", optionD: "had",
    correctOption: "C",
    explanation: "Động từ 'appreciate' (trân trọng, cảm kích) đi kèm với V-ing.",
    translation: "Chúng tôi rất trân trọng vì có cơ hội trình bày bản đề xuất của mình với nhóm của bạn.",
    tips: "appreciate + V-ing (cảm kích việc gì)."
  },
  {
    question: "Despite the bad weather, they intend _____ the outdoor promotional event as planned.",
    optionA: "hold", optionB: "to hold", optionC: "holding", optionD: "held",
    correctOption: "B",
    explanation: "Động từ 'intend' (dự định) theo sau bởi To-V.",
    translation: "Mặc dù thời tiết xấu, họ dự định vẫn tổ chức sự kiện quảng bá ngoài trời như kế hoạch.",
    tips: "intend + to V (dự định làm gì)."
  },
  {
    question: "The supervisor postponed _____ the final decision until all facts were verified.",
    optionA: "make", optionB: "to make", optionC: "making", optionD: "made",
    correctOption: "C",
    explanation: "Động từ 'postpone' (trì hoãn) đi kèm với V-ing.",
    translation: "Người giám sát đã trì hoãn việc đưa ra quyết định cuối cùng cho đến khi tất cả thông tin được xác minh.",
    tips: "postpone + V-ing (trì hoãn làm gì)."
  },
  {
    question: "He hesitated _____ the contract because he found a controversial clause.",
    optionA: "sign", optionB: "to sign", optionC: "signing", optionD: "signed",
    correctOption: "B",
    explanation: "Động từ 'hesitate' (do dự) đi kèm với To-V.",
    translation: "Anh ấy do dự không ký hợp đồng vì phát hiện ra một điều khoản gây tranh cãi.",
    tips: "hesitate + to V (do dự làm gì)."
  },
  {
    question: "The applicant denied _____ the confidential information to a competitor.",
    optionA: "leak", optionB: "to leak", optionC: "leaking", optionD: "leaked",
    correctOption: "C",
    explanation: "Động từ 'deny' (phủ nhận) đi kèm với V-ing.",
    translation: "Ứng viên đã phủ nhận việc tiết lộ thông tin mật cho đối thủ cạnh tranh.",
    tips: "deny + V-ing (phủ nhận đã làm gì)."
  },
  {
    question: "We are accustomed to _____ under tight deadlines in this industry.",
    optionA: "work", optionB: "to work", optionC: "working", optionD: "worked",
    correctOption: "C",
    explanation: "Cụm từ 'be accustomed to' (quen với việc gì) sử dụng 'to' như một giới từ, do đó theo sau phải là V-ing.",
    translation: "Chúng tôi đã quen với việc làm việc dưới áp lực thời hạn eo hẹp trong ngành này.",
    tips: "be accustomed to + V-ing (quen với việc làm gì)."
  },
  {
    question: "The management failed _____ the employees about the upcoming merger.",
    optionA: "inform", optionB: "to inform", optionC: "informing", optionD: "informed",
    correctOption: "B",
    explanation: "Động từ 'fail' (thất bại, không làm được) đi kèm với To-V.",
    translation: "Ban quản lý đã không thông báo cho nhân viên về vụ sáp nhập sắp tới.",
    tips: "fail + to V (không làm được việc gì)."
  },
  {
    question: "The company cannot risk _____ its reputation by launching a defective product.",
    optionA: "lose", optionB: "to lose", optionC: "losing", optionD: "lost",
    correctOption: "C",
    explanation: "Động từ 'risk' (liều lĩnh, mạo hiểm) đi kèm với V-ing.",
    translation: "Công ty không thể mạo hiểm đánh mất danh tiếng của mình bằng cách tung ra một sản phẩm lỗi.",
    tips: "risk + V-ing (mạo hiểm làm gì)."
  },
  {
    question: "Our department is preparing _____ a comprehensive audit next month.",
    optionA: "undergo", optionB: "to undergo", optionC: "undergoing", optionD: "undergone",
    correctOption: "B",
    explanation: "Động từ 'prepare' (chuẩn bị) đi kèm với To-V.",
    translation: "Bộ phận của chúng tôi đang chuẩn bị trải qua một cuộc kiểm toán toàn diện vào tháng tới.",
    tips: "prepare + to V (chuẩn bị làm gì)."
  }
];

const tcLesson2 = [
  {
    question: "Ms. Jenkins offered _____ me with the difficult translation project.",
    optionA: "help", optionB: "to help", optionC: "helping", optionD: "helped",
    correctOption: "B",
    explanation: "Động từ 'offer' (đề nghị giúp đỡ) đi kèm với To-V.",
    translation: "Cô Jenkins đã đề nghị giúp tôi dự án dịch thuật khó khăn này.",
    tips: "offer + to V (đề nghị làm gì cho ai)."
  },
  {
    question: "They succeeded in _____ the required funds for the startup.",
    optionA: "raise", optionB: "to raise", optionC: "raising", optionD: "raised",
    correctOption: "C",
    explanation: "Sau giới từ 'in' bắt buộc phải dùng V-ing.",
    translation: "Họ đã thành công trong việc huy động đủ số vốn yêu cầu cho công ty khởi nghiệp.",
    tips: "succeed in + V-ing (thành công trong việc gì)."
  },
  {
    question: "The speaker struggled _____ the audience's attention during the long presentation.",
    optionA: "maintain", optionB: "to maintain", optionC: "maintaining", optionD: "maintained",
    correctOption: "B",
    explanation: "Động từ 'struggle' (vật lộn, chật vật) đi kèm với To-V.",
    translation: "Diễn giả đã rất chật vật để duy trì sự chú ý của khán giả trong suốt bài thuyết trình dài.",
    tips: "struggle + to V (chật vật để làm gì)."
  },
  {
    question: "Many customers resent _____ a monthly fee for basic banking services.",
    optionA: "pay", optionB: "to pay", optionC: "paying", optionD: "paid",
    correctOption: "C",
    explanation: "Động từ 'resent' (bực tức, phẫn nộ) đi kèm với V-ing.",
    translation: "Nhiều khách hàng tỏ ra bức xúc khi phải trả phí hàng tháng cho các dịch vụ ngân hàng cơ bản.",
    tips: "resent + V-ing (bực tức khi phải làm gì)."
  },
  {
    question: "The team is committed to _____ the highest quality standards in all products.",
    optionA: "deliver", optionB: "to deliver", optionC: "delivering", optionD: "delivered",
    correctOption: "C",
    explanation: "Cụm 'be committed to' sử dụng 'to' như một giới từ, do đó theo sau là V-ing.",
    translation: "Đội ngũ cam kết mang lại tiêu chuẩn chất lượng cao nhất trong tất cả các sản phẩm.",
    tips: "be committed to + V-ing (cam kết làm gì)."
  },
  {
    question: "The tenant claimed _____ the rent on time every month.",
    optionA: "pay", optionB: "to pay", optionC: "paying", optionD: "paid",
    correctOption: "B",
    explanation: "Động từ 'claim' (tuyên bố, khẳng định) đi kèm với To-V.",
    translation: "Người thuê nhà khẳng định đã thanh toán tiền thuê nhà đúng hạn mỗi tháng.",
    tips: "claim + to V (khẳng định làm gì)."
  },
  {
    question: "We should practice _____ our communication skills before the international conference.",
    optionA: "improve", optionB: "to improve", optionC: "improving", optionD: "improved",
    correctOption: "C",
    explanation: "Động từ 'practice' (thực hành, luyện tập) đi kèm với V-ing.",
    translation: "Chúng ta nên luyện tập cải thiện kỹ năng giao tiếp trước khi diễn ra hội nghị quốc tế.",
    tips: "practice + V-ing (luyện tập làm gì)."
  },
  {
    question: "The technician attempted _____ the server issue but was unsuccessful.",
    optionA: "resolve", optionB: "to resolve", optionC: "resolving", optionD: "resolved",
    correctOption: "B",
    explanation: "Động từ 'attempt' (nỗ lực, cố gắng) đi kèm với To-V.",
    translation: "Kỹ thuật viên đã cố gắng khắc phục sự cố máy chủ nhưng không thành công.",
    tips: "attempt + to V (cố gắng làm gì)."
  },
  {
    question: "Instead of _____ the old machinery, they decided to purchase new equipment.",
    optionA: "repair", optionB: "to repair", optionC: "repairing", optionD: "repaired",
    correctOption: "C",
    explanation: "Cụm giới từ 'instead of' yêu cầu V-ing theo sau.",
    translation: "Thay vì sửa chữa máy móc cũ, họ đã quyết định mua thiết bị mới.",
    tips: "instead of + V-ing (thay vì làm gì)."
  },
  {
    question: "She pretended _____ sick so that she could stay home from work.",
    optionA: "be", optionB: "to be", optionC: "being", optionD: "been",
    correctOption: "B",
    explanation: "Động từ 'pretend' (giả vờ) đi kèm với To-V.",
    translation: "Cô ấy giả vờ ốm để có thể ở nhà không phải đi làm.",
    tips: "pretend + to V (giả vờ làm gì)."
  }
];

// ==========================================
// LEVEL 3: NÂNG CAO
// ==========================================
const ncLesson1 = [
  {
    question: "Please remember _____ the security alarm before leaving the office tonight.",
    optionA: "turn on", optionB: "to turn on", optionC: "turning on", optionD: "turned on",
    correctOption: "B",
    explanation: "Cấu trúc 'remember + to V' dùng để nhắc nhở một việc CẦN PHẢI LÀM (chưa làm).",
    translation: "Vui lòng nhớ bật chuông báo động an ninh trước khi rời văn phòng tối nay.",
    tips: "remember + to V (nhớ sẽ phải làm gì)."
  },
  {
    question: "I distinctly remember _____ the document to the legal team last Monday.",
    optionA: "send", optionB: "to send", optionC: "sending", optionD: "sent",
    correctOption: "C",
    explanation: "Cấu trúc 'remember + V-ing' dùng để nhớ lại một việc ĐÃ XẢY RA trong quá khứ.",
    translation: "Tôi nhớ rất rõ là đã gửi tài liệu cho nhóm pháp lý vào thứ Hai tuần trước.",
    tips: "remember + V-ing (nhớ là đã làm gì)."
  },
  {
    question: "The director stopped _____ to his assistant and quickly answered the phone.",
    optionA: "talk", optionB: "to talk", optionC: "talking", optionD: "talked",
    correctOption: "C",
    explanation: "Cấu trúc 'stop + V-ing' mang nghĩa DỪNG HẲN việc đang làm (ngừng nói chuyện).",
    translation: "Giám đốc ngừng nói chuyện với trợ lý của mình và nhanh chóng trả lời điện thoại.",
    tips: "stop + V-ing (ngừng việc đang làm)."
  },
  {
    question: "While driving to the conference, she stopped _____ a cup of coffee.",
    optionA: "buy", optionB: "to buy", optionC: "buying", optionD: "bought",
    correctOption: "B",
    explanation: "Cấu trúc 'stop + to V' mang nghĩa DỪNG LẠI ĐỂ LÀM một việc khác (dừng xe lại để mua cà phê).",
    translation: "Trong khi lái xe đến hội nghị, cô ấy đã dừng lại để mua một cốc cà phê.",
    tips: "stop + to V (dừng lại để làm gì)."
  },
  {
    question: "I regret _____ you that your application has been rejected.",
    optionA: "inform", optionB: "to inform", optionC: "informing", optionD: "informed",
    correctOption: "B",
    explanation: "Cấu trúc 'regret + to V' thường dùng để thông báo tin buồn (rất tiếc phải thông báo).",
    translation: "Tôi rất tiếc phải thông báo với bạn rằng đơn xin việc của bạn đã bị từ chối.",
    tips: "regret + to V (tiếc phải làm gì - thường đi với tell, inform, announce)."
  },
  {
    question: "He regrets _____ so much money on that unsuccessful advertising campaign.",
    optionA: "spend", optionB: "to spend", optionC: "spending", optionD: "spent",
    correctOption: "C",
    explanation: "Cấu trúc 'regret + V-ing' mang nghĩa HỐI HẬN vì một việc đã làm trong quá khứ.",
    translation: "Anh ấy hối hận vì đã chi quá nhiều tiền cho chiến dịch quảng cáo không thành công đó.",
    tips: "regret + V-ing (hối hận vì đã làm gì)."
  },
  {
    question: "The machinery needs _____ as soon as possible to prevent further delays.",
    optionA: "repair", optionB: "to repair", optionC: "repairing", optionD: "repaired",
    correctOption: "C",
    explanation: "Với chủ ngữ là vật (machinery), động từ 'need' mang nghĩa bị động. Ta dùng cấu trúc 'need + V-ing' (hoặc need + to be PII).",
    translation: "Máy móc cần được sửa chữa càng sớm càng tốt để ngăn ngừa sự chậm trễ thêm.",
    tips: "Sth + need + V-ing (Cái gì cần ĐƯỢC làm - nghĩa bị động)."
  },
  {
    question: "If you want to access the secure file, you should try _____ the updated password.",
    optionA: "enter", optionB: "to enter", optionC: "entering", optionD: "entered",
    correctOption: "C",
    explanation: "Cấu trúc 'try + V-ing' mang nghĩa THỬ LÀM GÌ ĐÓ (như một giải pháp).",
    translation: "Nếu bạn muốn truy cập vào tệp bảo mật, bạn nên thử nhập mật khẩu đã được cập nhật xem sao.",
    tips: "try + V-ing (thử làm gì)."
  },
  {
    question: "We must try _____ the project deadline despite the budget cuts.",
    optionA: "meet", optionB: "to meet", optionC: "meeting", optionD: "met",
    correctOption: "B",
    explanation: "Cấu trúc 'try + to V' mang nghĩa CỐ GẮNG, NỖ LỰC để đạt được điều gì đó.",
    translation: "Chúng ta phải cố gắng đáp ứng thời hạn dự án bất chấp việc cắt giảm ngân sách.",
    tips: "try + to V (cố gắng làm gì)."
  },
  {
    question: "I will never forget _____ the CEO of the company for the first time.",
    optionA: "meet", optionB: "to meet", optionC: "meeting", optionD: "met",
    correctOption: "C",
    explanation: "Cấu trúc 'forget + V-ing' mang nghĩa quên một việc ĐÃ LÀM (thường dùng dạng phủ định: sẽ không bao giờ quên việc đã gặp...).",
    translation: "Tôi sẽ không bao giờ quên lần đầu tiên được gặp Giám đốc điều hành của công ty.",
    tips: "forget + V-ing (quên đã làm gì)."
  }
];

const ncLesson2 = [
  {
    question: "Don't forget _____ your timesheet before leaving on Friday.",
    optionA: "submit", optionB: "to submit", optionC: "submitting", optionD: "submitted",
    correctOption: "B",
    explanation: "Cấu trúc 'forget + to V' mang nghĩa quên việc CẦN PHẢI LÀM.",
    translation: "Đừng quên nộp bảng chấm công của bạn trước khi rời đi vào thứ Sáu.",
    tips: "forget + to V (quên phải làm gì)."
  },
  {
    question: "The new software allows users _____ multiple tasks simultaneously.",
    optionA: "perform", optionB: "to perform", optionC: "performing", optionD: "performed",
    correctOption: "B",
    explanation: "Cấu trúc 'allow + Object + to V' (cho phép ai/cái gì làm gì).",
    translation: "Phần mềm mới cho phép người dùng thực hiện nhiều tác vụ cùng một lúc.",
    tips: "allow/permit + Object + to V."
  },
  {
    question: "The manager does not allow _____ in the laboratory for safety reasons.",
    optionA: "eat", optionB: "to eat", optionC: "eating", optionD: "eaten",
    correctOption: "C",
    explanation: "Động từ 'allow' nếu KHÔNG có tân ngữ theo sau thì dùng cấu trúc 'allow + V-ing' (cho phép việc gì).",
    translation: "Người quản lý không cho phép việc ăn uống trong phòng thí nghiệm vì lý do an toàn.",
    tips: "allow/permit + V-ing (không có tân ngữ người)."
  },
  {
    question: "The committee objects to _____ additional funds for this unproven project.",
    optionA: "allocate", optionB: "to allocate", optionC: "allocating", optionD: "allocated",
    correctOption: "C",
    explanation: "Cụm 'object to' (phản đối) sử dụng 'to' như một giới từ, theo sau phải là V-ing.",
    translation: "Ủy ban phản đối việc phân bổ thêm quỹ cho dự án chưa được chứng minh này.",
    tips: "object to + V-ing (phản đối việc gì)."
  },
  {
    question: "We anticipate _____ a significant increase in sales after the new marketing campaign.",
    optionA: "see", optionB: "to see", optionC: "seeing", optionD: "saw",
    correctOption: "C",
    explanation: "Động từ 'anticipate' (dự đoán, lường trước) đi kèm với V-ing.",
    translation: "Chúng tôi dự đoán sẽ thấy doanh số bán hàng tăng đáng kể sau chiến dịch tiếp thị mới.",
    tips: "anticipate + V-ing (dự đoán điều gì sẽ xảy ra)."
  },
  {
    question: "The supervisor advised _____ the contract carefully before signing.",
    optionA: "read", optionB: "to read", optionC: "reading", optionD: "readed",
    correctOption: "C",
    explanation: "Động từ 'advise' nếu KHÔNG có tân ngữ chỉ người thì đi kèm với V-ing (khuyên việc gì).",
    translation: "Người giám sát khuyên nên đọc kỹ hợp đồng trước khi ký.",
    tips: "advise + V-ing (khuyên việc gì chung chung)."
  },
  {
    question: "The doctor advised me _____ plenty of water and rest.",
    optionA: "drink", optionB: "to drink", optionC: "drinking", optionD: "drank",
    correctOption: "B",
    explanation: "Động từ 'advise' NẾU CÓ tân ngữ chỉ người thì dùng cấu trúc 'advise + Object + to V' (khuyên ai làm gì).",
    translation: "Bác sĩ khuyên tôi nên uống nhiều nước và nghỉ ngơi.",
    tips: "advise + Object + to V."
  },
  {
    question: "She couldn't help _____ when she saw the hilarious typo in the official report.",
    optionA: "laugh", optionB: "to laugh", optionC: "laughing", optionD: "laughed",
    correctOption: "C",
    explanation: "Cụm thành ngữ 'can't help / couldn't help' (không thể nhịn được, không thể không) luôn đi kèm V-ing.",
    translation: "Cô ấy không thể nhịn được cười khi nhìn thấy lỗi chính tả hài hước trong báo cáo chính thức.",
    tips: "can't help + V-ing."
  },
  {
    question: "The facility requires _____ completely before the health inspection.",
    optionA: "clean", optionB: "to clean", optionC: "cleaning", optionD: "cleaned",
    correctOption: "C",
    explanation: "Giống như 'need', động từ 'require' khi chủ ngữ là vật (the facility) mang nghĩa bị động, ta dùng 'require + V-ing'.",
    translation: "Cơ sở này yêu cầu phải được dọn dẹp hoàn toàn trước đợt kiểm tra sức khỏe.",
    tips: "Sth + require + V-ing (yêu cầu được làm gì)."
  },
  {
    question: "He is dedicated to _____ the best possible service to our clients.",
    optionA: "provide", optionB: "to provide", optionC: "providing", optionD: "provided",
    correctOption: "C",
    explanation: "Cụm 'be dedicated to' (tận tâm, cống hiến cho) sử dụng 'to' như một giới từ, theo sau là V-ing.",
    translation: "Anh ấy tận tâm cung cấp dịch vụ tốt nhất có thể cho khách hàng của chúng tôi.",
    tips: "be dedicated/devoted to + V-ing."
  }
];

async function run() {
  console.log("Generating Topic 6: Động từ dùng làm tân ngữ (3 levels)...");
  
  const baseTitle = "Động từ dùng làm tân ngữ";
  const levelsData = [
    { level: "Cơ Bản", slug: "dong-tu-tan-ngu-co-ban", keyword: "[Cơ Bản]", lessons: [ { title: "Bài tập 1", questions: cbLesson1 }, { title: "Bài tập 2", questions: cbLesson2 } ] },
    { level: "Trung Cấp", slug: "dong-tu-tan-ngu-trung-cap", keyword: "[Trung Cấp]", lessons: [ { title: "Bài tập 1", questions: tcLesson1 }, { title: "Bài tập 2", questions: tcLesson2 } ] },
    { level: "Nâng Cao", slug: "dong-tu-tan-ngu-nang-cao", keyword: "[Nâng Cao]", lessons: [ { title: "Bài tập 1", questions: ncLesson1 }, { title: "Bài tập 2", questions: ncLesson2 } ] }
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
        subtitle: `Ôn tập To-V và V-ing mức độ ${lData.level}`,
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

  console.log("Topic 6 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
