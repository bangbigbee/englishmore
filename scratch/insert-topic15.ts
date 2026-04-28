import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// DỄ (LESSON 1 & 2)
// ==========================================
const easyLesson1 = [
  {
    question: "She speaks English very ________.",
    optionA: "fluent", optionB: "fluently", optionC: "fluency", optionD: "fluencies",
    correctOption: "B",
    explanation: "\"speak\" là động từ thường nên cần một trạng từ (fluently) để bổ nghĩa.",
    translation: "Cô ấy nói tiếng Anh rất trôi chảy.",
    tips: "Động từ thường + Trạng từ."
  },
  {
    question: "The soup tastes ________. Can I have some more?",
    optionA: "delicious", optionB: "deliciously", optionC: "delight", optionD: "delighted",
    correctOption: "A",
    explanation: "\"taste\" là động từ nối (linking verb) nên theo sau phải là một tính từ (delicious).",
    translation: "Món súp có vị rất ngon. Tôi có thể ăn thêm không?",
    tips: "Linking verb (taste/feel/look...) + Tính từ."
  },
  {
    question: "He works ________ every day to support his family.",
    optionA: "hard", optionB: "hardly", optionC: "harder", optionD: "hards",
    correctOption: "A",
    explanation: "\"hard\" vừa là tính từ vừa là trạng từ (chăm chỉ). \"Hardly\" mang nghĩa là \"hầu như không\".",
    translation: "Anh ấy làm việc chăm chỉ mỗi ngày để nuôi gia đình.",
    tips: "hard là tính từ và trạng từ."
  },
  {
    question: "Please handle these glasses ________.",
    optionA: "careful", optionB: "care", optionC: "carefully", optionD: "careless",
    correctOption: "C",
    explanation: "\"handle\" là động từ thường nên cần trạng từ (carefully) để bổ nghĩa.",
    translation: "Vui lòng cầm những chiếc ly này một cách cẩn thận.",
    tips: "Động từ thường + Trạng từ."
  },
  {
    question: "The weather became ________ in the evening.",
    optionA: "cold", optionB: "coldly", optionC: "coldness", optionD: "colds",
    correctOption: "A",
    explanation: "\"become\" là động từ nối nên theo sau là tính từ (cold).",
    translation: "Thời tiết trở nên lạnh vào buổi tối.",
    tips: "become + Tính từ."
  },
  {
    question: "She is a ________ driver. She rarely has an accident.",
    optionA: "careful", optionB: "carefully", optionC: "careless", optionD: "carelessly",
    correctOption: "A",
    explanation: "Cần một tính từ bổ nghĩa cho danh từ \"driver\". Nghĩa phù hợp là \"cẩn thận\" (careful).",
    translation: "Cô ấy là một tài xế cẩn thận. Cô ấy hiếm khi gặp tai nạn.",
    tips: "Tính từ + Danh từ."
  },
  {
    question: "The baby is sleeping ________ in the room.",
    optionA: "quiet", optionB: "quietly", optionC: "quietness", optionD: "quieted",
    correctOption: "B",
    explanation: "\"sleep\" là động từ thường nên cần trạng từ (quietly).",
    translation: "Em bé đang ngủ một cách yên lặng trong phòng.",
    tips: "Động từ thường + Trạng từ."
  },
  {
    question: "This problem seems ________ to solve.",
    optionA: "easy", optionB: "easily", optionC: "easiness", optionD: "easier",
    correctOption: "A",
    explanation: "\"seem\" là động từ nối nên theo sau là tính từ (easy).",
    translation: "Vấn đề này dường như dễ giải quyết.",
    tips: "seem + Tính từ."
  },
  {
    question: "They arrived ________ because of the heavy traffic.",
    optionA: "late", optionB: "lately", optionC: "latest", optionD: "lateness",
    correctOption: "A",
    explanation: "\"late\" vừa là tính từ vừa là trạng từ mang nghĩa là \"muộn\". \"Lately\" có nghĩa là \"gần đây\".",
    translation: "Họ đã đến muộn vì giao thông đông đúc.",
    tips: "late là tính từ và trạng từ."
  },
  {
    question: "I feel ________ about the mistake I made.",
    optionA: "bad", optionB: "badly", optionC: "badness", optionD: "worse",
    correctOption: "A",
    explanation: "\"feel\" (cảm thấy) là động từ nối nên đi kèm tính từ (bad).",
    translation: "Tôi cảm thấy tồi tệ về sai lầm mà tôi đã gây ra.",
    tips: "feel + Tính từ."
  }
];

