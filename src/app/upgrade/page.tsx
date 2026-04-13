'use client'

import { useState, useEffect } from 'react'
import UpgradeModal from '@/components/UpgradeModal'

export default function UpgradePage() {
  const [showModal, setShowModal] = useState(true)

  // Keep modal open on this page
  useEffect(() => {
    if (!showModal) setShowModal(true)
  }, [showModal])

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <UpgradeModal isOpen={showModal} onClose={() => {}} />
    </div>
  )
}
