import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const cbLesson1 = [
  {
    question: "The director _____ a speech at the conference every year.",
    optionA: "give", optionB: "gives", optionC: "giving", optionD: "are giving",
    correctOption: "B",
    explanation: "Chủ ngữ 'The director' là danh từ số ít (ngôi thứ 3 số ít), động từ phải thêm 's' hoặc 'es'.",
    translation: "Giám đốc phát biểu tại hội nghị mỗi năm.",
    tips: "Chủ ngữ số ít -> Động từ thêm s/es."
  },
  {
    question: "Many students _____ participated in the volunteer program.",
    optionA: "has", optionB: "have", optionC: "is", optionD: "was",
    correctOption: "B",
    explanation: "Chủ ngữ 'Many students' là số nhiều, nên trợ động từ cho thì HTHT là 'have'.",
    translation: "Nhiều học sinh đã tham gia chương trình tình nguyện.",
    tips: "Many + N(số nhiều) -> Động từ số nhiều (have/are/were)."
  },
  {
    question: "A large number of applicants _____ already submitted their resumes.",
    optionA: "has", optionB: "have", optionC: "is", optionD: "does",
    correctOption: "B",
    explanation: "Cấu trúc 'A number of' + Danh từ số nhiều -> Động từ chia ở số nhiều.",
    translation: "Một số lượng lớn ứng viên đã nộp sơ yếu lý lịch của họ.",
    tips: "A number of + N(số nhiều) -> Động từ số nhiều."
  },
  {
    question: "Every employee _____ required to wear a name tag at all times.",
    optionA: "is", optionB: "are", optionC: "were", optionD: "have been",
    correctOption: "A",
    explanation: "Đại từ 'Every' + danh từ số ít luôn đi kèm với động từ số ít.",
    translation: "Mỗi nhân viên đều được yêu cầu đeo bảng tên mọi lúc.",
    tips: "Every/Each + N(số ít) -> Động từ số ít."
  },
  {
    question: "The information provided in these documents _____ very helpful.",
    optionA: "are", optionB: "is", optionC: "were", optionD: "have been",
    correctOption: "B",
    explanation: "Chủ ngữ chính là 'The information' (danh từ không đếm được, luôn chia số ít). Cụm 'provided in these documents' chỉ bổ nghĩa cho chủ ngữ.",
    translation: "Thông tin được cung cấp trong các tài liệu này rất hữu ích.",
    tips: "Danh từ không đếm được (information, equipment, advice...) -> V số ít."
  },
  {
    question: "Neither of the printers _____ working properly today.",
    optionA: "are", optionB: "is", optionC: "were", optionD: "have been",
    correctOption: "B",
    explanation: "Cấu trúc 'Neither of + N(số nhiều)' thường đi với động từ số ít trong ngữ pháp chuẩn (đôi khi số nhiều trong văn nói, nhưng TOEIC chọn số ít).",
    translation: "Không có máy in nào đang hoạt động bình thường vào hôm nay.",
    tips: "Neither of / Either of + N(số nhiều) -> V số ít."
  },
  {
    question: "Five hundred dollars _____ a lot of money to spend on a single meal.",
    optionA: "are", optionB: "were", optionC: "is", optionD: "have been",
    correctOption: "C",
    explanation: "Các đại lượng chỉ thời gian, tiền bạc, khoảng cách dù ở dạng số nhiều vẫn được coi là một tổng thể -> chia động từ số ít.",
    translation: "Năm trăm đô la là một số tiền lớn để chi cho một bữa ăn duy nhất.",
    tips: "Số tiền / Khoảng cách / Thời gian -> Động từ số ít."
  },
  {
    question: "The team _____ currently working on a new software project.",
    optionA: "is", optionB: "are", optionC: "has", optionD: "have",
    correctOption: "A",
    explanation: "Danh từ tập hợp 'The team' khi được xem như một đơn vị thống nhất sẽ chia động từ số ít.",
    translation: "Nhóm hiện đang làm việc trên một dự án phần mềm mới.",
    tips: "Team, family, committee, government (hoạt động như 1 khối) -> V số ít."
  },
  {
    question: "Physics _____ a required subject for engineering students.",
    optionA: "are", optionB: "is", optionC: "were", optionD: "have been",
    correctOption: "B",
    explanation: "Tên các môn học kết thúc bằng 's' (Physics, Mathematics, Economics...) là danh từ số ít.",
    translation: "Vật lý là một môn học bắt buộc đối với sinh viên kỹ thuật.",
    tips: "Tên môn học có chữ 's' ở cuối -> Động từ số ít."
  },
  {
    question: "Someone _____ left their umbrella in the waiting room.",
    optionA: "have", optionB: "has", optionC: "are", optionD: "is",
    correctOption: "B",
    explanation: "Các đại từ bất định (someone, anyone, everybody, nobody...) luôn đi với động từ số ít.",
    translation: "Ai đó đã để quên chiếc ô của họ trong phòng chờ.",
    tips: "Đại từ bất định (everyone, someone, nobody...) -> Động từ số ít."
  }
];

