import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cbLesson1 = [
  {
    question: "We need to buy some new _____ for the main office.",
    optionA: "furniture", optionB: "furnitures", optionC: "a furniture", optionD: "the furnitures",
    correctOption: "A",
    explanation: "Danh từ 'furniture' (đồ nội thất) là danh từ không đếm được, không có dạng số nhiều.",
    translation: "Chúng ta cần mua một số đồ nội thất mới cho văn phòng chính.",
    tips: "Các danh từ không đếm được phổ biến: information, equipment, furniture, luggage, advice."
  },
  {
    question: "The _____ of the new marketing strategy was discussed yesterday.",
    optionA: "develop", optionB: "developer", optionC: "development", optionD: "develops",
    correctOption: "C",
    explanation: "Sau mạo từ 'The' và trước giới từ 'of' cần một danh từ. 'Development' (sự phát triển) là danh từ.",
    translation: "Sự phát triển của chiến lược tiếp thị mới đã được thảo luận vào ngày hôm qua.",
    tips: "The + Noun + of + Noun."
  },
  {
    question: "Mr. Kim is an _____ in the field of artificial intelligence.",
    optionA: "expert", optionB: "expertise", optionC: "expertly", optionD: "experts",
    correctOption: "A",
    explanation: "Sau mạo từ 'an' cần một danh từ đếm được số ít chỉ người hoặc vật. 'expert' (chuyên gia) là danh từ phù hợp.",
    translation: "Ông Kim là một chuyên gia trong lĩnh vực trí tuệ nhân tạo.",
    tips: "an + Noun (bắt đầu bằng nguyên âm)."
  },
  {
    question: "She gave me a piece of _____ regarding my career path.",
    optionA: "advices", optionB: "advise", optionC: "advising", optionD: "advice",
    correctOption: "D",
    explanation: "'Advice' (lời khuyên) là danh từ không đếm được, nên người ta dùng cụm 'a piece of advice'.",
    translation: "Cô ấy đã cho tôi một lời khuyên về con đường sự nghiệp của tôi.",
    tips: "advice (N) không đếm được, advise (V) là động từ."
  },
  {
    question: "The _____ will be held in the main conference room.",
    optionA: "meet", optionB: "meeting", optionC: "met", optionD: "meets",
    correctOption: "B",
    explanation: "Cần một danh từ làm chủ ngữ sau mạo từ 'The'. 'Meeting' (cuộc họp) là danh từ.",
    translation: "Cuộc họp sẽ được tổ chức tại phòng hội nghị chính.",
    tips: "Nhiều V-ing có thể đóng vai trò làm danh từ (Gerund/Noun)."
  },
  {
    question: "_____ members of the team must attend the workshop tomorrow.",
    optionA: "Every", optionB: "All", optionC: "Each", optionD: "Much",
    correctOption: "B",
    explanation: "'members' là danh từ số nhiều, nên phải dùng 'All'. 'Every' và 'Each' đi với danh từ số ít.",
    translation: "Tất cả các thành viên của đội phải tham dự buổi hội thảo ngày mai.",
    tips: "All + N(số nhiều/không đếm được). Every/Each + N(số ít)."
  },
  {
    question: "We have received a lot of _____ about the new software update.",
    optionA: "complaint", optionB: "complains", optionC: "complaining", optionD: "complaints",
    correctOption: "D",
    explanation: "'a lot of' đi với danh từ đếm được số nhiều hoặc danh từ không đếm được. 'complaint' đếm được nên phải là số nhiều 'complaints'.",
    translation: "Chúng tôi đã nhận được nhiều phàn nàn về bản cập nhật phần mềm mới.",
    tips: "A lot of + N(số nhiều/không đếm được)."
  },
  {
    question: "_____ of the students has a unique ID number.",
    optionA: "All", optionB: "Some", optionC: "Each", optionD: "Many",
    correctOption: "C",
    explanation: "Động từ 'has' chia số ít, do đó chủ ngữ phải là 'Each'. Các từ All, Some, Many đi với 'of the students' sẽ dùng động từ số nhiều.",
    translation: "Mỗi học sinh đều có một số báo danh duy nhất.",
    tips: "Each of + the + N(số nhiều) + V(số ít)."
  },
  {
    question: "The manager's _____ was crucial to the success of the project.",
    optionA: "approve", optionB: "approved", optionC: "approval", optionD: "approving",
    correctOption: "C",
    explanation: "Sau sở hữu cách 'manager's' cần một danh từ. 'approval' (sự chấp thuận) là danh từ.",
    translation: "Sự chấp thuận của người quản lý đóng vai trò quan trọng đối với thành công của dự án.",
    tips: "Các từ đuôi -al thường là tính từ, nhưng 'approval', 'proposal', 'renewal' lại là danh từ."
  },
  {
    question: "Please put your _____ in the overhead compartment.",
    optionA: "baggage", optionB: "baggages", optionC: "a baggage", optionD: "the baggages",
    correctOption: "A",
    explanation: "'baggage' (hành lý) là danh từ không đếm được.",
    translation: "Vui lòng để hành lý của bạn vào ngăn chứa phía trên.",
    tips: "baggage / luggage là danh từ không đếm được."
  }
];

