import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cbLesson1 = [
  {
    question: "The company _____ its headquarters to a new building last month.",
    optionA: "move", optionB: "moves", optionC: "moved", optionD: "is moving",
    correctOption: "C",
    explanation: "Dấu hiệu 'last month' (tháng trước) -> Quá khứ đơn.",
    translation: "Công ty đã chuyển trụ sở chính đến một tòa nhà mới vào tháng trước.",
    tips: "last week/month/year, yesterday, ago -> Quá khứ đơn."
  },
  {
    question: "Mr. Brown _____ a meeting with the marketing team tomorrow morning.",
    optionA: "schedule", optionB: "scheduled", optionC: "has scheduled", optionD: "will schedule",
    correctOption: "D",
    explanation: "Dấu hiệu 'tomorrow morning' (sáng ngày mai) -> Tương lai đơn.",
    translation: "Ông Brown sẽ lên lịch một cuộc họp với nhóm tiếp thị vào sáng ngày mai.",
    tips: "tomorrow, next week/month/year -> Tương lai đơn."
  },
  {
    question: "They _____ the construction of the new bridge two years ago.",
    optionA: "begin", optionB: "began", optionC: "begun", optionD: "beginning",
    correctOption: "B",
    explanation: "Dấu hiệu 'two years ago' -> Quá khứ đơn. Động từ bất quy tắc: begin - began - begun.",
    translation: "Họ đã bắt đầu xây dựng cây cầu mới cách đây hai năm.",
    tips: "Khoảng thời gian + ago -> Quá khứ đơn."
  },
  {
    question: "I _____ the financial report as soon as I return to the office.",
    optionA: "submit", optionB: "will submit", optionC: "submitted", optionD: "have submitted",
    correctOption: "B",
    explanation: "Cấu trúc: Mệnh đề chính (Tương lai đơn) + As soon as + Mệnh đề trạng ngữ (Hiện tại đơn).",
    translation: "Tôi sẽ nộp báo cáo tài chính ngay khi tôi trở lại văn phòng.",
    tips: "Will + V + as soon as/when + Hiện tại đơn."
  },
  {
    question: "Ms. Garcia _____ the employee of the year award at the banquet yesterday.",
    optionA: "receives", optionB: "receive", optionC: "received", optionD: "will receive",
    correctOption: "C",
    explanation: "Dấu hiệu 'yesterday' (hôm qua) -> Quá khứ đơn.",
    translation: "Cô Garcia đã nhận giải thưởng nhân viên của năm tại bữa tiệc tối qua.",
    tips: "yesterday -> Quá khứ đơn."
  },
  {
    question: "The new software update _____ available for download next Monday.",
    optionA: "is", optionB: "was", optionC: "will be", optionD: "has been",
    correctOption: "C",
    explanation: "Dấu hiệu 'next Monday' -> Tương lai đơn. Động từ to be ở tương lai đơn là 'will be'.",
    translation: "Bản cập nhật phần mềm mới sẽ có sẵn để tải về vào thứ Hai tuần tới.",
    tips: "next + thời gian -> will be + Tính từ/Danh từ."
  },
  {
    question: "We _____ our supplier's factory in China last summer.",
    optionA: "visit", optionB: "visits", optionC: "visited", optionD: "visiting",
    correctOption: "C",
    explanation: "Dấu hiệu 'last summer' (mùa hè năm ngoái) -> Quá khứ đơn.",
    translation: "Chúng tôi đã đến thăm nhà máy của nhà cung cấp ở Trung Quốc vào mùa hè năm ngoái.",
    tips: "last + danh từ chỉ thời gian -> Quá khứ đơn."
  },
  {
    question: "If sales improve this quarter, the CEO _____ all employees a bonus.",
    optionA: "give", optionB: "gives", optionC: "gave", optionD: "will give",
    correctOption: "D",
    explanation: "Câu điều kiện loại 1: If + Hiện tại đơn, Tương lai đơn.",
    translation: "Nếu doanh số cải thiện trong quý này, giám đốc điều hành sẽ thưởng cho tất cả nhân viên.",
    tips: "If (HTĐ), Mệnh đề chính (Tương lai đơn)."
  },
  {
    question: "When I arrived at the office, the receptionist _____ on the phone.",
    optionA: "speaks", optionB: "spoke", optionC: "was speaking", optionD: "is speaking",
    correctOption: "C",
    explanation: "Một hành động đang diễn ra (was speaking) thì có hành động khác xen vào (arrived) trong quá khứ.",
    translation: "Khi tôi đến văn phòng, nhân viên lễ tân đang nói chuyện điện thoại.",
    tips: "When + Quá khứ đơn, Quá khứ tiếp diễn."
  },
  {
    question: "I guarantee that you _____ satisfied with our new delivery service.",
    optionA: "are", optionB: "will be", optionC: "were", optionD: "have been",
    correctOption: "B",
    explanation: "Sau các động từ chỉ sự hứa hẹn, đảm bảo (guarantee, promise), dự đoán -> Dùng tương lai đơn.",
    translation: "Tôi đảm bảo rằng bạn sẽ hài lòng với dịch vụ giao hàng mới của chúng tôi.",
    tips: "Promise / Guarantee / Expect that + Tương lai đơn."
  }
];

