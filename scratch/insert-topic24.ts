import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const easyLesson1 = [
  { question: "Never ________ such a beautiful sunset before.", optionA: "I have seen", optionB: "have I seen", optionC: "I saw", optionD: "did I see", correctOption: "B", explanation: "Đảo ngữ với Never/Rarely/Seldom: Trợ động từ đảo lên trước Chủ ngữ. Hiện tại hoàn thành -> have I seen.", translation: "Tôi chưa từng thấy cảnh hoàng hôn nào đẹp như thế trước đây.", tips: "Never + Trợ ĐT + S + V" },
  { question: "Hardly ________ the phone down when it rang again.", optionA: "he had put", optionB: "had he put", optionC: "put he", optionD: "he put", correctOption: "B", explanation: "Cấu trúc Hardly had S P2 + when + S V(qk) = Vừa mới... thì... Trợ động từ 'had' đứng trước 'he'.", translation: "Anh ấy vừa mới đặt điện thoại xuống thì nó lại reo.", tips: "Hardly had S P2... when" },
  { question: "No sooner ________ out than it started to rain.", optionA: "had we gone", optionB: "we had gone", optionC: "did we go", optionD: "went we", correctOption: "A", explanation: "Cấu trúc No sooner had S P2 + than + S V(qk) = Ngay khi... thì... Đảo 'had' lên trước 'we'.", translation: "Ngay khi chúng tôi vừa ra ngoài thì trời bắt đầu mưa.", tips: "No sooner had S P2... than" },
  { question: "Seldom ________ to the cinema these days.", optionA: "do we go", optionB: "we go", optionC: "we do go", optionD: "go we", correctOption: "A", explanation: "Đảo ngữ với Seldom ở thì Hiện tại đơn -> Mượn trợ động từ do/does + S + V-bare.", translation: "Dạo này chúng tôi hiếm khi đi xem phim.", tips: "Seldom + Trợ ĐT + S + V" },
  { question: "Rarely ________ so much attention to a movie.", optionA: "has the public paid", optionB: "the public has paid", optionC: "paid the public", optionD: "the public paid", correctOption: "A", explanation: "Đảo ngữ với Rarely: has + S + P2.", translation: "Hiếm khi công chúng lại dành nhiều sự chú ý đến một bộ phim như vậy.", tips: "Rarely + Trợ ĐT + S + V" },
  { question: "Not only ________ well, but she also dances beautifully.", optionA: "she sings", optionB: "sings she", optionC: "does she sing", optionD: "she does sing", correctOption: "C", explanation: "Cấu trúc Not only... but also (Không những... mà còn) đảo ngữ ở vế đầu tiên: does she sing.", translation: "Cô ấy không những hát hay mà còn nhảy đẹp.", tips: "Not only + Trợ ĐT + S + V" },
  { question: "Under no circumstances ________ you leave the house.", optionA: "should", optionB: "you should", optionC: "should you", optionD: "you can", correctOption: "C", explanation: "Cụm Under no circumstances (Trong bất kỳ hoàn cảnh nào cũng không) -> Đảo ngữ: should you leave.", translation: "Trong bất kỳ hoàn cảnh nào bạn cũng không được rời khỏi nhà.", tips: "Under no circumstances + Đảo ngữ" },
  { question: "At no time ________ I was in danger.", optionA: "I knew", optionB: "did I know", optionC: "knew I", optionD: "I did know", correctOption: "B", explanation: "At no time (Không bao giờ) -> Đảo ngữ ở quá khứ: did I know.", translation: "Chưa bao giờ tôi biết mình đang gặp nguy hiểm.", tips: "At no time + Đảo ngữ" },
  { question: "Only when I met him ________ the truth.", optionA: "I realized", optionB: "did I realize", optionC: "realized I", optionD: "I did realize", correctOption: "B", explanation: "Đảo ngữ với Only when (Chỉ khi): Vế chính (sau mệnh đề when) bị đảo ngữ.", translation: "Chỉ khi gặp anh ấy tôi mới nhận ra sự thật.", tips: "Only when + S V + Đảo ngữ" },
  { question: "Only later ________ his mistake.", optionA: "he realized", optionB: "did he realize", optionC: "realized he", optionD: "does he realize", correctOption: "B", explanation: "Đảo ngữ với Only later (Chỉ sau này): Đảo ngữ ở thì quá khứ.", translation: "Chỉ sau này anh ấy mới nhận ra sai lầm của mình.", tips: "Only later + Đảo ngữ" }
];

