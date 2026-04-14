'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface PricingConfig {
  name: string
  price: number
  durationMonths: number
}

export default function PricingSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [proPricing, setProPricing] = useState<PricingConfig | null>(null)
  const [ultraPricing, setUltraPricing] = useState<PricingConfig | null>(null)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      if (session.user?.role !== 'admin') {
        router.push('/')
      } else {
        fetchSettings()
      }
    }
  }, [status, session, router])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings?key=subscription_pricing')
      const data = await res.json()
      if (data && data.value) {
        setProPricing(data.value.PRO || { name: 'PRO', price: 199000, durationMonths: 6 })
        setUltraPricing(data.value.ULTRA || { name: 'ULTRA', price: 499000, durationMonths: 12 })
      } else {
        setProPricing({ name: 'PRO', price: 199000, durationMonths: 6 })
        setUltraPricing({ name: 'ULTRA', price: 499000, durationMonths: 12 })
      }
    } catch (e) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'subscription_pricing',
          description: 'Pricing and duration for PRO and ULTRA subscriptions',
          value: {
            PRO: proPricing,
            ULTRA: ultraPricing
          }
        })
      })

      if (!res.ok) {
        throw new Error('Failed to save settings')
      }

      toast.success('Lưu cấu hình thành công!')
    } catch (e) {
      toast.error('Lỗi khi lưu cấu hình')
    } finally {
      setSaving(false)
    }
  }

  if (loading || status === 'loading') {
    return <div className="p-8 text-center text-slate-500">Loading...</div>
  }

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Subscription Pricing</h1>
            <p className="text-sm text-slate-500 mt-1">Configure pricing and duration for PRO and ULTRA packages</p>
          </div>
          <Link href="/admin" className="text-sm font-semibold text-[#14532d] hover:underline">
            &larr; Back to Dashboard
          </Link>
        </div>

        <div className="grid gap-6">
          {/* PRO Settings */}
          {proPricing && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[#FFD700]"></div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-gradient-to-r from-[#FFD700] to-[#FDB931] text-[#594300] px-2 py-0.5 rounded text-xs tracking-widest font-black uppercase">PRO</span>
                Gói PRO
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Mức giá (VND)</label>
                  <input 
                    type="number" 
                    value={proPricing.price} 
                    onChange={e => setProPricing({...proPricing, price: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Số tháng</label>
                  <input 
                    type="number" 
                    value={proPricing.durationMonths}
                    onChange={e => setProPricing({...proPricing, durationMonths: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-[#FFD700] focus:ring-1 focus:ring-[#FFD700]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ULTRA Settings */}
          {ultraPricing && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
              <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span className="bg-gradient-to-r from-emerald-500 to-[#14532d] text-white px-2 py-0.5 rounded text-xs tracking-widest font-black uppercase">ULTRA</span>
                Gói ULTRA
              </h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Mức giá (VND)</label>
                  <input 
                    type="number" 
                    value={ultraPricing.price} 
                    onChange={e => setUltraPricing({...ultraPricing, price: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Số tháng</label>
                  <input 
                    type="number" 
                    value={ultraPricing.durationMonths}
                    onChange={e => setUltraPricing({...ultraPricing, durationMonths: Number(e.target.value)})}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          <div className="flex justify-end pt-4">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#14532d] text-white font-semibold py-2 px-6 rounded-lg hover:bg-emerald-800 disabled:opacity-50 transition shadow-sm"
            >
              {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
