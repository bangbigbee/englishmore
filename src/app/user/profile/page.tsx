'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Image from 'next/image'

interface UserProfile {
  id: string
  name: string | null
  email: string
  phone: string | null
  image: string | null
  bio: string | null
  studentId: string | null
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    bio: ''
  })

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    } else if (status === 'authenticated') {
      fetchProfile()
    }
  }, [status, router])

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
      setProfile(updated)
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
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className="space-y-6 lg:sticky lg:top-6 self-start">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-amber-700">Referred By</h2>
              {profile?.referrer ? (
                <div className="mt-3 space-y-1 text-sm text-slate-700">
                  <p><span className="font-semibold">Name:</span> {profile.referrer.name || 'N/A'}</p>
                  <p><span className="font-semibold">Email:</span> {profile.referrer.email}</p>
                  <p><span className="font-semibold">Student ID:</span> {profile.referrer.studentId || 'N/A'}</p>
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No referrer recorded.</p>
              )}
            </div>

            <div className="rounded-lg border border-[#14532d]/20 bg-[#14532d]/5 p-4">
              <h2 className="text-sm font-bold uppercase tracking-wide text-[#14532d]">Successful Referrals</h2>
              {profile?.referredUsers?.length ? (
                <div className="mt-3 space-y-3">
                  {profile.referredUsers.map((item) => (
                    <div key={item.id} className="rounded-lg border border-white bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                      <p><span className="font-semibold">Name:</span> {item.name || 'N/A'}</p>
                      <p><span className="font-semibold">Email:</span> {item.email}</p>
                      <p><span className="font-semibold">Student ID:</span> {item.studentId || 'N/A'}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-slate-600">No successful referrals yet.</p>
              )}
            </div>
          </aside>

          <div className="bg-white rounded-lg shadow p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8">Profile</h1>

            {error && <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}
            {success && <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded text-green-700 text-sm">{success}</div>}

            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Profile photo</label>
              <div className="flex items-end gap-4">
                <div className="shrink-0">
                  {imagePreview ? (
                    <div className="h-24 w-24 relative rounded-lg overflow-hidden bg-gray-200">
                      <Image
                        src={imagePreview}
                        alt="Avatar preview"
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="h-24 w-24 rounded-lg bg-gray-200 flex items-center justify-center">
                      <svg className="h-8 w-8 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="block w-full text-sm text-gray-500
                      file:mr-4 file:py-2 file:px-4
                      file:rounded file:border-0
                      file:text-sm file:font-semibold
                      file:bg-[#14532d] file:text-white
                      hover:file:bg-[#166534]
                      cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">JPG, PNG, GIF up to 5MB</p>
                </div>
              </div>
            </div>

            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d] outline-none"
              />
            </div>

            {/* Email (read-only) */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                id="email"
                value={profile?.email || ''}
                disabled
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 bg-gray-100 text-gray-600"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Student ID</label>
              <input
                type="text"
                value={profile?.studentId || 'Not assigned yet'}
                disabled
                className="mt-1 block w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 text-gray-600"
              />
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone number</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                placeholder="0912345678"
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d] outline-none"
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Write something about yourself..."
                rows={4}
                className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-[#14532d] focus:ring-1 focus:ring-[#14532d] outline-none resize-none"
              />
              <p className="text-xs text-gray-500 mt-1">Up to 500 characters</p>
            </div>

              {/* Submit */}
              <div className="flex gap-3 pt-4">
              {session.user?.role === 'admin' && (
                <button
                  type="button"
                  onClick={() => router.push('/admin')}
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-black font-medium transition-colors cursor-pointer"
                >
                  Go to Dashboard
                </button>
              )}
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-4 py-2 bg-[#14532d] text-white rounded-lg hover:bg-[#166534] disabled:opacity-50 font-medium transition-colors cursor-pointer"
                >
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors cursor-pointer"
                >
                  Back
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
