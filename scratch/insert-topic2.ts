import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cbLesson1 = [
  {
    question: "The store _____ at 8:00 AM every morning.",
    optionA: "open", optionB: "opens", optionC: "opening", optionD: "is opening",
    correctOption: "B",
    explanation: "Trạng từ 'every morning' (mỗi sáng) chỉ thói quen, lịch trình lặp đi lặp lại nên dùng thì Hiện tại đơn. Chủ ngữ 'The store' số ít -> opens.",
    translation: "Cửa hàng mở cửa vào lúc 8:00 sáng mỗi ngày.",
    tips: "every + thời gian -> Hiện tại đơn."
  },
  {
    question: "Currently, Mr. Davis _____ a seminar on digital marketing.",
    optionA: "attend", optionB: "attends", optionC: "is attending", optionD: "attended",
    correctOption: "C",
    explanation: "Trạng từ 'Currently' (Hiện tại) chỉ một hành động đang xảy ra tại thời điểm nói -> Hiện tại tiếp diễn.",
    translation: "Hiện tại, ông Davis đang tham dự một hội thảo về tiếp thị kỹ thuật số.",
    tips: "Currently / Now / At the moment -> Hiện tại tiếp diễn."
  },
  {
    question: "We usually _____ our weekly meetings on Tuesday afternoons.",
    optionA: "hold", optionB: "holds", optionC: "holding", optionD: "are holding",
    correctOption: "A",
    explanation: "'usually' (thường xuyên) là dấu hiệu của Hiện tại đơn. Chủ ngữ 'We' số nhiều -> hold.",
    translation: "Chúng tôi thường tổ chức các cuộc họp hàng tuần vào chiều thứ Ba.",
    tips: "usually / always / sometimes / often -> Hiện tại đơn."
  },
  {
    question: "The technician _____ the broken printer right now.",
    optionA: "repair", optionB: "repairs", optionC: "repaired", optionD: "is repairing",
    correctOption: "D",
    explanation: "'right now' (ngay lúc này) chỉ hành động đang diễn ra -> Hiện tại tiếp diễn.",
    translation: "Kỹ thuật viên đang sửa chiếc máy in bị hỏng ngay lúc này.",
    tips: "right now -> Hiện tại tiếp diễn."
  },
  {
    question: "Ms. Tanaka _____ English to international students at the local university.",
    optionA: "teach", optionB: "teaches", optionC: "teaching", optionD: "is taught",
    correctOption: "B",
    explanation: "Câu diễn tả một sự thật, một nghề nghiệp mang tính chất lâu dài -> Hiện tại đơn. Chủ ngữ 'Ms. Tanaka' số ít -> teaches.",
    translation: "Cô Tanaka dạy tiếng Anh cho sinh viên quốc tế tại trường đại học địa phương.",
    tips: "Sự thật hiển nhiên, nghề nghiệp, tính chất lâu dài -> Hiện tại đơn."
  },
  {
    question: "Look! The bus _____ toward the station.",
    optionA: "come", optionB: "comes", optionC: "is coming", optionD: "came",
    correctOption: "C",
    explanation: "Động từ gây chú ý 'Look!' chỉ một sự việc đang diễn ra ngay trước mắt -> Hiện tại tiếp diễn.",
    translation: "Nhìn kìa! Chiếc xe buýt đang tiến về phía nhà ga.",
    tips: "Look! / Listen! -> Hiện tại tiếp diễn."
  },
  {
    question: "It rarely _____ in this part of the country during the summer.",
    optionA: "rain", optionB: "rains", optionC: "is raining", optionD: "rained",
    correctOption: "B",
    explanation: "'rarely' (hiếm khi) là trạng từ tần suất của thì Hiện tại đơn. Chủ ngữ 'It' số ít -> rains.",
    translation: "Trời hiếm khi mưa ở khu vực này của đất nước vào mùa hè.",
    tips: "rarely / seldom / hardly -> Hiện tại đơn."
  },
  {
    question: "At present, our company _____ its operations into the European market.",
    optionA: "expand", optionB: "expands", optionC: "is expanding", optionD: "expanded",
    correctOption: "C",
    explanation: "'At present' (hiện tại) -> Hiện tại tiếp diễn.",
    translation: "Hiện tại, công ty chúng tôi đang mở rộng hoạt động sang thị trường châu Âu.",
    tips: "At present = Currently = Now -> Hiện tại tiếp diễn."
  },
  {
    question: "Water _____ at 100 degrees Celsius.",
    optionA: "boil", optionB: "boils", optionC: "is boiling", optionD: "boiled",
    correctOption: "B",
    explanation: "Đây là một chân lý, sự thật hiển nhiên khoa học -> Hiện tại đơn. 'Water' là danh từ không đếm được (số ít) -> boils.",
    translation: "Nước sôi ở 100 độ C.",
    tips: "Sự thật hiển nhiên khoa học -> Hiện tại đơn."
  },
  {
    question: "Please be quiet; the manager _____ an important phone call.",
    optionA: "makes", optionB: "is making", optionC: "make", optionD: "made",
    correctOption: "B",
    explanation: "Mệnh lệnh 'Please be quiet' cho thấy hành động ở vế sau đang diễn ra -> Hiện tại tiếp diễn.",
    translation: "Làm ơn giữ im lặng; người quản lý đang thực hiện một cuộc gọi quan trọng.",
    tips: "Please be quiet / Be careful + Mệnh đề Hiện tại tiếp diễn."
  }
];

