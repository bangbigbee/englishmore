import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ==========================================
// DỄ (LESSON 1 & 2)
// ==========================================
const easyLesson1 = [
  {
    question: "I _____ play tennis a lot, but I don't play very much now.",
    optionA: "am used to", optionB: "was used to", optionC: "used to", optionD: "get used to",
    correctOption: "C",
    explanation: "Cấu trúc 'used to + V-nguyên thể' diễn tả một thói quen trong quá khứ nay không còn nữa.",
    translation: "Tôi đã từng chơi quần vợt rất nhiều, nhưng bây giờ tôi không chơi nhiều nữa.",
    tips: "used to + V (thói quen quá khứ)."
  },
  {
    question: "It took me a long time to _____ driving on the left.",
    optionA: "used to", optionB: "get used to", optionC: "getting used to", optionD: "use to",
    correctOption: "B",
    explanation: "Cấu trúc 'get used to + V-ing / Noun' mang nghĩa 'dần quen với việc gì'. Sau 'to' (infinitive của take time to do sth), ta dùng động từ nguyên thể 'get'.",
    translation: "Tôi đã mất một thời gian dài để quen với việc lái xe bên trái.",
    tips: "get used to + V-ing (dần quen với)."
  },
  {
    question: "She _____ living alone, so she doesn't mind the quiet.",
    optionA: "is used to", optionB: "used to", optionC: "uses to", optionD: "did use to",
    correctOption: "A",
    explanation: "Cấu trúc 'be used to + V-ing / Noun' mang nghĩa 'đã quen với việc gì' ở hiện tại.",
    translation: "Cô ấy đã quen với việc sống một mình, nên cô ấy không thấy phiền vì sự yên tĩnh.",
    tips: "be used to + V-ing (đã quen với)."
  },
  {
    question: "Did you _____ go to the cinema very often when you were a child?",
    optionA: "used to", optionB: "use to", optionC: "using to", optionD: "uses to",
    correctOption: "B",
    explanation: "Trong câu hỏi có trợ động từ 'Did', ta dùng động từ nguyên thể 'use to' (không có d).",
    translation: "Bạn có thường xuyên đi xem phim khi còn nhỏ không?",
    tips: "Did + S + use to + V."
  },
  {
    question: "I am not used to _____ up so early in the morning.",
    optionA: "wake", optionB: "woke", optionC: "woken", optionD: "waking",
    correctOption: "D",
    explanation: "Sau 'be used to' phải là V-ing hoặc Danh từ.",
    translation: "Tôi không quen với việc thức dậy quá sớm vào buổi sáng.",
    tips: "be used to + V-ing."
  },
  {
    question: "There _____ be a cinema here, but it was torn down last year.",
    optionA: "gets used to", optionB: "used to", optionC: "is used to", optionD: "use to",
    correctOption: "B",
    explanation: "'used to + V' dùng để chỉ một trạng thái hoặc sự thật đã tồn tại trong quá khứ nhưng nay không còn.",
    translation: "Đã từng có một rạp chiếu phim ở đây, nhưng nó đã bị phá bỏ vào năm ngoái.",
    tips: "There used to be = Đã từng có."
  },
  {
    question: "We will soon _____ the new software system at work.",
    optionA: "use to", optionB: "used to", optionC: "get used to", optionD: "getting used to",
    correctOption: "C",
    explanation: "Sau 'will' dùng động từ nguyên thể 'get'. 'get used to' + Noun (the new software system) = dần làm quen với.",
    translation: "Chúng tôi sẽ sớm làm quen với hệ thống phần mềm mới tại nơi làm việc.",
    tips: "will get used to + Noun."
  },
  {
    question: "He didn't _____ smoke, but he started a few years ago.",
    optionA: "used to", optionB: "use to", optionC: "uses to", optionD: "using to",
    correctOption: "B",
    explanation: "Trong câu phủ định quá khứ (didn't), ta dùng 'use to' (không có d).",
    translation: "Anh ấy đã từng không hút thuốc, nhưng anh ấy đã bắt đầu hút vài năm trước.",
    tips: "didn't use to + V."
  },
  {
    question: "Are you used to _____ spicy food yet?",
    optionA: "eat", optionB: "ate", optionC: "eaten", optionD: "eating",
    correctOption: "D",
    explanation: "Cấu trúc 'be used to + V-ing'.",
    translation: "Bạn đã quen với việc ăn thức ăn cay chưa?",
    tips: "be used to + V-ing."
  },
  {
    question: "My father _____ read a bedtime story to me every night.",
    optionA: "used to", optionB: "is used to", optionC: "gets used to", optionD: "using to",
    correctOption: "A",
    explanation: "Diễn tả một thói quen lặp đi lặp lại trong quá khứ dùng 'used to + V'.",
    translation: "Bố tôi đã từng đọc truyện trước khi đi ngủ cho tôi mỗi đêm.",
    tips: "used to + V."
  }
];