const easyLesson2 = [
  { question: "Little ________ about the surprise party.", optionA: "did she know", optionB: "she knew", optionC: "she did know", optionD: "knew she", correctOption: "A", explanation: "Little (gần như không) đứng đầu câu -> Đảo ngữ.", translation: "Cô ấy gần như không biết gì về bữa tiệc bất ngờ.", tips: "Little đứng đầu -> Đảo ngữ" },
  { question: "Not until yesterday ________ the news.", optionA: "did I hear", optionB: "I heard", optionC: "heard I", optionD: "I did hear", correctOption: "A", explanation: "Not until + thời gian/mệnh đề + Đảo ngữ (Mãi cho đến khi... thì mới...).", translation: "Mãi cho đến ngày hôm qua tôi mới nghe tin này.", tips: "Not until... + Đảo ngữ" },
  { question: "Not a single word ________ during the meeting.", optionA: "he spoke", optionB: "did he speak", optionC: "spoke he", optionD: "he did speak", correctOption: "B", explanation: "Not a single word (Không một lời nào) -> Cụm phủ định đầu câu -> Đảo ngữ did he speak.", translation: "Anh ta không nói một lời nào trong suốt cuộc họp.", tips: "Phủ định đầu câu -> Đảo ngữ" },
  { question: "On no account ________ the door to strangers.", optionA: "you should open", optionB: "should you open", optionC: "open you", optionD: "you open", correctOption: "B", explanation: "On no account = Under no circumstances (Tuyệt đối không) -> Đảo ngữ.", translation: "Tuyệt đối không mở cửa cho người lạ.", tips: "On no account + Đảo ngữ" },
  { question: "In no way ________ accept this offer.", optionA: "will I", optionB: "I will", optionC: "I can", optionD: "do I", correctOption: "A", explanation: "In no way (Không đời nào) -> Đảo ngữ.", translation: "Không đời nào tôi chấp nhận lời đề nghị này.", tips: "In no way + Đảo ngữ" },
  { question: "Only in this way ________ solve the problem.", optionA: "can we", optionB: "we can", optionC: "we could", optionD: "could we", correctOption: "A", explanation: "Only in this way (Chỉ bằng cách này) -> Đảo ngữ mệnh đề chính.", translation: "Chỉ bằng cách này chúng ta mới có thể giải quyết được vấn đề.", tips: "Only in this way + Đảo ngữ" },
  { question: "Nowhere ________ such good service as here.", optionA: "you will find", optionB: "will you find", optionC: "find you", optionD: "you find", correctOption: "B", explanation: "Nowhere (Không nơi nào) -> Đảo ngữ.", translation: "Bạn sẽ không tìm thấy dịch vụ nào tốt như ở đây ở bất kỳ nơi nào khác.", tips: "Nowhere + Đảo ngữ" },
  { question: "Barely ________ the house when the storm began.", optionA: "he had left", optionB: "had he left", optionC: "left he", optionD: "did he leave", correctOption: "B", explanation: "Barely/Scarcely/Hardly had S P2 + when + S V(qk) (Vừa mới... thì...).", translation: "Anh ấy vừa mới rời khỏi nhà thì cơn bão bắt đầu.", tips: "Barely had S P2... when" },
  { question: "Not once ________ look at me.", optionA: "did she", optionB: "she did", optionC: "she", optionD: "does she", correctOption: "A", explanation: "Not once (Chưa một lần nào) -> Đảo ngữ did she (nhìn vào quá khứ).", translation: "Cô ấy chưa một lần nào nhìn tôi.", tips: "Not once + Đảo ngữ" },
  { question: "Only then ________ what I had done.", optionA: "I understood", optionB: "did I understand", optionC: "understood I", optionD: "I did understand", correctOption: "B", explanation: "Only then (Chỉ khi đó) -> Đảo ngữ.", translation: "Chỉ khi đó tôi mới hiểu những gì mình đã làm.", tips: "Only then + Đảo ngữ" }
];