const cbLesson2 = [
  {
    question: "He _____ completed the quarterly financial report.",
    optionA: "have", optionB: "having", optionC: "has", optionD: "is",
    correctOption: "C",
    explanation: "Có 'completed' (V3/ed), cần trợ động từ của thì Hiện tại hoàn thành. Chủ ngữ 'He' (số ít) -> has.",
    translation: "Anh ấy vừa hoàn thành báo cáo tài chính hàng quý.",
    tips: "has/have + V3/ed (Hiện tại hoàn thành)."
  },
  {
    question: "The flight to New York _____ at 10:30 PM tonight.",
    optionA: "depart", optionB: "departs", optionC: "departing", optionD: "has departed",
    correctOption: "B",
    explanation: "Dù là tối nay (tương lai), nhưng đây là lịch trình tàu xe/máy bay cố định nên dùng Hiện tại đơn.",
    translation: "Chuyến bay đến New York sẽ khởi hành lúc 10:30 tối nay.",
    tips: "Lịch trình tàu xe, máy bay, giờ học dùng Hiện tại đơn mang nghĩa tương lai."
  },
  {
    question: "I _____ in this city since I graduated from college.",
    optionA: "live", optionB: "am living", optionC: "have lived", optionD: "lives",
    correctOption: "C",
    explanation: "'since' + mốc thời gian trong quá khứ -> Dùng thì Hiện tại hoàn thành.",
    translation: "Tôi đã sống ở thành phố này kể từ khi tốt nghiệp đại học.",
    tips: "since + mốc thời gian -> Hiện tại hoàn thành."
  },
  {
    question: "Every employee _____ an ID card to enter the building.",
    optionA: "need", optionB: "needs", optionC: "needing", optionD: "is needing",
    correctOption: "B",
    explanation: "'Every' luôn đi với danh từ số ít và động từ chia số ít. Động từ chỉ trạng thái 'need' không dùng ở tiếp diễn.",
    translation: "Mỗi nhân viên đều cần một thẻ ID để vào tòa nhà.",
    tips: "Every + N số ít + V số ít. Need, want, know, like... không dùng thì tiếp diễn."
  },
  {
    question: "They _____ already reviewed the new contract.",
    optionA: "has", optionB: "have", optionC: "are", optionD: "were",
    correctOption: "B",
    explanation: "'already' thường dùng trong thì Hiện tại hoàn thành. Chủ ngữ 'They' -> have.",
    translation: "Họ đã xem xét hợp đồng mới rồi.",
    tips: "have/has + already + V3/ed."
  },
  {
    question: "The CEO _____ a press conference this Friday to announce the merger.",
    optionA: "hold", optionB: "holds", optionC: "is holding", optionD: "have held",
    correctOption: "C",
    explanation: "Dấu hiệu 'this Friday' (thứ Sáu này), một kế hoạch đã được lên lịch sắp xếp sẵn trong tương lai gần -> Dùng Hiện tại tiếp diễn.",
    translation: "Giám đốc điều hành sẽ tổ chức một cuộc họp báo vào thứ Sáu này để công bố việc sáp nhập.",
    tips: "Hiện tại tiếp diễn có thể diễn tả kế hoạch tương lai chắc chắn xảy ra."
  },
  {
    question: "She _____ not seen the new office layout yet.",
    optionA: "do", optionB: "does", optionC: "has", optionD: "have",
    correctOption: "C",
    explanation: "'yet' thường nằm trong câu phủ định của thì Hiện tại hoàn thành. 'She' -> has.",
    translation: "Cô ấy vẫn chưa xem cách bố trí văn phòng mới.",
    tips: "has/have not + V3/ed + yet."
  },
  {
    question: "We usually _____ our orders via express mail.",
    optionA: "send", optionB: "sends", optionC: "sending", optionD: "are sending",
    correctOption: "A",
    explanation: "'usually' -> Hiện tại đơn. Chủ ngữ 'We' -> send.",
    translation: "Chúng tôi thường gửi các đơn đặt hàng qua đường chuyển phát nhanh.",
    tips: "usually -> Hiện tại đơn."
  },
  {
    question: "The factory _____ 500 cars every single day.",
    optionA: "produce", optionB: "produces", optionC: "is producing", optionD: "has produced",
    correctOption: "B",
    explanation: "'every single day' -> Hiện tại đơn. Chủ ngữ 'The factory' số ít -> produces.",
    translation: "Nhà máy sản xuất 500 chiếc ô tô mỗi ngày.",
    tips: "every + thời gian -> Hiện tại đơn."
  },
  {
    question: "I _____ the document to the manager a few times, but he hasn't replied.",
    optionA: "send", optionB: "am sending", optionC: "have sent", optionD: "sends",
    correctOption: "C",
    explanation: "'a few times' (vài lần) chỉ số lần thực hiện hành động tính đến hiện tại -> Hiện tại hoàn thành.",
    translation: "Tôi đã gửi tài liệu cho người quản lý vài lần, nhưng anh ấy chưa phản hồi.",
    tips: "số lần thực hiện (once, twice, 3 times...) -> Hiện tại hoàn thành."
  }
];