const easyLesson2 = [
  {
    question: "The flowers smell ________.",
    optionA: "sweet", optionB: "sweetly", optionC: "sweetness", optionD: "sweets",
    correctOption: "A",
    explanation: "\"smell\" là động từ nối nên theo sau là tính từ (sweet).",
    translation: "Những bông hoa có mùi rất thơm.",
    tips: "smell + Tính từ."
  },
  {
    question: "He answered the questions very ________.",
    optionA: "quick", optionB: "quickly", optionC: "quickness", optionD: "quicker",
    correctOption: "B",
    explanation: "\"answer\" là động từ thường nên cần trạng từ (quickly).",
    translation: "Anh ấy đã trả lời các câu hỏi rất nhanh chóng.",
    tips: "Động từ thường + Trạng từ."
  },
  {
    question: "The music sounds ________. Please turn it down.",
    optionA: "loud", optionB: "loudly", optionC: "loudness", optionD: "louder",
    correctOption: "A",
    explanation: "\"sound\" là động từ nối nên theo sau là tính từ (loud).",
    translation: "Âm nhạc nghe có vẻ lớn quá. Vui lòng vặn nhỏ lại.",
    tips: "sound + Tính từ."
  },
  {
    question: "She always smiles ________ at everyone.",
    optionA: "happy", optionB: "happily", optionC: "happiness", optionD: "happier",
    correctOption: "B",
    explanation: "\"smile\" là động từ thường nên cần trạng từ (happily).",
    translation: "Cô ấy luôn mỉm cười hạnh phúc với mọi người.",
    tips: "Động từ thường + Trạng từ."
  },
  {
    question: "The situation remained ________ despite our efforts.",
    optionA: "unchanged", optionB: "unchangeably", optionC: "unchanging", optionD: "unchange",
    correctOption: "A",
    explanation: "\"remain\" là động từ nối nên theo sau là tính từ (unchanged).",
    translation: "Tình hình vẫn không thay đổi bất chấp nỗ lực của chúng tôi.",
    tips: "remain + Tính từ."
  },
  {
    question: "He drove so ________ that he caused a serious accident.",
    optionA: "careless", optionB: "carelessly", optionC: "careful", optionD: "carefully",
    correctOption: "B",
    explanation: "\"drive\" là động từ thường nên cần trạng từ, nghĩa tiêu cực phù hợp là \"carelessly\" (bất cẩn).",
    translation: "Anh ấy đã lái xe quá bất cẩn đến nỗi gây ra một tai nạn nghiêm trọng.",
    tips: "Động từ thường + Trạng từ."
  },
  {
    question: "The new manager looks ________ in her tailored suit.",
    optionA: "professional", optionB: "professionally", optionC: "profession", optionD: "professions",
    correctOption: "A",
    explanation: "\"look\" (trông có vẻ) là động từ nối nên cần tính từ (professional).",
    translation: "Quản lý mới trông rất chuyên nghiệp trong bộ vest may đo.",
    tips: "look + Tính từ."
  },
  {
    question: "They completed the project ________ on time.",
    optionA: "perfect", optionB: "perfectly", optionC: "perfection", optionD: "perfects",
    correctOption: "B",
    explanation: "\"complete\" là động từ thường nên cần trạng từ (perfectly).",
    translation: "Họ đã hoàn thành dự án một cách hoàn hảo đúng hạn.",
    tips: "Động từ thường + Trạng từ."
  },
  {
    question: "The food turned ________ after being left out for two days.",
    optionA: "bad", optionB: "badly", optionC: "worse", optionD: "badness",
    correctOption: "A",
    explanation: "\"turn\" (trở nên) ở đây đóng vai trò là động từ nối, do đó cần tính từ (bad).",
    translation: "Thức ăn đã trở nên ôi thiu sau khi bị để bên ngoài hai ngày.",
    tips: "turn + Tính từ."
  },
  {
    question: "I ________ believe that he is innocent.",
    optionA: "strong", optionB: "strongly", optionC: "strength", optionD: "stronger",
    correctOption: "B",
    explanation: "\"believe\" là động từ thường nên cần trạng từ (strongly) bổ nghĩa.",
    translation: "Tôi tin tưởng mạnh mẽ rằng anh ấy vô tội.",
    tips: "Trạng từ bổ nghĩa cho động từ."
  }
];