const cbLesson2 = [
  {
    question: "While the technician _____ the computer, the power went out.",
    optionA: "fixes", optionB: "fixed", optionC: "was fixing", optionD: "is fixing",
    correctOption: "C",
    explanation: "Sau 'While' thường là quá khứ tiếp diễn (hành động đang diễn ra).",
    translation: "Trong khi kỹ thuật viên đang sửa máy tính thì mất điện.",
    tips: "While + Quá khứ tiếp diễn, Quá khứ đơn."
  },
  {
    question: "By this time tomorrow, we _____ in Paris for our business trip.",
    optionA: "are", optionB: "will be", optionC: "were", optionD: "have been",
    correctOption: "B",
    explanation: "Dấu hiệu 'By this time tomorrow' (vào giờ này ngày mai). Với động từ 'to be', ta thường dùng 'will be' thay vì tương lai tiếp diễn.",
    translation: "Vào giờ này ngày mai, chúng ta sẽ đang ở Paris cho chuyến công tác.",
    tips: "By this time tomorrow + Tương lai đơn/Tương lai tiếp diễn."
  },
  {
    question: "The committee _____ the budget proposal thoroughly yesterday afternoon.",
    optionA: "reviews", optionB: "reviewed", optionC: "will review", optionD: "has reviewed",
    correctOption: "B",
    explanation: "Dấu hiệu 'yesterday afternoon' -> Quá khứ đơn.",
    translation: "Ủy ban đã xem xét kỹ lưỡng đề xuất ngân sách vào chiều hôm qua.",
    tips: "yesterday + buổi trong ngày -> Quá khứ đơn."
  },
  {
    question: "Please let me know when the packages _____.",
    optionA: "arrive", optionB: "arrives", optionC: "will arrive", optionD: "arrived",
    correctOption: "A",
    explanation: "Mệnh đề trạng ngữ chỉ thời gian bắt đầu bằng 'when' chỉ tương lai -> dùng thì Hiện tại đơn.",
    translation: "Vui lòng cho tôi biết khi nào các gói hàng đến.",
    tips: "when + Hiện tại đơn (mang nghĩa tương lai)."
  },
  {
    question: "Before she joined our firm, Ms. Davis _____ for a rival company.",
    optionA: "works", optionB: "worked", optionC: "has worked", optionD: "working",
    correctOption: "B",
    explanation: "Có thể dùng Quá khứ hoàn thành (had worked) hoặc Quá khứ đơn (worked) cho chuỗi hành động quá khứ. Ở đây chỉ có 'worked' hợp lý.",
    translation: "Trước khi gia nhập công ty chúng tôi, cô Davis đã làm việc cho một công ty đối thủ.",
    tips: "Before + Quá khứ đơn, Quá khứ đơn / Quá khứ hoàn thành."
  },
  {
    question: "Next year, the corporation _____ its 50th anniversary.",
    optionA: "celebrate", optionB: "celebrated", optionC: "will celebrate", optionD: "has celebrated",
    correctOption: "C",
    explanation: "Dấu hiệu 'Next year' -> Tương lai đơn.",
    translation: "Năm tới, tập đoàn sẽ kỷ niệm 50 năm thành lập.",
    tips: "Next year -> will + V(nguyên thể)."
  },
  {
    question: "They _____ a new marketing strategy during last week's conference.",
    optionA: "discuss", optionB: "will discuss", optionC: "discussed", optionD: "were discussed",
    correctOption: "C",
    explanation: "Dấu hiệu 'last week's' -> Quá khứ đơn.",
    translation: "Họ đã thảo luận về một chiến lược tiếp thị mới trong hội nghị tuần trước.",
    tips: "last week -> Quá khứ đơn."
  },
  {
    question: "I think the cost of living _____ further in the coming months.",
    optionA: "rises", optionB: "will rise", optionC: "rose", optionD: "has risen",
    correctOption: "B",
    explanation: "Dấu hiệu 'in the coming months' (trong những tháng tới) và động từ dự đoán 'I think' -> Tương lai đơn.",
    translation: "Tôi nghĩ chi phí sinh hoạt sẽ tiếp tục tăng trong những tháng tới.",
    tips: "I think/believe + Tương lai đơn."
  },
  {
    question: "At 10:00 AM yesterday, the CEO _____ a speech to the shareholders.",
    optionA: "gives", optionB: "gave", optionC: "was giving", optionD: "has given",
    correctOption: "C",
    explanation: "Thời điểm cụ thể trong quá khứ 'At 10:00 AM yesterday' -> Quá khứ tiếp diễn.",
    translation: "Vào lúc 10 giờ sáng hôm qua, Giám đốc điều hành đang phát biểu trước các cổ đông.",
    tips: "Giờ cụ thể + yesterday -> Quá khứ tiếp diễn."
  },
  {
    question: "Don't worry, the mechanic _____ your car by 5:00 PM.",
    optionA: "repairs", optionB: "repaired", optionC: "will repair", optionD: "has repaired",
    correctOption: "C",
    explanation: "Chỉ một hành động sẽ hoàn tất vào tương lai. Lẽ ra dùng Tương lai hoàn thành, nhưng trong giao tiếp cơ bản (và các đáp án hiện có), Tương lai đơn 'will repair' là phù hợp nhất.",
    translation: "Đừng lo, thợ máy sẽ sửa xong xe của bạn trước 5 giờ chiều.",
    tips: "Sự hứa hẹn -> Tương lai đơn."
  }
];

