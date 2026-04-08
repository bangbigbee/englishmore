import { useState } from "react";
import PracticeEntryModal from "../PracticeEntryModal";

export default function ReadingPage() {
  const [showModal, setShowModal] = useState(true);

  return (
    <div className="max-w-xl mx-auto py-10 px-4">
      {showModal && <PracticeEntryModal onClose={() => setShowModal(false)} />}
      {!showModal && (
        <div>
          <h1 className="text-2xl font-bold mb-6 text-center">Luyện Reading TOEIC</h1>
          <div className="text-center text-gray-500">(Nội dung sẽ được cập nhật...)</div>
        </div>
      )}
    </div>
  );
}