const easyLesson2 = [
  {
    question: "I can't _____ working with this new loud machine.",
    optionA: "used to", optionB: "get used to", optionC: "getting used to", optionD: "use to",
    correctOption: "B",
    explanation: "Sau 'can't' (modal verb) dùng động từ nguyên thể 'get used to' (không quen được với).",
    translation: "Tôi không thể quen được với việc làm việc cùng chiếc máy ồn ào mới này.",
    tips: "can't get used to + V-ing."
  },
  {
    question: "Before they built the highway, it _____ take three hours to get to the city.",
    optionA: "is used to", optionB: "was used to", optionC: "used to", optionD: "gets used to",
    correctOption: "C",
    explanation: "Thói quen/Sự việc thường xuyên trong quá khứ: used to + V (take).",
    translation: "Trước khi họ xây dựng đường cao tốc, đã từng mất ba giờ để đến thành phố.",
    tips: "used to + V."
  },
  {
    question: "As a nurse, she is used to _____ night shifts.",
    optionA: "work", optionB: "worked", optionC: "working", optionD: "works",
    correctOption: "C",
    explanation: "be used to + V-ing (quen với việc gì).",
    translation: "Là một y tá, cô ấy đã quen với việc làm ca đêm.",
    tips: "be used to + V-ing."
  },
  {
    question: "I _____ hate vegetables when I was younger, but now I love them.",
    optionA: "used to", optionB: "use to", optionC: "was used to", optionD: "got used to",
    correctOption: "A",
    explanation: "Chỉ một trạng thái/sở thích ở quá khứ nay không còn: used to + V.",
    translation: "Tôi đã từng ghét rau khi còn nhỏ, nhưng bây giờ tôi lại rất thích chúng.",
    tips: "used to + V."
  },
  {
    question: "If you move to England, you'll have to get used to _____ on the left side of the road.",
    optionA: "drive", optionB: "drove", optionC: "driving", optionD: "driven",
    correctOption: "C",
    explanation: "get used to + V-ing.",
    translation: "Nếu bạn chuyển đến Anh, bạn sẽ phải làm quen với việc lái xe ở bên trái đường.",
    tips: "get used to + V-ing."
  },
  {
    question: "They _____ live in Paris before they moved to London.",
    optionA: "are used to", optionB: "used to", optionC: "use to", optionD: "get used to",
    correctOption: "B",
    explanation: "Sự thật trong quá khứ đã thay đổi: used to + V.",
    translation: "Họ đã từng sống ở Paris trước khi chuyển đến London.",
    tips: "used to + V."
  },
  {
    question: "I am slowly _____ the cold weather in this country.",
    optionA: "get used to", optionB: "getting used to", optionC: "used to", optionD: "use to",
    correctOption: "B",
    explanation: "Thì hiện tại tiếp diễn: am getting used to + Noun (đang dần quen với).",
    translation: "Tôi đang dần làm quen với thời tiết lạnh giá ở đất nước này.",
    tips: "am getting used to."
  },
  {
    question: "Did you _____ have long hair in high school?",
    optionA: "use to", optionB: "used to", optionC: "uses to", optionD: "using to",
    correctOption: "A",
    explanation: "Câu hỏi dạng quá khứ với 'Did' -> động từ nguyên thể 'use to'.",
    translation: "Hồi trung học bạn có để tóc dài không?",
    tips: "Did + use to."
  },
  {
    question: "He is not used to _____ in front of a large audience.",
    optionA: "speak", optionB: "spoke", optionC: "speaking", optionD: "spoken",
    correctOption: "C",
    explanation: "be not used to + V-ing (không quen với việc).",
    translation: "Anh ấy không quen với việc nói trước một lượng lớn khán giả.",
    tips: "be used to + V-ing."
  },
  {
    question: "The dog _____ sleep on my bed, but now he sleeps on the floor.",
    optionA: "is used to", optionB: "used to", optionC: "was used to", optionD: "getting used to",
    correctOption: "B",
    explanation: "Thói quen quá khứ: used to + V.",
    translation: "Con chó đã từng ngủ trên giường của tôi, nhưng bây giờ nó ngủ trên sàn nhà.",
    tips: "used to + V."
  }
];