const tcLesson1 = [
  {
    question: "The director _____ the contract before he realized the mistake.",
    optionA: "signed", optionB: "has signed", optionC: "had signed", optionD: "signs",
    correctOption: "C",
    explanation: "Hành động ký (signed) xảy ra TRƯỚC hành động nhận ra (realized) trong quá khứ -> Quá khứ hoàn thành (had signed).",
    translation: "Giám đốc đã ký hợp đồng trước khi ông ấy nhận ra sai sót.",
    tips: "Quá khứ hoàn thành + before + Quá khứ đơn."
  },
  {
    question: "By the end of this month, our team _____ the market research phase.",
    optionA: "will complete", optionB: "completed", optionC: "will have completed", optionD: "have completed",
    correctOption: "C",
    explanation: "Dấu hiệu 'By the end of + Tương lai' -> Tương lai hoàn thành (will have V3/ed).",
    translation: "Vào cuối tháng này, nhóm của chúng tôi sẽ hoàn thành giai đoạn nghiên cứu thị trường.",
    tips: "By the end of + tương lai -> Tương lai hoàn thành."
  },
  {
    question: "I _____ to reach you all morning yesterday, but your phone was off.",
    optionA: "try", optionB: "tried", optionC: "was trying", optionD: "have tried",
    correctOption: "C",
    explanation: "Hành động mang tính liên tục, nhấn mạnh quá trình 'all morning yesterday' -> Quá khứ tiếp diễn (hoặc QKHT tiếp diễn).",
    translation: "Tôi đã cố liên lạc với bạn suốt cả buổi sáng hôm qua, nhưng điện thoại của bạn tắt máy.",
    tips: "all morning yesterday -> Quá khứ tiếp diễn."
  },
  {
    question: "Once the new policy _____, all employees will receive a notification.",
    optionA: "will be approved", optionB: "is approved", optionC: "was approved", optionD: "approves",
    correctOption: "B",
    explanation: "Mệnh đề thời gian với 'Once' (Một khi) chỉ tương lai nhưng động từ phải chia ở Hiện tại đơn (mang nghĩa bị động).",
    translation: "Một khi chính sách mới được phê duyệt, tất cả nhân viên sẽ nhận được thông báo.",
    tips: "Once + Hiện tại đơn (chỉ tương lai)."
  },
  {
    question: "The supplier informed us that the shipment _____ earlier than expected.",
    optionA: "will arrive", optionB: "arrives", optionC: "would arrive", optionD: "has arrived",
    correctOption: "C",
    explanation: "Câu tường thuật trong quá khứ 'informed'. Động từ ở mệnh đề sau phải lùi thì từ 'will' sang 'would'.",
    translation: "Nhà cung cấp đã thông báo với chúng tôi rằng lô hàng sẽ đến sớm hơn dự kiến.",
    tips: "Tường thuật quá khứ -> lùi thì (will -> would)."
  },
  {
    question: "We _____ for a full hour by the time the client finally arrived.",
    optionA: "were waiting", optionB: "waited", optionC: "had been waiting", optionD: "have waited",
    correctOption: "C",
    explanation: "Có 'for a full hour' (tính liên tục) và 'by the time + Quá khứ đơn' -> Quá khứ hoàn thành tiếp diễn.",
    translation: "Chúng tôi đã chờ đợi suốt một tiếng đồng hồ khi khách hàng cuối cùng cũng đến.",
    tips: "By the time (QKĐ) + Quá khứ hoàn thành tiếp diễn."
  },
  {
    question: "This time next week, I _____ on a beach in Hawaii.",
    optionA: "relax", optionB: "will relax", optionC: "will be relaxing", optionD: "relaxed",
    correctOption: "C",
    explanation: "'This time next week' (giờ này tuần sau) -> Tương lai tiếp diễn.",
    translation: "Giờ này tuần sau, tôi sẽ đang thư giãn trên một bãi biển ở Hawaii.",
    tips: "This time + tương lai -> Tương lai tiếp diễn."
  },
  {
    question: "The concert _____ by the time we got to the stadium.",
    optionA: "started", optionB: "has started", optionC: "had started", optionD: "starts",
    correctOption: "C",
    explanation: "'By the time + Quá khứ đơn (got)' -> Mệnh đề chính Quá khứ hoàn thành (xảy ra trước).",
    translation: "Buổi hòa nhạc đã bắt đầu trước khi chúng tôi đến sân vận động.",
    tips: "By the time (QKĐ) -> Quá khứ hoàn thành."
  },
  {
    question: "As long as you _____ the guidelines, there won't be any problems.",
    optionA: "follow", optionB: "will follow", optionC: "followed", optionD: "are following",
    correctOption: "A",
    explanation: "Mệnh đề điều kiện 'As long as' (Miễn là) -> Hiện tại đơn.",
    translation: "Miễn là bạn tuân thủ các hướng dẫn, sẽ không có bất kỳ vấn đề gì.",
    tips: "As long as + Hiện tại đơn."
  },
  {
    question: "The previous manager _____ a strict dress code before she resigned.",
    optionA: "implements", optionB: "implemented", optionC: "had implemented", optionD: "was implementing",
    correctOption: "C",
    explanation: "Hành động áp dụng quy định xảy ra TRƯỚC khi từ chức (resigned) trong quá khứ -> Quá khứ hoàn thành.",
    translation: "Người quản lý trước đã áp dụng quy định trang phục nghiêm ngặt trước khi bà ấy từ chức.",
    tips: "Quá khứ hoàn thành + before + Quá khứ đơn."
  }
];

