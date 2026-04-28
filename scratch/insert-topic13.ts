import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// LEVEL 1: CƠ BẢN
// ==========================================
const cbLesson1 = [
  {
    question: "I hope that he _____ the exam tomorrow.",
    optionA: "pass", optionB: "passes", optionC: "passed", optionD: "will pass",
    correctOption: "D",
    explanation: "Động từ 'hope' đi với tương lai đơn giản để diễn đạt hy vọng về việc sẽ xảy ra ở tương lai.",
    translation: "Tôi hy vọng rằng anh ấy sẽ vượt qua kỳ thi ngày mai.",
    tips: "hope + Tương lai đơn (will V)."
  },
  {
    question: "We hope that they _____ yesterday.",
    optionA: "came", optionB: "come", optionC: "will come", optionD: "had come",
    correctOption: "A",
    explanation: "Động từ 'hope' có thể dùng với hành động ở quá khứ nếu ta không biết chắc nó đã xảy ra chưa. Ở đây có 'yesterday' nên dùng Quá khứ đơn (came).",
    translation: "Chúng tôi hy vọng rằng họ đã đến hôm qua.",
    tips: "hope + Quá khứ đơn (khi hy vọng về việc đã qua)."
  },
  {
    question: "I wish I _____ fly like a bird.",
    optionA: "can", optionB: "could", optionC: "will", optionD: "shall",
    correctOption: "B",
    explanation: "Điều ước ở hiện tại (trái thực tế hiện tại) dùng động từ khuyết thiếu dạng quá khứ: can -> could.",
    translation: "Tôi ước gì tôi có thể bay như một chú chim.",
    tips: "wish + could + V."
  },
  {
    question: "She acts as if she _____ the boss of this company.",
    optionA: "is", optionB: "are", optionC: "was", optionD: "were",
    correctOption: "D",
    explanation: "Cấu trúc 'as if/as though' diễn tả sự việc không có thật ở hiện tại. Động từ to be luôn dùng 'were' cho mọi ngôi.",
    translation: "Cô ấy cư xử cứ như thể cô ấy là sếp của công ty này.",
    tips: "as if/as though + were (không có thật ở HT)."
  },
  {
    question: "I would rather _____ at home tonight.",
    optionA: "stay", optionB: "to stay", optionC: "staying", optionD: "stayed",
    correctOption: "A",
    explanation: "Cấu trúc would rather (thích... hơn) với một chủ ngữ: S + would rather + V-nguyên thể.",
    translation: "Tôi thà ở nhà tối nay.",
    tips: "would rather + V-bare."
  },
  {
    question: "He wishes he _____ a lot of money now.",
    optionA: "has", optionB: "have", optionC: "had", optionD: "will have",
    correctOption: "C",
    explanation: "Điều ước ở hiện tại (now) trái ngược với thực tế: S + wish + S + V-quá khứ (had).",
    translation: "Anh ấy ước gì bây giờ anh ấy có nhiều tiền.",
    tips: "wish + V-past (ước cho hiện tại)."
  },
  {
    question: "She talks as though she _____ everything.",
    optionA: "knows", optionB: "know", optionC: "knew", optionD: "has known",
    correctOption: "C",
    explanation: "As though + mệnh đề quá khứ (knew) để diễn tả điều không có thật ở hiện tại.",
    translation: "Cô ấy nói chuyện cứ như thể cô ấy biết mọi thứ.",
    tips: "as though + V-past."
  },
  {
    question: "I hope you _____ a good time at the party.",
    optionA: "have", optionB: "had", optionC: "will have", optionD: "are having",
    correctOption: "A",
    explanation: "Sau hope diễn đạt hy vọng ở hiện tại/tương lai, có thể dùng thì Hiện tại đơn (hoặc tương lai). Ở đây 'have' là hiện tại đơn.",
    translation: "Tôi hy vọng bạn có một thời gian vui vẻ tại bữa tiệc.",
    tips: "hope + Hiện tại đơn (diễn tả hy vọng HT/TL)."
  },
  {
    question: "We wish it _____ raining so we could go out.",
    optionA: "stop", optionB: "stops", optionC: "stopped", optionD: "would stop",
    correctOption: "D",
    explanation: "Điều ước cho sự việc xảy ra ở tương lai hoặc phàn nàn về một thói quen ở hiện tại: S + wish + S + would + V.",
    translation: "Chúng tôi ước gì trời tạnh mưa để chúng tôi có thể đi ra ngoài.",
    tips: "wish + would + V."
  },
  {
    question: "I would rather you _____ home now.",
    optionA: "go", optionB: "went", optionC: "gone", optionD: "going",
    correctOption: "B",
    explanation: "Would rather với 2 chủ ngữ, diễn tả ý muốn ở hiện tại/tương lai: S1 + would rather + S2 + V(quá khứ).",
    translation: "Tôi thà rằng bạn về nhà bây giờ.",
    tips: "S1 would rather S2 + V-past."
  }
];