const cbLesson2 = [
  {
    question: "This machine requires regular _____ to function properly.",
    optionA: "maintain", optionB: "maintains", optionC: "maintenance", optionD: "maintained",
    correctOption: "C",
    explanation: "Sau tính từ 'regular' cần một danh từ. 'maintenance' (sự bảo trì) là danh từ.",
    translation: "Máy này cần được bảo trì thường xuyên để hoạt động bình thường.",
    tips: "Tính từ (regular) + Danh từ (maintenance)."
  },
  {
    question: "There is _____ water left in the bottle.",
    optionA: "few", optionB: "many", optionC: "a few", optionD: "little",
    correctOption: "D",
    explanation: "'water' là danh từ không đếm được, nên chỉ có thể dùng 'little' (rất ít).",
    translation: "Còn rất ít nước trong chai.",
    tips: "little/a little + N(không đếm được). few/a few + N(đếm được số nhiều)."
  },
  {
    question: "The _____ of the bridge will take approximately two years.",
    optionA: "construct", optionB: "constructive", optionC: "construction", optionD: "constructed",
    correctOption: "C",
    explanation: "Sau 'The' và trước 'of' cần danh từ. 'construction' (sự xây dựng) là phù hợp.",
    translation: "Việc xây dựng cây cầu sẽ mất khoảng hai năm.",
    tips: "đuôi -tion thường là danh từ."
  },
  {
    question: "Could you please give me _____ information about the tour?",
    optionA: "an", optionB: "some", optionC: "a few", optionD: "many",
    correctOption: "B",
    explanation: "'information' là danh từ không đếm được, dùng 'some' trong câu yêu cầu/đề nghị lịch sự.",
    translation: "Bạn có thể vui lòng cung cấp cho tôi một số thông tin về chuyến tham quan không?",
    tips: "Information không bao giờ có 's' và đi kèm với some/much/a lot of."
  },
  {
    question: "The company offers a comprehensive _____ package for its employees.",
    optionA: "benefit", optionB: "benefits", optionC: "beneficial", optionD: "benefited",
    correctOption: "A",
    explanation: "Cụm danh từ ghép 'benefit package' (gói phúc lợi). Danh từ đi trước làm chức năng bổ nghĩa thường ở dạng số ít.",
    translation: "Công ty cung cấp một gói phúc lợi toàn diện cho nhân viên của mình.",
    tips: "Trong danh từ ghép, danh từ đứng trước thường không có 's'."
  },
  {
    question: "Only _____ people attended the meeting because of the heavy rain.",
    optionA: "a little", optionB: "little", optionC: "a few", optionD: "much",
    correctOption: "C",
    explanation: "'people' là danh từ đếm được số nhiều, nên dùng 'a few' (một vài).",
    translation: "Chỉ có một vài người tham dự cuộc họp do trời mưa to.",
    tips: "a few + N(số nhiều đếm được)."
  },
  {
    question: "The director expressed his _____ for the team's hard work.",
    optionA: "appreciate", optionB: "appreciative", optionC: "appreciation", optionD: "appreciated",
    correctOption: "C",
    explanation: "Sau tính từ sở hữu 'his' cần một danh từ. 'appreciation' (sự trân trọng) là danh từ.",
    translation: "Giám đốc bày tỏ sự trân trọng đối với sự làm việc chăm chỉ của đội.",
    tips: "Tính từ sở hữu (my, his, her...) + Danh từ."
  },
  {
    question: "We have to follow _____ strict safety regulations.",
    optionA: "a", optionB: "an", optionC: "the", optionD: "(none)",
    correctOption: "C",
    explanation: "'regulations' là danh từ số nhiều xác định trong ngữ cảnh này, hoặc không dùng mạo từ. Ở đây 'the' là hợp lý nhất nếu nó chỉ quy định cụ thể của công ty. Tuy nhiên '(none)' cũng đúng trong trường hợp chung chung. Trong bài thi TOEIC thường chọn 'the' cho sự việc cụ thể.",
    translation: "Chúng ta phải tuân thủ các quy định an toàn nghiêm ngặt.",
    tips: "Khi danh từ là số nhiều và xác định, dùng 'the'."
  },
  {
    question: "Ms. Carter is known for her exceptional _____ skills.",
    optionA: "lead", optionB: "leader", optionC: "leadership", optionD: "leading",
    correctOption: "C",
    explanation: "Cần một danh từ ghép 'leadership skills' (kỹ năng lãnh đạo).",
    translation: "Cô Carter được biết đến với kỹ năng lãnh đạo xuất chúng.",
    tips: "leadership skills: kỹ năng lãnh đạo."
  },
  {
    question: "We cannot process your application without your _____.",
    optionA: "signature", optionB: "sign", optionC: "signed", optionD: "signing",
    correctOption: "A",
    explanation: "Sau tính từ sở hữu 'your' cần một danh từ. 'signature' (chữ ký) là danh từ phù hợp nhất.",
    translation: "Chúng tôi không thể xử lý đơn đăng ký của bạn nếu không có chữ ký của bạn.",
    tips: "signature là danh từ của động từ sign."
  }
];