const tcLesson1 = [
  {
    question: "For the past three years, our team _____ on developing eco-friendly packaging.",
    optionA: "works", optionB: "is working", optionC: "has worked", optionD: "work",
    correctOption: "C",
    explanation: "'For the past three years' (trong suốt 3 năm qua tính tới nay) -> Hiện tại hoàn thành.",
    translation: "Trong suốt ba năm qua, nhóm của chúng tôi đã làm việc để phát triển bao bì thân thiện với môi trường.",
    tips: "For the past/last + thời gian -> Hiện tại hoàn thành."
  },
  {
    question: "The board of directors _____ to open a new branch in Singapore next month.",
    optionA: "plan", optionB: "plans", optionC: "have planned", optionD: "planning",
    correctOption: "B",
    explanation: "Động từ 'plan' chia theo chủ ngữ 'The board of directors' (xem như 1 tổ chức số ít) -> plans. Dù có 'next month', Hiện tại đơn vẫn dùng cho lịch trình/kế hoạch chung.",
    translation: "Hội đồng quản trị dự định mở một chi nhánh mới tại Singapore vào tháng tới.",
    tips: "Chủ ngữ là tên tổ chức/hội đồng -> V số ít."
  },
  {
    question: "Mr. Roberts _____ the company since he was 25 years old.",
    optionA: "manages", optionB: "is managing", optionC: "has managed", optionD: "managed",
    correctOption: "C",
    explanation: "Cấu trúc: HTHT + since + Quá khứ đơn.",
    translation: "Ông Roberts đã quản lý công ty này kể từ khi ông ấy 25 tuổi.",
    tips: "since + mệnh đề quá khứ đơn -> mệnh đề chính chia HTHT."
  },
  {
    question: "The number of smartphone users _____ rapidly over the last decade.",
    optionA: "grow", optionB: "grows", optionC: "is growing", optionD: "has grown",
    correctOption: "D",
    explanation: "'over the last decade' (trong thập kỷ qua) -> HTHT. 'The number of' đi với V số ít -> has grown.",
    translation: "Số lượng người dùng điện thoại thông minh đã tăng trưởng nhanh chóng trong thập kỷ qua.",
    tips: "over the last/past + khoảng thời gian -> Hiện tại hoàn thành."
  },
  {
    question: "Sales _____ steadily this quarter due to the new marketing campaign.",
    optionA: "increase", optionB: "increases", optionC: "are increasing", optionD: "increased",
    correctOption: "C",
    explanation: "Sự thay đổi, xu hướng đang diễn ra trong hiện tại (this quarter) -> Hiện tại tiếp diễn.",
    translation: "Doanh số đang tăng đều trong quý này nhờ vào chiến dịch tiếp thị mới.",
    tips: "Diễn tả xu hướng đang thay đổi -> Hiện tại tiếp diễn."
  },
  {
    question: "We _____ for a response from the supplier for two weeks now.",
    optionA: "wait", optionB: "are waiting", optionC: "have been waiting", optionD: "waited",
    correctOption: "C",
    explanation: "'for two weeks now' nhấn mạnh quá trình liên tục từ quá khứ đến hiện tại -> Hiện tại hoàn thành tiếp diễn (have been V-ing).",
    translation: "Chúng tôi đã chờ đợi phản hồi từ nhà cung cấp suốt hai tuần nay.",
    tips: "for + khoảng thời gian + now -> HT Hoàn thành tiếp diễn."
  },
  {
    question: "The new software update _____ several critical bug fixes.",
    optionA: "include", optionB: "includes", optionC: "including", optionD: "is including",
    correctOption: "B",
    explanation: "Động từ 'include' chỉ trạng thái/đặc điểm, không dùng tiếp diễn. Chủ ngữ số ít -> includes.",
    translation: "Bản cập nhật phần mềm mới bao gồm một vài bản vá lỗi quan trọng.",
    tips: "Động từ include, contain, consist of không dùng ở HT tiếp diễn."
  },
  {
    question: "So far, the project manager _____ positive feedback from the clients.",
    optionA: "receive", optionB: "receives", optionC: "has received", optionD: "is receiving",
    correctOption: "C",
    explanation: "'So far' (cho đến nay) -> Hiện tại hoàn thành.",
    translation: "Cho đến nay, quản lý dự án đã nhận được phản hồi tích cực từ khách hàng.",
    tips: "So far, up to now, until now, recently, lately -> Hiện tại hoàn thành."
  },
  {
    question: "The committee _____ twice a month to discuss financial strategies.",
    optionA: "meet", optionB: "meets", optionC: "is meeting", optionD: "has met",
    correctOption: "B",
    explanation: "'twice a month' (hai lần một tháng) chỉ lịch trình định kỳ -> Hiện tại đơn. 'The committee' (xem như 1 đơn vị) -> meets.",
    translation: "Ủy ban họp mặt hai lần một tháng để thảo luận về chiến lược tài chính.",
    tips: "twice a month -> Hiện tại đơn."
  },
  {
    question: "Recently, the company _____ a new policy regarding remote work.",
    optionA: "implement", optionB: "implements", optionC: "is implementing", optionD: "has implemented",
    correctOption: "D",
    explanation: "'Recently' (Gần đây) -> Hiện tại hoàn thành.",
    translation: "Gần đây, công ty đã triển khai một chính sách mới về làm việc từ xa.",
    tips: "Recently / Lately -> Hiện tại hoàn thành."
  }
];