// ==========================================
// TRUNG BÌNH (LESSON 3 & 4)
// ==========================================
const mediumLesson1 = [
  {
    question: "When I started my new job, I had to _____ early.",
    optionA: "get used to waking up", optionB: "used to waking up", optionC: "get used to wake up", optionD: "used to wake up",
    correctOption: "A",
    explanation: "Sau 'had to' (phải làm gì) dùng động từ nguyên thể 'get'. 'get used to' + V-ing: dần làm quen với việc thức dậy sớm.",
    translation: "Khi tôi bắt đầu công việc mới, tôi đã phải làm quen với việc thức dậy sớm.",
    tips: "had to + get used to + V-ing."
  },
  {
    question: "My grandparents _____ travel a lot before they retired.",
    optionA: "were used to", optionB: "got used to", optionC: "used to", optionD: "use to",
    correctOption: "C",
    explanation: "Hành động thường xuyên xảy ra ở quá khứ và hiện không còn nữa dùng 'used to + V'.",
    translation: "Ông bà tôi đã từng đi du lịch rất nhiều trước khi họ nghỉ hưu.",
    tips: "used to + V (thói quen QK)."
  },
  {
    question: "I've lived here for a year now, so I _____ the noise from the street.",
    optionA: "used to", optionB: "am used to", optionC: "am get used to", optionD: "use to",
    correctOption: "B",
    explanation: "Đã sống 1 năm nên hiện tại 'đã quen với' -> 'be used to' + Noun (the noise).",
    translation: "Tôi đã sống ở đây được một năm rồi, nên tôi đã quen với tiếng ồn từ đường phố.",
    tips: "be used to + Noun (hiện tại đã quen)."
  },
  {
    question: "We _____ playing video games all night, but now we get tired early.",
    optionA: "used to", optionB: "are used to", optionC: "were used to", optionD: "used to be",
    correctOption: "C",
    explanation: "Câu này có V-ing (playing) nên không thể đi với 'used to' đơn thuần. Phải dùng 'be used to' ở quá khứ -> 'were used to' (trước đây đã từng quen với việc...).",
    translation: "Trước đây chúng tôi đã từng quen với việc chơi điện tử thâu đêm, nhưng bây giờ chúng tôi thấy mệt sớm.",
    tips: "were used to + V-ing (đã quen với việc gì trong QK)."
  },
  {
    question: "You will soon _____ living in the countryside.",
    optionA: "get used to", optionB: "be used to", optionC: "used to", optionD: "got used to",
    correctOption: "A",
    explanation: "Dự đoán sự thay đổi trạng thái trong tương lai: will + get used to + V-ing (sẽ dần làm quen).",
    translation: "Bạn sẽ sớm làm quen với việc sống ở nông thôn.",
    tips: "will get used to + V-ing."
  },
  {
    question: "It is difficult for older employees to _____ the new digital workflow.",
    optionA: "used to", optionB: "be used to", optionC: "get used to", optionD: "use to",
    correctOption: "C",
    explanation: "Sau 'to' (infinitive) dùng động từ nguyên thể 'get'. 'get used to + Noun' = dần làm quen với.",
    translation: "Thật khó cho những nhân viên lớn tuổi để làm quen với quy trình làm việc kỹ thuật số mới.",
    tips: "to get used to + Noun."
  },
  {
    question: "She _____ drink coffee, but now she is addicted to it.",
    optionA: "didn't used to", optionB: "didn't use to", optionC: "wasn't used to", optionD: "hasn't used to",
    correctOption: "B",
    explanation: "Phủ định của thói quen trong quá khứ là 'didn't use to' + V.",
    translation: "Cô ấy đã từng không uống cà phê, nhưng bây giờ cô ấy bị nghiện nó.",
    tips: "didn't use to + V."
  },
  {
    question: "I am a teacher, so I _____ speaking in public.",
    optionA: "used to", optionB: "get used to", optionC: "am used to", optionD: "was used to",
    correctOption: "C",
    explanation: "Do nghề nghiệp nên hiện tại đã ở trạng thái 'quen với việc' -> am used to + V-ing.",
    translation: "Tôi là một giáo viên, nên tôi đã quen với việc nói trước đám đông.",
    tips: "am used to + V-ing."
  },
  {
    question: "Because he is an early bird, he _____ up at 5 a.m.",
    optionA: "is used to getting", optionB: "used to getting", optionC: "uses to get", optionD: "get used to get",
    correctOption: "A",
    explanation: "Early bird (người dậy sớm) -> Thói quen hiện tại 'đã quen với' -> is used to + V-ing.",
    translation: "Vì anh ấy là người hay dậy sớm, anh ấy đã quen với việc thức dậy lúc 5 giờ sáng.",
    tips: "is used to + V-ing."
  },
  {
    question: "I _____ the taste of this medicine; it still tastes awful to me.",
    optionA: "am not used to", optionB: "haven't got used to", optionC: "didn't use to", optionD: "won't use to",
    correctOption: "B",
    explanation: "Thì Hiện tại hoàn thành: haven't got used to (vẫn chưa quen được với).",
    translation: "Tôi vẫn chưa quen được với mùi vị của loại thuốc này; nó vẫn có vị thật tồi tệ đối với tôi.",
    tips: "haven't got used to (vẫn chưa làm quen được)."
  }
];