const mediumLesson1 = [
  { question: "If I had known, I would have helped you. \n→ ________, I would have helped you.", optionA: "Had I known", optionB: "Did I know", optionC: "If had I known", optionD: "Have I known", correctOption: "A", explanation: "Đảo ngữ câu điều kiện loại 3: Bỏ If, đảo Had lên trước Chủ ngữ.", translation: "Nếu tôi biết, tôi đã giúp bạn rồi.", tips: "Had S P2 (Câu ĐK loại 3)" },
  { question: "If he were rich, he would buy a yacht. \n→ ________ rich, he would buy a yacht.", optionA: "Was he", optionB: "Were he", optionC: "Did he be", optionD: "He were", correctOption: "B", explanation: "Đảo ngữ câu điều kiện loại 2: Bỏ If, đảo Were lên trước Chủ ngữ.", translation: "Nếu anh ấy giàu có, anh ấy sẽ mua một chiếc du thuyền.", tips: "Were S... (Câu ĐK loại 2)" },
  { question: "If you should need any help, please call me. \n→ ________ any help, please call me.", optionA: "Should you need", optionB: "Do you need", optionC: "If should you need", optionD: "Need you", correctOption: "A", explanation: "Đảo ngữ câu điều kiện loại 1: Bỏ If, đảo Should lên trước Chủ ngữ.", translation: "Nếu bạn cần bất kỳ sự giúp đỡ nào, vui lòng gọi cho tôi.", tips: "Should S V (Câu ĐK loại 1)" },
  { question: "________ more carefully, he wouldn't have had an accident.", optionA: "If he drove", optionB: "Had he driven", optionC: "Were he to drive", optionD: "Did he drive", correctOption: "B", explanation: "Câu điều kiện loại 3 -> Had he driven = If he had driven.", translation: "Nếu anh ấy lái xe cẩn thận hơn, anh ấy đã không gặp tai nạn.", tips: "ĐK loại 3: Had S P2" },
  { question: "________ me, tell him I'm busy.", optionA: "Should he call", optionB: "If he calls", optionC: "Both A and B", optionD: "Were he to call", correctOption: "C", explanation: "Cả If he calls (Câu bình thường) và Should he call (Đảo ngữ loại 1) đều đúng.", translation: "Nếu anh ấy gọi tôi, hãy nói với anh ấy rằng tôi đang bận.", tips: "Should S V = If S V(ht)" },
  { question: "________ a bird, I would fly around the world.", optionA: "Were I", optionB: "Am I", optionC: "Was I", optionD: "Had I been", correctOption: "A", explanation: "Đảo ngữ điều kiện loại 2: Were I = If I were.", translation: "Nếu tôi là một con chim, tôi sẽ bay quanh thế giới.", tips: "Were I = If I were" },
  { question: "Only by working hard ________ success.", optionA: "can you achieve", optionB: "you can achieve", optionC: "you achieve", optionD: "achieve you", correctOption: "A", explanation: "Only by + V-ing -> Đảo ngữ mệnh đề chính: can you achieve.", translation: "Chỉ bằng cách làm việc chăm chỉ, bạn mới có thể đạt được thành công.", tips: "Only by + V-ing + Đảo ngữ" },
  { question: "Not only ________ late, but he also forgot his books.", optionA: "was he", optionB: "he was", optionC: "did he", optionD: "he did", correctOption: "A", explanation: "Động từ 'late' là tính từ -> dùng to-be. Đảo ngữ: was he.", translation: "Anh ấy không những đến muộn mà còn quên sách.", tips: "Not only + Tobe + S + Adj" },
  { question: "So fast ________ that we couldn't catch him.", optionA: "did he run", optionB: "he ran", optionC: "ran he", optionD: "he did run", correctOption: "A", explanation: "Đảo ngữ với So... that: So + Adj/Adv + Trợ ĐT + S + V... that... -> So fast did he run.", translation: "Anh ta chạy nhanh đến nỗi chúng tôi không thể bắt kịp.", tips: "So + Adj/Adv + Đảo ngữ" },
  { question: "Such ________ that we couldn't go out.", optionA: "the storm was", optionB: "was the storm", optionC: "storm was", optionD: "is the storm", correctOption: "B", explanation: "Đảo ngữ với Such: Such + be + N/NP... that... -> Such was the storm (Cơn bão quá lớn đến nỗi...).", translation: "Cơn bão quá lớn đến nỗi chúng tôi không thể đi ra ngoài.", tips: "Such + be + N + that" }
];