const tcLesson2 = [
  {
    question: "The airline announced that all domestic flights _____ due to the snowstorm.",
    optionA: "are cancelled", optionB: "were cancelled", optionC: "will be cancelled", optionD: "have cancelled",
    correctOption: "B",
    explanation: "Động từ tường thuật ở quá khứ 'announced', vế sau lùi thì hiện tại/tương lai về quá khứ -> 'were cancelled' (bị động).",
    translation: "Hãng hàng không thông báo rằng tất cả các chuyến bay nội địa đã bị hủy do bão tuyết.",
    tips: "Câu tường thuật ở quá khứ -> Lùi thì."
  },
  {
    question: "Please ensure your seatbelt is fastened while the plane _____.",
    optionA: "land", optionB: "will land", optionC: "is landing", optionD: "landed",
    correctOption: "C",
    explanation: "'while' (trong khi) chỉ sự việc đang diễn ra ở hiện tại -> Hiện tại tiếp diễn.",
    translation: "Vui lòng đảm bảo dây an toàn của bạn được thắt chặt trong khi máy bay đang hạ cánh.",
    tips: "while + Hiện tại tiếp diễn."
  },
  {
    question: "By next Friday, the contractors _____ the renovations on the second floor.",
    optionA: "finish", optionB: "will finish", optionC: "will have finished", optionD: "finished",
    correctOption: "C",
    explanation: "Dấu hiệu 'By next Friday' -> Tương lai hoàn thành.",
    translation: "Vào thứ Sáu tới, các nhà thầu sẽ hoàn tất việc cải tạo trên tầng hai.",
    tips: "By + Tương lai -> Tương lai hoàn thành."
  },
  {
    question: "I _____ the error earlier if I had checked the figures more carefully.",
    optionA: "would notice", optionB: "noticed", optionC: "would have noticed", optionD: "will notice",
    correctOption: "C",
    explanation: "Câu điều kiện loại 3 (nếu đã... thì đã...): If S + had V3/ed, S + would have V3/ed.",
    translation: "Tôi đã có thể nhận ra lỗi sớm hơn nếu tôi kiểm tra các số liệu cẩn thận hơn.",
    tips: "Câu điều kiện loại 3: would have V3/ed."
  },
  {
    question: "The conference _____ place at the Grand Hotel next week.",
    optionA: "takes", optionB: "will taking", optionC: "is taking", optionD: "has taken",
    correctOption: "C",
    explanation: "Lịch trình, kế hoạch đã được chốt chắc chắn trong tương lai gần thường dùng Hiện tại tiếp diễn ('is taking'). 'will take' cũng đúng nhưng không có trong đáp án.",
    translation: "Hội nghị sẽ diễn ra tại Grand Hotel vào tuần tới.",
    tips: "Kế hoạch chắc chắn -> Hiện tại tiếp diễn mang nghĩa tương lai."
  },
  {
    question: "While I _____ my presentation, the microphone suddenly stopped working.",
    optionA: "deliver", optionB: "was delivering", optionC: "delivered", optionD: "am delivering",
    correctOption: "B",
    explanation: "Hành động đang diễn ra trong quá khứ thì hành động khác xen vào (stopped).",
    translation: "Trong khi tôi đang trình bày bài thuyết trình của mình, micrô đột ngột ngừng hoạt động.",
    tips: "While + Quá khứ tiếp diễn."
  },
  {
    question: "The new interns _____ extensive training before they handle client accounts.",
    optionA: "receive", optionB: "will receive", optionC: "received", optionD: "are receiving",
    correctOption: "B",
    explanation: "Sự việc sẽ xảy ra trong tương lai. Mệnh đề trạng ngữ chỉ thời gian dùng Hiện tại đơn 'handle'. Mệnh đề chính dùng Tương lai đơn.",
    translation: "Các thực tập sinh mới sẽ nhận được khóa đào tạo chuyên sâu trước khi họ xử lý tài khoản khách hàng.",
    tips: "Mệnh đề chính (Tương lai đơn) + before + Hiện tại đơn."
  },
  {
    question: "She realized that she _____ her keys at the office.",
    optionA: "leaves", optionB: "left", optionC: "has left", optionD: "had left",
    correctOption: "D",
    explanation: "Việc 'để quên' (had left) xảy ra trước việc 'nhận ra' (realized) trong quá khứ -> Quá khứ hoàn thành.",
    translation: "Cô ấy nhận ra rằng cô ấy đã để quên chìa khóa ở văn phòng.",
    tips: "Nhận ra (quá khứ) một việc xảy ra trước đó -> Quá khứ hoàn thành."
  },
  {
    question: "Our sales _____ steadily until the economic crisis hit last year.",
    optionA: "grow", optionB: "grew", optionC: "were growing", optionD: "have grown",
    correctOption: "C",
    explanation: "Một quá trình đang diễn ra (were growing) cho đến khi bị chặn lại bởi sự kiện quá khứ (crisis hit).",
    translation: "Doanh số của chúng tôi đang tăng đều đặn cho đến khi cuộc khủng hoảng kinh tế xảy ra vào năm ngoái.",
    tips: "Quá khứ tiếp diễn + until + Quá khứ đơn."
  },
  {
    question: "If the product is successful, we _____ it to international markets.",
    optionA: "export", optionB: "will export", optionC: "exported", optionD: "would export",
    correctOption: "B",
    explanation: "Câu điều kiện loại 1 (If + HTĐ, TLĐ).",
    translation: "Nếu sản phẩm thành công, chúng tôi sẽ xuất khẩu nó sang các thị trường quốc tế.",
    tips: "Câu điều kiện loại 1: Mệnh đề chính Tương lai đơn."
  }
];