const mediumLesson2 = [
  {
    question: "Did you _____ believe in ghosts when you were a little kid?",
    optionA: "use to", optionB: "used to", optionC: "get used to", optionD: "be used to",
    correctOption: "A",
    explanation: "Câu hỏi 'Did' -> động từ ở dạng nguyên thể không 'd': use to.",
    translation: "Hồi còn nhỏ bạn có từng tin vào ma quỷ không?",
    tips: "Did + use to."
  },
  {
    question: "After six months in Japan, I _____ the public transportation system.",
    optionA: "used to", optionB: "got used to", optionC: "am used to", optionD: "use to",
    correctOption: "B",
    explanation: "Quá trình làm quen đã diễn ra và hoàn tất trong quá khứ -> got used to (đã dần quen với).",
    translation: "Sau sáu tháng ở Nhật Bản, tôi đã làm quen được với hệ thống giao thông công cộng.",
    tips: "got used to + Noun."
  },
  {
    question: "He complains a lot because he _____ doing manual labor.",
    optionA: "is not used to", optionB: "doesn't use to", optionC: "didn't use to", optionD: "isn't getting used to",
    correctOption: "A",
    explanation: "Anh ta phàn nàn ở hiện tại (complains) vì tình trạng 'không quen với' ở hiện tại -> is not used to + V-ing.",
    translation: "Anh ta phàn nàn rất nhiều vì anh ta không quen với việc làm lao động chân tay.",
    tips: "be not used to + V-ing."
  },
  {
    question: "They _____ live in an apartment, but now they own a large house.",
    optionA: "are used to", optionB: "were used to", optionC: "used to", optionD: "got used to",
    correctOption: "C",
    explanation: "Trạng thái ở quá khứ nay không còn: used to + V (live).",
    translation: "Họ đã từng sống trong một căn hộ, nhưng bây giờ họ sở hữu một ngôi nhà lớn.",
    tips: "used to + V."
  },
  {
    question: "I can't imagine how people _____ communicate before the internet.",
    optionA: "are used to", optionB: "got used to", optionC: "use to", optionD: "used to",
    correctOption: "D",
    explanation: "Thói quen, sự việc ở thời điểm trước khi có internet (quá khứ) -> used to + V.",
    translation: "Tôi không thể tưởng tượng được mọi người đã từng giao tiếp như thế nào trước khi có internet.",
    tips: "used to + V."
  },
  {
    question: "It was a struggle at first, but she _____ working with her new team.",
    optionA: "used to", optionB: "use to", optionC: "has got used to", optionD: "is used to",
    correctOption: "C",
    explanation: "Quá trình từ lúc bắt đầu (at first) cho đến hiện tại đã quen -> Hiện tại hoàn thành: has got used to + V-ing.",
    translation: "Ban đầu là một cuộc đấu tranh, nhưng cô ấy đã dần làm quen với việc làm việc cùng nhóm mới của mình.",
    tips: "has got used to + V-ing."
  },
  {
    question: "We _____ taking a walk after dinner, but lately we've been too busy.",
    optionA: "used to", optionB: "were used to", optionC: "are used to", optionD: "have used to",
    correctOption: "B",
    explanation: "Câu này có 'taking' (V-ing) -> Phải dùng 'be used to'. Vì vế sau 'lately we've been...' chỉ sự thay đổi, vế trước là thói quen ở quá khứ -> 'were used to taking'.",
    translation: "Trước đây chúng tôi quen với việc đi dạo sau bữa tối, nhưng dạo này chúng tôi bận quá.",
    tips: "were used to + V-ing."
  },
  {
    question: "How long did it take you to _____ the cold climate?",
    optionA: "used to", optionB: "use to", optionC: "get used to", optionD: "be used to",
    correctOption: "C",
    explanation: "take time to do sth -> to get used to (mất bao lâu để dần làm quen với).",
    translation: "Bạn đã mất bao lâu để làm quen với khí hậu lạnh giá?",
    tips: "to get used to + Noun."
  },
  {
    question: "He never _____ study so hard, but the university curriculum demands it.",
    optionA: "used to", optionB: "uses to", optionC: "is used to", optionD: "gets used to",
    correctOption: "A",
    explanation: "Từ 'never' mang nghĩa phủ định. 'never used to + V' = chưa từng có thói quen làm gì trong quá khứ.",
    translation: "Anh ấy chưa từng (có thói quen) học tập chăm chỉ như vậy, nhưng chương trình đại học đòi hỏi điều đó.",
    tips: "never used to + V."
  },
  {
    question: "Are you _____ the new company regulations yet?",
    optionA: "used to", optionB: "use to", optionC: "getting used to", optionD: "using to",
    correctOption: "C",
    explanation: "Thì hiện tại tiếp diễn dạng câu hỏi: Are you getting used to...? (Bạn đã dần quen với... chưa?)",
    translation: "Bạn đã dần quen với các quy định mới của công ty chưa?",
    tips: "Are you getting used to + Noun."
  }
];