const tcLesson1 = [
  {
    question: "_____ applicants must submit a portfolio along with their resume.",
    optionA: "Every", optionB: "All", optionC: "Much", optionD: "Another",
    correctOption: "B",
    explanation: "'applicants' là danh từ số nhiều, chỉ có 'All' đi được với N số nhiều. Every và Another + N số ít.",
    translation: "Tất cả các ứng viên phải nộp hồ sơ năng lực cùng với sơ yếu lý lịch.",
    tips: "All + N(số nhiều)."
  },
  {
    question: "The new CEO has over 20 years of _____ in the retail industry.",
    optionA: "experience", optionB: "experiences", optionC: "experienced", optionD: "experiencing",
    correctOption: "A",
    explanation: "'Experience' (kinh nghiệm) là danh từ không đếm được nên không có dạng số nhiều.",
    translation: "Tổng giám đốc mới có hơn 20 năm kinh nghiệm trong ngành bán lẻ.",
    tips: "Experience (kinh nghiệm) là không đếm được. Experience (trải nghiệm) đếm được."
  },
  {
    question: "A large number of _____ have complained about the noise.",
    optionA: "resident", optionB: "residents", optionC: "residence", optionD: "residences",
    correctOption: "B",
    explanation: "Sau 'A large number of' là danh từ đếm được số nhiều. 'residents' (cư dân).",
    translation: "Rất nhiều cư dân đã phàn nàn về tiếng ồn.",
    tips: "A number of + N(số nhiều)."
  },
  {
    question: "Please have another _____ of pie if you like.",
    optionA: "piece", optionB: "pieces", optionC: "a piece", optionD: "piece's",
    correctOption: "A",
    explanation: "'another' + danh từ số ít. 'piece' (miếng) là danh từ số ít.",
    translation: "Vui lòng dùng thêm một miếng bánh nữa nếu bạn thích.",
    tips: "another + N(số ít)."
  },
  {
    question: "The hotel offers complimentary _____ to the airport.",
    optionA: "transport", optionB: "transportation", optionC: "transports", optionD: "transporting",
    correctOption: "B",
    explanation: "'transportation' (sự vận chuyển/đưa đón) là danh từ không đếm được, thường dùng trong ngữ cảnh này.",
    translation: "Khách sạn cung cấp dịch vụ đưa đón miễn phí ra sân bay.",
    tips: "complimentary transportation: dịch vụ đưa đón miễn phí."
  },
  {
    question: "The _____ for the new project is set for next Monday.",
    optionA: "deadlines", optionB: "deadline", optionC: "deadlined", optionD: "deadlining",
    correctOption: "B",
    explanation: "Động từ 'is' chia số ít, do đó chủ ngữ 'deadline' phải ở dạng số ít.",
    translation: "Hạn chót cho dự án mới được ấn định vào thứ Hai tới.",
    tips: "Sự hòa hợp chủ vị: V số ít -> N số ít."
  },
  {
    question: "There is an alternative _____ to the problem we are facing.",
    optionA: "solve", optionB: "solution", optionC: "solver", optionD: "solvency",
    correctOption: "B",
    explanation: "Sau tính từ 'alternative' cần danh từ. 'solution' (giải pháp) hợp nghĩa.",
    translation: "Có một giải pháp thay thế cho vấn đề chúng ta đang đối mặt.",
    tips: "alternative solution: giải pháp thay thế."
  },
  {
    question: "Much of the _____ was destroyed in the fire last night.",
    optionA: "equipments", optionB: "equipment", optionC: "an equipment", optionD: "the equipments",
    correctOption: "B",
    explanation: "'equipment' (thiết bị) là danh từ không đếm được, không có 's'.",
    translation: "Phần lớn thiết bị đã bị thiêu rụi trong trận hỏa hoạn đêm qua.",
    tips: "Much of + N(không đếm được)."
  },
  {
    question: "Only _____ members voted in favor of the new policy.",
    optionA: "a little", optionB: "little", optionC: "few", optionD: "a few",
    correctOption: "D",
    explanation: "'members' là danh từ đếm được số nhiều, dùng 'a few' mang ý nghĩa một vài người (khẳng định).",
    translation: "Chỉ có một vài thành viên bỏ phiếu tán thành chính sách mới.",
    tips: "only a few + N(số nhiều)."
  },
  {
    question: "The marketing director presented _____ proposal to the board.",
    optionA: "she", optionB: "hers", optionC: "her", optionD: "herself",
    correctOption: "C",
    explanation: "Trước danh từ 'proposal' cần tính từ sở hữu 'her'.",
    translation: "Giám đốc tiếp thị đã trình bày bản đề xuất của cô ấy trước ban quản trị.",
    tips: "Tính từ sở hữu + N."
  }
];