const mediumLesson2 = [
  { question: "Only after ________ the test did he realize his mistake.", optionA: "he finished", optionB: "finishing", optionC: "he finishes", optionD: "finished", correctOption: "B", explanation: "Only after + V-ing / Mệnh đề. Ở đây V-ing phù hợp vì theo sau là mệnh đề đảo ngữ did he realize.", translation: "Chỉ sau khi làm xong bài kiểm tra, anh ấy mới nhận ra sai lầm của mình.", tips: "Only after + V-ing" },
  { question: "Not until ________ home did she know the truth.", optionA: "she returned", optionB: "returning", optionC: "she returns", optionD: "returned", correctOption: "A", explanation: "Not until + Mệnh đề quá khứ (she returned) + Mệnh đề đảo ngữ (did she know).", translation: "Mãi cho đến khi cô ấy về nhà, cô ấy mới biết sự thật.", tips: "Not until + S V(qk)" },
  { question: "On the hill ________ a small cottage.", optionA: "does stand", optionB: "stands", optionC: "did stand", optionD: "stand", correctOption: "B", explanation: "Đảo ngữ toàn bộ (Đảo từ chỉ phương hướng/vị trí): Cụm từ chỉ nơi chốn + V + S. Không mượn trợ động từ. (stands a small cottage).", translation: "Trên đồi có một ngôi nhà tranh nhỏ.", tips: "Đảo ngữ toàn bộ không mượn Trợ ĐT" },
  { question: "Down ________, and the crowd cheered.", optionA: "did he fall", optionB: "fell he", optionC: "he fell", optionD: "he did fall", correctOption: "C", explanation: "Đảo ngữ toàn bộ: Trạng từ chỉ phương hướng đứng đầu (Down), nhưng vì chủ ngữ là Đại từ nhân xưng (he) nên KHÔNG đảo động từ. (Down he fell).", translation: "Anh ta ngã xuống, và đám đông reo hò.", tips: "S là đại từ -> Không đảo V" },
  { question: "Here ________ the bus!", optionA: "comes", optionB: "come", optionC: "does come", optionD: "is coming", correctOption: "A", explanation: "Đảo ngữ toàn bộ: Here/There + V + Noun. (Here comes the bus).", translation: "Xe buýt đến rồi!", tips: "Here/There + V + N" },
  { question: "Away ________.", optionA: "the birds flew", optionB: "flew the birds", optionC: "did the birds fly", optionD: "fly the birds", correctOption: "B", explanation: "Đảo ngữ toàn bộ: Trạng từ (Away) + Động từ (flew) + Danh từ (the birds).", translation: "Những con chim bay đi mất.", tips: "Adv + V + Danh từ" },
  { question: "Only when you grow up ________ the truth.", optionA: "will you understand", optionB: "you will understand", optionC: "do you understand", optionD: "you understand", correctOption: "A", explanation: "Only when + S + V(ht) + Đảo ngữ tương lai: will you understand.", translation: "Chỉ khi bạn lớn lên bạn mới hiểu được sự thật.", tips: "Only when + Vế tương lai" },
  { question: "Not a penny ________ to charity.", optionA: "he gave", optionB: "did he give", optionC: "he did give", optionD: "gave he", correctOption: "B", explanation: "Not + Tân ngữ đầu câu -> Đảo ngữ trợ động từ. (Not a penny did he give).", translation: "Anh ta không đóng góp một xu nào cho từ thiện.", tips: "Not + Tân ngữ + Đảo ngữ" },
  { question: "Seldom ________ anything without asking.", optionA: "does he do", optionB: "he does", optionC: "do he does", optionD: "he does do", correctOption: "A", explanation: "Seldom + Trợ động từ + S + V.", translation: "Hiếm khi anh ấy làm bất cứ điều gì mà không hỏi ý kiến.", tips: "Seldom + Đảo ngữ" },
  { question: "Hardly ________ the game when it started raining heavily.", optionA: "had they begun", optionB: "they had begun", optionC: "did they begin", optionD: "they began", correctOption: "A", explanation: "Hardly had S P2 + when + S V(qk).", translation: "Họ vừa mới bắt đầu trận đấu thì trời đổ mưa lớn.", tips: "Hardly had S P2... when" }
];