// ==========================================
// TRUNG BÌNH (LESSON 3 & 4)
// ==========================================
const mediumLesson1 = [
  {
    question: "My brother is ________ as my father.",
    optionA: "as tall", optionB: "tall", optionC: "taller", optionD: "the tallest",
    correctOption: "A",
    explanation: "Cấu trúc so sánh bằng: as + adj + as. Ở đây có \"as\" ở sau nên cần \"as tall\".",
    translation: "Anh trai tôi cao bằng bố tôi.",
    tips: "as + adj + as (So sánh bằng)."
  },
  {
    question: "This exam is ________ than the previous one.",
    optionA: "more difficult", optionB: "difficult", optionC: "most difficult", optionD: "as difficult",
    correctOption: "A",
    explanation: "Có \"than\" nên dùng cấu trúc so sánh hơn. \"Difficult\" là tính từ dài nên dùng \"more difficult\".",
    translation: "Bài kiểm tra này khó hơn bài kiểm tra trước.",
    tips: "more + adj dài + than (So sánh hơn)."
  },
  {
    question: "His car runs ________ than mine.",
    optionA: "faster", optionB: "fast", optionC: "more fast", optionD: "fastly",
    correctOption: "A",
    explanation: "Trạng từ \"fast\" là từ ngắn, nên dạng so sánh hơn là \"faster\".",
    translation: "Xe của anh ấy chạy nhanh hơn xe của tôi.",
    tips: "adj/adv ngắn + er + than (So sánh hơn)."
  },
  {
    question: "The weather today is not ________ as it was yesterday.",
    optionA: "so hot", optionB: "hotter", optionC: "hottest", optionD: "hot",
    correctOption: "A",
    explanation: "Cấu trúc so sánh bằng ở dạng phủ định: not as/so + adj + as.",
    translation: "Thời tiết hôm nay không nóng bằng hôm qua.",
    tips: "not so/as + adj + as."
  },
  {
    question: "She speaks English ________ than her classmates.",
    optionA: "more fluently", optionB: "fluently", optionC: "fluenter", optionD: "fluent",
    correctOption: "A",
    explanation: "\"fluently\" là trạng từ dài, so sánh hơn là \"more fluently\".",
    translation: "Cô ấy nói tiếng Anh trôi chảy hơn các bạn cùng lớp.",
    tips: "more + adv dài + than."
  },
  {
    question: "This problem is much ________ than we expected.",
    optionA: "worse", optionB: "bad", optionC: "worst", optionD: "more bad",
    correctOption: "A",
    explanation: "Dạng so sánh hơn của \"bad\" là \"worse\". \"Much\" dùng để nhấn mạnh cho so sánh hơn.",
    translation: "Vấn đề này tồi tệ hơn nhiều so với chúng tôi mong đợi.",
    tips: "much + so sánh hơn (để nhấn mạnh)."
  },
  {
    question: "My new phone is ________ expensive as yours.",
    optionA: "not as", optionB: "more", optionC: "less", optionD: "so",
    correctOption: "A",
    explanation: "Có \"as yours\" ở sau, nên ở trước dùng \"not as\" (so sánh không bằng).",
    translation: "Điện thoại mới của tôi không đắt bằng điện thoại của bạn.",
    tips: "not as + adj + as."
  },
  {
    question: "He works ________ than anyone else in the office.",
    optionA: "harder", optionB: "more hard", optionC: "hardly", optionD: "hardest",
    correctOption: "A",
    explanation: "\"hard\" vừa là tính từ vừa trạng từ (ngắn). So sánh hơn là \"harder\".",
    translation: "Anh ấy làm việc chăm chỉ hơn bất cứ ai khác trong văn phòng.",
    tips: "adv ngắn + er + than."
  },
  {
    question: "Your laptop is the same ________ as mine.",
    optionA: "size", optionB: "big", optionC: "large", optionD: "small",
    correctOption: "A",
    explanation: "Cấu trúc so sánh bằng với danh từ: the same + N + as. \"Size\" là danh từ của big/small.",
    translation: "Laptop của bạn có cùng kích thước với của tôi.",
    tips: "the same + Noun + as."
  },
  {
    question: "Today is a little ________ than yesterday.",
    optionA: "warmer", optionB: "warm", optionC: "more warm", optionD: "warmest",
    correctOption: "A",
    explanation: "So sánh hơn của tính từ ngắn \"warm\" là \"warmer\". \"A little\" dùng để nhấn mạnh (hơn 1 chút).",
    translation: "Hôm nay ấm hơn một chút so với hôm qua.",
    tips: "a little + so sánh hơn."
  }
];

