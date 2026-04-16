'use client'

import { useState } from 'react'
import UpgradeModal from '@/components/UpgradeModal'
import { useRouter } from 'next/navigation'

export default function UpgradePage() {
  const [showModal, setShowModal] = useState(true)
  const router = useRouter()

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <UpgradeModal 
        isOpen={showModal} 
        onClose={() => {
          setShowModal(false)
          if (window.history.length > 2) {
             router.back()
          } else {
             router.push('/')
          }
        }} 
      />
    </div>
  )
}