// ==========================================
// KHÓ (LESSON 5 & 6)
// ==========================================
const hardLesson1 = [
  {
    question: "Knives are generally _____ cut food.",
    optionA: "used to", optionB: "getting used to", optionC: "used to cutting", optionD: "used for",
    correctOption: "A",
    explanation: "Bẫy: Đây KHÔNG PHẢI cấu trúc thói quen, mà là câu BỊ ĐỘNG của động từ 'use' (sử dụng). To be used to + V (nguyên thể) = được sử dụng để làm gì.",
    translation: "Dao nói chung được sử dụng để cắt thức ăn.",
    tips: "be used to + V-bare (Bị động: được dùng để)."
  },
  {
    question: "I _____ the constant noise of the construction site near my apartment.",
    optionA: "am not used to", optionB: "haven't used to", optionC: "didn't used to", optionD: "don't get used to",
    correctOption: "A",
    explanation: "Diễn tả trạng thái hiện tại chưa quen: am not used to + Noun.",
    translation: "Tôi chưa quen với tiếng ồn liên tục từ công trường xây dựng gần căn hộ của tôi.",
    tips: "be not used to + Noun."
  },
  {
    question: "This ancient building _____ a school during the 19th century.",
    optionA: "was used as", optionB: "used to be", optionC: "is used to being", optionD: "Both A and B",
    correctOption: "D",
    explanation: "Cả A và B đều hợp lý. A: was used as (được dùng như là). B: used to be (đã từng là).",
    translation: "Tòa nhà cổ này đã từng là / được dùng làm trường học vào thế kỷ 19.",
    tips: "used to be (đã từng là); was used as (được dùng làm)."
  },
  {
    question: "It is hard for an introvert to _____ spending so much time networking.",
    optionA: "be used to", optionB: "get used to", optionC: "used to", optionD: "use to",
    correctOption: "B",
    explanation: "Diễn tả sự thay đổi, quá trình chuyển đổi -> get used to + V-ing.",
    translation: "Thật khó cho một người hướng nội để làm quen với việc dành quá nhiều thời gian xây dựng mối quan hệ.",
    tips: "get used to + V-ing."
  },
  {
    question: "Wood is commonly _____ making furniture and paper.",
    optionA: "used to", optionB: "used for", optionC: "used of", optionD: "using for",
    correctOption: "B",
    explanation: "Bẫy bị động: be used for + V-ing (được sử dụng cho mục đích gì). Cấu trúc tương đương là 'be used to + V-bare'.",
    translation: "Gỗ thường được sử dụng để làm đồ nội thất và giấy.",
    tips: "be used for + V-ing (Bị động)."
  },
  {
    question: "I _____ skipping breakfast, but my doctor advised me to stop.",
    optionA: "used to", optionB: "am used to", optionC: "was used to", optionD: "used to be",
    correctOption: "C",
    explanation: "Vế sau chỉ sự thay đổi do bác sĩ khuyên (đã khuyên - advised). Tức là trong quá khứ người này 'đã quen với' việc bỏ bữa sáng. Dùng 'was used to + V-ing'.",
    translation: "Tôi trước đây đã quen với việc bỏ bữa sáng, nhưng bác sĩ đã khuyên tôi nên dừng lại.",
    tips: "was used to + V-ing (trạng thái đã quen ở QK)."
  },
  {
    question: "Over time, the employees _____ the strict management style of the new CEO.",
    optionA: "were used to", optionB: "got used to", optionC: "used to", optionD: "have used to",
    correctOption: "B",
    explanation: "'Over time' (theo thời gian) nhấn mạnh một quá trình đã hoàn tất -> got used to (đã dần làm quen với).",
    translation: "Theo thời gian, các nhân viên đã dần quen với phong cách quản lý nghiêm ngặt của Giám đốc điều hành mới.",
    tips: "got used to + Noun."
  },
  {
    question: "He _____ be incredibly shy, but public speaking courses helped him overcome it.",
    optionA: "use to", optionB: "was used to", optionC: "used to", optionD: "used",
    correctOption: "C",
    explanation: "Thói quen/Tính cách trong quá khứ đã thay đổi: used to + V (be).",
    translation: "Anh ấy đã từng vô cùng nhút nhát, nhưng các khóa học nói trước công chúng đã giúp anh ấy vượt qua nó.",
    tips: "used to + V."
  },
  {
    question: "I still haven't _____ wearing glasses instead of contact lenses.",
    optionA: "used to", optionB: "got used to", optionC: "been used to", optionD: "get used to",
    correctOption: "B",
    explanation: "Thì hiện tại hoàn thành: haven't got used to + V-ing (vẫn chưa làm quen được với).",
    translation: "Tôi vẫn chưa làm quen được với việc đeo kính gọng thay vì kính áp tròng.",
    tips: "haven't got used to + V-ing."
  },
  {
    question: "A lot of energy _____ heat the building during winter.",
    optionA: "is used to", optionB: "is used for", optionC: "gets used to", optionD: "used to",
    correctOption: "A",
    explanation: "Bị động: 'energy is used' + 'to heat' (năng lượng được sử dụng để làm nóng). Đừng nhầm với cấu trúc quen thuộc.",
    translation: "Rất nhiều năng lượng được sử dụng để sưởi ấm tòa nhà trong suốt mùa đông.",
    tips: "be used to + V-bare (Bị động)."
  }
];