const tcLesson2 = [
  {
    question: "Our competitors _____ a new product line while we are still in the planning phase.",
    optionA: "launch", optionB: "launches", optionC: "are launching", optionD: "have launched",
    correctOption: "C",
    explanation: "Mệnh đề trạng ngữ có 'while we are still...' chỉ 2 hành động cùng thời điểm ở hiện tại -> Hiện tại tiếp diễn cho cả 2 hoặc mệnh đề chính.",
    translation: "Các đối thủ cạnh tranh của chúng ta đang ra mắt dòng sản phẩm mới trong khi chúng ta vẫn đang ở giai đoạn lập kế hoạch.",
    tips: "while + HTTD, mệnh đề còn lại cũng có thể dùng HTTD."
  },
  {
    question: "The train to London _____ at platform 4 in five minutes.",
    optionA: "arrive", optionB: "arrives", optionC: "arriving", optionD: "have arrived",
    correctOption: "B",
    explanation: "Lịch trình phương tiện công cộng luôn dùng Hiện tại đơn dù có thời gian ở tương lai (in five minutes).",
    translation: "Chuyến tàu đến London sẽ đến sân ga số 4 trong năm phút nữa.",
    tips: "Lịch trình giao thông -> Hiện tại đơn."
  },
  {
    question: "I _____ over this proposal all morning, and I still can't find the error.",
    optionA: "look", optionB: "am looking", optionC: "have been looking", optionD: "have looked",
    correctOption: "C",
    explanation: "'all morning' (suốt cả buổi sáng) nhấn mạnh sự việc xảy ra liên tục không ngừng nghỉ đến hiện tại -> Hiện tại hoàn thành tiếp diễn.",
    translation: "Tôi đã và đang xem xét kỹ bản đề xuất này suốt cả buổi sáng, nhưng vẫn không tìm thấy lỗi.",
    tips: "all day/morning/week nhấn mạnh tính liên tục -> HTHT tiếp diễn."
  },
  {
    question: "We _____ never seen such a dramatic increase in profit margins.",
    optionA: "has", optionB: "have", optionC: "are", optionD: "do",
    correctOption: "B",
    explanation: "'never' + seen (V3) -> Hiện tại hoàn thành (Trải nghiệm từ trước đến nay).",
    translation: "Chúng tôi chưa bao giờ thấy sự gia tăng biên lợi nhuận đáng kể như vậy.",
    tips: "have/has + never/ever + V3/ed."
  },
  {
    question: "The human resources department _____ reviewing the applications right now.",
    optionA: "are", optionB: "is", optionC: "has", optionD: "have",
    correctOption: "B",
    explanation: "Có 'reviewing' và 'right now' -> Hiện tại tiếp diễn (am/is/are + Ving). 'department' (phòng ban) là danh từ số ít -> is.",
    translation: "Phòng nhân sự đang xem xét các đơn xin việc ngay lúc này.",
    tips: "right now -> is/are V-ing."
  },
  {
    question: "Up to the present time, she _____ the best salesperson in our division.",
    optionA: "is", optionB: "has been", optionC: "was", optionD: "had been",
    correctOption: "B",
    explanation: "'Up to the present time' = Until now -> Hiện tại hoàn thành.",
    translation: "Cho đến thời điểm hiện tại, cô ấy vẫn là nhân viên bán hàng xuất sắc nhất trong bộ phận của chúng ta.",
    tips: "Up to now / Up to the present -> Hiện tại hoàn thành."
  },
  {
    question: "The director _____ you to sign these documents before you leave.",
    optionA: "want", optionB: "wants", optionC: "is wanting", optionD: "has wanted",
    correctOption: "B",
    explanation: "Động từ chỉ ý muốn 'want' không bao giờ chia ở thì tiếp diễn.",
    translation: "Giám đốc muốn bạn ký những tài liệu này trước khi bạn rời đi.",
    tips: "want, need, prefer, know, understand -> Không dùng tiếp diễn."
  },
  {
    question: "More and more customers _____ online shopping these days.",
    optionA: "prefer", optionB: "prefers", optionC: "are preferring", optionD: "have preferred",
    correctOption: "A",
    explanation: "'These days' có thể dùng với Hiện tại đơn hoặc HTTD. Nhưng 'prefer' không dùng thì tiếp diễn -> Hiện tại đơn. Chủ ngữ 'customers' số nhiều -> prefer.",
    translation: "Ngày càng có nhiều khách hàng ưa chuộng mua sắm trực tuyến dạo gần đây.",
    tips: "prefer (thích hơn) luôn chia ở thể đơn."
  },
  {
    question: "The firm _____ its annual charity gala every December.",
    optionA: "host", optionB: "hosts", optionC: "is hosting", optionD: "has hosted",
    correctOption: "B",
    explanation: "'every December' (mỗi tháng 12) -> Hiện tại đơn. 'The firm' số ít -> hosts.",
    translation: "Công ty tổ chức buổi tiệc từ thiện thường niên vào mỗi tháng 12.",
    tips: "every + thời gian -> Hiện tại đơn."
  },
  {
    question: "They _____ the new prototype for three months without any success.",
    optionA: "test", optionB: "are testing", optionC: "have tested", optionD: "have been testing",
    correctOption: "D",
    explanation: "'for three months' nhấn mạnh quá trình ròng rã suốt 3 tháng đến hiện tại chưa xong -> Hiện tại hoàn thành tiếp diễn.",
    translation: "Họ đã và đang thử nghiệm nguyên mẫu mới trong ba tháng mà không có bất kỳ thành công nào.",
    tips: "Nhấn mạnh quá trình chưa kết thúc -> Hiện tại hoàn thành tiếp diễn."
  }
];

