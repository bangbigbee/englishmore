import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PracticeEntryModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-80">
        <h2 className="text-lg font-bold mb-4 text-center">Bạn muốn tiếp tục như thế nào?</h2>
        <div className="space-y-3">
          <button
            className="w-full py-2 px-4 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
            onClick={() => router.push("/login")}
          >
            Đăng nhập để lưu tiến trình
          </button>
          <button
            className="w-full py-2 px-4 rounded border font-semibold hover:bg-gray-100"
            onClick={onClose}
          >
            Tiếp tục không cần đăng nhập
          </button>
          <button
            className="w-full py-2 px-4 rounded border text-gray-500 hover:bg-gray-50"
            onClick={onClose}
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
  );
}