const cbLesson2 = [
  {
    question: "Each of the participants _____ given a certificate of completion.",
    optionA: "were", optionB: "was", optionC: "have been", optionD: "are",
    correctOption: "B",
    explanation: "Cấu trúc 'Each of + N(số nhiều)' luôn chia động từ ở số ít.",
    translation: "Mỗi người tham gia đã được trao một chứng chỉ hoàn thành.",
    tips: "Each of + N(số nhiều) -> V số ít."
  },
  {
    question: "The luggage _____ safely loaded onto the plane.",
    optionA: "were", optionB: "was", optionC: "have been", optionD: "are",
    correctOption: "B",
    explanation: "Danh từ 'luggage' (hành lý) là danh từ không đếm được, chia động từ số ít.",
    translation: "Hành lý đã được chất an toàn lên máy bay.",
    tips: "Luggage, baggage (không đếm được) -> V số ít."
  },
  {
    question: "A pair of shoes _____ left near the entrance.",
    optionA: "was", optionB: "were", optionC: "have been", optionD: "are",
    correctOption: "A",
    explanation: "Chủ ngữ là 'A pair' (một đôi) là số ít, nên động từ chia số ít. (Nếu là 'Two pairs' thì chia số nhiều).",
    translation: "Một đôi giày đã bị bỏ lại gần lối vào.",
    tips: "A pair of + N(số nhiều) -> V số ít."
  },
  {
    question: "The CEO and founder of the company _____ retiring next year.",
    optionA: "are", optionB: "is", optionC: "were", optionD: "have been",
    correctOption: "B",
    explanation: "Hai danh từ nối bằng 'and' nhưng chỉ cùng MỘT người (giám đốc kiêm người sáng lập, vì không có 'the' trước founder) -> chia động từ số ít.",
    translation: "Giám đốc điều hành kiêm người sáng lập công ty sẽ nghỉ hưu vào năm tới.",
    tips: "The N1 and N2 (chỉ 1 người/vật) -> V số ít. The N1 and the N2 (2 người) -> V số nhiều."
  },
  {
    question: "Two hours _____ not enough time to finish this complex task.",
    optionA: "are", optionB: "were", optionC: "is", optionD: "have been",
    correctOption: "C",
    explanation: "Khoảng thời gian (Two hours) được xem là một tổng thể duy nhất -> chia động từ số ít.",
    translation: "Hai giờ là không đủ thời gian để hoàn thành nhiệm vụ phức tạp này.",
    tips: "Khoảng thời gian / Khoảng cách -> V số ít."
  },
  {
    question: "There _____ a lot of people waiting in line for the concert tickets.",
    optionA: "is", optionB: "are", optionC: "was", optionD: "has been",
    correctOption: "B",
    explanation: "Trong cấu trúc 'There is/are', động từ chia theo danh từ đứng ngay sau nó. 'a lot of people' là danh từ số nhiều -> are.",
    translation: "Có rất nhiều người đang xếp hàng chờ mua vé xem hòa nhạc.",
    tips: "There + be + N. Động từ be chia theo N."
  },
  {
    question: "None of the information _____ accurate.",
    optionA: "are", optionB: "were", optionC: "have been", optionD: "is",
    correctOption: "D",
    explanation: "'None of' + danh từ không đếm được (information) -> chia động từ số ít.",
    translation: "Không có thông tin nào là chính xác.",
    tips: "None of + N(không đếm được) -> V số ít."
  },
  {
    question: "My glasses _____ broken during the trip.",
    optionA: "was", optionB: "is", optionC: "were", optionD: "has been",
    correctOption: "C",
    explanation: "Các danh từ chỉ đồ vật gồm 2 phần bằng nhau như 'glasses' (kính), 'scissors' (kéo), 'pants' (quần) luôn là danh từ số nhiều.",
    translation: "Kính của tôi đã bị vỡ trong chuyến đi.",
    tips: "glasses, scissors, pants -> V số nhiều."
  },
  {
    question: "Mathematics _____ always been my favorite subject.",
    optionA: "have", optionB: "has", optionC: "are", optionD: "were",
    correctOption: "B",
    explanation: "'Mathematics' là môn toán (số ít), dùng trợ động từ số ít trong thì Hiện tại hoàn thành.",
    translation: "Toán học luôn là môn học yêu thích của tôi.",
    tips: "Tên môn học (Mathematics, Physics) -> V số ít."
  },
  {
    question: "All of the equipment _____ inspected regularly.",
    optionA: "are", optionB: "were", optionC: "is", optionD: "have been",
    correctOption: "C",
    explanation: "'All of' chia theo danh từ đứng sau nó. 'equipment' là danh từ không đếm được (số ít) -> is.",
    translation: "Tất cả các thiết bị đều được kiểm tra thường xuyên.",
    tips: "All of / Most of / Some of + N(không đếm được) -> V số ít."
  }
];