const hardLesson1 = [
  { question: "So beautiful ________ that he couldn't take his eyes off her.", optionA: "was she", optionB: "she was", optionC: "did she be", optionD: "was her", correctOption: "A", explanation: "So + Adj (beautiful) + Tobe (was) + S (she) + that...", translation: "Cô ấy xinh đẹp đến nỗi anh ta không thể rời mắt khỏi cô.", tips: "So + Adj + Be + S + that" },
  { question: "Such ________ that everyone respects him.", optionA: "his intelligence is", optionB: "is his intelligence", optionC: "intelligence is his", optionD: "does his intelligence", correctOption: "B", explanation: "Such + Be (is) + Noun/NP (his intelligence) + that...", translation: "Sự thông minh của anh ấy lớn đến mức mọi người đều kính trọng anh.", tips: "Such + Be + N/NP + that" },
  { question: "Not only ________ the exam, but he also got a scholarship.", optionA: "he passed", optionB: "did he pass", optionC: "passed he", optionD: "he did pass", correctOption: "B", explanation: "Not only + Trợ động từ + S + V.", translation: "Anh ấy không những vượt qua kỳ thi mà còn nhận được học bổng.", tips: "Not only + Đảo ngữ" },
  { question: "Only with your help ________ this project.", optionA: "we can finish", optionB: "can we finish", optionC: "finish we can", optionD: "we finish", correctOption: "B", explanation: "Only with + Noun/NP + Đảo ngữ mệnh đề chính.", translation: "Chỉ với sự giúp đỡ của bạn chúng tôi mới có thể hoàn thành dự án này.", tips: "Only with + N/NP + Đảo ngữ" },
  { question: "No longer ________ in this city.", optionA: "he lives", optionB: "does he live", optionC: "he does live", optionD: "lives he", correctOption: "B", explanation: "No longer (Không còn nữa) + Đảo ngữ.", translation: "Anh ấy không còn sống ở thành phố này nữa.", tips: "No longer + Đảo ngữ" },
  { question: "Nowhere else ________ such a breathtaking view.", optionA: "can you see", optionB: "you can see", optionC: "see you can", optionD: "you see", correctOption: "A", explanation: "Nowhere else + Đảo ngữ.", translation: "Không nơi nào khác bạn có thể thấy một khung cảnh ngoạn mục như vậy.", tips: "Nowhere else + Đảo ngữ" },
  { question: "________, we would have missed the flight.", optionA: "Had it not been for your help", optionB: "If it had not been your help", optionC: "Were it not for your help", optionD: "Without your help had it been", correctOption: "A", explanation: "Cấu trúc đảo ngữ ĐK loại 3: Had it not been for + N (Nếu không có...).", translation: "Nếu không có sự giúp đỡ của bạn, chúng tôi đã lỡ chuyến bay.", tips: "Had it not been for + N" },
  { question: "________, he would not be able to do this.", optionA: "Were it not for the money", optionB: "If it is not for the money", optionC: "Had it not been for the money", optionD: "Were not it for the money", correctOption: "A", explanation: "Cấu trúc đảo ngữ ĐK loại 2: Were it not for + N (Nếu không có...).", translation: "Nếu không vì tiền, anh ta sẽ không thể làm việc này.", tips: "Were it not for + N" },
  { question: "Out ________ the children, playing happily.", optionA: "ran", optionB: "did run", optionC: "run", optionD: "running", correctOption: "A", explanation: "Đảo ngữ toàn bộ: Out + V (ran) + N (the children).", translation: "Bọn trẻ chạy ùa ra ngoài, chơi đùa vui vẻ.", tips: "Đảo ngữ toàn bộ" },
  { question: "Only when ________ his degree did he apply for the job.", optionA: "he got", optionB: "did he get", optionC: "getting", optionD: "got he", correctOption: "A", explanation: "Only when + S V (không đảo mệnh đề when, đảo mệnh đề chính phía sau). Ở đây chọn mệnh đề when nên không đảo -> he got.", translation: "Chỉ khi lấy được bằng, anh ấy mới nộp đơn xin việc.", tips: "Only when + S V (không đảo)" }
];

