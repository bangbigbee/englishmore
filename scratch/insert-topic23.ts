import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const easyLesson1 = [
  { question: "The ________ movie made everyone fall asleep.", optionA: "bore", optionB: "bored", optionC: "boring", optionD: "bores", correctOption: "C", explanation: "Tính từ V-ing (boring) dùng để mô tả bản chất của sự vật (bộ phim gây chán).", translation: "Bộ phim nhàm chán đã khiến mọi người ngủ gật.", tips: "V-ing chỉ bản chất" },
  { question: "I am very ________ in learning about ancient history.", optionA: "interest", optionB: "interested", optionC: "interesting", optionD: "interests", correctOption: "B", explanation: "Tính từ V-ed (interested) dùng để mô tả cảm xúc của người bị tác động (thấy thích thú).", translation: "Tôi rất thích tìm hiểu về lịch sử cổ đại.", tips: "V-ed chỉ cảm xúc" },
  { question: "The ________ news surprised all of us.", optionA: "shock", optionB: "shocked", optionC: "shocking", optionD: "shocks", correctOption: "C", explanation: "Tin tức gây sốc (bản chất) -> shocking.", translation: "Tin tức gây sốc đã làm tất cả chúng tôi ngạc nhiên.", tips: "V-ing chỉ bản chất" },
  { question: "We were ________ by the magic trick.", optionA: "amaze", optionB: "amazed", optionC: "amazing", optionD: "amazes", correctOption: "B", explanation: "Chúng tôi cảm thấy kinh ngạc (bị tác động) -> amazed.", translation: "Chúng tôi đã kinh ngạc bởi trò ảo thuật.", tips: "V-ed chỉ cảm xúc" },
  { question: "It was an ________ experience.", optionA: "excite", optionB: "excited", optionC: "exciting", optionD: "excitement", correctOption: "C", explanation: "Trải nghiệm mang tính thú vị (bản chất) -> exciting.", translation: "Đó là một trải nghiệm thú vị.", tips: "V-ing chỉ bản chất" },
  { question: "She looked ________ after the long journey.", optionA: "exhaust", optionB: "exhausted", optionC: "exhausting", optionD: "exhausts", correctOption: "B", explanation: "Cô ấy cảm thấy kiệt sức (trạng thái, cảm xúc) -> exhausted.", translation: "Cô ấy trông kiệt sức sau chuyến đi dài.", tips: "V-ed chỉ trạng thái/cảm xúc" },
  { question: "This math problem is very ________.", optionA: "confuse", optionB: "confused", optionC: "confusing", optionD: "confuses", correctOption: "C", explanation: "Bài toán gây bối rối (bản chất) -> confusing.", translation: "Bài toán này rất khó hiểu.", tips: "V-ing chỉ bản chất" },
  { question: "The students were ________ because the teacher was late.", optionA: "annoy", optionB: "annoyed", optionC: "annoying", optionD: "annoys", correctOption: "B", explanation: "Học sinh cảm thấy bực mình (bị tác động) -> annoyed.", translation: "Các học sinh bực mình vì giáo viên đến muộn.", tips: "V-ed chỉ cảm xúc" },
  { question: "That was a ________ performance.", optionA: "disappoint", optionB: "disappointed", optionC: "disappointing", optionD: "disappoints", correctOption: "C", explanation: "Màn trình diễn gây thất vọng (bản chất) -> disappointing.", translation: "Đó là một màn trình diễn đáng thất vọng.", tips: "V-ing chỉ bản chất" },
  { question: "I felt ________ when I heard the bad news.", optionA: "depress", optionB: "depressed", optionC: "depressing", optionD: "depresses", correctOption: "B", explanation: "Cảm thấy suy sụp (cảm xúc) -> depressed.", translation: "Tôi cảm thấy suy sụp khi nghe tin xấu.", tips: "V-ed chỉ cảm xúc" }
];

