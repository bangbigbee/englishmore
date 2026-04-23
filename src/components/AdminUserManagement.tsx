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
  const [onlineStats, setOnlineStats] = useState({ 
    online: 0, 
    daily: 0,
    sectionCounts: {} as Record<string, number>,
    users: 0,
    guests: 0,
    usersDetails: [],
    guestsDetails: []
  })
  const [courseFilter, setCourseFilter] = useState('')

  useEffect(() => {
    fetchCourses()
    
    const updateStats = async () => {
      try {
        const res = await fetch('/api/admin/tracking/stats');
        if (res.ok) {
          const data = await res.json();
          setOnlineStats({
            online: data.online || 0,
            daily: data.daily || 0,
            sectionCounts: data.sectionCounts || {},
            users: data.usersCount || 0,
            guests: data.guestsCount || 0,
            usersDetails: data.usersDetails || [],
            guestsDetails: data.guestsDetails || []
          });
        }
      } catch (e) {
        console.error('Failed to fetch stats');
      }
    };
    updateStats();
    const interval = setInterval(updateStats, 15000);
    return () => clearInterval(interval);
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

      {/* Overview Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        {/* Real-time Online Breakdown */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 relative">
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full"></span>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              </div>
              <div>
                <h3 className="text-lg flex font-black items-center gap-1.5 text-slate-800"><span className="text-emerald-600 text-xl">{onlineStats.online}</span> Đang online học bài ở ToeicMore</h3>
                <p className="text-sm font-medium text-slate-500">Phân bố người dùng theo nội dung</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 mb-5">
            {Object.entries((onlineStats as any).sectionCounts || {})
              .sort((a: any, b: any) => b[1] - a[1])
              .map(([sectionName, count]: any, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex flex-col justify-center items-center text-center">
                   <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-1 truncate w-full px-1">{sectionName}</span>
                   <span className="text-xl font-black text-slate-700">{count}</span>
                </div>
              ))}
            {Object.keys((onlineStats as any).sectionCounts || {}).length === 0 && (
               <div className="col-span-full py-4 text-center text-slate-400 text-sm italic">Chưa có dữ liệu phân bố</div>
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-slate-100 pt-5">
             <div className="flex-1 px-1">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-bold mb-2">
                   <span className="text-blue-600 flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-blue-500"></div>THÀNH VIÊN ({onlineStats.users})</span>
                   <span className="text-slate-500 flex items-center gap-1.5">KHÁCH ({onlineStats.guests})<div className="w-2 h-2 rounded-full bg-slate-300"></div></span>
                </div>
                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                   <div className="h-full bg-blue-500 transition-all duration-1000" style={{ width: `${(onlineStats.users/Math.max(1, onlineStats.online))*100}%` }}></div>
                   <div className="h-full bg-slate-200 transition-all duration-1000" style={{ width: `${(onlineStats.guests/Math.max(1, onlineStats.online))*100}%` }}></div>
                </div>
             </div>
           </div>

          {/* Detailed Lists */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 border-t border-slate-100 pt-6">
            <div>
              <h4 className="font-bold text-sm text-blue-700 mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-500"></div>Thành viên đang học ({(onlineStats as any).users})</h4>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {(onlineStats as any).usersDetails?.length === 0 && <p className="text-xs text-slate-400 italic">Không có thành viên nào online</p>}
                {(onlineStats as any).usersDetails?.map((u: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-lg border border-slate-100 bg-slate-50">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-xs font-bold shrink-0">{u.user?.name?.charAt(0) || '?'}</div>
                      <div className="flex flex-col"><span className="text-xs font-bold text-slate-700 truncate w-24" title={u.user?.name || u.user?.email || 'No Name'}>{u.user?.name || u.user?.email?.split('@')[0] || 'No Name'}</span><span className="text-[10px] text-slate-500">{u.user?.tier}</span></div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-white border border-slate-200 rounded text-slate-600 truncate max-w-[100px]" title={u.section}>{u.section}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-700 mb-3 flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-slate-400"></div>Khách vãng lai ({(onlineStats as any).guests})</h4>
              <div className="max-h-60 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                {(onlineStats as any).guestsDetails?.length === 0 && <p className="text-xs text-slate-400 italic">Không có khách nào online</p>}
                {(onlineStats as any).guestsDetails?.map((g: any, i: number) => (
                  <div key={i} className="flex justify-between items-center p-2 rounded-lg border border-slate-100 bg-slate-50">
                    <div className="flex flex-col w-32 shrink-0">
                      <span className="text-[10px] font-mono text-slate-500 truncate" title={g.guestId}>{g.guestId}</span>
                      <span className="text-[9px] text-slate-400 truncate" title={g.userAgent}>{g.userAgent?.split(' ')[0] || 'Unknown OS'}</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-1 bg-white border border-slate-200 rounded text-slate-600 truncate max-w-[100px]" title={g.section}>{g.section}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-center items-center text-center min-h-[200px]">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          </div>
          <div>
            <h3 className="text-4xl font-black text-slate-800 tracking-tight">{onlineStats.daily}</h3>
            <p className="text-sm font-semibold text-slate-400 mt-2 uppercase tracking-wide">lượt truy cập trang</p>
          </div>
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