const ncLesson1 = [
  {
    question: "By the time the investors arrive, we _____ a comprehensive financial report.",
    optionA: "prepared", optionB: "have prepared", optionC: "will have prepared", optionD: "would prepare",
    correctOption: "C",
    explanation: "Dấu hiệu 'By the time + Hiện tại đơn' (tương lai) -> Mệnh đề chính dùng Tương lai hoàn thành.",
    translation: "Vào lúc các nhà đầu tư đến, chúng ta sẽ đã chuẩn bị xong một báo cáo tài chính toàn diện.",
    tips: "By the time (HTĐ) -> Tương lai hoàn thành."
  },
  {
    question: "Had I known about the software update, I _____ my files sooner.",
    optionA: "backed up", optionB: "had backed up", optionC: "would back up", optionD: "would have backed up",
    correctOption: "D",
    explanation: "Đảo ngữ câu điều kiện loại 3: Had + S + V3/ed, S + would have V3/ed.",
    translation: "Nếu tôi biết về bản cập nhật phần mềm, tôi đã sao lưu các tập tin của mình sớm hơn.",
    tips: "Đảo ngữ câu ĐK loại 3: Had S V3/ed, S would have V3/ed."
  },
  {
    question: "Scarcely _____ the presentation when the fire alarm went off.",
    optionA: "he had begun", optionB: "had he begun", optionC: "he began", optionD: "did he begin",
    correctOption: "B",
    explanation: "Cấu trúc đảo ngữ: Scarcely/Hardly + had + S + V3/ed + when + S + V2/ed (Vừa mới... thì...).",
    translation: "Anh ấy vừa mới bắt đầu bài thuyết trình thì chuông báo cháy reo lên.",
    tips: "Scarcely/Hardly + had + S + V3/ed + when."
  },
  {
    question: "The contract stipulates that the payment _____ within 30 days of receiving the invoice.",
    optionA: "is made", optionB: "be made", optionC: "will make", optionD: "makes",
    correctOption: "B",
    explanation: "Cấu trúc giả định (Subjunctive) với 'stipulate': stipulate that + S + (should) + V(nguyên thể). Bị động: be V3/ed.",
    translation: "Hợp đồng quy định rằng khoản thanh toán phải được thực hiện trong vòng 30 ngày kể từ ngày nhận hóa đơn.",
    tips: "stipulate/demand that + S + be + V3/ed."
  },
  {
    question: "We _____ the proposed changes for hours when the CEO finally made a decision.",
    optionA: "debated", optionB: "were debating", optionC: "had been debating", optionD: "have been debating",
    correctOption: "C",
    explanation: "Hành động liên tục ('for hours') trước một hành động quá khứ khác ('made a decision') -> Quá khứ hoàn thành tiếp diễn.",
    translation: "Chúng tôi đã và đang tranh luận về những thay đổi đề xuất trong nhiều giờ khi Giám đốc điều hành cuối cùng đưa ra quyết định.",
    tips: "Nhấn mạnh quá trình trước một thời điểm quá khứ -> QKHT Tiếp diễn."
  },
  {
    question: "No sooner _____ the office than his boss called him back.",
    optionA: "had he left", optionB: "he had left", optionC: "did he leave", optionD: "he left",
    correctOption: "A",
    explanation: "Đảo ngữ: No sooner + had + S + V3/ed + than + S + V2/ed.",
    translation: "Anh ấy vừa mới rời văn phòng thì sếp gọi anh ấy quay lại.",
    tips: "No sooner + had S V3/ed + than + Quá khứ đơn."
  },
  {
    question: "By the end of this year, the company _____ its workforce by 20%.",
    optionA: "will expand", optionB: "is expanding", optionC: "will have expanded", optionD: "expanded",
    correctOption: "C",
    explanation: "'By the end of this year' -> Tương lai hoàn thành.",
    translation: "Vào cuối năm nay, công ty sẽ đã mở rộng lực lượng lao động của mình thêm 20%.",
    tips: "By the end of + Tương lai -> Tương lai hoàn thành."
  },
  {
    question: "I _____ the email yesterday, but it must have been saved in my drafts.",
    optionA: "send", optionB: "was sending", optionC: "had sent", optionD: "was to send",
    correctOption: "C",
    explanation: "Mặc dù có 'yesterday', nhưng ngữ cảnh 'must have been saved in my drafts' (chắc hẳn đã bị lưu vào bản nháp) ngụ ý rằng hành động gửi lẽ ra đã xảy ra trước khi kiểm tra -> Quá khứ hoàn thành.",
    translation: "Tôi (nghĩ rằng) đã gửi email vào ngày hôm qua, nhưng chắc hẳn nó đã bị lưu vào hộp nháp.",
    tips: "Thì quá khứ hoàn thành đôi khi diễn tả ý định/hành động đã làm trước khi nhận ra sự thật."
  },
  {
    question: "If we _____ a backup generator, we wouldn't have lost all that data during the blackout.",
    optionA: "had", optionB: "have had", optionC: "had had", optionD: "would have",
    correctOption: "C",
    explanation: "Mệnh đề chính dùng 'wouldn't have lost' (Câu ĐK loại 3), nên mệnh đề If phải dùng Quá khứ hoàn thành 'had had'.",
    translation: "Nếu chúng ta có máy phát điện dự phòng, chúng ta đã không bị mất toàn bộ dữ liệu đó trong thời gian cúp điện.",
    tips: "Câu điều kiện loại 3: If + S + had V3/ed."
  },
  {
    question: "We anticipate that the new product line _____ highly profitable by the fourth quarter.",
    optionA: "becomes", optionB: "will become", optionC: "became", optionD: "would become",
    correctOption: "B",
    explanation: "Động từ 'anticipate' (dự đoán) + that + mệnh đề (thường dùng Tương lai đơn 'will V').",
    translation: "Chúng tôi dự đoán rằng dòng sản phẩm mới sẽ trở nên sinh lời cao vào quý tư.",
    tips: "anticipate/expect that + Tương lai đơn."
  }
];

