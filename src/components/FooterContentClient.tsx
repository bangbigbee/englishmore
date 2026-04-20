'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FooterContentItem } from '@/app/admin/AdminFooterContent'

const IconX = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
)

export default function FooterContentClient({ title, items, fallbackMessage }: { title: string, items: FooterContentItem[], fallbackMessage: string }) {
    const [selectedItem, setSelectedItem] = useState<FooterContentItem | null>(null)

    return (
        <div className="max-w-6xl mx-auto pt-6 pb-16 px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-1.5 h-8 bg-[#ea980c] rounded-full"></div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#14532d]">{title}</h1>
            </div>

            {items.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center shadow-sm">
                    <p className="text-slate-500">{fallbackMessage}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map(item => (
                        <div 
                            key={item.id} 
                            onClick={() => setSelectedItem(item)}
                            className="bg-white border border-slate-200 rounded-3xl overflow-hidden cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col h-full"
                        >
                            {item.imageUrl ? (
                                <div className="h-48 w-full overflow-hidden bg-slate-100 relative">
                                    <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors z-10"></div>
                                    <img src={item.imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                </div>
                            ) : (
                                <div className="h-48 w-full bg-slate-100 flex items-center justify-center text-slate-400">
                                    <span className="text-4xl">📄</span>
                                </div>
                            )}
                            <div className="p-6 flex flex-col flex-1 relative">
                                <h3 className="text-lg font-bold text-slate-800 mb-2 group-hover:text-[#14532d] transition-colors line-clamp-2">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-slate-500 line-clamp-3 mb-4 flex-1">
                                    {item.description}
                                </p>
                                <div className="pt-4 border-t border-slate-100 mt-auto flex items-center justify-between">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">Xem chi tiết</span>
                                    <div className="w-8 h-8 rounded-full bg-[#14532d] flex items-center justify-center text-white scale-90 group-hover:scale-100 transition-transform">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                            <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                                        </svg>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {selectedItem && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm"
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div 
                            initial={{ y: "100%" }}
                            animate={{ y: 0 }}
                            exit={{ y: "100%" }}
                            transition={{ type: "spring", damping: 25, stiffness: 200 }}
                            onClick={e => e.stopPropagation()}
                            className="w-full sm:max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] sm:max-h-[85vh] relative"
                        >
                            <button 
                                onClick={() => setSelectedItem(null)}
                                className="absolute top-4 right-4 z-20 w-10 h-10 bg-white/80 backdrop-blur-md rounded-full flex items-center justify-center text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors shadow-sm cursor-pointer"
                            >
                                <IconX className="w-5 h-5" />
                            </button>

                            <div className="overflow-y-auto custom-scrollbar flex-1 relative">
                                {selectedItem.imageUrl && (
                                    <div className="w-full h-48 sm:h-64 md:h-72 bg-slate-100 flex-shrink-0 relative">
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent z-10" />
                                        <img src={selectedItem.imageUrl} alt={selectedItem.title} className="w-full h-full object-cover" />
                                        <div className="absolute bottom-0 left-0 w-full p-6 sm:p-8 z-20">
                                            <h2 className="text-2xl sm:text-3xl font-black text-white leading-tight drop-shadow-md">
                                                {selectedItem.title}
                                            </h2>
                                        </div>
                                    </div>
                                )}
                                
                                <div className="p-6 sm:p-8 bg-white">
                                    {!selectedItem.imageUrl && (
                                        <h2 className="text-2xl sm:text-3xl font-black text-[#14532d] mb-6 leading-tight">
                                            {selectedItem.title}
                                        </h2>
                                    )}
                                    
                                    <div className="bg-emerald-50 rounded-2xl p-5 mb-8 border border-emerald-100 shadow-inner">
                                        <p className="text-emerald-800 leading-relaxed font-medium">
                                            {selectedItem.description}
                                        </p>
                                    </div>

                                    <div 
                                        className="prose prose-slate prose-lg sm:prose-xl max-w-none prose-headings:text-[#14532d] prose-a:text-[#ea980c] prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl"
                                        dangerouslySetInnerHTML={{ __html: selectedItem.content }} 
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