const mediumLesson2 = [
  {
    question: "She is ________ student in our class.",
    optionA: "the smartest", optionB: "smarter", optionC: "smartest", optionD: "most smart",
    correctOption: "A",
    explanation: "So sánh nhất của tính từ ngắn \"smart\" là \"the smartest\".",
    translation: "Cô ấy là học sinh thông minh nhất trong lớp chúng tôi.",
    tips: "the + adj ngắn + est (So sánh nhất)."
  },
  {
    question: "This is ________ book I have ever read.",
    optionA: "the most interesting", optionB: "most interesting", optionC: "more interesting", optionD: "interesting",
    correctOption: "A",
    explanation: "Dấu hiệu \"have ever read\" chỉ ra đây là so sánh nhất. \"Interesting\" là tính từ dài.",
    translation: "Đây là cuốn sách thú vị nhất mà tôi từng đọc.",
    tips: "the most + adj dài (So sánh nhất)."
  },
  {
    question: "The ________ you study, the better your grades will be.",
    optionA: "more", optionB: "much", optionC: "most", optionD: "hard",
    correctOption: "A",
    explanation: "Cấu trúc so sánh kép (càng... càng...): The + so sánh hơn..., the + so sánh hơn...",
    translation: "Bạn càng học nhiều, điểm của bạn sẽ càng cao.",
    tips: "The + so sánh hơn, the + so sánh hơn."
  },
  {
    question: "The weather is getting ________.",
    optionA: "colder and colder", optionB: "more and more cold", optionC: "cold and cold", optionD: "coldest",
    correctOption: "A",
    explanation: "So sánh đa bội (càng ngày càng) với tính từ ngắn: adj-er + and + adj-er.",
    translation: "Thời tiết đang trở nên càng ngày càng lạnh.",
    tips: "adj-er + and + adj-er (càng ngày càng)."
  },
  {
    question: "Of all the candidates, John performed ________.",
    optionA: "the worst", optionB: "worse", optionC: "bad", optionD: "badly",
    correctOption: "A",
    explanation: "Dấu hiệu \"Of all...\" -> so sánh nhất. Trạng từ \"badly\" có so sánh nhất là \"the worst\".",
    translation: "Trong tất cả các ứng viên, John thể hiện tệ nhất.",
    tips: "the worst (so sánh nhất của bad/badly)."
  },
  {
    question: "The more he exercises, ________ he feels.",
    optionA: "the healthier", optionB: "healthier", optionC: "the healthiest", optionD: "more healthy",
    correctOption: "A",
    explanation: "So sánh kép: The + so sánh hơn..., the + so sánh hơn...",
    translation: "Anh ấy càng tập thể dục nhiều, anh ấy càng cảm thấy khỏe mạnh hơn.",
    tips: "The + so sánh hơn, the + so sánh hơn."
  },
  {
    question: "It is becoming ________ to find a cheap apartment in this city.",
    optionA: "more and more difficult", optionB: "difficult and difficult", optionC: "more difficult", optionD: "most difficult",
    correctOption: "A",
    explanation: "So sánh đa bội với tính từ dài: more and more + adj dài.",
    translation: "Việc tìm một căn hộ giá rẻ ở thành phố này đang trở nên càng ngày càng khó khăn.",
    tips: "more and more + adj dài (càng ngày càng)."
  },
  {
    question: "This restaurant serves ________ food in town.",
    optionA: "the best", optionB: "better", optionC: "the most good", optionD: "best",
    correctOption: "A",
    explanation: "So sánh nhất của \"good\" là \"the best\".",
    translation: "Nhà hàng này phục vụ thức ăn ngon nhất trong thị trấn.",
    tips: "the best (so sánh nhất của good)."
  },
  {
    question: "The larger the company, ________ difficult it is to manage.",
    optionA: "the more", optionB: "more", optionC: "the most", optionD: "most",
    correctOption: "A",
    explanation: "So sánh kép: The + so sánh hơn, the + so sánh hơn (the more difficult).",
    translation: "Công ty càng lớn thì càng khó quản lý.",
    tips: "The + so sánh hơn, the + so sánh hơn."
  },
  {
    question: "He ran ________ of all the runners in the marathon.",
    optionA: "the fastest", optionB: "faster", optionC: "fastest", optionD: "fast",
    correctOption: "A",
    explanation: "So sánh nhất của trạng từ \"fast\" là \"the fastest\".",
    translation: "Anh ấy đã chạy nhanh nhất trong số tất cả các vận động viên trong cuộc đua marathon.",
    tips: "the + adv ngắn + est (So sánh nhất)."
  }
];

