export const ROADMAP_TEMPLATES: any = {
    'BEGINNER': {
        targetScore: 450,
        estimatedWeeks: 8,
        phases: [
            {
                weekNumber: 1,
                title: "Chặng 1: Xây Nền Móng",
                objectiveOutput: "Nắm vững 12 thì & 300 từ vựng cốt lõi",
                expectedScoreUp: 50,
                tasks: [
                    { dayNumber: 1, taskType: "GRAMMAR", title: "Khởi động: Thì Hiện tại đơn", referencePath: "/toeic-practice/grammar/thi-hien-tai-don", rewardStars: 10 },
                    { dayNumber: 1, taskType: "VOCAB", title: "Học 20 từ vựng chủ đề Office", referencePath: "/toeic-practice?tab=vocabulary&topic=Office", rewardStars: 15 },
                    { dayNumber: 2, taskType: "LISTENING", title: "Luyện Nghe Part 1: Tranh Tả Người", referencePath: "/toeic-practice/grammar/tranh-ta-nguoi", rewardStars: 20 },
                    { dayNumber: 3, taskType: "GRAMMAR", title: "Thì Quá khứ đơn & Tương lai đơn", referencePath: "/toeic-practice/grammar/thi-qua-khu-don-va-tuong-lai-don", rewardStars: 15 },
                    { dayNumber: 4, taskType: "VOCAB", title: "Học 20 từ vựng chủ đề Personnel", referencePath: "/toeic-practice?tab=vocabulary&topic=Personnel", rewardStars: 15 },
                    { dayNumber: 5, taskType: "READING", title: "Đọc hiểu cơ bản Part 5", referencePath: "/toeic-practice/grammar/doc-hieu-co-ban-part-5", rewardStars: 20 },
                ]
            },
            {
                weekNumber: 2,
                title: "Chặng 2: Vượt Chướng Ngại Vật",
                objectiveOutput: "Chinh phục Part 2 & Mở rộng từ vựng",
                expectedScoreUp: 80,
                tasks: [
                    { dayNumber: 8, taskType: "LISTENING", title: "Kỹ năng nghe Wh-questions", referencePath: "/toeic-practice/grammar/nghe-wh-questions", rewardStars: 20 },
                    { dayNumber: 9, taskType: "GRAMMAR", title: "Câu Bị Động (Passive Voice)", referencePath: "/toeic-practice/grammar/cau-bi-dong", rewardStars: 15 },
                ]
            },
            {
                weekNumber: 3,
                title: "Chặng 3: Bứt Phá Giới Hạn",
                objectiveOutput: "Kỹ năng làm bài Part 3, 4 nâng cao",
                expectedScoreUp: 100,
                tasks: [
                    { dayNumber: 15, taskType: "LISTENING", title: "Part 3: Đoạn hội thoại ngắn", referencePath: "/toeic-practice/grammar/doan-hoi-thoai-ngan-part-3", rewardStars: 20 },
                ]
            },
            {
                weekNumber: 4,
                title: "Chặng 4: Tăng Tốc Đọc Hiểu",
                objectiveOutput: "Chiến thuật làm Part 6, 7 tốc độ",
                expectedScoreUp: 100,
                tasks: [
                    { dayNumber: 22, taskType: "READING", title: "Part 7: Đọc hiểu đoạn kép", referencePath: "/toeic-practice/grammar/doc-hieu-doan-kep-part-7", rewardStars: 30 },
                    { dayNumber: 23, taskType: "VOCAB", title: "Từ vựng chuyên ngành Purchasing", referencePath: "/toeic-practice?tab=vocabulary&topic=Purchasing", rewardStars: 15 },
                ]
            },
            {
                weekNumber: 5,
                title: "Chặng 5: Luyện Đề Tổng Lực",
                objectiveOutput: "Thực chiến ETS & Nâng cao phản xạ",
                expectedScoreUp: 120,
                tasks: [
                    { dayNumber: 29, taskType: "TEST", title: "Thi thử ETS Test 1", referencePath: "/toeic-practice/actual-test/ets-2024-test-1/take", rewardStars: 50 },
                    { dayNumber: 30, taskType: "REVIEW", title: "Chữa đề & Lấp lỗ hổng", referencePath: "/toeic-practice/actual-test/ets-2024-test-1/take", rewardStars: 30 },
                ]
            }
        ]
    },
    'INTERMEDIATE': {
        targetScore: 650,
        estimatedWeeks: 6,
        phases: [
            {
                weekNumber: 1,
                title: "Chặng 1: Tối ưu Part 3, 4",
                objectiveOutput: "Nghe hiểu đoạn hội thoại dài & bài nói",
                expectedScoreUp: 60,
                tasks: [
                    { dayNumber: 1, taskType: "LISTENING", title: "Part 3: Luyện nghe suy luận", referencePath: "/toeic-practice/grammar/luyen-nghe-suy-luan-part-3", rewardStars: 20 },
                    { dayNumber: 1, taskType: "VOCAB", title: "Từ vựng Marketing & Sales", referencePath: "/toeic-practice?tab=vocabulary&topic=Marketing and Sales", rewardStars: 15 },
                    { dayNumber: 2, taskType: "GRAMMAR", title: "Mệnh đề quan hệ", referencePath: "/toeic-practice/grammar/menh-de-quan-he", rewardStars: 15 },
                    { dayNumber: 3, taskType: "READING", title: "Đọc hiểu Part 6: Điền từ vào đoạn văn", referencePath: "/toeic-practice/grammar/dien-tu-vao-doan-van-part-6", rewardStars: 20 },
                ]
            },
            {
                weekNumber: 2,
                title: "Chặng 2: Chinh phục Part 7",
                objectiveOutput: "Kỹ năng đọc lướt (Skimming & Scanning)",
                expectedScoreUp: 80,
                tasks: [
                    { dayNumber: 8, taskType: "READING", title: "Part 7: Đọc đoạn văn đơn", referencePath: "/toeic-practice/grammar/doc-doan-van-don-part-7", rewardStars: 20 },
                ]
            },
            {
                weekNumber: 3,
                title: "Chặng 3: Bẫy Ngữ Pháp & Từ Vựng",
                objectiveOutput: "Thành thạo Part 5, 6 nâng cao",
                expectedScoreUp: 60,
                tasks: [
                    { dayNumber: 15, taskType: "GRAMMAR", title: "Câu đảo ngữ, Câu điều kiện", referencePath: "/toeic-practice/grammar/cau-dao-ngu-va-cau-dieu-kien", rewardStars: 15 },
                ]
            },
            {
                weekNumber: 4,
                title: "Chặng 4: Tăng Tốc Kỹ Năng Đọc",
                objectiveOutput: "Skimming & Scanning đỉnh cao",
                expectedScoreUp: 70,
                tasks: [
                    { dayNumber: 22, taskType: "READING", title: "Part 7: Xử lý đoạn kép, ba", referencePath: "/toeic-practice/grammar/xu-ly-doan-kep-ba-part-7", rewardStars: 30 },
                ]
            },
            {
                weekNumber: 5,
                title: "Chặng 5: Thực Chiến ETS",
                objectiveOutput: "Giải đề và tối ưu thời gian",
                expectedScoreUp: 80,
                tasks: [
                    { dayNumber: 29, taskType: "TEST", title: "Thi thử ETS 2024 Test 1", referencePath: "/toeic-practice/actual-test/ets-2024-test-1/take", rewardStars: 50 },
                ]
            }
        ]
    },
    'ADVANCED': {
        targetScore: 850,
        estimatedWeeks: 4,
        phases: [
            {
                weekNumber: 1,
                title: "Chặng 1: Luyện Đề Thực Chiến",
                objectiveOutput: "Giải đề ETS cường độ cao",
                expectedScoreUp: 50,
                tasks: [
                    { dayNumber: 1, taskType: "TEST", title: "Thi Thử ETS 2024 - Test 1", referencePath: "/toeic-practice/actual-test/ets-2024-test-1/take", rewardStars: 50 },
                    { dayNumber: 2, taskType: "REVIEW", title: "Phân tích lỗi sai Test 1", referencePath: "/toeic-practice/actual-test/ets-2024-test-1/take", rewardStars: 20 },
                    { dayNumber: 3, taskType: "VOCAB", title: "Học từ vựng nâng cao (Bẫy TOEIC)", referencePath: "/toeic-practice?tab=vocabulary&topic=Advanced Traps", rewardStars: 15 },
                ]
            },
            {
                weekNumber: 2,
                title: "Chặng 2: Nâng Cao Tốc Độ",
                objectiveOutput: "Rút ngắn thời gian làm bài Đọc hiểu",
                expectedScoreUp: 50,
                tasks: [
                    { dayNumber: 8, taskType: "READING", title: "Speed Reading Part 7 (Đoạn kép)", referencePath: "/toeic-practice/grammar/speed-reading-part-7", rewardStars: 30 },
                ]
            },
            {
                weekNumber: 3,
                title: "Chặng 3: Tối Ưu Hóa Part 3 & 4",
                objectiveOutput: "Nghe hiểu 100% hội thoại",
                expectedScoreUp: 60,
                tasks: [
                    { dayNumber: 15, taskType: "LISTENING", title: "Part 3: Các câu hỏi ngụ ý", referencePath: "/toeic-practice/grammar/cac-cau-hoi-ngu-y-part-3", rewardStars: 30 },
                ]
            },
            {
                weekNumber: 4,
                title: "Chặng 4: Nắm Bắt Cấu Trúc Khó",
                objectiveOutput: "Part 5, 6 mức độ 800+",
                expectedScoreUp: 60,
                tasks: [
                    { dayNumber: 22, taskType: "GRAMMAR", title: "Câu đảo ngữ phức tạp", referencePath: "/toeic-practice/grammar/cau-dao-ngu-phuc-tap", rewardStars: 20 },
                ]
            },
            {
                weekNumber: 5,
                title: "Chặng 5: Về Đích 900+",
                objectiveOutput: "Thi thực chiến đề thi thật 2024",
                expectedScoreUp: 50,
                tasks: [
                    { dayNumber: 29, taskType: "TEST", title: "Thi thử ETS 2024 Test 2", referencePath: "/toeic-practice/actual-test/ets-2024-test-2/take", rewardStars: 50 },
                ]
            }
        ]
    }
};