const tcLesson2 = [
  {
    question: "_____ candidate must pass a written examination.",
    optionA: "All", optionB: "Each", optionC: "Many", optionD: "Some",
    correctOption: "B",
    explanation: "'candidate' ở dạng số ít, do đó phải đi với 'Each' hoặc 'Every'.",
    translation: "Mỗi ứng viên phải vượt qua một bài thi viết.",
    tips: "Each/Every + N(số ít)."
  },
  {
    question: "The store's primary _____ is to ensure customer satisfaction.",
    optionA: "object", optionB: "objection", optionC: "objective", optionD: "objectively",
    correctOption: "C",
    explanation: "'objective' (mục tiêu) là danh từ. Các từ khác không hợp nghĩa.",
    translation: "Mục tiêu chính của cửa hàng là đảm bảo sự hài lòng của khách hàng.",
    tips: "objective = goal = mục tiêu."
  },
  {
    question: "We need an architectural _____ before we can proceed with the construction.",
    optionA: "assess", optionB: "assessor", optionC: "assessment", optionD: "assessing",
    correctOption: "C",
    explanation: "Sau tính từ 'architectural' cần danh từ. 'assessment' (sự đánh giá).",
    translation: "Chúng tôi cần một bản đánh giá kiến trúc trước khi có thể tiếp tục xây dựng.",
    tips: "assessment: sự đánh giá."
  },
  {
    question: "There was a lot of _____ between the two departments.",
    optionA: "cooperate", optionB: "cooperative", optionC: "cooperatively", optionD: "cooperation",
    correctOption: "D",
    explanation: "Sau 'a lot of' cần một danh từ. 'cooperation' (sự hợp tác).",
    translation: "Có rất nhiều sự hợp tác giữa hai bộ phận.",
    tips: "cooperation: sự hợp tác."
  },
  {
    question: "_____ of the employees was given a bonus at the end of the year.",
    optionA: "Some", optionB: "Most", optionC: "Each", optionD: "All",
    correctOption: "C",
    explanation: "Động từ 'was' chia ở số ít, do đó phải dùng 'Each'.",
    translation: "Mỗi một nhân viên đều được nhận tiền thưởng vào cuối năm.",
    tips: "Each of + the + N(số nhiều) + V(số ít)."
  },
  {
    question: "Please read the instruction _____ carefully before operating the machine.",
    optionA: "manual", optionB: "manually", optionC: "manuals", optionD: "manualing",
    correctOption: "A",
    explanation: "'instruction manual' là cụm danh từ ghép nghĩa là 'sách hướng dẫn'.",
    translation: "Vui lòng đọc kỹ sách hướng dẫn trước khi vận hành máy.",
    tips: "instruction manual: sổ tay hướng dẫn."
  },
  {
    question: "The company will hire _____ staff if the workload increases.",
    optionA: "another", optionB: "additional", optionC: "many", optionD: "few",
    correctOption: "B",
    explanation: "'staff' là danh từ tập hợp không đếm được/không có 's'. 'additional' (thêm) đi được với danh từ.",
    translation: "Công ty sẽ thuê thêm nhân viên nếu khối lượng công việc tăng lên.",
    tips: "additional staff: nhân viên bổ sung."
  },
  {
    question: "_____ information regarding the schedule change will be emailed soon.",
    optionA: "Further", optionB: "Farther", optionC: "Many", optionD: "A few",
    correctOption: "A",
    explanation: "'Further information' (thông tin thêm). Information không đếm được nên không dùng Many hay A few.",
    translation: "Thông tin thêm về việc thay đổi lịch trình sẽ được gửi qua email sớm.",
    tips: "further information: thông tin thêm chi tiết."
  },
  {
    question: "The warranty covers the _____ of defective parts for one year.",
    optionA: "replace", optionB: "replaced", optionC: "replacement", optionD: "replacing",
    correctOption: "C",
    explanation: "Cần danh từ sau mạo từ 'the'. 'replacement' (sự thay thế).",
    translation: "Chế độ bảo hành bao gồm việc thay thế các bộ phận bị lỗi trong vòng một năm.",
    tips: "đuôi -ment thường là danh từ."
  },
  {
    question: "Mr. Brown has a great deal of _____ in international trade.",
    optionA: "expert", optionB: "expertise", optionC: "expertly", optionD: "experts",
    correctOption: "B",
    explanation: "'A great deal of' đi với danh từ không đếm được. 'expertise' (chuyên môn) là danh từ không đếm được.",
    translation: "Ông Brown có rất nhiều kiến thức chuyên môn về thương mại quốc tế.",
    tips: "expertise (sự chuyên môn) là N không đếm được."
  }
];