const easyLesson2 = [
  { question: "A ________ child was crying in the supermarket.", optionA: "lose", optionB: "lost", optionC: "losing", optionD: "loses", correctOption: "B", explanation: "lost child = đứa trẻ bị lạc (thường dùng phân từ hai như tính từ).", translation: "Một đứa trẻ bị lạc đang khóc trong siêu thị.", tips: "lost (bị lạc)" },
  { question: "Please submit the ________ documents by Friday.", optionA: "require", optionB: "required", optionC: "requiring", optionD: "requires", correctOption: "B", explanation: "Tài liệu được yêu cầu (mang nghĩa bị động) -> required documents.", translation: "Vui lòng nộp các tài liệu được yêu cầu trước thứ Sáu.", tips: "V-ed mang nghĩa bị động" },
  { question: "The ________ dog chased the cat.", optionA: "bark", optionB: "barked", optionC: "barking", optionD: "barks", correctOption: "C", explanation: "Con chó đang sủa (hành động chủ động đang diễn ra) -> barking dog.", translation: "Con chó đang sủa đuổi theo con mèo.", tips: "V-ing mang nghĩa chủ động" },
  { question: "The police found the ________ car.", optionA: "steal", optionB: "stolen", optionC: "stealing", optionD: "steals", correctOption: "B", explanation: "Chiếc xe bị ăn cắp (mang nghĩa bị động) -> stolen car.", translation: "Cảnh sát đã tìm thấy chiếc xe bị đánh cắp.", tips: "V-ed/P2 mang nghĩa bị động" },
  { question: "Boiling water is dangerous. Don't touch the ________ water.", optionA: "boil", optionB: "boiled", optionC: "boiling", optionD: "boils", correctOption: "C", explanation: "Nước đang sôi (trạng thái đang diễn ra) -> boiling water. (boiled water = nước đã đun sôi để nguội).", translation: "Nước đang sôi rất nguy hiểm. Đừng chạm vào nước đang sôi.", tips: "boiling = đang sôi" },
  { question: "He fixed the ________ window yesterday.", optionA: "break", optionB: "broke", optionC: "broken", optionD: "breaking", correctOption: "C", explanation: "Cửa sổ bị vỡ (mang nghĩa bị động) -> broken window.", translation: "Anh ấy đã sửa chiếc cửa sổ bị vỡ hôm qua.", tips: "P2 mang nghĩa bị động" },
  { question: "The ________ leaves fell to the ground.", optionA: "fall", optionB: "fell", optionC: "falling", optionD: "fallen", correctOption: "D", explanation: "Lá đã rụng (hành động đã hoàn thành) -> fallen leaves. (falling leaves = lá đang rơi).", translation: "Những chiếc lá rụng rơi xuống đất.", tips: "fallen = đã rụng" },
  { question: "She bought a ________ dress for the party.", optionA: "stun", optionB: "stunned", optionC: "stunning", optionD: "stuns", correctOption: "C", explanation: "Chiếc váy tuyệt đẹp (chỉ bản chất, gây ấn tượng) -> stunning dress.", translation: "Cô ấy đã mua một chiếc váy lộng lẫy cho bữa tiệc.", tips: "stunning = lộng lẫy" },
  { question: "He is a well-________ writer.", optionA: "know", optionB: "knew", optionC: "knowing", optionD: "known", correctOption: "D", explanation: "well-known = nổi tiếng, được nhiều người biết đến.", translation: "Ông ấy là một nhà văn nổi tiếng.", tips: "well-known (adj)" },
  { question: "The newly ________ bridge will open tomorrow.", optionA: "build", optionB: "built", optionC: "building", optionD: "builds", correctOption: "B", explanation: "Cây cầu mới được xây (mang nghĩa bị động) -> newly built.", translation: "Cây cầu mới xây sẽ được khánh thành vào ngày mai.", tips: "P2 mang nghĩa bị động" }
];

