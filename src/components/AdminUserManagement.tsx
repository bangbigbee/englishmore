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
  const [courses, setCourses] = useState<Array<{id: string; title: string}>>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')

  useEffect(() => {
    fetchCourses()
  }, [])

  useEffect(() => {
    fetchUsers(search, courseFilter)
  }, [search, courseFilter])

  const fetchCourses = async () => {
    try {
      const res = await fetch('/api/admin/courses')
      if (res.ok) {
        const data = await res.json()
        setCourses(Array.isArray(data) ? data.filter((c: any) => c.id !== 'general_gallery_settings') : [])
      }
    } catch(e) {
      console.error(e)
    }
  }

  const fetchUsers = async (searchTerm: string, courseId: string) => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()
      if (searchTerm) queryParams.append('search', searchTerm)
      if (courseId) queryParams.append('courseId', courseId)
      
      const res = await fetch(`/api/admin/users?${queryParams.toString()}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setUsers(data.users || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  const handleResetTier = async (userId: string) => {
    if (!window.confirm('Are you sure you want to reset this user to FREE tier?')) return
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset_tier' })
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to reset user tier')
      }
      alert('User reset to FREE successfully.')
      fetchUsers(search, courseFilter)
    } catch (err: any) {
      alert(err.message || 'Error resetting user tier')
      setLoading(false)
    }
  }

  const handleDeleteUser = async (userId: string) => {
    if (!window.confirm('Are you sure you want to permanently delete this user? This action cannot be undone.')) return
    try {
      setLoading(true)
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      })
      if (!res.ok) {
        const errorData = await res.json()
        throw new Error(errorData.error || 'Failed to delete user')
      }
      alert('User deleted successfully.')
      fetchUsers(search, courseFilter)
    } catch (err: any) {
      alert(err.message || 'Error deleting user')
      setLoading(false)
    }
  }

  const getTierBadge = (tier: string, expiresAt: string | null) => {
    if (tier === 'ULTRA') {
      return (
        <span className="inline-flex items-center gap-1 bg-purple-100 text-purple-900 px-2 py-1 rounded text-[11px] font-bold uppercase tracking-wider border border-purple-200">
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

  const stats = {
    total: users.length,
    free: users.filter(u => u.tier === 'FREE' || !u.tier).length,
    pro: users.filter(u => u.tier === 'PRO').length,
    ultra: users.filter(u => u.tier === 'ULTRA').length,
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
          <p className="text-sm font-medium text-slate-500">Total Users</p>
          <p className="text-3xl font-bold text-slate-800 mt-2">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 bg-gradient-to-br from-slate-50 to-white">
          <p className="text-sm font-medium text-slate-500">FREE Tier</p>
          <p className="text-3xl font-bold text-slate-700 mt-2">{stats.free}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-amber-200 p-5 bg-gradient-to-br from-amber-50 to-white">
          <p className="text-sm font-medium text-amber-600">PRO Tier</p>
          <p className="text-3xl font-bold text-amber-600 mt-2">{stats.pro}</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-purple-200 p-5 bg-gradient-to-br from-purple-50 to-white">
          <p className="text-sm font-medium text-purple-800">ULTRA Tier</p>
          <p className="text-3xl font-bold text-purple-800 mt-2">{stats.ultra}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
        
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <select
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
          >
            <option value="">All Courses</option>
            {courses.map(c => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          
          <div className="relative w-full sm:w-72">
            <svg className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
            <input
              type="text"
              placeholder="Search name, phone, email..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#14532d]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
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
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
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
                  <td className="px-6 py-4 text-sm">
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleResetTier(user.id)}
                        disabled={user.tier === 'FREE'}
                        title="Đặt lại membership về FREE"
                        className={`text-left text-amber-600 hover:text-amber-800 hover:underline ${user.tier === 'FREE' ? 'opacity-30 cursor-not-allowed hover:no-underline' : ''}`}
                      >
                        Reset
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-left text-red-600 hover:text-red-800 hover:underline"
                        title="Xóa dữ liệu user khỏi hệ thống"
                      >
                        Delete
                      </button>
                    </div>
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