// ==========================================
// KHÓ (LESSON 5 & 6)
// ==========================================
const hardLesson1 = [
  {
    question: "This assignment is far ________ than the previous one.",
    optionA: "more complicated", optionB: "complicated", optionC: "most complicated", optionD: "as complicated",
    correctOption: "A",
    explanation: "Có \"than\" nên dùng so sánh hơn. \"far\" được dùng để nhấn mạnh so sánh hơn.",
    translation: "Bài tập này phức tạp hơn nhiều so với bài trước.",
    tips: "far/much/a lot + so sánh hơn."
  },
  {
    question: "No sooner had he left the house ________ it started to rain.",
    optionA: "than", optionB: "when", optionC: "that", optionD: "then",
    correctOption: "A",
    explanation: "Cấu trúc: No sooner + had + S + PII + than + S + past simple (Vừa mới ... thì).",
    translation: "Anh ấy vừa mới rời khỏi nhà thì trời bắt đầu mưa.",
    tips: "No sooner ... than (Vừa mới... thì)."
  },
  {
    question: "His presentation was half ________ as mine.",
    optionA: "as long", optionB: "long", optionC: "longer", optionD: "the longest",
    correctOption: "A",
    explanation: "So sánh gấp bội (half, twice, 3 times...): Số lần + as + adj/adv + as.",
    translation: "Bài thuyết trình của anh ấy dài bằng một nửa của tôi.",
    tips: "Số lần + as + adj/adv + as."
  },
  {
    question: "She earned twice ________ money as her brother.",
    optionA: "as much", optionB: "much", optionC: "more", optionD: "the most",
    correctOption: "A",
    explanation: "So sánh gấp bội: Số lần (twice) + as + much/many + N + as.",
    translation: "Cô ấy kiếm được gấp đôi số tiền so với anh trai mình.",
    tips: "Số lần + as much N as."
  },
  {
    question: "Of the two sisters, Mary is ________.",
    optionA: "the taller", optionB: "the tallest", optionC: "taller", optionD: "tallest",
    correctOption: "A",
    explanation: "Khi so sánh giữa 2 đối tượng xác định (Of the two...), dùng cấu trúc: the + so sánh hơn.",
    translation: "Trong hai chị em, Mary là người cao hơn.",
    tips: "Of the two + N, S + be + the + so sánh hơn."
  },
  {
    question: "We need to discuss this matter ________.",
    optionA: "further", optionB: "farther", optionC: "furthest", optionD: "farthest",
    correctOption: "A",
    explanation: "\"Further\" dùng để chỉ khoảng cách trừu tượng (thêm nữa, sâu hơn), còn \"farther\" dùng cho khoảng cách vật lý.",
    translation: "Chúng ta cần thảo luận vấn đề này sâu hơn.",
    tips: "further (thêm nữa, sâu hơn - trừu tượng)."
  },
  {
    question: "The ________ we wait, the more anxious I become.",
    optionA: "longer", optionB: "long", optionC: "longest", optionD: "more long",
    correctOption: "A",
    explanation: "So sánh kép: The + so sánh hơn (longer), the + so sánh hơn (more anxious).",
    translation: "Chúng ta càng chờ đợi lâu, tôi càng trở nên lo lắng.",
    tips: "The + so sánh hơn, the + so sánh hơn."
  },
  {
    question: "This problem is twice ________ to solve as the other one.",
    optionA: "as hard", optionB: "harder", optionC: "hard", optionD: "the hardest",
    correctOption: "A",
    explanation: "So sánh gấp bội: twice + as + adj + as.",
    translation: "Vấn đề này khó giải quyết gấp đôi so với vấn đề kia.",
    tips: "Số lần + as + adj + as."
  },
  {
    question: "Hardly had the meeting started ________ the power went out.",
    optionA: "when", optionB: "than", optionC: "then", optionD: "that",
    correctOption: "A",
    explanation: "Cấu trúc tương đương với No sooner... than là: Hardly/Scarcely + had + S + PII + when + S + V(quá khứ).",
    translation: "Cuộc họp vừa mới bắt đầu thì mất điện.",
    tips: "Hardly ... when (Vừa mới ... thì)."
  },
  {
    question: "This is by far ________ movie of the year.",
    optionA: "the worst", optionB: "worse", optionC: "worst", optionD: "the worse",
    correctOption: "A",
    explanation: "\"by far\" thường dùng để nhấn mạnh cấu trúc so sánh nhất (the worst).",
    translation: "Đây cho đến nay là bộ phim tệ nhất của năm.",
    tips: "by far + so sánh nhất (nhấn mạnh)."
  }
];

