'use client'

import { useEffect, useState } from 'react'

interface LeaderboardUser {
  id: string
  rank: number
  isCurrentUser: boolean
  name: string
  email: string
  activityPoints: number
}

export default function LeaderboardSection() {
  const [users, setUsers] = useState<LeaderboardUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/member/leaderboard')
        if (res.ok) {
          const data = await res.json()
          if (active) {
            setUsers(Array.isArray(data) ? data : [])
          }
        }
      } catch (error) {
        console.error('Error fetching leaderboard:', error)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchLeaderboard()
    return () => { active = false }
  }, [])

  if (loading) return null
  if (users.length === 0) return null

  return (
    <section className="mt-12 px-1">
      <div className="mb-6">
        <h3 className="text-xl font-bold tracking-tight text-primary-900">
          Bảng Xếp Hạng Activity
        </h3>
        <p className="text-sm text-slate-500 mt-1">Hoạt động tích cực để leo top nhận thưởng nhé!</p>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-primary-50 text-xs uppercase text-primary-900">
              <tr>
                <th className="px-4 py-3 font-bold text-center w-16">Hạng</th>
                <th className="px-4 py-3 font-bold">Học Viên</th>
                <th className="px-4 py-3 font-bold">Email</th>
                <th className="px-4 py-3 font-bold text-right">Activity Points</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.map((user) => (
                <tr 
                  key={user.id} 
                  className={`transition-colors hover:bg-slate-50 ${user.isCurrentUser ? 'bg-orange-50/60 font-bold text-primary-900' : ''}`}
                >
                  <td className="px-4 py-3 text-center">
                    {user.rank <= 3 ? (
                      <span className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white shadow-sm ${
                        user.rank === 1 ? 'bg-yellow-500' :
                        user.rank === 2 ? 'bg-slate-400' :
                        'bg-orange-500'
                      }`}>
                        {user.rank}
                      </span>
                    ) : (
                      <span className="font-medium text-slate-500">{user.rank}</span>
                    )}
                  </td>
                  <td className="px-4 py-3">{user.name}</td>
                  <td className="px-4 py-3">{user.email}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-100 px-2.5 py-0.5 text-xs font-semibold text-orange-700">
                      {user.activityPoints} <span className="opacity-70 text-[10px]">AP</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