const tcLesson1 = [
  {
    question: "The number of employees who _____ by bus has increased.",
    optionA: "commute", optionB: "commutes", optionC: "commuting", optionD: "is commuting",
    correctOption: "A",
    explanation: "Mệnh đề quan hệ 'who commute' bổ nghĩa cho danh từ số nhiều 'employees' ngay trước nó, nên 'commute' chia ở dạng số nhiều. Lưu ý: động từ chính của câu là 'has increased' chia theo 'The number of'.",
    translation: "Số lượng nhân viên đi làm bằng xe buýt đã tăng lên.",
    tips: "Trong mệnh đề quan hệ, động từ chia theo danh từ mà đại từ quan hệ (who, which, that) thay thế."
  },
  {
    question: "Neither the manager nor the employees _____ aware of the new schedule.",
    optionA: "was", optionB: "is", optionC: "has been", optionD: "were",
    correctOption: "D",
    explanation: "Cấu trúc 'Neither S1 nor S2', động từ chia theo chủ ngữ gần nó nhất (S2). 'the employees' số nhiều -> were.",
    translation: "Cả người quản lý lẫn nhân viên đều không biết về lịch trình mới.",
    tips: "Either/Neither S1 or/nor S2 -> Động từ chia theo S2."
  },
  {
    question: "Not only the CEO but also the board members _____ attending the seminar.",
    optionA: "is", optionB: "are", optionC: "was", optionD: "has been",
    correctOption: "B",
    explanation: "Cấu trúc 'Not only S1 but also S2', động từ chia theo S2. 'the board members' số nhiều -> are.",
    translation: "Không chỉ Giám đốc điều hành mà cả các thành viên hội đồng quản trị cũng đang tham dự buổi hội thảo.",
    tips: "Not only S1 but also S2 -> Động từ chia theo S2."
  },
  {
    question: "The committee, along with the advisors, _____ scheduled to meet at 3 PM.",
    optionA: "are", optionB: "have been", optionC: "is", optionD: "were",
    correctOption: "C",
    explanation: "Chủ ngữ 1 + along with/together with/as well as + Chủ ngữ 2 -> Động từ chia theo Chủ ngữ 1 ('The committee' - xem như 1 khối số ít -> is).",
    translation: "Ủy ban, cùng với các cố vấn, được lên lịch họp lúc 3 giờ chiều.",
    tips: "S1 along with S2 -> Động từ chia theo S1."
  },
  {
    question: "A large percentage of the profits _____ reinvested into research and development.",
    optionA: "is", optionB: "are", optionC: "was", optionD: "has",
    correctOption: "B",
    explanation: "'A percentage of' hoặc phân số chia theo danh từ đứng sau 'of'. 'the profits' là số nhiều -> are.",
    translation: "Một tỷ lệ lớn lợi nhuận được tái đầu tư vào nghiên cứu và phát triển.",
    tips: "Percentage/Phân số + of + N(số nhiều) -> V số nhiều."
  },
  {
    question: "There _____ a pen, two pencils, and an eraser on the desk.",
    optionA: "is", optionB: "are", optionC: "were", optionD: "have been",
    correctOption: "A",
    explanation: "Trong cấu trúc 'There is/are', nếu sau nó là một danh sách các vật, động từ chia theo danh từ đầu tiên của danh sách. 'a pen' (số ít) -> is.",
    translation: "Có một cái bút mực, hai cái bút chì và một cục tẩy trên bàn.",
    tips: "There + be + Danh sách: Động từ chia theo danh từ đứng gần nó nhất."
  },
  {
    question: "Everyone except the security guards _____ left the building.",
    optionA: "have", optionB: "has", optionC: "are", optionD: "were",
    correctOption: "B",
    explanation: "Chủ ngữ chính là 'Everyone' (đại từ bất định -> số ít). Phần 'except the security guards' chỉ là giới từ bổ nghĩa, không ảnh hưởng đến động từ.",
    translation: "Mọi người ngoại trừ các nhân viên bảo vệ đều đã rời khỏi tòa nhà.",
    tips: "Everyone/Everybody/No one + except/but N -> Động từ vẫn chia số ít theo Everyone."
  },
  {
    question: "The United States _____ a major trading partner of ours.",
    optionA: "are", optionB: "were", optionC: "is", optionD: "have been",
    correctOption: "C",
    explanation: "Tên một quốc gia, tổ chức, hoặc tựa đề sách dù kết thúc bằng 's' vẫn là danh từ số ít.",
    translation: "Hoa Kỳ là một đối tác thương mại lớn của chúng tôi.",
    tips: "Tên quốc gia (The United States, The Philippines) -> V số ít."
  },
  {
    question: "The poor _____ often neglected in rural development policies.",
    optionA: "is", optionB: "was", optionC: "has been", optionD: "are",
    correctOption: "D",
    explanation: "Cấu trúc 'The + Tính từ' dùng để chỉ một nhóm người mang đặc điểm đó (The poor = người nghèo), đây là danh từ số nhiều -> are.",
    translation: "Người nghèo thường bị bỏ quên trong các chính sách phát triển nông thôn.",
    tips: "The + Tính từ (The rich, the poor, the elderly) -> V số nhiều."
  },
  {
    question: "Ten miles _____ a long distance to walk in this hot weather.",
    optionA: "are", optionB: "were", optionC: "is", optionD: "have been",
    correctOption: "C",
    explanation: "Khoảng cách (Ten miles) được coi là một đơn vị đo lường duy nhất -> chia động từ số ít.",
    translation: "Mười dặm là một khoảng cách dài để đi bộ trong thời tiết nóng bức này.",
    tips: "Khoảng cách / Tiền / Thời gian -> V số ít."
  }
];

