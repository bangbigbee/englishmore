import Link from "next/link";

export default function ToeicPracticePage() {
  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-bold mb-6 text-center">Luyện thi TOEIC miễn phí</h1>
      <div className="space-y-4">
        <Link href="/toeic-practice/vocabulary">
          <div className="p-4 rounded-lg border hover:bg-blue-50 cursor-pointer">
            <span className="font-semibold">Học từ vựng theo chủ đề</span>
            <div className="text-sm text-gray-500">Làm quen và ghi nhớ từ vựng thường gặp trong đề TOEIC.</div>
          </div>
        </Link>
        <Link href="/toeic-practice/listening">
          <div className="p-4 rounded-lg border hover:bg-blue-50 cursor-pointer">
            <span className="font-semibold">Luyện nghe TOEIC (theo Part)</span>
            <div className="text-sm text-gray-500">Luyện tập các dạng bài nghe TOEIC, chia theo từng phần.</div>
          </div>
        </Link>
        <Link href="/toeic-practice/reading">
          <div className="p-4 rounded-lg border hover:bg-blue-50 cursor-pointer">
            <span className="font-semibold">Luyện Reading TOEIC</span>
            <div className="text-sm text-gray-500">Làm bài tập đọc hiểu, luyện kỹ năng làm bài Reading TOEIC.</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