const mediumLesson1 = [
  { question: "The man ________ next to me is my uncle.", optionA: "stand", optionB: "stood", optionC: "standing", optionD: "stands", correctOption: "C", explanation: "Mệnh đề quan hệ rút gọn chủ động (who is standing -> standing).", translation: "Người đàn ông đang đứng cạnh tôi là chú tôi.", tips: "Rút gọn chủ động -> V-ing" },
  { question: "The books ________ on the shelf belong to the library.", optionA: "place", optionB: "placed", optionC: "placing", optionD: "places", correctOption: "B", explanation: "Mệnh đề quan hệ rút gọn bị động (which are placed -> placed).", translation: "Những cuốn sách được đặt trên giá thuộc về thư viện.", tips: "Rút gọn bị động -> P2" },
  { question: "The boy ________ by the dog was crying.", optionA: "bite", optionB: "bitten", optionC: "biting", optionD: "bites", correctOption: "B", explanation: "Rút gọn mệnh đề quan hệ mang nghĩa bị động (bị chó cắn) -> bitten.", translation: "Cậu bé bị chó cắn đang khóc.", tips: "Bị động -> P2" },
  { question: "Anyone ________ to join the club must sign up here.", optionA: "want", optionB: "wanted", optionC: "wanting", optionD: "wants", correctOption: "C", explanation: "Rút gọn mệnh đề quan hệ mang nghĩa chủ động (anyone who wants -> anyone wanting).", translation: "Bất cứ ai muốn tham gia câu lạc bộ đều phải đăng ký tại đây.", tips: "Chủ động -> V-ing" },
  { question: "The letters ________ yesterday have not arrived yet.", optionA: "send", optionB: "sent", optionC: "sending", optionD: "sends", correctOption: "B", explanation: "Những lá thư được gửi (mang nghĩa bị động) -> sent.", translation: "Những lá thư được gửi hôm qua vẫn chưa đến.", tips: "Bị động -> P2" },
  { question: "Do you know the woman ________ a red dress?", optionA: "wear", optionB: "wore", optionC: "wearing", optionD: "worn", correctOption: "C", explanation: "Rút gọn mệnh đề quan hệ chủ động (đang mặc) -> wearing.", translation: "Bạn có biết người phụ nữ đang mặc chiếc váy đỏ không?", tips: "Chủ động -> V-ing" },
  { question: "Products ________ in China are very cheap.", optionA: "make", optionB: "made", optionC: "making", optionD: "makes", correctOption: "B", explanation: "Sản phẩm được làm tại Trung Quốc (bị động) -> made.", translation: "Các sản phẩm được sản xuất tại Trung Quốc rất rẻ.", tips: "Bị động -> P2" },
  { question: "Students ________ late will not be allowed to enter.", optionA: "arrive", optionB: "arrived", optionC: "arriving", optionD: "arrives", correctOption: "C", explanation: "Học sinh đến muộn (chủ động) -> arriving.", translation: "Học sinh đến muộn sẽ không được phép vào.", tips: "Chủ động -> V-ing" },
  { question: "The rules ________ by the committee must be followed.", optionA: "establish", optionB: "established", optionC: "establishing", optionD: "establishes", correctOption: "B", explanation: "Các quy tắc được thiết lập (bị động) -> established.", translation: "Phải tuân theo các quy tắc do ủy ban thiết lập.", tips: "Bị động -> P2" },
  { question: "People ________ in big cities often face traffic jams.", optionA: "live", optionB: "lived", optionC: "living", optionD: "lives", correctOption: "C", explanation: "Người sống ở thành phố lớn (chủ động) -> living.", translation: "Những người sống ở các thành phố lớn thường phải đối mặt với kẹt xe.", tips: "Chủ động -> V-ing" }
];