const hardLesson2 = [
  {
    question: "I doubt I will ever _____ the spicy food in this region.",
    optionA: "used to", optionB: "be used to", optionC: "get used to", optionD: "use to",
    correctOption: "C",
    explanation: "Sau 'will ever' dùng động từ nguyên thể 'get'. Diễn tả quá trình làm quen trong tương lai.",
    translation: "Tôi nghi ngờ việc mình sẽ có lúc làm quen được với đồ ăn cay ở vùng này.",
    tips: "will ever get used to + Noun."
  },
  {
    question: "There _____ a time when communication took weeks, not seconds.",
    optionA: "was used to", optionB: "got used to", optionC: "used to be", optionD: "used to being",
    correctOption: "C",
    explanation: "Cấu trúc 'There used to be...' = Đã từng có một thời...",
    translation: "Đã từng có thời điểm mà việc liên lạc mất hàng tuần, chứ không phải vài giây.",
    tips: "There used to be."
  },
  {
    question: "She _____ receiving harsh criticism, so this bad review didn't bother her.",
    optionA: "is used to", optionB: "was used to", optionC: "used to", optionD: "gets used to",
    correctOption: "B",
    explanation: "Sự việc 'bad review didn't bother her' diễn ra ở quá khứ, lý do là trước đó cô ấy 'đã quen với' -> was used to + V-ing.",
    translation: "Cô ấy đã quen với việc nhận những lời chỉ trích gay gắt, nên bài đánh giá tồi tệ này không làm cô ấy bận tâm.",
    tips: "was used to + V-ing."
  },
  {
    question: "Software tools are mainly _____ automate repetitive tasks.",
    optionA: "used to", optionB: "used for", optionC: "getting used to", optionD: "used of",
    correctOption: "A",
    explanation: "Bị động: be used to + V-bare (automate). Được sử dụng để tự động hóa...",
    translation: "Các công cụ phần mềm chủ yếu được sử dụng để tự động hóa các nhiệm vụ lặp đi lặp lại.",
    tips: "be used to + V-bare (Bị động)."
  },
  {
    question: "I don't think I can ever _____ up at 4 AM every day.",
    optionA: "used to waking", optionB: "get used to wake", optionC: "get used to waking", optionD: "be used to wake",
    correctOption: "C",
    explanation: "can ever + get used to + V-ing (có thể quen với việc).",
    translation: "Tôi không nghĩ mình có thể quen với việc thức dậy lúc 4 giờ sáng mỗi ngày.",
    tips: "get used to + V-ing."
  },
  {
    question: "He _____ think that success comes easily without hard work.",
    optionA: "used to", optionB: "is used to", optionC: "was used to", optionD: "got used to",
    correctOption: "A",
    explanation: "Sự thật/niềm tin trong quá khứ đã thay đổi: used to + V (think).",
    translation: "Anh ấy đã từng nghĩ rằng thành công đến dễ dàng mà không cần làm việc chăm chỉ.",
    tips: "used to + V."
  },
  {
    question: "A Geiger counter is an instrument _____ measuring radioactivity.",
    optionA: "used to", optionB: "used for", optionC: "using to", optionD: "is used to",
    correctOption: "B",
    explanation: "Mệnh đề quan hệ rút gọn: 'which is used for measuring' -> 'used for measuring'. (Be used for + V-ing).",
    translation: "Máy đếm Geiger là một công cụ được sử dụng để đo độ phóng xạ.",
    tips: "used for + V-ing (MĐQH rút gọn)."
  },
  {
    question: "Many expats find it challenging to _____ the cultural differences.",
    optionA: "be used to", optionB: "get used to", optionC: "used to", optionD: "use to",
    correctOption: "B",
    explanation: "Chỉ một quá trình chuyển đổi trạng thái (trở nên quen thuộc) -> get used to + Noun.",
    translation: "Nhiều người nước ngoài thấy thật thử thách khi phải làm quen với những khác biệt văn hóa.",
    tips: "to get used to + Noun."
  },
  {
    question: "By the time he graduates, he _____ handling tight deadlines.",
    optionA: "will be used to", optionB: "will get used to", optionC: "Both A and B", optionD: "will have used to",
    correctOption: "C",
    explanation: "Cả A và B đều mang ý nghĩa hợp lý trong tương lai: 'sẽ ở trạng thái quen với' hoặc 'sẽ dần quen với'.",
    translation: "Vào thời điểm anh ấy tốt nghiệp, anh ấy sẽ (dần) quen với việc xử lý các thời hạn nghiêm ngặt.",
    tips: "will be/get used to + V-ing."
  },
  {
    question: "He didn't _____ be so aggressive, but the stress has changed him.",
    optionA: "use to", optionB: "used to", optionC: "uses to", optionD: "getting used to",
    correctOption: "A",
    explanation: "Phủ định thì quá khứ đơn của cấu trúc thói quen: didn't use to + V.",
    translation: "Anh ấy đã từng không hung hăng như vậy, nhưng căng thẳng đã thay đổi anh ấy.",
    tips: "didn't use to + V."
  }
];

async function run() {
  console.log("Generating Topic 14: Cấu trúc Used to & Be/Get used to (Level: Trung Cấp, 6 lessons)...");
  
  const baseTitle = "Cấu trúc Used to & Be/Get used to";
  const slug = "cau-truc-used-to-get-used-to";
  const level = "Trung Cấp";

  let topic = await prisma.toeicGrammarTopic.findUnique({ where: { slug: slug } });
  
  if (topic) {
      console.log(`Topic ${slug} already exists. Skipping creation...`);
  } else {
      topic = await prisma.toeicGrammarTopic.create({
        data: {
          title: baseTitle,
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
  console.log("Topic 14 Generation Completed!");
}

run().catch(console.error).finally(() => prisma.$disconnect());
