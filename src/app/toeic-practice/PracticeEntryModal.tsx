"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function PracticeEntryModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();

  const [hovered, setHovered] = useState(false);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ type: "spring", damping: 25, stiffness: 300, duration: 0.2 }}
        className="relative bg-white rounded-lg shadow-lg p-6 w-80"
      >
        <h2 className="text-base font-bold mb-4 text-center">Đăng nhập lưu tiến độ học tập</h2>
        <div className="space-y-3">
          <button
            className="w-full py-2 px-4 rounded bg-[#14532d] text-white font-normal text-sm hover:bg-[#166534] transition-colors"
            onClick={() => router.push("/login")}
          >
            Đăng nhập
          </button>
          <button
            className="w-full py-2 px-4 rounded border font-normal text-sm transition"
            style={hovered ? { backgroundColor: '#ea580c', color: '#fff' } : { backgroundColor: '#f3f4f6', color: '#6b7280' }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClose}
          >
            Tiếp tục mà không đăng nhập
          </button>
        </div>
      </motion.div>
    </div>
  );
}