const mediumLesson2 = [
  { question: "________ tired, I went to bed early.", optionA: "Feel", optionB: "Felt", optionC: "Feeling", optionD: "To feel", correctOption: "C", explanation: "Rút gọn 2 mệnh đề cùng chủ ngữ mang nghĩa chủ động (Because I felt tired -> Feeling tired).", translation: "Cảm thấy mệt, tôi đã đi ngủ sớm.", tips: "Chủ động đầu câu -> V-ing" },
  { question: "________ by the loud noise, the baby woke up.", optionA: "Frighten", optionB: "Frightened", optionC: "Frightening", optionD: "To frighten", correctOption: "B", explanation: "Rút gọn 2 mệnh đề cùng chủ ngữ mang nghĩa bị động (Because the baby was frightened -> Frightened).", translation: "Bị hoảng sợ bởi tiếng ồn lớn, em bé tỉnh giấc.", tips: "Bị động đầu câu -> P2" },
  { question: "________ the door, he left the house.", optionA: "Lock", optionB: "Locked", optionC: "Locking", optionD: "Locks", correctOption: "C", explanation: "Khóa cửa (hành động chủ động xảy ra nối tiếp) -> Locking.", translation: "Khóa cửa xong, anh ta rời khỏi nhà.", tips: "Chủ động -> V-ing" },
  { question: "________ in 1990, the company has grown rapidly.", optionA: "Found", optionB: "Founded", optionC: "Founding", optionD: "To found", correctOption: "B", explanation: "Được thành lập năm 1990 (bị động, found - founded - founded) -> Founded.", translation: "Được thành lập vào năm 1990, công ty đã phát triển nhanh chóng.", tips: "Bị động -> P2" },
  { question: "Not ________ his phone number, I couldn't call him.", optionA: "know", optionB: "known", optionC: "knowing", optionD: "knew", correctOption: "C", explanation: "Rút gọn mệnh đề chủ động ở dạng phủ định: Not + V-ing.", translation: "Không biết số điện thoại của anh ấy, tôi không thể gọi cho anh ấy.", tips: "Phủ định chủ động -> Not V-ing" },
  { question: "________ the book, she gave it to her friend.", optionA: "Read", optionB: "Reading", optionC: "Having read", optionD: "To read", correctOption: "C", explanation: "Nhấn mạnh hành động đọc sách đã hoàn tất trước khi đưa cho bạn -> Having + P2.", translation: "Đã đọc xong cuốn sách, cô ấy đưa nó cho bạn mình.", tips: "Hoàn tất trước -> Having P2" },
  { question: "________ in a poor family, he worked hard to become rich.", optionA: "Born", optionB: "Bearing", optionC: "Bore", optionD: "Bear", correctOption: "A", explanation: "Được sinh ra (bị động của bear là born) -> Born.", translation: "Sinh ra trong một gia đình nghèo, anh ấy đã làm việc chăm chỉ để trở nên giàu có.", tips: "Bị động -> Born" },
  { question: "________ to wait, I decided to go home.", optionA: "Not wanting", optionB: "Not wanted", optionC: "Wanting not", optionD: "Don't want", correctOption: "A", explanation: "Rút gọn chủ động phủ định (Vì không muốn chờ) -> Not wanting.", translation: "Không muốn chờ đợi, tôi quyết định về nhà.", tips: "Phủ định -> Not V-ing" },
  { question: "________ all the money, he asked his parents for more.", optionA: "Spend", optionB: "Spent", optionC: "Having spent", optionD: "To spend", correctOption: "C", explanation: "Đã tiêu hết tiền (hoàn tất trước hành động khác) -> Having spent.", translation: "Đã tiêu hết số tiền, anh ấy xin bố mẹ thêm.", tips: "Hoàn tất trước -> Having P2" },
  { question: "________ by the police, the thief confessed.", optionA: "Catch", optionB: "Caught", optionC: "Catching", optionD: "To catch", correctOption: "B", explanation: "Bị bắt bởi cảnh sát (bị động) -> Caught.", translation: "Bị cảnh sát bắt, tên trộm đã thú tội.", tips: "Bị động -> P2" }
];

