import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PracticeEntryModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const [hovered, setHovered] = useState(false);
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h2 className="text-lg font-bold mb-4 text-center">Đăng nhập lưu tiến độ học tập</h2>
        <div className="space-y-3">
          <button
            className="w-full py-2 px-4 rounded bg-green-900 text-white font-semibold hover:bg-green-800"
            onClick={() => router.push("/login")}
          >
            Đăng nhập
          </button>
          <button
            className="w-full py-2 px-4 rounded border font-semibold transition"
            style={hovered ? { backgroundColor: '#ea580c', color: '#fff' } : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClose}
          >
            Tiếp tục mà không đăng nhập
          </button>
        </div>
      </div>
    </div>
  );
}
