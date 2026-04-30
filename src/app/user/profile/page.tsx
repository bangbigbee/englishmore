'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import Image from 'next/image'
import ProgressView from './ProgressView'
import { toast } from 'sonner'
import { UpgradeContent } from '@/app/toeic-practice/upgrade/page'
import LinkifiedText from '@/components/LinkifiedText'
import Link from 'next/link'

interface BadgeItem {
  id: string
  icon: string
  name: string
  description: string
  earned: boolean
  earnedAt?: string | null
  progress?: number
  progressLabel?: string
}

interface UserProfile {
  id: string
  name: string | null
  email: string
  activityPoints: number
  toeicStars?: number
  phone: string | null
  image: string | null
  bio: string | null
  studentId: string | null
  courseEnrollmentStatus: string | null
  courseTitle: string | null
  referrer: {
    id: string
    name: string | null
    email: string
    phone: string | null
    studentId: string | null
  } | null
  referredUsers: Array<{
    id: string
    name: string | null
    email: string
    phone: string | null
    studentId: string | null
    createdAt: string
  }>
  toeicReferrer: {
    id: string
    name: string | null
    email: string
    phone: string | null
    studentId: string | null
  } | null
  toeicReferredUsers: Array<{
    id: string
    name: string | null
    email: string
    phone: string | null
    studentId: string | null
    createdAt: string
  }>
}