const hardLesson1 = [
  { question: "He is the first person ________ the finish line.", optionA: "cross", optionB: "crossed", optionC: "crossing", optionD: "to cross", correctOption: "D", explanation: "Sau số thứ tự (the first, the second) dùng To-V để rút gọn mệnh đề quan hệ.", translation: "Anh ấy là người đầu tiên vượt qua vạch đích.", tips: "the first/last -> to V" },
  { question: "Neil Armstrong was the first man ________ on the moon.", optionA: "walk", optionB: "walked", optionC: "walking", optionD: "to walk", correctOption: "D", explanation: "Sau the first dùng To-V.", translation: "Neil Armstrong là người đầu tiên đi trên mặt trăng.", tips: "the first -> to V" },
  { question: "There are many forms ________ to apply for this job.", optionA: "fill in", optionB: "filled in", optionC: "to be filled in", optionD: "filling in", correctOption: "C", explanation: "Cần điền vào mẫu (mang nghĩa bị động, mẫu đơn được điền) -> to be + P2.", translation: "Có rất nhiều mẫu đơn cần được điền để xin việc này.", tips: "Bị động cần làm -> to be P2" },
  { question: "The last student ________ interviewed was John.", optionA: "to be", optionB: "being", optionC: "been", optionD: "was", correctOption: "A", explanation: "Sau the last dùng to-V, mang nghĩa bị động (được phỏng vấn) -> to be interviewed.", translation: "Học sinh cuối cùng được phỏng vấn là John.", tips: "the last + bị động -> to be P2" },
  { question: "Here is the report ________ by the manager.", optionA: "to read", optionB: "reading", optionC: "to be read", optionD: "read", correctOption: "C", explanation: "Báo cáo để cho quản lý đọc (nghĩa bị động: được đọc bởi quản lý) -> to be read.", translation: "Đây là báo cáo để quản lý đọc.", tips: "Mục đích bị động -> to be P2" },
  { question: "I have some letters ________.", optionA: "write", optionB: "to write", optionC: "writing", optionD: "written", correctOption: "B", explanation: "Có việc cần làm (chủ động) -> to V. (Tôi có thư cần phải viết).", translation: "Tôi có một vài lá thư cần viết.", tips: "Có việc cần làm -> to V" },
  { question: "He was the only survivor ________ in the crash.", optionA: "find", optionB: "found", optionC: "to find", optionD: "to be found", correctOption: "D", explanation: "Sau the only dùng to-V, nghĩa bị động (được tìm thấy) -> to be found.", translation: "Anh ấy là người sống sót duy nhất được tìm thấy trong vụ tai nạn.", tips: "the only + bị động -> to be P2" },
  { question: "Yuri Gagarin became the first man ________ into space.", optionA: "travel", optionB: "traveled", optionC: "traveling", optionD: "to travel", correctOption: "D", explanation: "Sau the first dùng to-V.", translation: "Yuri Gagarin trở thành người đầu tiên bay vào vũ trụ.", tips: "the first -> to V" },
  { question: "She bought a lot of clothes ________.", optionA: "to wash", optionB: "washing", optionC: "washed", optionD: "to be washed", correctOption: "A", explanation: "Cô ấy mua quần áo để (cô ấy) giặt -> to wash (mục đích chủ động).", translation: "Cô ấy đã mua rất nhiều quần áo để giặt.", tips: "Mục đích -> to V" },
  { question: "This is the best book ________ on this subject.", optionA: "to write", optionB: "to be written", optionC: "writing", optionD: "written", correctOption: "B", explanation: "Sau so sánh nhất (the best) dùng to-V. Sách được viết (bị động) -> to be written.", translation: "Đây là cuốn sách hay nhất được viết về chủ đề này.", tips: "so sánh nhất + bị động -> to be P2" }
];