const cbLesson2 = [
  {
    question: "He acts as if he _____ the manager, but he is just an assistant.",
    optionA: "is", optionB: "be", optionC: "was", optionD: "were",
    correctOption: "D",
    explanation: "Sau 'as if', để chỉ tình huống không có thật ở hiện tại, động từ to be dùng 'were' cho mọi ngôi.",
    translation: "Anh ấy hành xử cứ như thể anh ấy là quản lý, nhưng anh ấy chỉ là trợ lý.",
    tips: "as if + were."
  },
  {
    question: "I wish I _____ the answer to your question.",
    optionA: "knew", optionB: "know", optionC: "knows", optionD: "have known",
    correctOption: "A",
    explanation: "Điều ước trái với hiện tại (wish), động từ lùi về quá khứ đơn (knew).",
    translation: "Tôi ước gì tôi biết câu trả lời cho câu hỏi của bạn.",
    tips: "wish + V-past."
  },
  {
    question: "They hope that the weather _____ fine tomorrow.",
    optionA: "is", optionB: "will be", optionC: "would be", optionD: "was",
    correctOption: "B",
    explanation: "Hy vọng về một việc trong tương lai dùng 'hope' + mệnh đề thì tương lai đơn (will be).",
    translation: "Họ hy vọng thời tiết sẽ đẹp vào ngày mai.",
    tips: "hope + will V."
  },
  {
    question: "She would rather _____ coffee than tea.",
    optionA: "drink", optionB: "drank", optionC: "drinking", optionD: "to drink",
    correctOption: "A",
    explanation: "Cấu trúc would rather + V (nguyên thể không to) + than + V (nguyên thể không to) : thích làm gì hơn làm gì.",
    translation: "Cô ấy thích uống cà phê hơn trà.",
    tips: "would rather + V-bare."
  },
  {
    question: "It looks as though it _____ going to rain.",
    optionA: "is", optionB: "were", optionC: "will", optionD: "would",
    correctOption: "A",
    explanation: "Nếu tình huống có vẻ CÓ THẬT (có khả năng xảy ra thực sự), sau 'as though/as if' chia theo thì bình thường. Ở đây trời có vẻ sắp mưa thật nên dùng 'is'.",
    translation: "Trông có vẻ như trời sắp mưa.",
    tips: "as though + HT (nếu có thật)."
  },
  {
    question: "I wish you _____ making so much noise.",
    optionA: "stop", optionB: "stopped", optionC: "would stop", optionD: "will stop",
    correctOption: "C",
    explanation: "Cấu trúc wish + would + V được dùng để phàn nàn, mong muốn ai đó dừng một hành động gây bực mình.",
    translation: "Tôi ước gì bạn ngừng làm ồn.",
    tips: "wish + would V (phàn nàn)."
  },
  {
    question: "John hopes he _____ the job he applied for.",
    optionA: "get", optionB: "gets", optionC: "got", optionD: "getting",
    correctOption: "B",
    explanation: "Động từ 'hope' đi với mệnh đề hiện tại đơn để diễn tả điều hy vọng có thể xảy ra ở hiện tại hoặc tương lai.",
    translation: "John hy vọng anh ấy nhận được công việc anh ấy đã nộp đơn.",
    tips: "hope + HTĐ."
  },
  {
    question: "The little boy looks as if he _____ a ghost.",
    optionA: "sees", optionB: "saw", optionC: "has seen", optionD: "had seen",
    correctOption: "D",
    explanation: "Sau 'looks' (hiện tại), 'as if' diễn tả sự việc đã xảy ra trước đó (nhìn thấy ma) không có thật -> lùi thì thành quá khứ hoàn thành (had seen).",
    translation: "Cậu bé trông cứ như thể cậu vừa nhìn thấy ma.",
    tips: "as if + had PII."
  },
  {
    question: "I would rather you _____ not tell anyone about this secret.",
    optionA: "do", optionB: "did", optionC: "had", optionD: "would",
    correctOption: "B",
    explanation: "Cấu trúc 'would rather' 2 chủ ngữ, diễn tả ý muốn ở HT/TL -> chia thì QK đơn. Phủ định mượn trợ động từ did -> did not tell.",
    translation: "Tôi thà rằng bạn đừng nói với ai về bí mật này.",
    tips: "would rather S + didn't V."
  },
  {
    question: "I wish I _____ enough money to buy a car.",
    optionA: "have", optionB: "had", optionC: "will have", optionD: "have had",
    correctOption: "B",
    explanation: "Điều ước trái thực tế hiện tại, động từ dùng ở quá khứ đơn (had).",
    translation: "Tôi ước gì tôi có đủ tiền để mua một chiếc xe hơi.",
    tips: "wish + V-past."
  }
];