const hardLesson2 = [
  { question: "Scarcely ________ the speech when the audience stood up.", optionA: "had he finished", optionB: "he had finished", optionC: "did he finish", optionD: "finished he", correctOption: "A", explanation: "Scarcely had S P2 + when (Vừa mới... thì...).", translation: "Anh ấy vừa kết thúc bài phát biểu thì khán giả đã đứng lên.", tips: "Scarcely had S P2... when" },
  { question: "Little ________ how much danger they were in.", optionA: "did they realize", optionB: "they realized", optionC: "realized they", optionD: "they did realize", correctOption: "A", explanation: "Little đầu câu -> Đảo ngữ (did they realize).", translation: "Họ hầu như không nhận ra họ đang gặp nguy hiểm nhường nào.", tips: "Little + Đảo ngữ" },
  { question: "Not until the late 19th century ________ an independent country.", optionA: "did it become", optionB: "it became", optionC: "became it", optionD: "it did become", correctOption: "A", explanation: "Not until + thời gian + Đảo ngữ (did it become).", translation: "Mãi đến cuối thế kỷ 19, nó mới trở thành một quốc gia độc lập.", tips: "Not until... + Đảo ngữ" },
  { question: "Under no circumstances ________ passengers allowed to open the doors.", optionA: "are", optionB: "do", optionC: "should", optionD: "were", correctOption: "A", explanation: "Bị động: are allowed. Đảo ngữ đưa 'are' lên trước 'passengers'.", translation: "Trong bất kỳ hoàn cảnh nào, hành khách cũng không được phép mở cửa.", tips: "Đảo ngữ Tobe bị động" },
  { question: "On no account ________ this secret be revealed.", optionA: "must", optionB: "can", optionC: "will", optionD: "Both A and C", correctOption: "A", explanation: "On no account (Tuyệt đối không) thường đi với must/should. 'must this secret be revealed' là hợp ngữ cảnh nhất.", translation: "Tuyệt đối không được tiết lộ bí mật này.", tips: "On no account must..." },
  { question: "So devastating ________ that the entire city was destroyed.", optionA: "was the earthquake", optionB: "the earthquake was", optionC: "did the earthquake be", optionD: "is the earthquake", correctOption: "A", explanation: "So + Adj + Be (was) + S (the earthquake) + that...", translation: "Trận động đất tàn khốc đến mức toàn bộ thành phố bị phá hủy.", tips: "So + Adj + Be + S" },
  { question: "Such ________ that he couldn't walk.", optionA: "was his pain", optionB: "his pain was", optionC: "pain his was", optionD: "did his pain be", correctOption: "A", explanation: "Such + Be (was) + N (his pain) + that...", translation: "Nỗi đau của anh ấy lớn đến nỗi anh ấy không thể đi lại.", tips: "Such + Be + N/NP" },
  { question: "Should you ________ any problems, please contact us.", optionA: "encounter", optionB: "encountered", optionC: "to encounter", optionD: "encounters", correctOption: "A", explanation: "Should + S + V-bare (Đảo ngữ loại 1).", translation: "Nếu bạn gặp bất kỳ vấn đề gì, vui lòng liên hệ với chúng tôi.", tips: "Should S V-bare" },
  { question: "Were I ________ you, I wouldn't do that.", optionA: "to be", optionB: "be", optionC: "being", optionD: "am", correctOption: "A", explanation: "Were S to V / Were S (to be) N/Adj. Với Đại từ nhân xưng, thường dùng 'Were I you' hoặc 'Were I to be you'. Tuy nhiên 'Were I you' (ko cần to be) phổ biến hơn. Nhưng đáp án ở đây là to be. Thực tế 'Were I you' là đúng. Ở đây chọn 'to be' vì cấu trúc Were S to V dùng cho động từ thường. Nếu là tobe chỉ cần Were I you. Sửa: Thực tế không có đáp án đúng tuyệt đối, 'Were I you' là cách nói chuẩn. (Sửa thành câu khác cho dễ).", translation: "Nếu tôi là bạn, tôi sẽ không làm thế.", tips: "Were I you" },
  { question: "Had the weather been better, we ________ swimming.", optionA: "would have gone", optionB: "would go", optionC: "will go", optionD: "went", correctOption: "A", explanation: "Đảo ngữ loại 3 (Had S P2), mệnh đề chính dùng S + would have P2.", translation: "Nếu thời tiết đẹp hơn, chúng tôi đã đi bơi.", tips: "ĐK loại 3 -> would have P2" }
];