const hardLesson2 = [
  {
    question: "Her voice sounds ________. She must be a professional singer.",
    optionA: "beautiful", optionB: "beautifully", optionC: "beauty", optionD: "beautify",
    correctOption: "A",
    explanation: "\"sound\" là động từ nối nên cần tính từ (beautiful).",
    translation: "Giọng của cô ấy nghe rất hay. Cô ấy hẳn là một ca sĩ chuyên nghiệp.",
    tips: "sound + Tính từ."
  },
  {
    question: "The prices of these items are ________ than we thought.",
    optionA: "much lower", optionB: "more low", optionC: "very lower", optionD: "lowest",
    correctOption: "A",
    explanation: "So sánh hơn của \"low\" là \"lower\". \"Much\" được dùng để nhấn mạnh so sánh hơn.",
    translation: "Giá của những mặt hàng này thấp hơn nhiều so với chúng tôi nghĩ.",
    tips: "much + so sánh hơn."
  },
  {
    question: "The test was ________ difficult than I expected.",
    optionA: "a bit more", optionB: "more a bit", optionC: "much a bit", optionD: "little more",
    correctOption: "A",
    explanation: "Dùng \"a bit\" trước \"more difficult\" để nhấn mạnh mức độ (hơn một chút).",
    translation: "Bài kiểm tra khó hơn một chút so với tôi dự kiến.",
    tips: "a bit + so sánh hơn."
  },
  {
    question: "Of the two plans, the first one is ________.",
    optionA: "the better", optionB: "better", optionC: "the best", optionD: "best",
    correctOption: "A",
    explanation: "So sánh giữa 2 đối tượng (Of the two...), dùng \"the + so sánh hơn\".",
    translation: "Trong hai kế hoạch, kế hoạch đầu tiên tốt hơn.",
    tips: "Of the two + N, the + so sánh hơn."
  },
  {
    question: "She ran ________ she could to catch the bus.",
    optionA: "as fast as", optionB: "fast as", optionC: "faster than", optionD: "the fastest",
    correctOption: "A",
    explanation: "So sánh bằng: as + adv + as + possible / as she could.",
    translation: "Cô ấy đã chạy nhanh nhất có thể để bắt xe buýt.",
    tips: "as + adv + as + S + could."
  },
  {
    question: "Our products are superior ________ those of our competitors.",
    optionA: "to", optionB: "than", optionC: "as", optionD: "with",
    correctOption: "A",
    explanation: "Một số tính từ gốc Latin mang nghĩa so sánh như \"superior, inferior, senior, junior\" đi với giới từ \"to\" thay vì \"than\".",
    translation: "Sản phẩm của chúng tôi ưu việt hơn của các đối thủ cạnh tranh.",
    tips: "superior/inferior/senior/junior + to."
  },
  {
    question: "No one in the team plays ________ as Tom.",
    optionA: "as well", optionB: "as good", optionC: "better", optionD: "the best",
    correctOption: "A",
    explanation: "\"play\" là động từ thường nên cần trạng từ (well) trong cấu trúc so sánh bằng (as well as).",
    translation: "Không ai trong đội chơi giỏi bằng Tom.",
    tips: "Động từ thường + as + adv + as."
  },
  {
    question: "The situation is becoming ________ serious.",
    optionA: "more and more", optionB: "most and most", optionC: "much and more", optionD: "more and much",
    correctOption: "A",
    explanation: "So sánh đa bội với tính từ dài: more and more + adj dài.",
    translation: "Tình hình đang trở nên ngày càng nghiêm trọng.",
    tips: "more and more + adj dài."
  },
  {
    question: "He didn't act ________ he should have.",
    optionA: "as politely as", optionB: "so polite as", optionC: "politely as", optionD: "as politely",
    correctOption: "A",
    explanation: "\"act\" là động từ thường nên cần trạng từ (politely). Cấu trúc so sánh bằng ở dạng phủ định: not as/so + adv + as.",
    translation: "Anh ấy đã không hành xử một cách lịch sự như lẽ ra anh ấy phải làm.",
    tips: "not as/so + adv + as."
  },
  {
    question: "This task requires ________ time than the previous one.",
    optionA: "less", optionB: "fewer", optionC: "few", optionD: "little",
    correctOption: "A",
    explanation: "So sánh kém với danh từ không đếm được (time) dùng \"less\". (Với danh từ đếm được dùng \"fewer\").",
    translation: "Nhiệm vụ này đòi hỏi ít thời gian hơn nhiệm vụ trước.",
    tips: "less + N(không đếm được) + than."
  }
];