const tcLesson2 = [
  {
    question: "Either the marketing strategy or the product design _____ to be updated.",
    optionA: "need", optionB: "needs", optionC: "are needing", optionD: "have needed",
    correctOption: "B",
    explanation: "Cấu trúc 'Either S1 or S2', động từ chia theo S2 ('the product design' - số ít) -> needs.",
    translation: "Hoặc chiến lược tiếp thị hoặc thiết kế sản phẩm cần phải được cập nhật.",
    tips: "Either S1 or S2 -> V chia theo S2."
  },
  {
    question: "More than one applicant _____ for an extension of the deadline.",
    optionA: "have asked", optionB: "are asking", optionC: "has asked", optionD: "were asking",
    correctOption: "C",
    explanation: "Cấu trúc 'More than one + N(số ít)' luôn đi kèm với động từ số ít, mặc dù ý nghĩa là số nhiều (nhiều hơn một).",
    translation: "Nhiều hơn một ứng viên đã yêu cầu gia hạn thời hạn nộp đơn.",
    tips: "More than one + N(số ít) -> V số ít."
  },
  {
    question: "The majority of the committee members _____ against the proposal.",
    optionA: "is", optionB: "are", optionC: "was", optionD: "has been",
    correctOption: "B",
    explanation: "'The majority of' chia theo danh từ đứng sau 'of'. 'members' là số nhiều -> are.",
    translation: "Đa số các thành viên ủy ban phản đối đề xuất.",
    tips: "The majority of + N(số nhiều) -> V số nhiều."
  },
  {
    question: "The staff _____ currently divided on whether to accept the new policy.",
    optionA: "is", optionB: "has been", optionC: "are", optionD: "was",
    correctOption: "C",
    explanation: "Danh từ tập hợp 'The staff' khi muốn nhấn mạnh đến từng cá nhân (đang bị chia rẽ ý kiến) thì động từ chia ở dạng số nhiều -> are.",
    translation: "Nhân viên hiện đang bị chia rẽ ý kiến về việc có nên chấp nhận chính sách mới hay không.",
    tips: "Danh từ tập hợp nhấn mạnh cá nhân (divided, arguing) -> V số nhiều."
  },
  {
    question: "Half of the cake _____ already been eaten by the children.",
    optionA: "have", optionB: "has", optionC: "are", optionD: "is",
    correctOption: "B",
    explanation: "Phân số (Half) chia theo danh từ đứng sau 'of'. 'the cake' là số ít -> has.",
    translation: "Trẻ em đã ăn hết một nửa cái bánh.",
    tips: "Phân số + of + N(số ít) -> V số ít."
  },
  {
    question: "Both the CEO and the CFO _____ approved the new budget.",
    optionA: "has", optionB: "is", optionC: "have", optionD: "was",
    correctOption: "C",
    explanation: "Cấu trúc 'Both S1 and S2' luôn chia động từ ở số nhiều.",
    translation: "Cả Giám đốc điều hành và Giám đốc tài chính đều đã phê duyệt ngân sách mới.",
    tips: "Both A and B -> V số nhiều."
  },
  {
    question: "The news about the company's bankruptcy _____ a shock to everyone.",
    optionA: "were", optionB: "have been", optionC: "are", optionD: "was",
    correctOption: "D",
    explanation: "Từ 'news' (tin tức) mặc dù tận cùng bằng 's' nhưng luôn là danh từ không đếm được (số ít) -> was.",
    translation: "Tin tức về việc công ty phá sản là một cú sốc đối với mọi người.",
    tips: "News -> V số ít."
  },
  {
    question: "My colleague as well as my supervisor _____ supportive of my new project.",
    optionA: "are", optionB: "is", optionC: "were", optionD: "have been",
    correctOption: "B",
    explanation: "S1 + as well as + S2 -> Động từ chia theo S1 ('My colleague' - số ít) -> is.",
    translation: "Đồng nghiệp cũng như sếp của tôi đều ủng hộ dự án mới của tôi.",
    tips: "S1 as well as S2 -> V chia theo S1."
  },
  {
    question: "A number of crucial issues _____ discussed during the meeting.",
    optionA: "was", optionB: "is", optionC: "were", optionD: "has been",
    correctOption: "C",
    explanation: "'A number of' (nhiều) + N(số nhiều) -> V số nhiều.",
    translation: "Một số vấn đề quan trọng đã được thảo luận trong cuộc họp.",
    tips: "A number of + N(nhiều) -> V(nhiều)."
  },
  {
    question: "None of the applicants _____ fully qualified for the position.",
    optionA: "was", optionB: "is", optionC: "has been", optionD: "were",
    correctOption: "D",
    explanation: "'None of' + danh từ số nhiều (applicants). Trong ngữ pháp chuẩn, có thể dùng số ít hoặc số nhiều, nhưng số nhiều ('were') phổ biến hơn và tự nhiên hơn trong ngữ cảnh số nhiều.",
    translation: "Không có ứng viên nào hoàn toàn đủ điều kiện cho vị trí này.",
    tips: "None of + N(số nhiều) -> V(thường chia số nhiều)."
  }
];