const ncLesson2 = [
  {
    question: "The director required that all staff members _____ the mandatory compliance training.",
    optionA: "attended", optionB: "attend", optionC: "attends", optionD: "will attend",
    correctOption: "B",
    explanation: "Cấu trúc giả định với 'require': require that + S + (should) + V(nguyên thể).",
    translation: "Giám đốc yêu cầu tất cả nhân viên phải tham gia khóa đào tạo tuân thủ bắt buộc.",
    tips: "require/request that + S + V(nguyên thể)."
  },
  {
    question: "Only after the survey results were published _____ the severity of the issue.",
    optionA: "we did realize", optionB: "did we realize", optionC: "we realized", optionD: "realized we",
    correctOption: "B",
    explanation: "Cấu trúc đảo ngữ: Only after + N/V-ing/Mệnh đề + Trợ động từ + S + V.",
    translation: "Chỉ sau khi kết quả khảo sát được công bố, chúng tôi mới nhận ra mức độ nghiêm trọng của vấn đề.",
    tips: "Only after + Mệnh đề + Đảo ngữ (did + S + V)."
  },
  {
    question: "He _____ his presentation for over an hour when the projector finally broke down.",
    optionA: "was giving", optionB: "has been giving", optionC: "had been giving", optionD: "gave",
    correctOption: "C",
    explanation: "Nhấn mạnh quá trình 'for over an hour' trước khi 'broke down' (Quá khứ) -> Quá khứ hoàn thành tiếp diễn.",
    translation: "Anh ấy đã và đang thuyết trình được hơn một giờ thì máy chiếu cuối cùng bị hỏng.",
    tips: "Quá trình liên tục trước một thời điểm quá khứ -> QKHT tiếp diễn."
  },
  {
    question: "It is crucial that the defect _____ fixed before mass production begins.",
    optionA: "is", optionB: "was", optionC: "be", optionD: "will be",
    correctOption: "C",
    explanation: "Cấu trúc giả định: It is crucial that + S + (should) + V(nguyên thể). Động từ to be nguyên thể là 'be'.",
    translation: "Điều quan trọng là lỗi này phải được khắc phục trước khi bắt đầu sản xuất hàng loạt.",
    tips: "It is crucial/important that + S + be + V3/ed."
  },
  {
    question: "If he _____ more attention to detail, he wouldn't make so many mistakes now.",
    optionA: "paid", optionB: "had paid", optionC: "pays", optionD: "would pay",
    correctOption: "B",
    explanation: "Câu điều kiện hỗn hợp (Loại 3-2): Giả định ngược với quá khứ (had paid), dẫn đến kết quả hiện tại (wouldn't make... now).",
    translation: "Nếu anh ấy đã chú ý đến chi tiết hơn (trong quá khứ), thì bây giờ anh ấy đã không mắc nhiều sai lầm như vậy.",
    tips: "Câu ĐK hỗn hợp: If S + had V3/ed, S + would/could + V + now."
  },
  {
    question: "By this time next year, I _____ at this firm for a decade.",
    optionA: "will work", optionB: "will be working", optionC: "will have been working", optionD: "have worked",
    correctOption: "C",
    explanation: "Dấu hiệu 'By this time next year' + 'for a decade' (khoảng tgian) -> Tương lai hoàn thành tiếp diễn.",
    translation: "Vào giờ này năm tới, tôi sẽ làm việc tại công ty này tròn một thập kỷ.",
    tips: "By this time + tương lai + for + khoảng tgian -> TL Hoàn thành (Tiếp diễn)."
  },
  {
    question: "Scarcely _____ the phone down when it started ringing again.",
    optionA: "I had put", optionB: "had I put", optionC: "I put", optionD: "did I put",
    correctOption: "B",
    explanation: "Đảo ngữ: Scarcely + had + S + V3/ed + when...",
    translation: "Tôi vừa mới đặt điện thoại xuống thì nó lại bắt đầu reo.",
    tips: "Scarcely + had + S + V3/ed."
  },
  {
    question: "We _____ the flight if we hadn't been stuck in traffic.",
    optionA: "caught", optionB: "would catch", optionC: "had caught", optionD: "would have caught",
    correctOption: "D",
    explanation: "Mệnh đề if dùng 'hadn't been' (loại 3) -> Mệnh đề chính 'would have caught'.",
    translation: "Chúng tôi đã có thể bắt kịp chuyến bay nếu không bị tắc đường.",
    tips: "Câu ĐK loại 3: would have V3/ed."
  },
  {
    question: "I'd rather you _____ the document tomorrow instead of today.",
    optionA: "submit", optionB: "submitted", optionC: "will submit", optionD: "are submitting",
    correctOption: "B",
    explanation: "Cấu trúc S1 + would rather + S2 + V(quá khứ đơn) diễn tả ý muốn ai đó làm gì ở hiện tại/tương lai.",
    translation: "Tôi thà rằng bạn nộp tài liệu vào ngày mai thay vì hôm nay.",
    tips: "would rather + S + Quá khứ đơn (mang nghĩa hiện tại/tương lai)."
  },
  {
    question: "Little _____ about the massive corporate restructuring that was about to take place.",
    optionA: "they knew", optionB: "knew they", optionC: "did they know", optionD: "they had known",
    correctOption: "C",
    explanation: "Đảo ngữ với từ phủ định 'Little' đứng đầu: Little + Trợ động từ + S + V.",
    translation: "Họ biết rất ít về cuộc tái cơ cấu doanh nghiệp quy mô lớn sắp diễn ra.",
    tips: "Little + Đảo ngữ (did + S + V)."
  }
];

async function run() {
  console.log("Generating Topic 3: Các thì Quá khứ & Tương lai (3 levels)...");
  
  const baseTitle = "Các thì Quá khứ & Tương lai";
  const levelsData = [
    { level: "Cơ Bản", slug: "cac-thi-qua-khu-tuong-lai-co-ban", keyword: "[Cơ Bản]", lessons: [ { title: "Bài tập 1", questions: cbLesson1 }, { title: "Bài tập 2", questions: cbLesson2 } ] },
    { level: "Trung Cấp", slug: "cac-thi-qua-khu-tuong-lai-trung-cap", keyword: "[Trung Cấp]", lessons: [ { title: "Bài tập 1", questions: tcLesson1 }, { title: "Bài tập 2", questions: tcLesson2 } ] },
    { level: "Nâng Cao", slug: "cac-thi-qua-khu-tuong-lai-nang-cao", keyword: "[Nâng Cao]", lessons: [ { title: "Bài tập 1", questions: ncLesson1 }, { title: "Bài tập 2", questions: ncLesson2 } ] }
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
        subtitle: `Ôn tập Các thì Quá khứ & Tương lai ở mức độ ${lData.level}`,
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

  console.log("Topic 3 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