// ==========================================
// LEVEL 2: TRUNG CẤP
// ==========================================
const tcLesson1 = [
  {
    question: "He sounded as if he _____ the marathon.",
    optionA: "ran", optionB: "runs", optionC: "had run", optionD: "has run",
    correctOption: "C",
    explanation: "Động từ chính 'sounded' ở quá khứ. Hành động 'chạy marathon' xảy ra trước đó và giả định không có thật -> dùng Quá khứ hoàn thành (had run).",
    translation: "Giọng anh ấy nghe cứ như thể anh ấy vừa chạy bộ marathon.",
    tips: "V-past + as if + had PII."
  },
  {
    question: "I wish I _____ to your advice before buying that old house.",
    optionA: "listened", optionB: "listen", optionC: "had listened", optionD: "would listen",
    correctOption: "C",
    explanation: "Sự việc 'buying that old house' đã xảy ra trong quá khứ. Điều ước trái với quá khứ phải dùng Quá khứ hoàn thành (had listened).",
    translation: "Tôi ước gì tôi đã nghe theo lời khuyên của bạn trước khi mua ngôi nhà cũ đó.",
    tips: "wish + had PII (trái QK)."
  },
  {
    question: "I would rather _____ a movie than listen to music.",
    optionA: "watch", optionB: "watched", optionC: "to watch", optionD: "watching",
    correctOption: "A",
    explanation: "Cấu trúc would rather + V(bare) + than + V(bare) : Thích làm gì hơn làm gì.",
    translation: "Tôi thích xem phim hơn là nghe nhạc.",
    tips: "would rather V than V."
  },
  {
    question: "They hope that the package _____ by Friday.",
    optionA: "will arrive", optionB: "arrived", optionC: "would arrive", optionD: "arriving",
    correctOption: "A",
    explanation: "Hy vọng về sự việc sẽ xảy ra ở tương lai (by Friday) -> mệnh đề theo sau dùng tương lai đơn.",
    translation: "Họ hy vọng rằng gói hàng sẽ đến trước thứ Sáu.",
    tips: "hope + will V."
  },
  {
    question: "I would rather you _____ me the truth yesterday.",
    optionA: "told", optionB: "tell", optionC: "had told", optionD: "would tell",
    correctOption: "C",
    explanation: "Would rather với 2 chủ ngữ, diễn tả ý nuối tiếc/mong muốn về một việc ở quá khứ (yesterday) -> Mệnh đề sau chia Quá khứ hoàn thành (had told).",
    translation: "Tôi ước gì hôm qua bạn đã nói cho tôi sự thật.",
    tips: "would rather S + had PII (QK)."
  },
  {
    question: "She behaved as though she _____ the place.",
    optionA: "owns", optionB: "owned", optionC: "had owned", optionD: "owning",
    correctOption: "B",
    explanation: "Động từ 'behaved' chia quá khứ. Nhưng hành động 'own' (sở hữu) là đồng thời với lúc 'behaved' -> chia Quá khứ đơn (owned) để giả định trái thực tế.",
    translation: "Cô ấy cư xử cứ như thể cô ấy là chủ nơi này.",
    tips: "V-past + as though + V-past (đồng thời)."
  },
  {
    question: "He wished he _____ more carefully during the driving test.",
    optionA: "drives", optionB: "drove", optionC: "has driven", optionD: "had driven",
    correctOption: "D",
    explanation: "Điều ước ở quá khứ (wished) về một sự việc cũng đã xảy ra trước đó (trong buổi thi lái xe) -> dùng Quá khứ hoàn thành.",
    translation: "Anh ấy ước gì anh ấy đã lái xe cẩn thận hơn trong bài thi lái xe.",
    tips: "wished + had PII."
  },
  {
    question: "I'd rather you _____ smoke in here, if you don't mind.",
    optionA: "didn't", optionB: "don't", optionC: "wouldn't", optionD: "won't",
    correctOption: "A",
    explanation: "I'd rather = I would rather. 2 chủ ngữ, ý muốn ở hiện tại/tương lai (don't smoke in here) -> dùng trợ động từ ở quá khứ (didn't).",
    translation: "Tôi thà rằng bạn đừng hút thuốc ở đây, nếu bạn không phiền.",
    tips: "would rather S didn't V."
  },
  {
    question: "She looks as if she _____ crying.",
    optionA: "is", optionB: "has been", optionC: "were", optionD: "had been",
    correctOption: "B",
    explanation: "Cấu trúc as if đi với hiện tượng có thật/khả năng cao có thật (mắt cô ấy đỏ, cô ấy có vẻ như vừa khóc xong) -> dùng thì hiện tại hoàn thành (has been) hoặc hiện tại hoàn thành tiếp diễn.",
    translation: "Trông cô ấy như thể vừa mới khóc xong.",
    tips: "as if + HTHT (nếu sự việc có khả năng thật)."
  },
  {
    question: "We hope she _____ the job interview yesterday.",
    optionA: "passes", optionB: "passed", optionC: "has passed", optionD: "would pass",
    correctOption: "B",
    explanation: "Hope dùng với quá khứ đơn (passed) khi hy vọng về một điều đã xảy ra nhưng chưa biết kết quả (yesterday).",
    translation: "Chúng tôi hy vọng cô ấy đã vượt qua buổi phỏng vấn việc làm ngày hôm qua.",
    tips: "hope + V-past."
  }
];