export default function ProfilePage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imagePreviewFailed, setImagePreviewFailed] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [activeTab, setActiveTab] = useState<'info' | 'upgrade' | 'progress'>('info')

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: ''
  })
  const [badges, setBadges] = useState<BadgeItem[]>([])
  const [badgesLoading, setBadgesLoading] = useState(false)
  const profileInitial = (formData.name || profile?.name || session?.user?.name || session?.user?.email || 'U').trim().charAt(0).toUpperCase()

  useEffect(() => {
    setImagePreviewFailed(false)
  }, [imagePreview])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchProfile()
      fetchBadges()
    }
  }, [status, router])

  useEffect(() => {
    if (error) {
      toast.error(error)
    }
  }, [error])

  useEffect(() => {
    if (success) {
      toast.success(success)
    }
  }, [success])

  const fetchBadges = async () => {
    try {
      setBadgesLoading(true)
      const res = await fetch('/api/user/badges')
      if (!res.ok) return
      const data = await res.json()
      setBadges(data.badges || [])
    } catch {
      // Ignore badge fetch errors silently
    } finally {
      setBadgesLoading(false)
    }
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const res = await fetch('/api/user/profile')
      if (!res.ok) throw new Error('Failed to fetch profile')
      const data = await res.json()
      setProfile(data)
      setFormData({
        name: data.name || '',
        phone: data.phone || '',
        bio: data.bio || ''
      })
      if (data.image) {
        setImagePreview(data.image)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setSaving(true)

    try {
      const updateData: { name?: string; phone?: string; bio?: string; image?: string } = {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio
      }

      let avatarUploadFailed = false
      let avatarUploadError = ''

      // Try to upload avatar, but don't fail if it errors
      if (selectedFile) {
        try {
          const formDataFile = new FormData()
          formDataFile.append('file', selectedFile)
          
          const uploadRes = await fetch('/api/user/upload-avatar', {
            method: 'POST',
            body: formDataFile
          })

          if (uploadRes.ok) {
            const uploadData = await uploadRes.json()
            updateData.image = uploadData.url
          } else {
            const uploadErr = await uploadRes.json().catch(() => ({ error: 'Unknown upload error' }))
            avatarUploadFailed = true
            avatarUploadError = uploadErr.error || 'Failed to upload image'
          }
        } catch (uploadErr) {
          avatarUploadFailed = true
          avatarUploadError = uploadErr instanceof Error ? uploadErr.message : 'Failed to upload image'
        }
      }

      // Always update profile, regardless of avatar upload status
      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      })

      if (!res.ok) {
        const errData = await res.json()
        throw new Error(errData.error || 'Failed to update profile')
      }

      const updated = await res.json()
      setProfile((current) => {
        if (!current) {
          return updated
        }
        return {
          ...current,
          ...updated
        }
      })
      setSelectedFile(null)

      // Refresh session to sync name and image across app
      await update()

      // Show success message, with warning about avatar if it failed
      if (avatarUploadFailed) {
        setSuccess(`Your profile has been saved, but the avatar upload failed: ${avatarUploadError}`)
      } else {
        setSuccess('Profile updated successfully!')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-slate-500">Loading...</p>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="w-full h-full pb-12">
      <div className="mx-auto max-w-5xl px-0 py-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 p-1 bg-slate-100 rounded-xl overflow-x-auto custom-scrollbar mb-6 border border-slate-200 w-full md:w-max">
            <button
              onClick={() => setActiveTab('info')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${activeTab === 'info' ? 'bg-primary-100 text-primary-900' : 'bg-gray-100 text-gray-700'}`}
            >
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('progress')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full transition-all ${activeTab === 'progress' ? 'bg-primary-100 text-primary-900' : 'bg-gray-100 text-gray-700'}`}
            >
              Tiến độ
            </button>
            <button
              onClick={() => setActiveTab('upgrade')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-full flex items-center gap-1 transition-all ${activeTab === 'upgrade' ? 'bg-primary-100 text-primary-900' : 'bg-gray-100 text-gray-700'}`}
            >
              <span className="text-secondary-500">⚡</span> Nâng cấp tài khoản
            </button>
          </div>

        {activeTab === 'info' ? (
          <div className="flex flex-col gap-8">
            {/* Main Info Box */}
          <div className="rounded-xl border-2 border-slate-200 bg-white shadow-sm p-6 sm:p-8 relative">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Profile photo</label>
                <div className="flex items-center gap-4">
                  <div className="shrink-0 relative">
                    {imagePreview && !imagePreviewFailed ? (
                      <div className={`h-24 w-24 relative rounded-xl overflow-hidden bg-gray-100 shadow-md ${session.user?.tier === 'PRO' ? 'outline outline-2 outline-[#ea980c] ring-4 ring-[#ea980c]/10' : session.user?.tier === 'ULTRA' ? 'outline outline-2 outline-primary-700 ring-4 ring-primary-600/10' : ''}`}>
                        <Image
                          src={imagePreview}
                          alt="Avatar preview"
                          fill
                          className="object-cover"
                          onError={() => setImagePreviewFailed(true)}
                        />
                      </div>
                    ) : (
                      <div className={`flex h-24 w-24 items-center justify-center rounded-xl bg-primary-900/5 text-3xl font-black text-primary-900 shadow-sm ${session.user?.tier === 'PRO' ? 'outline outline-2 outline-[#ea980c] ring-4 ring-[#ea980c]/10' : session.user?.tier === 'ULTRA' ? 'outline outline-2 outline-primary-700 ring-4 ring-primary-600/10' : ''}`}>
                        {profileInitial}
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-slate-500
                        file:mr-4 file:py-2.5 file:px-4
                        file:rounded-xl file:border-0
                        file:text-sm file:font-bold
                        file:bg-slate-100 file:text-slate-700
                        hover:file:bg-slate-200 file:transition-colors
                        cursor-pointer focus:outline-none"
                    />
                    <p className="text-xs text-slate-400 mt-2 font-medium">JPG, PNG, GIF Max 5MB</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-bold text-slate-700">Full name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1.5 block w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 focus:border-primary-900 focus:ring-0 outline-none transition-colors font-medium text-slate-800"
                  />
                </div>

                {/* Email (read-only) */}
                <div>
                  <label htmlFor="email" className="block text-sm font-bold text-slate-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={profile?.email || ''}
                    disabled
                    className="mt-1.5 block w-full rounded-xl border-2 border-slate-100 px-4 py-2.5 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-slate-700">Student ID (Khóa học)</label>
                  <input
                    type="text"
                    value={profile?.studentId || 'Chưa cập nhật'}
                    disabled
                    className="mt-1.5 block w-full rounded-xl border-2 border-slate-100 px-4 py-2.5 bg-slate-50 text-slate-500 font-medium cursor-not-allowed"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-bold text-slate-700">Số điện thoại</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="0912345678"
                    className="mt-1.5 block w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 focus:border-primary-900 focus:ring-0 outline-none transition-colors font-medium text-slate-800"
                  />
                </div>

                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-slate-700">Mã giới thiệu (ToeicMore ID)</label>
                    <div className="relative mt-1.5 flex items-center">
                      <input
                        type="text"
                        value={profile?.id ? profile.id.slice(-10) : ''}
                        disabled
                        className="block w-full rounded-xl border-2 border-slate-100 pl-4 pr-12 py-2.5 bg-slate-50 text-slate-500 font-bold cursor-not-allowed text-[14px]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (profile?.id) {
                            navigator.clipboard.writeText(profile.id.slice(-10));
                            toast.success('Đã copy Mã giới thiệu');
                          }
                        }}
                        className="absolute right-2 p-1.5 text-slate-400 hover:text-primary-600 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm"
                        title="Copy Mã giới thiệu"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-700">Link giới thiệu (ToeicMore)</label>
                    <div className="relative mt-1.5 flex items-center">
                      <input
                        type="text"
                        value={profile?.id ? `${typeof window !== 'undefined' ? window.location.origin : 'https://toeicmore.com'}/?ref=${profile.id.slice(-10)}` : ''}
                        disabled
                        className="block w-full rounded-xl border-2 border-slate-100 pl-4 pr-12 py-2.5 bg-slate-50 text-slate-500 font-bold cursor-not-allowed text-[13px]"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (profile?.id) {
                            const link = `${typeof window !== 'undefined' ? window.location.origin : 'https://toeicmore.com'}/?ref=${profile.id.slice(-10)}`;
                            navigator.clipboard.writeText(link);
                            toast.success('Đã copy Link giới thiệu');
                          }
                        }}
                        className="absolute right-2 p-1.5 text-slate-400 hover:text-primary-600 transition-colors bg-white rounded-lg border border-slate-200 shadow-sm"
                        title="Copy Link giới thiệu"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path></svg>
                      </button>
                    </div>
                  </div>
                </div>
                
                <div className="md:col-span-2 -mt-2">
                  <p className="text-xs text-slate-500 font-medium">Bạn có thể gửi mã hoặc link chia sẻ này cho bạn bè. Khi bạn bè truy cập và tạo tài khoản, hệ thống sẽ ghi nhận lượt mời cho bạn.</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-slate-700">Khóa học hiện tại</label>
                  <div className="mt-1.5 flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      value={
                        !profile?.courseEnrollmentStatus
                          ? 'Chưa đăng ký khóa học nào'
                          : profile.courseEnrollmentStatus === 'pending'
                          ? 'Đang chờ duyệt'
                          : profile.courseTitle || 'Không xác định'
                      }
                      disabled
                      className="block flex-1 min-w-[200px] rounded-xl border-2 border-slate-100 px-4 py-2.5 bg-slate-50 text-slate-500 font-bold cursor-not-allowed"
                    />
                    {profile?.courseEnrollmentStatus === 'pending' && (
                      <span className="shrink-0 rounded-[10px] bg-secondary-100 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-secondary-700">Pending</span>
                    )}
                    {profile?.courseEnrollmentStatus === 'active' && (
                      <span className="shrink-0 rounded-[10px] bg-primary-900/10 px-3 py-1.5 text-xs font-black uppercase tracking-wider text-primary-900">Active Enrolled</span>
                    )}
                  </div>
                </div>

                {/* Bio */}
                <div className="md:col-span-2">
                  <label htmlFor="bio" className="block text-sm font-bold text-slate-700">Tiểu sử (Bio)</label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={formData.bio}
                    onChange={handleInputChange}
                    placeholder="Viết một vài dòng về bản thân bạn..."
                    rows={3}
                    className="mt-1.5 block w-full rounded-xl border-2 border-slate-200 px-4 py-2.5 focus:border-primary-900 focus:ring-0 outline-none transition-colors font-medium text-slate-800 resize-none custom-scrollbar"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-100">
                {session.user?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={() => router.push('/admin')}
                    className="px-6 py-2.5 bg-slate-900 text-white rounded-[12px] hover:bg-black font-bold transition-all cursor-pointer shadow-md"
                  >
                    Go Admin
                  </button>
                )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 min-w-[150px] px-6 py-2.5 bg-primary-900 text-white rounded-[12px] hover:bg-primary-800 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-all cursor-pointer shadow-md"
                >
                  {saving ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-2.5 border-2 border-slate-200 text-slate-600 rounded-[12px] hover:bg-slate-50 hover:text-slate-800 font-bold transition-all cursor-pointer"
                >
                  Trở về
                </button>
              </div>
            </form>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* AP */}
            <div className="rounded-xl border-2 border-secondary-200 bg-gradient-to-br from-secondary-50 to-white p-5 shadow-sm flex flex-col">
              <h2 className="text-xs font-black uppercase tracking-widest text-secondary-700 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                Activity Points
              </h2>
              <div className="flex-1 flex items-center gap-3">
                <div className="text-4xl font-black text-secondary-600 tracking-tighter">
                  {profile?.activityPoints ?? 0}
                </div>
                <div className="flex flex-col">
                  <span className="text-secondary-800 font-bold text-sm">Điểm AP</span>
                  <span className="text-secondary-600/70 text-[11px] font-medium leading-tight mt-0.5">EnglishMore</span>
                </div>
              </div>
            </div>

            {/* Toeic Stars */}
            <div className="rounded-xl border-2 border-yellow-300 bg-gradient-to-br from-yellow-50 to-white p-5 shadow-sm flex flex-col">
              <h2 className="text-xs font-black uppercase tracking-widest text-yellow-600 mb-4 flex items-center gap-2">
                <span className="text-lg leading-none mb-0.5">⭐</span>
                Toeic Stars
              </h2>
              <div className="flex-1 flex items-center gap-3">
                <div className="text-4xl font-black text-yellow-500 tracking-tighter">
                  {profile?.toeicStars ?? 0}
                </div>
                <div className="flex flex-col">
                  <span className="text-yellow-700 font-bold text-sm">Điểm Sao</span>
                  <span className="text-yellow-600/70 text-[11px] font-medium leading-tight mt-0.5">ToeicMore</span>
                </div>
              </div>
            </div>

            {/* Referred By (EnglishMore) */}
            <div className="rounded-xl border-2 border-slate-200 bg-white p-5 shadow-sm flex flex-col">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Người giới thiệu (Khóa học)
              </h2>
              <div className="flex-1">
                {profile?.referrer ? (
                  <div className="space-y-1.5">
                    <p className="text-slate-800 font-bold text-[15px]">{profile.referrer.name || 'Thành viên vô danh'}</p>
                    <p className="text-slate-500 font-medium text-[13px] truncate">{profile.referrer.email}</p>
                    {profile.referrer.studentId && (
                      <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-600 text-[11px] font-bold rounded-md mt-1">ID: {profile.referrer.studentId}</span>
                    )}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-400 italic mt-2">Chưa ghi nhận người giới thiệu.</p>
                )}
              </div>
            </div>

            {/* My Referrals (EnglishMore) */}
            <div className="rounded-xl border-2 border-primary-900/20 bg-gradient-to-br from-primary-900/5 to-white p-5 shadow-sm flex flex-col">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-primary-900 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                Lượt giới thiệu (Khóa học)
              </h2>
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="text-3xl font-black text-primary-900 tracking-tighter mb-2">
                  {profile?.referredUsers?.length || 0}
                  <span className="text-sm font-bold text-primary-900/60 tracking-normal ml-1.5">lượt</span>
                </div>
                {profile?.referredUsers?.length ? (
                  <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1 max-h-[80px]">
                    {profile.referredUsers.map((item) => (
                      <div key={item.id} className="text-[13px] font-medium text-slate-600 truncate border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                        {item.name || item.email.split('@')[0]}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-400 italic">Chưa giới thiệu được ai.</p>
                )}
              </div>
            </div>

            {/* Referred By (ToeicMore) */}
            <div className="rounded-xl border-2 border-slate-200 bg-white p-5 shadow-sm flex flex-col">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-slate-500 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                Người giới thiệu (ToeicMore)
              </h2>
              <div className="flex-1">
                {profile?.toeicReferrer ? (
                  <div className="space-y-1.5">
                    <p className="text-slate-800 font-bold text-[15px]">{profile.toeicReferrer.name || 'Thành viên vô danh'}</p>
                    <p className="text-slate-500 font-medium text-[13px] truncate">{profile.toeicReferrer.email}</p>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-slate-400 italic mt-2">Đăng ký tự do.</p>
                )}
              </div>
            </div>

            {/* My Referrals (ToeicMore) */}
            <div className="rounded-xl border-2 border-primary-200 bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm flex flex-col">
              <h2 className="text-[11px] font-black uppercase tracking-widest text-primary-700 mb-4 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                Lượt giới thiệu ToeicMore
              </h2>
              <div className="flex-1 overflow-hidden flex flex-col">
                <div className="text-3xl font-black text-primary-700 tracking-tighter mb-2">
                  {profile?.toeicReferredUsers?.length || 0}
                  <span className="text-sm font-bold text-primary-700/60 tracking-normal ml-1.5">lượt</span>
                </div>
                {profile?.toeicReferredUsers?.length ? (
                  <div className="space-y-2 overflow-y-auto custom-scrollbar flex-1 pr-1 max-h-[80px]">
                    {profile.toeicReferredUsers.map((item) => (
                      <div key={item.id} className="text-[13px] font-medium text-slate-600 truncate border-b border-slate-100 last:border-0 pb-1 last:pb-0">
                        {item.name || item.email.split('@')[0]}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
        ) : (
          <div className="w-full">
            <Suspense fallback={<div className="h-40 flex items-center justify-center">Đang tải...</div>}>
              <UpgradeContent />
            </Suspense>
          </div>
        )}
        {activeTab === 'progress' && (
          <div className="mt-8">
            <ProgressView />
          </div>
        )}
      </div>
    </div>
  )
}