const ncLesson1 = [
  {
    question: "Statistics _____ a difficult course for many college freshmen.",
    optionA: "are", optionB: "were", optionC: "is", optionD: "have been",
    correctOption: "C",
    explanation: "Khi 'Statistics' mang nghĩa là một MÔN HỌC (Môn thống kê), nó được coi là danh từ số ít.",
    translation: "Thống kê là một khóa học khó đối với nhiều sinh viên đại học năm nhất.",
    tips: "Tên môn học (Statistics, Economics) -> V số ít."
  },
  {
    question: "The latest statistics _____ that our marketing campaign was highly successful.",
    optionA: "shows", optionB: "show", optionC: "is showing", optionD: "has shown",
    correctOption: "B",
    explanation: "Khi 'statistics' mang nghĩa là 'số liệu thống kê' (không phải môn học), nó là danh từ số nhiều -> show.",
    translation: "Các số liệu thống kê mới nhất cho thấy chiến dịch tiếp thị của chúng ta rất thành công.",
    tips: "Statistics (số liệu) -> V số nhiều."
  },
  {
    question: "The Japanese _____ known for their incredible work ethic and discipline.",
    optionA: "is", optionB: "has been", optionC: "are", optionD: "was",
    correctOption: "C",
    explanation: "Cấu trúc 'The + quốc tịch tận cùng là -ese hoặc -sh/ch' dùng để chỉ toàn bộ người dân nước đó -> danh từ số nhiều.",
    translation: "Người Nhật Bản được biết đến với đạo đức nghề nghiệp và kỷ luật đáng kinh ngạc.",
    tips: "The Japanese/English/French -> V số nhiều."
  },
  {
    question: "There _____ a number of reasons why the project was delayed.",
    optionA: "is", optionB: "has been", optionC: "was", optionD: "are",
    correctOption: "D",
    explanation: "Trong cấu trúc 'There is/are', động từ chia theo danh từ phía sau. 'a number of reasons' mang nghĩa số nhiều -> are.",
    translation: "Có một số lý do khiến dự án bị trì hoãn.",
    tips: "There + be + a number of N(nhiều) -> are/were."
  },
  {
    question: "Not only the software but also the hardware components _____ upgraded recently.",
    optionA: "has been", optionB: "was", optionC: "have been", optionD: "is",
    correctOption: "C",
    explanation: "Cấu trúc 'Not only S1 but also S2', chia theo S2 ('components' - số nhiều). Dấu hiệu 'recently' -> Hiện tại hoàn thành (have been).",
    translation: "Không chỉ phần mềm mà cả các thành phần phần cứng cũng đã được nâng cấp gần đây.",
    tips: "Not only S1 but also S2 -> V theo S2."
  },
  {
    question: "A high percentage of the workforce _____ from home nowadays.",
    optionA: "work", optionB: "works", optionC: "are working", optionD: "have worked",
    correctOption: "B",
    explanation: "'percentage of' chia theo danh từ đứng sau. 'workforce' là danh từ tập hợp, thường đếm được chia ở số ít trong ngữ cảnh này -> works.",
    translation: "Một tỷ lệ lớn lực lượng lao động đang làm việc tại nhà hiện nay.",
    tips: "Percentage of + Danh từ tập hợp số ít -> V số ít."
  },
  {
    question: "The rich _____ legally obligated to pay higher taxes in this country.",
    optionA: "is", optionB: "was", optionC: "are", optionD: "has been",
    correctOption: "C",
    explanation: "'The + Tính từ' (The rich) chỉ tập hợp người -> danh từ số nhiều.",
    translation: "Người giàu có nghĩa vụ pháp lý phải trả thuế cao hơn ở quốc gia này.",
    tips: "The rich, the elderly, the homeless -> V số nhiều."
  },
  {
    question: "One of the most pressing issues facing our company _____ high employee turnover.",
    optionA: "are", optionB: "is", optionC: "were", optionD: "have been",
    correctOption: "B",
    explanation: "Cấu trúc 'One of + N(số nhiều)', chủ ngữ chính là 'One' -> động từ luôn chia số ít.",
    translation: "Một trong những vấn đề cấp bách nhất mà công ty chúng ta phải đối mặt là tỷ lệ nhân viên nghỉ việc cao.",
    tips: "One of + N(số nhiều) -> V số ít."
  },
  {
    question: "Measles _____ a highly contagious infectious disease.",
    optionA: "are", optionB: "were", optionC: "have been", optionD: "is",
    correctOption: "D",
    explanation: "Các loại bệnh tật tận cùng là 's' (Measles - bệnh sởi, Rabies, Mumps) là danh từ số ít.",
    translation: "Bệnh sởi là một bệnh truyền nhiễm có khả năng lây lan cao.",
    tips: "Tên bệnh (Measles, Mumps) -> V số ít."
  },
  {
    question: "Two-thirds of the city _____ destroyed during the earthquake.",
    optionA: "were", optionB: "have been", optionC: "was", optionD: "are",
    correctOption: "C",
    explanation: "Phân số (Two-thirds) chia theo danh từ sau 'of'. 'the city' là số ít -> was.",
    translation: "Hai phần ba thành phố đã bị phá hủy trong trận động đất.",
    tips: "Phân số + of + N(số ít) -> V số ít."
  }
];