const tcLesson2 = [
  {
    question: "It is high time you _____ looking for a job.",
    optionA: "start", optionB: "started", optionC: "will start", optionD: "starting",
    correctOption: "B",
    explanation: "Cấu trúc giả định: It's high time S + V-past. Mang nghĩa 'đã đến lúc ai đó nên làm gì'.",
    translation: "Đã đến lúc bạn nên bắt đầu tìm việc.",
    tips: "It is high time + V-past."
  },
  {
    question: "I wish I _____ what to do in this situation.",
    optionA: "know", optionB: "knew", optionC: "have known", optionD: "knows",
    correctOption: "B",
    explanation: "Điều ước ở hiện tại, lùi động từ về quá khứ đơn (knew).",
    translation: "Tôi ước gì tôi biết phải làm gì trong tình huống này.",
    tips: "wish + V-past."
  },
  {
    question: "He acts as if he _____ the CEO of the company, ordering everyone around.",
    optionA: "was", optionB: "is", optionC: "were", optionD: "has been",
    correctOption: "C",
    explanation: "Cấu trúc giả định 'as if' trái hiện tại -> to be dùng 'were'.",
    translation: "Anh ta hành động cứ như thể anh ta là Giám đốc điều hành của công ty, sai bảo mọi người.",
    tips: "as if + were."
  },
  {
    question: "I would rather have stayed at home yesterday than _____ to the party.",
    optionA: "go", optionB: "gone", optionC: "went", optionD: "going",
    correctOption: "B",
    explanation: "Cấu trúc would rather have + PII + than + PII (Nuối tiếc: Thà đã làm việc này hơn làm việc kia ở quá khứ).",
    translation: "Hôm qua tôi thà ở nhà còn hơn là đã đi đến bữa tiệc.",
    tips: "would rather have PII than PII."
  },
  {
    question: "I hope you _____ a good flight back home tomorrow.",
    optionA: "have", optionB: "had", optionC: "will have", optionD: "having",
    correctOption: "C",
    explanation: "Hope + tương lai đơn (will have) diễn đạt hy vọng ở tương lai.",
    translation: "Tôi hy vọng bạn sẽ có một chuyến bay tốt đẹp về nhà vào ngày mai.",
    tips: "hope + will V."
  },
  {
    question: "She spoke to me as though she _____ me all her life.",
    optionA: "knows", optionB: "knew", optionC: "has known", optionD: "had known",
    correctOption: "D",
    explanation: "Động từ 'spoke' ở quá khứ. Việc 'biết cả đời' xảy ra trước đó và là giả định không có thật -> dùng Quá khứ hoàn thành (had known).",
    translation: "Cô ấy nói chuyện với tôi cứ như thể cô ấy đã quen tôi cả đời vậy.",
    tips: "V-past + as though + had PII."
  },
  {
    question: "I wish I _____ afford to buy that expensive dress.",
    optionA: "can", optionB: "could", optionC: "will", optionD: "should",
    correctOption: "B",
    explanation: "Điều ước trái thực tế hiện tại với động từ khuyết thiếu: can -> could.",
    translation: "Tôi ước gì tôi có đủ khả năng tài chính để mua chiếc váy đắt tiền đó.",
    tips: "wish + could."
  },
  {
    question: "We would rather _____ early tomorrow morning.",
    optionA: "leave", optionB: "left", optionC: "leaving", optionD: "to leave",
    correctOption: "A",
    explanation: "Cấu trúc would rather 1 chủ ngữ ở hiện tại/tương lai: would rather + V-bare.",
    translation: "Chúng tôi thà rời đi sớm vào sáng mai.",
    tips: "would rather + V-bare."
  },
  {
    question: "He hoped that he _____ the promotion.",
    optionA: "will get", optionB: "gets", optionC: "would get", optionD: "has got",
    correctOption: "C",
    explanation: "Hope ở thì quá khứ (hoped) -> Mệnh đề sau phải lùi thì: will get -> would get.",
    translation: "Anh ấy đã hy vọng rằng anh ấy sẽ được thăng chức.",
    tips: "hoped + would V."
  },
  {
    question: "It looks as if it _____ rain. Look at those dark clouds!",
    optionA: "is going to", optionB: "were going to", optionC: "will", optionD: "would",
    correctOption: "A",
    explanation: "Khi có bằng chứng rõ ràng (dark clouds), tình huống là CÓ THẬT -> mệnh đề sau 'as if' chia thì bình thường. Tương lai gần 'is going to'.",
    translation: "Trời có vẻ như sắp mưa. Nhìn những đám mây đen kia kìa!",
    tips: "as if + HT/TL (có thật)."
  }
];