const hardLesson2 = [
  { question: "Seen from a distance, the painting ________ beautiful.", optionA: "look", optionB: "looking", optionC: "looks", optionD: "looked", correctOption: "C", explanation: "Mệnh đề phụ 'Seen from a distance' (bị động) bổ nghĩa cho chủ ngữ 'the painting'. Sự việc là sự thật hiện tại -> dùng hiện tại đơn 'looks'.", translation: "Nhìn từ xa, bức tranh trông rất đẹp.", tips: "Chú ý thì của động từ chính" },
  { question: "________ their work, they went home.", optionA: "Having finish", optionB: "Having finished", optionC: "Finishing", optionD: "Both B and C", correctOption: "D", explanation: "Hai hành động liên tiếp. Có thể dùng Having P2 (nhấn mạnh sự hoàn tất) hoặc V-ing đều được chấp nhận, nhưng B chính xác hơn về ngữ pháp chuẩn, còn C cũng dùng được.", translation: "Hoàn thành xong công việc, họ đã đi về nhà.", tips: "Having P2 / V-ing" },
  { question: "It ________ a rainy day, we stayed indoors.", optionA: "is", optionB: "was", optionC: "being", optionD: "been", correctOption: "C", explanation: "Cấu trúc độc lập (Absolute Phrase): N1 + V-ing/P2, N2 + V2. Khi 2 mệnh đề khác chủ ngữ, ta giữ nguyên chủ ngữ N1 và biến động từ thành V-ing. (It being = Because it was).", translation: "Vì là một ngày mưa, chúng tôi đã ở trong nhà.", Absolute: "It being = Because it was" },
  { question: "The weather ________ fine, we went for a picnic.", optionA: "is", optionB: "was", optionC: "being", optionD: "be", correctOption: "C", explanation: "Cấu trúc độc lập: The weather being fine = Because the weather was fine.", translation: "Vì thời tiết đẹp, chúng tôi đã đi dã ngoại.", tips: "N1 + V-ing, N2 + V" },
  { question: "All things ________, it's a good plan.", optionA: "consider", optionB: "considered", optionC: "considering", optionD: "to consider", correctOption: "B", explanation: "Cụm thành ngữ cố định: All things considered (Mọi thứ được cân nhắc kỹ).", translation: "Cân nhắc mọi thứ, đó là một kế hoạch tốt.", tips: "All things considered" },
  { question: "________ that he is poor, he is quite happy.", optionA: "Give", optionB: "Giving", optionC: "Given", optionD: "Gave", correctOption: "C", explanation: "Given that = Mặc dù, xét thấy (phân từ dùng như liên từ).", translation: "Xét thấy anh ấy nghèo, anh ấy khá hạnh phúc.", tips: "Given that = Xét thấy" },
  { question: "There being no bus, we ________ to walk.", optionA: "have", optionB: "had", optionC: "having", optionD: "has", correctOption: "B", explanation: "There being... (Vì không có...). Mệnh đề sau kể lại sự việc trong quá khứ -> dùng had.", translation: "Vì không có xe buýt, chúng tôi đã phải đi bộ.", tips: "There being = Because there was" },
  { question: "Frankly ________, I don't like him.", optionA: "speak", optionB: "spoke", optionC: "speaking", optionD: "spoken", correctOption: "C", explanation: "Frankly speaking (Nói một cách thẳng thắn) - Phân từ độc lập dùng như trạng từ.", translation: "Nói thẳng ra thì, tôi không thích anh ta.", tips: "Frankly speaking = Nói thẳng ra" },
  { question: "________ into English, the poem loses its beauty.", optionA: "Translating", optionB: "Translate", optionC: "Translated", optionD: "To translate", correctOption: "C", explanation: "Bị động: Được dịch sang tiếng Anh (Because it is translated) -> Translated.", translation: "Khi được dịch sang tiếng Anh, bài thơ mất đi vẻ đẹp của nó.", tips: "Bị động -> P2" },
  { question: "________ his phone, he couldn't call for help.", optionA: "Lose", optionB: "Lost", optionC: "Having lost", optionD: "To lose", correctOption: "C", explanation: "Nhấn mạnh hành động làm mất điện thoại đã xảy ra trước đó -> Having lost.", translation: "Vì đã làm mất điện thoại, anh ấy không thể gọi giúp đỡ.", tips: "Hoàn tất trước -> Having P2" }
];

async function run() {
  const slug = "phan-tu-va-cum-phan-tu";
  const title = "23. Phân từ và Cụm phân từ (Participles & Participle Clauses)";
  
  let topic = await prisma.toeicGrammarTopic.findUnique({ where: { slug } });
  if (topic) {
    console.log("Topic 23 already exists!");
    return;
  }
  
  topic = await prisma.toeicGrammarTopic.create({
    data: {
      title,
      subtitle: "V-ing (Hiện tại phân từ) và V-ed/P2 (Quá khứ phân từ) dùng làm tính từ hoặc rút gọn mệnh đề",
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
        title: `${l.title}: Participles`,
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

  console.log("Created Topic 23: Participles with 6 lessons (60 questions).");
}

run().catch(console.error).finally(() => prisma.$disconnect());
