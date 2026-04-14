'use client'

import { useEffect, useState } from 'react'

interface UserItem {
  id: string
  name: string | null
  email: string
  phone: string | null
  image: string | null
  tier: string
  tierExpiresAt: string | null
  createdAt: string
  enrollments: Array<{
    course: { title: string }
  }>
}

export default function AdminUserManagement() {
  const [users, setUsers] = useState<UserItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchUsers(search)
  }, [search])

  const fetchUsers = async (searchTerm: string) => {
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/users?search=${encodeURIComponent(searchTerm)}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const getTierBadge = (tier: string, expiresAt: string | null) => {
    if (tier === 'ULTRA') {
      return (
        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border border-purple-200">
          ULTRA (Trọn đời)
        </span>
      )
    }
    if (tier === 'PRO') {
      const isExpired = expiresAt && new Date(expiresAt) < new Date()
      return (
        <div className="flex flex-col gap-1 items-start">
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border ${
            isExpired ? 'bg-slate-100 text-slate-500 border-slate-200' : 'bg-amber-100 text-amber-700 border-amber-200'
          }`}>
            PRO
          </span>
          {expiresAt && (
            <span className="text-[10px] text-slate-500 whitespace-nowrap">
              End: {new Date(expiresAt).toLocaleDateString('en-GB')}
            </span>
          )}
        </div>
      )
    }
    return (
      <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border border-slate-200">
        FREE
      </span>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        <div className="relative">
          <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search name, phone, email..."
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#14532d] w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm bg-white">
        <table className="w-full border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">User Info</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Subscription Tier</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Course Enrollments</th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">Loading users...</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 text-sm">No users found.</td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors align-top">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
                        {user.image ? (
                          <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <span className="text-slate-500 font-bold text-sm">{(user.name || user.email).charAt(0).toUpperCase()}</span>
                        )}
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-sm font-bold text-slate-800 truncate">{user.name || 'No Name'}</span>
                        <span className="text-xs text-slate-500 truncate">{user.email}</span>
                        {user.phone && <span className="text-xs text-slate-500 truncate mt-0.5">{user.phone}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getTierBadge(user.tier, user.tierExpiresAt)}
                  </td>
                  <td className="px-6 py-4">
                    {user.enrollments.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {user.enrollments.map((enr, i) => (
                          <span key={i} className="inline-block bg-[#14532d]/10 text-[#14532d] px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap">
                            {enr.course.title}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No courses</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(user.createdAt).toLocaleDateString('en-GB')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