// ==========================================
// LEVEL 3: NÂNG CAO
// ==========================================
const ncLesson1 = [
  {
    question: "I would rather you _____ me about the changes in the schedule earlier.",
    optionA: "tell", optionB: "told", optionC: "had told", optionD: "have told",
    correctOption: "C",
    explanation: "Would rather với 2 chủ ngữ, nói về sự việc lẽ ra nên xảy ra ở quá khứ (earlier) -> dùng Quá khứ hoàn thành (had told).",
    translation: "Tôi ước gì bạn đã nói cho tôi về những thay đổi trong lịch trình sớm hơn.",
    tips: "would rather S + had PII (QK)."
  },
  {
    question: "She looked as though she _____ up all night studying.",
    optionA: "stayed", optionB: "stays", optionC: "had stayed", optionD: "has stayed",
    correctOption: "C",
    explanation: "Động từ 'looked' (quá khứ). Giả định việc thức cả đêm xảy ra trước hành động 'looked' -> chia Quá khứ hoàn thành (had stayed).",
    translation: "Trông cô ấy cứ như thể cô ấy đã thức cả đêm để học.",
    tips: "V-past + as though + had PII."
  },
  {
    question: "They wish they _____ the opportunity to invest in that startup when it first launched.",
    optionA: "took", optionB: "have taken", optionC: "had taken", optionD: "would take",
    correctOption: "C",
    explanation: "Điều ước trái thực tế ở quá khứ (when it first launched) -> chia Quá khứ hoàn thành (had taken).",
    translation: "Họ ước gì họ đã nắm lấy cơ hội đầu tư vào công ty khởi nghiệp đó khi nó mới ra mắt.",
    tips: "wish + had PII (trái QK)."
  },
  {
    question: "It's about time you _____ taking your responsibilities seriously.",
    optionA: "start", optionB: "started", optionC: "starting", optionD: "will start",
    correctOption: "B",
    explanation: "Cấu trúc It's about time / It's high time + S + V-past: Đã đến lúc ai đó phải làm gì.",
    translation: "Đã đến lúc bạn phải bắt đầu thực hiện các trách nhiệm của mình một cách nghiêm túc.",
    tips: "It's about time S + V-past."
  },
  {
    question: "I hoped that the committee _____ my proposal into consideration.",
    optionA: "will take", optionB: "takes", optionC: "would take", optionD: "had taken",
    correctOption: "C",
    explanation: "Hoped (quá khứ) -> Mệnh đề chỉ hy vọng trong quá khứ thường dùng 'would + V'.",
    translation: "Tôi đã hy vọng rằng ủy ban sẽ xem xét đề xuất của tôi.",
    tips: "hoped + would V."
  },
  {
    question: "The engine sounds as if it _____ about to break down.",
    optionA: "is", optionB: "were", optionC: "was", optionD: "be",
    correctOption: "B",
    explanation: "Giả định không có thật ở hiện tại (động cơ chưa hỏng nhưng nghe có vẻ như vậy). Dùng 'were' cho mọi ngôi.",
    translation: "Động cơ nghe cứ như thể nó sắp bị hỏng.",
    tips: "as if + were."
  },
  {
    question: "I would rather have walked home than _____ for the bus in the rain.",
    optionA: "wait", optionB: "waited", optionC: "to wait", optionD: "waiting",
    correctOption: "B",
    explanation: "Cấu trúc would rather have + PII + than + (have) PII. Động từ thứ hai chia ở dạng phân từ 2 (waited).",
    translation: "Tôi thà đi bộ về nhà còn hơn là chờ xe buýt dưới trời mưa.",
    tips: "would rather have PII than PII."
  },
  {
    question: "He talks about Rome as if he _____ there himself, but we know he hasn't.",
    optionA: "was", optionB: "were", optionC: "had been", optionD: "has been",
    correctOption: "C",
    explanation: "Mặc dù 'talks' ở hiện tại, nhưng việc 'từng đến Rome' là sự việc xảy ra ở quá khứ -> Dùng Quá khứ hoàn thành (had been) để giả định trái thực tế.",
    translation: "Anh ấy nói về Rome cứ như thể chính anh ấy đã từng đến đó, nhưng chúng tôi biết anh ấy chưa từng.",
    tips: "as if + had PII (giả định QK)."
  },
  {
    question: "We wish the management _____ their decision to lay off the workers.",
    optionA: "will reconsider", optionB: "reconsiders", optionC: "would reconsider", optionD: "reconsidered",
    correctOption: "C",
    explanation: "Wish + would + V được dùng để bày tỏ mong muốn ai đó (management) sẽ thay đổi quyết định hoặc thực hiện một hành động trong tương lai.",
    translation: "Chúng tôi ước gì ban quản lý sẽ xem xét lại quyết định sa thải công nhân của họ.",
    tips: "wish + would V."
  },
  {
    question: "I'd rather you _____ me by my nickname in formal meetings.",
    optionA: "don't call", optionB: "didn't call", optionC: "hadn't called", optionD: "wouldn't call",
    correctOption: "B",
    explanation: "Would rather 2 chủ ngữ, diễn đạt ý muốn ở hiện tại (in formal meetings nói chung) -> Dùng quá khứ đơn (didn't call).",
    translation: "Tôi thà rằng bạn đừng gọi tôi bằng biệt danh trong các cuộc họp trang trọng.",
    tips: "would rather S didn't V."
  }
];