const ncLesson2 = [
  {
    question: "Every man, woman, and child _____ the right to clean drinking water.",
    optionA: "have", optionB: "has", optionC: "are having", optionD: "were having",
    correctOption: "B",
    explanation: "Cho dù có bao nhiêu danh từ được liệt kê sau 'Every', chủ ngữ vẫn được tính là số ít.",
    translation: "Mọi đàn ông, phụ nữ và trẻ em đều có quyền được sử dụng nước uống sạch.",
    tips: "Every N1, N2, and N3 -> V số ít."
  },
  {
    question: "The majority of the information we received _____ completely false.",
    optionA: "were", optionB: "are", optionC: "have been", optionD: "was",
    correctOption: "D",
    explanation: "'The majority of' chia theo danh từ đứng sau. 'information' là danh từ không đếm được -> was.",
    translation: "Phần lớn thông tin mà chúng tôi nhận được là hoàn toàn sai lệch.",
    tips: "Majority of + N(không đếm được) -> V số ít."
  },
  {
    question: "Either the CEO or the department heads _____ responsible for this decision.",
    optionA: "is", optionB: "has been", optionC: "are", optionD: "was",
    correctOption: "C",
    explanation: "Cấu trúc 'Either S1 or S2', động từ chia theo S2 ('the department heads' - số nhiều) -> are.",
    translation: "Giám đốc điều hành hoặc các trưởng bộ phận chịu trách nhiệm về quyết định này.",
    tips: "Either S1 or S2 -> V chia theo S2."
  },
  {
    question: "The acoustics in this new auditorium _____ surprisingly excellent.",
    optionA: "is", optionB: "are", optionC: "was", optionD: "has been",
    correctOption: "B",
    explanation: "'acoustics' mang nghĩa đặc tính âm thanh của một căn phòng thì là danh từ số nhiều. (Chỉ dùng số ít khi nó mang nghĩa môn học Âm học).",
    translation: "Đặc tính âm thanh trong khán phòng mới này cực kỳ tuyệt vời.",
    tips: "Acoustics (đặc tính âm) -> V số nhiều."
  },
  {
    question: "Many a student _____ struggling with the complexity of the new software.",
    optionA: "are", optionB: "were", optionC: "have been", optionD: "is",
    correctOption: "D",
    explanation: "Cấu trúc đặc biệt 'Many a + N(số ít)' mang nghĩa số nhiều ('nhiều học sinh') nhưng động từ bắt buộc phải chia ở SỐ ÍT.",
    translation: "Nhiều học sinh đang gặp khó khăn với độ phức tạp của phần mềm mới.",
    tips: "Many a + N(số ít) -> V số ít."
  },
  {
    question: "The sheep in the meadow _____ grazing peacefully all morning.",
    optionA: "has been", optionB: "is", optionC: "have been", optionD: "was",
    correctOption: "C",
    explanation: "'sheep' là danh từ có dạng số ít và số nhiều giống nhau. Trong ngữ cảnh 'in the meadow' ngụ ý một bầy cừu -> chia số nhiều (have been).",
    translation: "Đàn cừu trên đồng cỏ đã gặm cỏ một cách yên bình suốt cả buổi sáng.",
    tips: "Sheep, deer, fish (số nhiều không có s) -> V số nhiều tùy ngữ cảnh."
  },
  {
    question: "It is not the managers but the CEO who _____ the final say in this matter.",
    optionA: "has", optionB: "have", optionC: "are having", optionD: "were having",
    correctOption: "A",
    explanation: "Cấu trúc 'Not S1 but S2', động từ trong mệnh đề quan hệ (who) chia theo S2 ('the CEO' - số ít) -> has.",
    translation: "Không phải các nhà quản lý mà chính Giám đốc điều hành mới là người có tiếng nói cuối cùng trong vấn đề này.",
    tips: "Not S1 but S2 -> V chia theo S2."
  },
  {
    question: "Three-quarters of the applicants _____ rejected during the initial screening.",
    optionA: "was", optionB: "were", optionC: "has been", optionD: "is",
    correctOption: "B",
    explanation: "Phân số (Three-quarters) chia theo danh từ 'applicants' (số nhiều) -> were.",
    translation: "Ba phần tư số ứng viên đã bị từ chối trong đợt sàng lọc ban đầu.",
    tips: "Phân số + of + N(số nhiều) -> V số nhiều."
  },
  {
    question: "A pair of tweezers _____ needed to properly extract the tiny component.",
    optionA: "are", optionB: "were", optionC: "have been", optionD: "is",
    correctOption: "D",
    explanation: "Từ 'tweezers' (cái nhíp) luôn là số nhiều. Nhưng khi có 'A pair of', chủ ngữ chính là 'A pair' (số ít) -> is.",
    translation: "Cần có một cái nhíp để gắp chính xác linh kiện nhỏ đó ra.",
    tips: "A pair of + N(luôn có s) -> V số ít."
  },
  {
    question: "To fully understand these complex theories _____ years of dedicated study.",
    optionA: "require", optionB: "requires", optionC: "are requiring", optionD: "have required",
    correctOption: "B",
    explanation: "Chủ ngữ là một cụm nguyên thể (To V / V-ing), được xem là một hành động đơn lẻ -> động từ luôn chia số ít.",
    translation: "Để hiểu đầy đủ những lý thuyết phức tạp này đòi hỏi nhiều năm nghiên cứu chuyên tâm.",
    tips: "To V / V-ing làm chủ ngữ -> V số ít."
  }
];

async function run() {
  console.log("Generating Topic 4: Sự hòa hợp Chủ ngữ - Động từ (3 levels)...");
  
  const baseTitle = "Sự hòa hợp Chủ - Vị";
  const levelsData = [
    { level: "Cơ Bản", slug: "su-hoa-hop-chu-vi-co-ban", keyword: "[Cơ Bản]", lessons: [ { title: "Bài tập 1", questions: cbLesson1 }, { title: "Bài tập 2", questions: cbLesson2 } ] },
    { level: "Trung Cấp", slug: "su-hoa-hop-chu-vi-trung-cap", keyword: "[Trung Cấp]", lessons: [ { title: "Bài tập 1", questions: tcLesson1 }, { title: "Bài tập 2", questions: tcLesson2 } ] },
    { level: "Nâng Cao", slug: "su-hoa-hop-chu-vi-nang-cao", keyword: "[Nâng Cao]", lessons: [ { title: "Bài tập 1", questions: ncLesson1 }, { title: "Bài tập 2", questions: ncLesson2 } ] }
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
        subtitle: `Ôn tập quy tắc Sự hòa hợp Chủ - Vị ở mức độ ${lData.level}`,
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

  console.log("Topic 4 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