// Fix for question 9 in hardLesson2 to avoid ambiguity
hardLesson2[8] = { question: "Were he ________ harder, he would pass the exam.", optionA: "to study", optionB: "study", optionC: "studying", optionD: "studied", correctOption: "A", explanation: "Đảo ngữ loại 2 với động từ thường: Were S + to V.", translation: "Nếu anh ấy học chăm chỉ hơn, anh ấy sẽ qua kỳ thi.", tips: "Were S to V (ĐK loại 2)" };

async function run() {
  const slug = "cau-truc-dao-ngu";
  const title = "24. Cấu trúc đảo ngữ (Inversion)";
  
  let topic = await prisma.toeicGrammarTopic.findUnique({ where: { slug } });
  if (topic) {
    console.log("Topic 24 already exists!");
    return;
  }
  
  topic = await prisma.toeicGrammarTopic.create({
    data: {
      title,
      subtitle: "Đảo ngữ với từ phủ định, câu điều kiện, Only, So...that, Such...that",
      slug,
      level: "Nâng Cao",
      type: "GRAMMAR",
      part: 5
    }
  });

  const lessons = [
    { title: "Bài tập 1 (Dễ)", order: 1, questions: easyLesson1 },
    { title: "Bài tập 2 (Dễ)", order: 2, questions: easyLesson2 },
    { title: "Bài tập 3 (Trung bình)", order: 3, questions: mediumLesson1 },
    { title: "Bài tập 4 (Trung bình)", order: 4, questions: mediumLesson2 },
    { title: "Bài tập 5 (Khó)", order: 5, questions: hardLesson1 },
    { title: "Bài tập 6 (Khó)", order: 6, questions: hardLesson2 },
  ];

  for (const l of lessons) {
    const lesson = await prisma.toeicGrammarLesson.create({
      data: {
        topicId: topic.id,
        title: `${l.title}: Đảo ngữ`,
        order: l.order,
        accessTier: 'FREE'
      }
    });

    for (const q of l.questions) {
      await prisma.toeicQuestion.create({
        data: {
          lessonId: lesson.id,
          ...q
        }
      });
    }
  }

  console.log("Created Topic 24: Inversion with 6 lessons (60 questions).");
}

run().catch(console.error).finally(() => prisma.$disconnect().then(() => process.exit(0)));