const ncLesson2 = [
  {
    question: "The economic crisis looks as if it _____ to worsen before it gets better.",
    optionA: "is going", optionB: "were going", optionC: "went", optionD: "had gone",
    correctOption: "A",
    explanation: "Bối cảnh thực tế (khủng hoảng kinh tế) và có khả năng xảy ra -> 'as if' đi với thì hiện tại tiếp diễn / tương lai gần (is going) vì nó mô tả diễn biến thật.",
    translation: "Cuộc khủng hoảng kinh tế có vẻ như sẽ tồi tệ hơn trước khi nó trở nên tốt hơn.",
    tips: "as if + HT/TL (có thật)."
  },
  {
    question: "I wish I _____ the foresight to save money when I was earning a high salary.",
    optionA: "have", optionB: "had", optionC: "had had", optionD: "would have",
    correctOption: "C",
    explanation: "Điều ước ở quá khứ (when I was earning...) -> dùng Quá khứ hoàn thành. Động từ chính là 'have', QKHT là 'had had'.",
    translation: "Tôi ước gì tôi đã có sự nhìn xa trông rộng để tiết kiệm tiền khi tôi còn đang kiếm được mức lương cao.",
    tips: "wish + had had (QKHT)."
  },
  {
    question: "She treats him as though he _____ a total stranger, even though they were married for years.",
    optionA: "is", optionB: "was", optionC: "were", optionD: "has been",
    correctOption: "C",
    explanation: "Cấu trúc giả định trái thực tế hiện tại (treats) -> as though + quá khứ đơn (were).",
    translation: "Cô ấy đối xử với anh ấy cứ như thể anh ấy là một người hoàn toàn xa lạ, mặc dù họ đã kết hôn nhiều năm.",
    tips: "as though + were."
  },
  {
    question: "They hoped the negotiations _____ a mutually beneficial agreement.",
    optionA: "yield", optionB: "will yield", optionC: "would yield", optionD: "yielded",
    correctOption: "C",
    explanation: "Hoped (quá khứ) đi với mong muốn trong tương lai tại thời điểm quá khứ -> would + V.",
    translation: "Họ đã hy vọng các cuộc đàm phán sẽ mang lại một thỏa thuận đôi bên cùng có lợi.",
    tips: "hoped + would V."
  },
  {
    question: "I would rather you _____ to the press before consulting with our legal team.",
    optionA: "not speak", optionB: "didn't speak", optionC: "hadn't spoken", optionD: "wouldn't speak",
    correctOption: "C",
    explanation: "Nói về việc đã xảy ra ở quá khứ (đã nói với báo chí rồi) -> dùng would rather S + QKHT (hadn't spoken).",
    translation: "Tôi thà rằng bạn đã không nói chuyện với báo chí trước khi tham khảo ý kiến đội ngũ pháp lý của chúng ta.",
    tips: "would rather S hadn't PII."
  },
  {
    question: "He walked into the room as if he _____ the place.",
    optionA: "owns", optionB: "owned", optionC: "has owned", optionD: "had owned",
    correctOption: "B",
    explanation: "Hành động 'owned' xảy ra ĐỒNG THỜI với hành động 'walked' (quá khứ). Giả định trái thực tế -> dùng quá khứ đơn (owned). (Một số tài liệu cũ có thể dùng had owned, nhưng owned phổ biến hơn cho sự đồng thời).",
    translation: "Anh ta bước vào phòng cứ như thể anh ta là chủ nơi này.",
    tips: "V-past + as if + V-past (đồng thời)."
  },
  {
    question: "It is high time the board of directors _____ a definitive action on this matter.",
    optionA: "takes", optionB: "took", optionC: "taken", optionD: "will take",
    correctOption: "B",
    explanation: "It's high time + S + V-past: Đã đến lúc phải làm gì.",
    translation: "Đã đến lúc hội đồng quản trị phải thực hiện một hành động dứt khoát về vấn đề này.",
    tips: "It is high time + V-past."
  },
  {
    question: "I wish the neighbors _____ playing loud music every night. It's driving me crazy.",
    optionA: "stop", optionB: "stopped", optionC: "would stop", optionD: "had stopped",
    correctOption: "C",
    explanation: "Phàn nàn về một thói quen gây khó chịu ở hiện tại và mong muốn họ thay đổi -> wish + would + V.",
    translation: "Tôi ước gì những người hàng xóm ngừng chơi nhạc ồn ào mỗi đêm. Điều đó làm tôi phát điên lên.",
    tips: "wish + would V."
  },
  {
    question: "He looks as if he _____ for days.",
    optionA: "didn't sleep", optionB: "hasn't slept", optionC: "hadn't slept", optionD: "wouldn't sleep",
    correctOption: "C",
    explanation: "Hành động 'không ngủ' xảy ra TRƯỚC thời điểm hiện tại 'looks'. Trái với thực tế (thực ra có ngủ) -> lùi thì thành Quá khứ hoàn thành (hadn't slept).",
    translation: "Anh ấy trông cứ như thể anh ấy đã không ngủ trong nhiều ngày.",
    tips: "as if + had PII."
  },
  {
    question: "I would rather have been informed of the decision immediately than _____ it from someone else.",
    optionA: "hear", optionB: "heard", optionC: "hearing", optionD: "to hear",
    correctOption: "B",
    explanation: "Cấu trúc would rather have PII + than + (have) PII. ( heard là dạng PII của hear).",
    translation: "Tôi thà được thông báo quyết định ngay lập tức còn hơn là nghe điều đó từ người khác.",
    tips: "would rather have PII than PII."
  }
];

async function run() {
  console.log("Generating Topic 13: Cấu trúc As if, As though, Hope, Wish, Would rather (3 levels)...");
  
  const baseTitle = "As if, As though, Hope, Wish, Would rather";
  const levelsData = [
    { level: "Cơ Bản", slug: "cau-truc-as-if-hope-wish-co-ban", keyword: "[Cơ Bản]", lessons: [ { title: "Bài tập 1", questions: cbLesson1 }, { title: "Bài tập 2", questions: cbLesson2 } ] },
    { level: "Trung Cấp", slug: "cau-truc-as-if-hope-wish-trung-cap", keyword: "[Trung Cấp]", lessons: [ { title: "Bài tập 1", questions: tcLesson1 }, { title: "Bài tập 2", questions: tcLesson2 } ] },
    { level: "Nâng Cao", slug: "cau-truc-as-if-hope-wish-nang-cao", keyword: "[Nâng Cao]", lessons: [ { title: "Bài tập 1", questions: ncLesson1 }, { title: "Bài tập 2", questions: ncLesson2 } ] }
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
        subtitle: `Cách sử dụng câu giả định và điều ước mức độ ${lData.level}`,
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

  console.log("Topic 13 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