const ncLesson1 = [
  {
    question: "By the time the manager arrives, the team _____ preparing the presentation for an hour.",
    optionA: "will be", optionB: "has been", optionC: "will have been", optionD: "have been",
    correctOption: "C",
    explanation: "Sự việc sẽ xảy ra liên tục trước 1 thời điểm ở tương lai (mệnh đề By the time chia HTĐ) -> Tương lai hoàn thành tiếp diễn.",
    translation: "Vào lúc người quản lý đến, đội sẽ đã và đang chuẩn bị bài thuyết trình được một giờ rồi.",
    tips: "By the time (HTĐ), mệnh đề chính (Tương lai hoàn thành/TLHT Tiếp diễn)."
  },
  {
    question: "It is essential that everyone _____ the safety guidelines strictly.",
    optionA: "follows", optionB: "follow", optionC: "is following", optionD: "followed",
    correctOption: "B",
    explanation: "Cấu trúc giả định (Subjunctive): It is essential/important/vital that + S + V(nguyên thể không to). Dù 'everyone' số ít nhưng vẫn dùng 'follow'.",
    translation: "Điều thiết yếu là mọi người phải tuân thủ nghiêm ngặt các hướng dẫn an toàn.",
    tips: "It is essential that + S + V(nguyên thể)."
  },
  {
    question: "Hardly a day goes by without someone _____ about the new software interface.",
    optionA: "complain", optionB: "complains", optionC: "complained", optionD: "complaining",
    correctOption: "D",
    explanation: "Giới từ 'without' + V-ing. HTĐ được dùng ở mệnh đề chính 'goes by' để diễn tả sự việc thường xuyên xảy ra.",
    translation: "Hiếm có ngày nào trôi qua mà không có ai phàn nàn về giao diện phần mềm mới.",
    tips: "without + V-ing."
  },
  {
    question: "The construction of the new terminal _____ since early last year and is still far from complete.",
    optionA: "is going on", optionB: "has gone on", optionC: "has been going on", optionD: "goes on",
    correctOption: "C",
    explanation: "Có 'since early last year' và 'still far from complete' nhấn mạnh hành động liên tục không ngừng tới hiện tại -> HTHT Tiếp diễn.",
    translation: "Việc xây dựng nhà ga mới đã và đang diễn ra từ đầu năm ngoái và vẫn còn lâu mới hoàn thành.",
    tips: "Nhấn mạnh quá trình kéo dài liên tục -> HT Hoàn thành tiếp diễn."
  },
  {
    question: "By the end of this week, I _____ working on this account for exactly six months.",
    optionA: "have been", optionB: "will be", optionC: "will have been", optionD: "am",
    correctOption: "C",
    explanation: "'By the end of this week' (Tương lai) + 'for exactly six months' (Khoảng tgian) -> Tương lai hoàn thành tiếp diễn.",
    translation: "Vào cuối tuần này, tôi sẽ làm việc với tài khoản khách hàng này được tròn sáu tháng.",
    tips: "By + mốc tương lai, có for + khoảng thời gian -> TLHT / TLHT Tiếp diễn."
  },
  {
    question: "This is the third time the server _____ down this week.",
    optionA: "goes", optionB: "is going", optionC: "has gone", optionD: "went",
    correctOption: "C",
    explanation: "Cấu trúc 'This is the first/second/third time...' -> Hiện tại hoàn thành.",
    translation: "Đây là lần thứ ba máy chủ bị sập trong tuần này.",
    tips: "This is the first/second/third time + HTHT."
  },
  {
    question: "As soon as she _____ the report, she will email it to the executives.",
    optionA: "finishes", optionB: "will finish", optionC: "finished", optionD: "is finishing",
    correctOption: "A",
    explanation: "Mệnh đề trạng ngữ chỉ thời gian (As soon as, When, After, Before) KHÔNG dùng thì tương lai. Dùng Hiện tại đơn để chỉ tương lai.",
    translation: "Ngay khi cô ấy hoàn thành báo cáo, cô ấy sẽ gửi email cho các giám đốc.",
    tips: "As soon as + Hiện tại đơn, Tương lai đơn."
  },
  {
    question: "The newly installed security system _____ whenever an unauthorized entry occurs.",
    optionA: "activate", optionB: "activates", optionC: "is activating", optionD: "has activated",
    correctOption: "B",
    explanation: "'whenever' (bất cứ khi nào) diễn tả một quy luật/cơ chế hoạt động tự động -> Hiện tại đơn.",
    translation: "Hệ thống an ninh mới lắp đặt sẽ kích hoạt bất cứ khi nào có sự xâm nhập trái phép.",
    tips: "whenever -> Hiện tại đơn."
  },
  {
    question: "Mr. Clark _____ the branch manager after Ms. Davies retires next month.",
    optionA: "becomes", optionB: "is becoming", optionC: "will become", optionD: "has become",
    correctOption: "C",
    explanation: "Sự việc sẽ xảy ra trong tương lai ('next month'). Dùng Tương lai đơn.",
    translation: "Ông Clark sẽ trở thành giám đốc chi nhánh sau khi bà Davies nghỉ hưu vào tháng tới.",
    tips: "next month -> Tương lai đơn."
  },
  {
    question: "We demand that the defective merchandise _____ immediately.",
    optionA: "is replaced", optionB: "be replaced", optionC: "are replaced", optionD: "will be replaced",
    correctOption: "B",
    explanation: "Cấu trúc giả định với động từ 'demand': demand that + S + (should) + V(nguyên thể). Bị động: be + V3/ed.",
    translation: "Chúng tôi yêu cầu số hàng hóa bị lỗi phải được thay thế ngay lập tức.",
    tips: "demand/suggest/recommend that + S + V(nguyên thể)."
  }
];