const ncLesson1 = [
  {
    question: "The board of directors reached a _____ regarding the merger after a long debate.",
    optionA: "consensus", optionB: "consent", optionC: "consenting", optionD: "consensual",
    correctOption: "A",
    explanation: "Cụm từ cố định 'reach a consensus' (đạt được sự đồng thuận).",
    translation: "Hội đồng quản trị đã đạt được sự đồng thuận về việc sáp nhập sau một cuộc tranh luận dài.",
    tips: "reach a consensus: đạt được sự đồng thuận."
  },
  {
    question: "Due to the economic downturn, there has been a sharp _____ in consumer spending.",
    optionA: "decline", optionB: "declining", optionC: "declines", optionD: "declined",
    correctOption: "A",
    explanation: "Sau mạo từ 'a' và tính từ 'sharp' cần danh từ số ít 'decline' (sự suy giảm).",
    translation: "Do suy thoái kinh tế, chi tiêu của người tiêu dùng đã sụt giảm mạnh.",
    tips: "a sharp decline in: sự sụt giảm mạnh về..."
  },
  {
    question: "We require a minimum of five years of _____ in the software development industry.",
    optionA: "experience", optionB: "experiences", optionC: "experiencing", optionD: "experienced",
    correctOption: "A",
    explanation: "Danh từ 'experience' mang nghĩa kinh nghiệm làm việc là danh từ không đếm được.",
    translation: "Chúng tôi yêu cầu tối thiểu năm năm kinh nghiệm trong ngành phát triển phần mềm.",
    tips: "years of experience: năm kinh nghiệm."
  },
  {
    question: "The new tax policy will have serious _____ for small business owners.",
    optionA: "imply", optionB: "implies", optionC: "implications", optionD: "implying",
    correctOption: "C",
    explanation: "Sau tính từ 'serious' cần danh từ. 'implications' (hệ quả, ngụ ý).",
    translation: "Chính sách thuế mới sẽ có những hệ quả nghiêm trọng đối với các chủ doanh nghiệp nhỏ.",
    tips: "serious implications: những hệ quả nghiêm trọng."
  },
  {
    question: "The _____ of the new regulations will begin on January 1st.",
    optionA: "enforce", optionB: "enforcement", optionC: "enforcing", optionD: "enforcer",
    correctOption: "B",
    explanation: "Danh từ 'enforcement' (sự thực thi) phù hợp sau mạo từ 'The'.",
    translation: "Việc thực thi các quy định mới sẽ bắt đầu vào ngày 1 tháng 1.",
    tips: "enforcement of regulations: sự thi hành quy định."
  },
  {
    question: "Despite numerous _____, the project was completed on time and under budget.",
    optionA: "obstacle", optionB: "obstacles", optionC: "obstacling", optionD: "obstacled",
    correctOption: "B",
    explanation: "Sau 'numerous' (nhiều) cần danh từ số nhiều 'obstacles' (trở ngại).",
    translation: "Bất chấp vô số trở ngại, dự án đã được hoàn thành đúng hạn và dưới ngân sách.",
    tips: "numerous + N(số nhiều)."
  },
  {
    question: "The city council approved the _____ of the historic building in the downtown area.",
    optionA: "restore", optionB: "restoration", optionC: "restorative", optionD: "restoring",
    correctOption: "B",
    explanation: "Cần danh từ 'restoration' (sự phục hồi, trùng tu).",
    translation: "Hội đồng thành phố đã phê duyệt việc trùng tu tòa nhà lịch sử ở khu vực trung tâm.",
    tips: "restoration: sự khôi phục, trùng tu."
  },
  {
    question: "An individual's _____ to the charity organization is tax-deductible.",
    optionA: "contribute", optionB: "contribution", optionC: "contributing", optionD: "contributor",
    correctOption: "B",
    explanation: "Sau sở hữu cách 'individual's' cần danh từ 'contribution' (sự đóng góp).",
    translation: "Khoản đóng góp của một cá nhân cho tổ chức từ thiện được khấu trừ thuế.",
    tips: "contribution to: sự đóng góp cho."
  },
  {
    question: "The software provides comprehensive _____ for data analysis.",
    optionA: "capably", optionB: "capabilities", optionC: "capable", optionD: "capableness",
    correctOption: "B",
    explanation: "Sau tính từ 'comprehensive' cần danh từ 'capabilities' (những khả năng/tính năng).",
    translation: "Phần mềm cung cấp các tính năng toàn diện cho việc phân tích dữ liệu.",
    tips: "capabilities: năng lực, khả năng."
  },
  {
    question: "Strict _____ with safety protocols is required for all lab personnel.",
    optionA: "comply", optionB: "compliance", optionC: "compliant", optionD: "complies",
    correctOption: "B",
    explanation: "Danh từ 'compliance' (sự tuân thủ) đi với giới từ 'with'.",
    translation: "Sự tuân thủ nghiêm ngặt các quy trình an toàn là bắt buộc đối với tất cả nhân viên phòng thí nghiệm.",
    tips: "in compliance with / compliance with: sự tuân thủ với."
  }
];