async function run() {
  console.log("Generating Topic 15: Tính từ, Trạng từ và Các cấu trúc so sánh (Level: Trung Cấp, 6 lessons)...");
  
  const baseTitle = "Tính từ, Trạng từ và Các cấu trúc so sánh";
  const slug = "tinh-tu-trang-tu-va-cau-truc-so-sanh";
  const level = "Trung Cấp";

  let topic = await prisma.toeicGrammarTopic.findUnique({ where: { slug: slug } });
  
  if (topic) {
      console.log(`Topic ${slug} already exists. Skipping creation...`);
  } else {
      topic = await prisma.toeicGrammarTopic.create({
        data: {
          title: `15. ${baseTitle}`,
          subtitle: `Tổng hợp kiến thức ${baseTitle}`,
          slug: slug,
          level: level,
          type: 'GRAMMAR',
          part: 5
        }
      });
  }

  const lessonsData = [
    { title: "Bài tập 1 (Dễ)", order: 1, questions: easyLesson1 },
    { title: "Bài tập 2 (Dễ)", order: 2, questions: easyLesson2 },
    { title: "Bài tập 3 (Trung bình)", order: 3, questions: mediumLesson1 },
    { title: "Bài tập 4 (Trung bình)", order: 4, questions: mediumLesson2 },
    { title: "Bài tập 5 (Khó)", order: 5, questions: hardLesson1 },
    { title: "Bài tập 6 (Khó)", order: 6, questions: hardLesson2 },
  ];

  for (const lData of lessonsData) {
    const lesson = await prisma.toeicGrammarLesson.create({
      data: {
        topicId: topic.id,
        title: `${lData.title}: ${baseTitle}`,
        order: lData.order,
        accessTier: 'FREE'
      }
    });

    for (const q of lData.questions) {
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
  
  console.log(`Created Topic: ${slug} with 6 lessons and 60 questions total.`);
  console.log("Topic 15 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