const ncLesson2 = [
  {
    question: "Unless the weather _____, the outdoor team-building event will be postponed.",
    optionA: "improve", optionB: "improves", optionC: "will improve", optionD: "is improving",
    correctOption: "B",
    explanation: "Câu điều kiện loại 1 với 'Unless' (= If not). Mệnh đề Unless dùng Hiện tại đơn.",
    translation: "Trừ khi thời tiết cải thiện, sự kiện xây dựng đội ngũ ngoài trời sẽ bị hoãn lại.",
    tips: "Unless + Hiện tại đơn, Mệnh đề chính Tương lai đơn."
  },
  {
    question: "The economic forecast suggests that inflation _____ steadily over the next few quarters.",
    optionA: "rise", optionB: "rises", optionC: "will rise", optionD: "has risen",
    correctOption: "C",
    explanation: "'over the next few quarters' (trong vài quý tới) -> Tương lai. Động từ suggest + that + S + V(tương lai) trong ngữ cảnh dự đoán kinh tế.",
    translation: "Dự báo kinh tế cho thấy lạm phát sẽ tăng đều trong vài quý tới.",
    tips: "over the next + thời gian -> Tương lai đơn."
  },
  {
    question: "Not only _____ the deadline, but he also exceeded all expectations.",
    optionA: "did he meet", optionB: "he met", optionC: "does he meet", optionD: "he meets",
    correctOption: "A",
    explanation: "Đảo ngữ với 'Not only' đứng đầu câu. Vế sau dùng Quá khứ đơn (exceeded) nên vế trước cũng đảo trợ động từ Quá khứ đơn 'did'.",
    translation: "Anh ấy không những đáp ứng được thời hạn mà còn vượt quá mọi sự mong đợi.",
    tips: "Not only + Trợ động từ + S + V."
  },
  {
    question: "Since the new regulations were enforced, the number of workplace accidents _____ significantly.",
    optionA: "drop", optionB: "dropped", optionC: "has dropped", optionD: "had dropped",
    correctOption: "C",
    explanation: "Cấu trúc: Since + QKĐ (were enforced), Mệnh đề chính dùng Hiện tại hoàn thành (has dropped).",
    translation: "Kể từ khi các quy định mới được thực thi, số lượng tai nạn lao động đã giảm đáng kể.",
    tips: "Since + Quá khứ đơn, Hiện tại hoàn thành."
  },
  {
    question: "He is the most dedicated employee I _____ encountered in my entire career.",
    optionA: "have ever", optionB: "ever have", optionC: "had ever", optionD: "ever had",
    correctOption: "A",
    explanation: "Dùng Hiện tại hoàn thành sau cụm so sánh nhất (the most) để chỉ trải nghiệm tính đến hiện tại.",
    translation: "Anh ấy là nhân viên tận tụy nhất mà tôi từng gặp trong suốt sự nghiệp của mình.",
    tips: "So sánh nhất + Hiện tại hoàn thành (have/has ever V3/ed)."
  },
  {
    question: "If you _____ any further assistance, please do not hesitate to contact our support team.",
    optionA: "will require", optionB: "require", optionC: "are requiring", optionD: "requires",
    correctOption: "B",
    explanation: "Câu điều kiện loại 1 chỉ điều có thể xảy ra. Mệnh đề If dùng Hiện tại đơn.",
    translation: "Nếu bạn cần bất kỳ sự hỗ trợ nào thêm, vui lòng đừng ngần ngại liên hệ với nhóm hỗ trợ của chúng tôi.",
    tips: "If + Hiện tại đơn, Please + V(nguyên thể)."
  },
  {
    question: "The stock market generally _____ when interest rates are lowered.",
    optionA: "rally", optionB: "rallies", optionC: "is rallying", optionD: "has rallied",
    correctOption: "B",
    explanation: "Sự thật, quy luật chung trong kinh tế -> Hiện tại đơn. 'market' số ít -> rallies.",
    translation: "Thị trường chứng khoán thường phục hồi khi lãi suất được giảm.",
    tips: "generally -> Hiện tại đơn."
  },
  {
    question: "Over the past month, we _____ a surge in customer complaints regarding the delivery service.",
    optionA: "notice", optionB: "are noticing", optionC: "have noticed", optionD: "will notice",
    correctOption: "C",
    explanation: "'Over the past month' (Trong tháng qua) -> Hiện tại hoàn thành.",
    translation: "Trong tháng qua, chúng tôi đã nhận thấy sự gia tăng đột biến về khiếu nại của khách hàng liên quan đến dịch vụ giao hàng.",
    tips: "Over the past/last + khoảng tgian -> Hiện tại hoàn thành."
  },
  {
    question: "It has been determined that the error _____ from a miscalculation in the initial phase.",
    optionA: "stem", optionB: "stems", optionC: "stemming", optionD: "stemmed",
    correctOption: "B",
    explanation: "Bản chất/sự thật gây ra lỗi (error) là không đổi -> Hiện tại đơn. error (số ít) -> stems. (Hoặc Quá khứ đơn 'stemmed', nhưng chỉ có 'stems' đúng ngữ pháp ở hiện tại).",
    translation: "Người ta đã xác định rằng lỗi bắt nguồn từ việc tính toán sai ở giai đoạn đầu.",
    tips: "stem from: bắt nguồn từ."
  },
  {
    question: "Rarely _____ such an innovative approach to urban planning.",
    optionA: "we have seen", optionB: "have we seen", optionC: "we see", optionD: "do we seen",
    correctOption: "B",
    explanation: "Đảo ngữ với 'Rarely' đứng đầu câu. Trợ động từ 'have' đảo lên trước chủ ngữ 'we'.",
    translation: "Hiếm khi chúng tôi thấy một cách tiếp cận sáng tạo như vậy đối với quy hoạch đô thị.",
    tips: "Rarely/Seldom + Trợ động từ + S + V (Đảo ngữ)."
  }
];

async function run() {
  console.log("Generating Topic 2: Các thì Hiện tại (3 levels)...");
  
  const baseTitle = "Các thì Hiện tại";
  const levelsData = [
    { level: "Cơ Bản", slug: "cac-thi-hien-tai-co-ban", keyword: "[Cơ Bản]", lessons: [ { title: "Bài tập 1", questions: cbLesson1 }, { title: "Bài tập 2", questions: cbLesson2 } ] },
    { level: "Trung Cấp", slug: "cac-thi-hien-tai-trung-cap", keyword: "[Trung Cấp]", lessons: [ { title: "Bài tập 1", questions: tcLesson1 }, { title: "Bài tập 2", questions: tcLesson2 } ] },
    { level: "Nâng Cao", slug: "cac-thi-hien-tai-nang-cao", keyword: "[Nâng Cao]", lessons: [ { title: "Bài tập 1", questions: ncLesson1 }, { title: "Bài tập 2", questions: ncLesson2 } ] }
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
        subtitle: `Ôn tập Hiện tại đơn, Tiếp diễn, Hoàn thành ở mức độ ${lData.level}`,
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

  console.log("Topic 2 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
