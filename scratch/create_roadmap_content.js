const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const generateSlug = (text) => {
    return text.toString().toLowerCase()
        .replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, "a")
        .replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, "e")
        .replace(/ì|í|ị|ỉ|ĩ/g, "i")
        .replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, "o")
        .replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, "u")
        .replace(/ỳ|ý|ỵ|ỷ|ỹ/g, "y")
        .replace(/đ/g, "d")
        .replace(/\u0300|\u0301|\u0303|\u0309|\u0323/g, "")
        .replace(/\u02C6|\u0306|\u031B/g, "")
        .replace(/[^a-z0-9 -]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-");
};

const templates = [
    // BEGINNER
    { type: 'GRAMMAR', part: 5, title: 'Thì Hiện tại đơn', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'VOCAB', title: 'Office' },
    { type: 'LISTENING', part: 1, title: 'Tranh Tả Người', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'GRAMMAR', part: 5, title: 'Thì Quá khứ đơn và Tương lai đơn', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'VOCAB', title: 'Personnel' },
    { type: 'READING', part: 5, title: 'Đọc hiểu cơ bản Part 5', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'LISTENING', part: 2, title: 'Nghe Wh-questions', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'GRAMMAR', part: 5, title: 'Câu Bị Động', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'LISTENING', part: 3, title: 'Đoạn hội thoại ngắn Part 3', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'READING', part: 7, title: 'Đọc hiểu đoạn kép Part 7', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'VOCAB', title: 'Purchasing' },
    
    // INTERMEDIATE
    { type: 'LISTENING', part: 3, title: 'Luyện nghe suy luận Part 3', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'VOCAB', title: 'Marketing and Sales' },
    { type: 'GRAMMAR', part: 5, title: 'Mệnh đề quan hệ', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'READING', part: 6, title: 'Điền từ vào đoạn văn Part 6', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'READING', part: 7, title: 'Đọc đoạn văn đơn Part 7', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'GRAMMAR', part: 5, title: 'Câu đảo ngữ và Câu điều kiện', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'READING', part: 7, title: 'Xử lý đoạn kép ba Part 7', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    
    // ADVANCED
    { type: 'VOCAB', title: 'Advanced Traps' },
    { type: 'READING', part: 7, title: 'Speed Reading Part 7', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'LISTENING', part: 3, title: 'Các câu hỏi ngụ ý Part 3', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
    { type: 'GRAMMAR', part: 5, title: 'Câu đảo ngữ phức tạp', content: 'Quản trị viên đang cập nhật nội dung bài giảng...' },
];

async function run() {
    for (const t of templates) {
        if (t.type === 'VOCAB') {
            await prisma.vocabularyTopicConfig.upsert({
                where: { topic: t.title },
                update: {},
                create: {
                    topic: t.title
                }
            });
            console.log("Upserted VOCAB:", t.title);
        } else {
            const slug = generateSlug(t.title);
            let topic = await prisma.toeicGrammarTopic.findUnique({ where: { slug } });
            if (!topic) {
                topic = await prisma.toeicGrammarTopic.create({
                    data: {
                        title: t.title,
                        type: t.type,
                        part: t.part,
                        slug: slug
                    }
                });
                console.log("Created topic:", t.title);
            }
            
            // create lesson if not exists
            const existingLessons = await prisma.toeicGrammarLesson.findMany({ where: { topicId: topic.id } });
            if (existingLessons.length === 0) {
                await prisma.toeicGrammarLesson.create({
                    data: {
                        topicId: topic.id,
                        title: 'Bài học 1',
                        order: 1,
                        content: `<p>Quản trị viên đang cập nhật nội dung bài giảng. Bạn vui lòng quay lại sau nhé.</p>`,
                    }
                });
                console.log("Created lesson for:", t.title);
            }
        }
    }
}

run().then(() => console.log('Done')).catch(console.error);
