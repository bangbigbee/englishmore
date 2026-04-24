import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'sonner'
import Link from 'next/link'

interface PricingPhase {
  monthlyPrice: number
  lifetimePrice: number
  upgradeLifetimePrice?: number
  label?: string
}

interface PricingConfig {
  name: string
  activePhase: 'super_early_bird' | 'early_bird' | 'regular'
  phases: {
    super_early_bird: PricingPhase
    early_bird: PricingPhase
    regular: PricingPhase
  }
}

interface UpgradeOrder {
  id: string
  userId: string
  targetTier: string
  durationMonths: number
  price: number
  status: string
  referenceCode: string | null
  createdAt: string
  completedAt: string | null
  user: {
    name: string | null
    email: string
    image: string | null
    tier: string
    phone: string | null
  }
}

export default function PricingSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  
  const [orders, setOrders] = useState<UpgradeOrder[]>([])
  const [ordersLoading, setOrdersLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<string | null>(null)
  const [rejectingId, setRejectingId] = useState<string | null>(null)

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
        fetchOrders()
      }
    }
  }, [status, session, router])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/settings?key=subscription_pricing')
      const data = await res.json()
      if (data && data.value) {
        const proData = data.value.PRO || {}
        const ultraData = data.value.ULTRA || {}
        
        setProPricing({
          name: 'PRO',
          activePhase: proData.activePhase || 'regular',
          phases: proData.phases || {
            super_early_bird: { monthlyPrice: 49000, lifetimePrice: 299000 },
            early_bird: { monthlyPrice: 69000, lifetimePrice: 399000 },
            regular: { monthlyPrice: 99000, lifetimePrice: 499000 }
          }
        })
        
        setUltraPricing({
          name: 'ULTRA',
          activePhase: ultraData.activePhase || 'regular',
          phases: ultraData.phases || {
            super_early_bird: { monthlyPrice: 99000, lifetimePrice: 599000, upgradeLifetimePrice: 300000 },
            early_bird: { monthlyPrice: 129000, lifetimePrice: 799000, upgradeLifetimePrice: 400000 },
            regular: { monthlyPrice: 149000, lifetimePrice: 999000, upgradeLifetimePrice: 500000 }
          }
        })
      } else {
        setProPricing({
          name: 'PRO',
          activePhase: 'regular',
          phases: {
            super_early_bird: { monthlyPrice: 49000, lifetimePrice: 299000 },
            early_bird: { monthlyPrice: 69000, lifetimePrice: 399000 },
            regular: { monthlyPrice: 99000, lifetimePrice: 499000 }
          }
        })
        setUltraPricing({
          name: 'ULTRA',
          activePhase: 'regular',
          phases: {
            super_early_bird: { monthlyPrice: 99000, lifetimePrice: 599000, upgradeLifetimePrice: 300000 },
            early_bird: { monthlyPrice: 129000, lifetimePrice: 799000, upgradeLifetimePrice: 400000 },
            regular: { monthlyPrice: 149000, lifetimePrice: 999000, upgradeLifetimePrice: 500000 }
          }
        })
      }
    } catch (e) {
      toast.error('Failed to load settings')
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/admin/upgrade-orders')
      const data = await res.json()
      if (res.ok) {
        setOrders(data.orders || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setOrdersLoading(false)
    }
  }

  const handleAction = async (id: string, action: 'approve' | 'reject') => {
    if (!window.confirm(`Bạn có chắc chắn muốn ${action === 'approve' ? 'Duyệt' : 'Từ chối'} yêu cầu này?`)) return

    try {
      if (action === 'approve') setApprovingId(id)
      if (action === 'reject') setRejectingId(id)

      const res = await fetch(`/api/admin/upgrade-orders/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })

      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      toast.success(action === 'approve' ? 'Đã duyệt yêu cầu thành công!' : 'Đã từ chối yêu cầu.')
      fetchOrders() // refresh list
    } catch (err: any) {
      toast.error(err.message || "Có lỗi xảy ra")
    } finally {
      setApprovingId(null)
      setRejectingId(null)
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
    return <div className="p-8 text-center text-slate-500">Đang tải cấu hình...</div>
  }

  return (
    <div className="space-y-12">
      {/* SECTION: PRICING SETTINGS */}
      <div className="space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Subscription Pricing</h2>
            <p className="text-sm text-gray-500 mt-1">Cấu hình mức giá và thời lượng cho các gói Premium</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
          {/* PRO Settings Hidden (PRO is now free) */}

          {/* ULTRA Settings */}
          {ultraPricing && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-purple-500 to-[#581c87] text-white px-2 py-0.5 rounded text-xs tracking-widest font-black uppercase">ULTRA</span>
                  Gói ULTRA
                </h2>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">Giai đoạn hiện tại</label>
                  <select 
                    value={ultraPricing.activePhase}
                    onChange={e => setUltraPricing({...ultraPricing, activePhase: e.target.value as any})}
                    className="border border-slate-300 rounded-lg px-3 py-1.5 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm font-semibold"
                  >
                    <option value="super_early_bird">Super Early Bird</option>
                    <option value="early_bird">Early Bird</option>
                    <option value="regular">Regular</option>
                  </select>
                </div>
              </div>
              
              <div className="space-y-4">
                {(['super_early_bird', 'early_bird', 'regular'] as const).map(phaseKey => (
                  <div key={phaseKey} className={`p-4 rounded-lg border ${ultraPricing.activePhase === phaseKey ? 'border-purple-500 bg-purple-50' : 'border-slate-200'}`}>
                    <h3 className="text-sm font-bold text-slate-700 mb-3 capitalize">{phaseKey.replace(/_/g, ' ')}</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Giá Tháng (VND)</label>
                        <input 
                          type="number" 
                          value={ultraPricing.phases[phaseKey].monthlyPrice} 
                          onChange={e => setUltraPricing({
                            ...ultraPricing, 
                            phases: {
                              ...ultraPricing.phases,
                              [phaseKey]: { ...ultraPricing.phases[phaseKey], monthlyPrice: Number(e.target.value) }
                            }
                          })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Giá Trọn Đời (VND)</label>
                        <input 
                          type="number" 
                          value={ultraPricing.phases[phaseKey].lifetimePrice} 
                          onChange={e => setUltraPricing({
                            ...ultraPricing, 
                            phases: {
                              ...ultraPricing.phases,
                              [phaseKey]: { ...ultraPricing.phases[phaseKey], lifetimePrice: Number(e.target.value) }
                            }
                          })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Giá Nâng cấp Trọn Đời từ PRO (VND)</label>
                        <input 
                          type="number" 
                          value={ultraPricing.phases[phaseKey].upgradeLifetimePrice || 0} 
                          onChange={e => setUltraPricing({
                            ...ultraPricing, 
                            phases: {
                              ...ultraPricing.phases,
                              [phaseKey]: { ...ultraPricing.phases[phaseKey], upgradeLifetimePrice: Number(e.target.value) }
                            }
                          })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">Mốc Thời Gian (VD: Tháng 5)</label>
                        <input 
                          type="text" 
                          value={ultraPricing.phases[phaseKey].label || ''} 
                          onChange={e => setUltraPricing({
                            ...ultraPricing, 
                            phases: {
                              ...ultraPricing.phases,
                              [phaseKey]: { ...ultraPricing.phases[phaseKey], label: e.target.value }
                            }
                          })}
                          className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 text-sm"
                          placeholder="e.g. Từ 1/5 - 31/5"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-start max-w-4xl pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-[#581c87] text-white font-semibold py-2 px-6 rounded-lg hover:bg-purple-800 disabled:opacity-50 transition shadow-sm"
          >
            {saving ? 'Đang lưu...' : 'Thay Đổi Bảng Giá'}
          </button>
        </div>
      </div>

      <hr className="border-slate-200" />

      {/* SECTION: ORDER MANAGEMENT */}
      <div className="space-y-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Lịch Sử & Xét Duyệt Giao Dịch</h2>
            <p className="text-sm text-gray-500 mt-1">Quản lý những yêu cầu nâng cấp được gửi từ người dùng</p>
          </div>
          <button 
            onClick={fetchOrders}
            className="text-sm font-semibold text-slate-500 hover:text-slate-800 flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm"
          >
            Làm mới
          </button>
        </div>

        {ordersLoading ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500">Đang tải dữ liệu giao dịch...</div>
        ) : orders.length === 0 ? (
          <div className="text-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 text-slate-500">Chưa có giao dịch nâng cấp nào</div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="px-6 py-4">Khách hàng</th>
                    <th className="px-6 py-4">Gói Yêu Cầu</th>
                    <th className="px-6 py-4">Nội Dung CK / Mã GD</th>
                    <th className="px-6 py-4">Thời gian</th>
                    <th className="px-6 py-4">Trạng thái</th>
                    <th className="px-6 py-4 text-right">Hành động</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img src={o.user.image || `https://ui-avatars.com/api/?name=${o.user.name}&background=random`} alt="avatar" className="w-8 h-8 rounded-full" />
                          <div>
                            <div className="font-semibold text-slate-900">{o.user.name || o.user.email.split('@')[0]}</div>
                            <div className="text-xs text-slate-500">{o.user.email} • {o.user.phone || 'No phone'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-bold text-slate-800">{o.targetTier} <span className="font-normal text-slate-500">({o.durationMonths >= 99 ? 'Trọn đời' : `${o.durationMonths} tháng`})</span></div>
                        <div className="text-amber-500 font-bold">{o.price.toLocaleString()}đ</div>
                      </td>
                      <td className="px-6 py-4">
                        <code className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-700">{o.referenceCode || `UPGRADE ${o.targetTier} ${o.user.email.split('@')[0]}`}</code>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-slate-700">{new Date(o.createdAt).toLocaleDateString('vi-VN')}</div>
                        <div className="text-xs text-slate-400">{new Date(o.createdAt).toLocaleTimeString('vi-VN')}</div>
                      </td>
                      <td className="px-6 py-4">
                        {o.status === 'pending' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Chờ duyệt</span>}
                        {o.status === 'completed' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Đã kích hoạt</span>}
                        {o.status === 'rejected' && <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-800">Từ chối</span>}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {o.status === 'pending' ? (
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => handleAction(o.id, 'reject')}
                              disabled={rejectingId === o.id || approvingId === o.id}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-red-500 rounded-lg hover:bg-red-600 disabled:opacity-50"
                            >
                              {rejectingId === o.id ? '...' : 'Từ chối'}
                            </button>
                            <button
                              onClick={() => handleAction(o.id, 'approve')}
                              disabled={rejectingId === o.id || approvingId === o.id}
                              className="px-3 py-1.5 text-xs font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:opacity-50"
                            >
                              {approvingId === o.id ? '...' : 'Duyệt Gói'}
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs font-medium text-slate-400">
                            {o.completedAt ? new Date(o.completedAt).toLocaleDateString() : ''}
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