const ncLesson2 = [
  {
    question: "A significant _____ of our revenue comes from overseas markets.",
    optionA: "proportion", optionB: "propose", optionC: "proposing", optionD: "proposal",
    correctOption: "A",
    explanation: "Danh từ 'proportion' (tỷ lệ, phần) hợp nghĩa nhất: 'a significant proportion of' (một phần đáng kể của).",
    translation: "Một phần đáng kể doanh thu của chúng tôi đến từ các thị trường nước ngoài.",
    tips: "a significant proportion of = a large part of."
  },
  {
    question: "The CEO expressed his _____ over the recent drop in sales.",
    optionA: "concern", optionB: "concerned", optionC: "concerning", optionD: "concerns",
    correctOption: "A",
    explanation: "'concern' (sự lo ngại) là danh từ không đếm được hoặc đếm được. Trong cụm 'express one's concern over', dùng số ít 'concern'.",
    translation: "Giám đốc điều hành bày tỏ sự lo ngại về sự sụt giảm doanh số gần đây.",
    tips: "express concern over: bày tỏ sự lo ngại về."
  },
  {
    question: "The sudden _____ of the CEO left the company in a state of uncertainty.",
    optionA: "depart", optionB: "departure", optionC: "departing", optionD: "departed",
    correctOption: "B",
    explanation: "Danh từ 'departure' (sự rời đi, từ chức).",
    translation: "Sự ra đi đột ngột của Giám đốc điều hành đã để lại công ty trong tình trạng bất ổn.",
    tips: "sudden departure: sự rời đi đột ngột."
  },
  {
    question: "Employees are reminded to renew their parking _____ by the end of the month.",
    optionA: "permits", optionB: "permit", optionC: "permitting", optionD: "permission",
    correctOption: "A",
    explanation: "'parking permit' (thẻ đỗ xe) là danh từ đếm được. Do có nhiều nhân viên (Employees), từ này chia số nhiều 'permits'. 'permission' không đếm được.",
    translation: "Nhân viên được nhắc nhở gia hạn thẻ đỗ xe trước cuối tháng.",
    tips: "parking permit (N đếm được): vé/thẻ đỗ xe. permission (N không đếm được): sự cho phép."
  },
  {
    question: "To ensure maximum _____, the assembly line has been entirely automated.",
    optionA: "efficient", optionB: "efficiency", optionC: "efficiently", optionD: "efficiencies",
    correctOption: "B",
    explanation: "Sau tính từ 'maximum' cần danh từ 'efficiency' (hiệu suất).",
    translation: "Để đảm bảo hiệu suất tối đa, dây chuyền lắp ráp đã được tự động hóa hoàn toàn.",
    tips: "maximum efficiency: hiệu suất tối đa."
  },
  {
    question: "The author's latest book offers profound _____ into the history of economics.",
    optionA: "insight", optionB: "insights", optionC: "insightful", optionD: "insightfully",
    correctOption: "B",
    explanation: "Danh từ 'insights' (sự hiểu biết sâu sắc) đếm được, thường dùng ở số nhiều khi đi với 'offer/provide insights into'.",
    translation: "Cuốn sách mới nhất của tác giả cung cấp những hiểu biết sâu sắc về lịch sử kinh tế.",
    tips: "offer/provide insights into: cung cấp hiểu biết sâu sắc về."
  },
  {
    question: "We must take into consideration the cultural _____ of our target audience.",
    optionA: "prefer", optionB: "preferences", optionC: "preferable", optionD: "preferably",
    correctOption: "B",
    explanation: "Danh từ 'preferences' (sở thích, sự ưu tiên).",
    translation: "Chúng ta phải tính đến các sở thích văn hóa của khán giả mục tiêu.",
    tips: "cultural preferences: sở thích văn hóa."
  },
  {
    question: "There is a general _____ among experts that inflation will rise next year.",
    optionA: "agree", optionB: "agreeable", optionC: "agreement", optionD: "agreeably",
    correctOption: "C",
    explanation: "Cụm danh từ 'a general agreement' (sự đồng tình chung).",
    translation: "Có một sự đồng tình chung giữa các chuyên gia rằng lạm phát sẽ tăng vào năm tới.",
    tips: "general agreement: sự đồng thuận chung."
  },
  {
    question: "The success of the campaign is a direct result of our team's _____.",
    optionA: "dedicate", optionB: "dedicated", optionC: "dedication", optionD: "dedicating",
    correctOption: "C",
    explanation: "Danh từ 'dedication' (sự cống hiến) đứng sau sở hữu cách.",
    translation: "Thành công của chiến dịch là kết quả trực tiếp của sự cống hiến của đội chúng ta.",
    tips: "dedication (to): sự cống hiến (cho)."
  },
  {
    question: "All visitors are subject to a thorough security _____ before entering the building.",
    optionA: "inspect", optionB: "inspector", optionC: "inspection", optionD: "inspected",
    correctOption: "C",
    explanation: "Cụm danh từ 'security inspection' (việc kiểm tra an ninh).",
    translation: "Tất cả khách tham quan đều phải chịu sự kiểm tra an ninh kỹ lưỡng trước khi vào tòa nhà.",
    tips: "security inspection: kiểm tra an ninh."
  }
];

async function run() {
  console.log("Generating Topic 1: Cấu trúc Chủ ngữ & Danh từ with 3 levels...");
  
  const levelsData = [
    { level: "Cơ Bản", slug: "co-ban", lessons: [ { title: "Lesson 1", questions: cbLesson1 }, { title: "Lesson 2", questions: cbLesson2 } ] },
    { level: "Trung Cấp", slug: "trung-cap", lessons: [ { title: "Lesson 1", questions: tcLesson1 }, { title: "Lesson 2", questions: tcLesson2 } ] },
    { level: "Nâng Cao", slug: "nang-cao", lessons: [ { title: "Lesson 1", questions: ncLesson1 }, { title: "Lesson 2", questions: ncLesson2 } ] }
  ];

  for (const l of levelsData) {
    const slug = `cau-truc-chu-ngu-${l.slug}`;
    
    // Check exist
    const exist = await prisma.toeicGrammarTopic.findFirst({ where: { slug } });
    if (exist) {
      console.log(`Topic ${slug} already exists, skipping...`);
      continue;
    }

    const topic = await prisma.toeicGrammarTopic.create({
      data: {
        title: "Cấu trúc Chủ ngữ & Danh từ",
        subtitle: `Nắm vững cấu trúc Chủ ngữ và Danh từ ở cấp độ ${l.level}`,
        slug: slug,
        level: l.level,
        type: 'GRAMMAR',
        part: 5
      }
    });

    let order = 1;
    for (const lessonData of l.lessons) {
      const lesson = await prisma.toeicGrammarLesson.create({
        data: {
          topicId: topic.id,
          title: `Bài tập: Chủ ngữ & Danh từ (${lessonData.title})`,
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
    console.log(`Created Topic: ${slug} with 2 lessons and 20 questions total.`);
  }

  console.log("Topic 1 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
