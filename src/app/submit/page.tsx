'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

export default function Submit() {
  const { data: session } = useSession()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [method, setMethod] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  if (!session) {
    router.push('/login')
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const res = await fetch('/api/assignments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, method })
    })
    if (res.ok) {
      setSuccess('Assignment submitted successfully!')
      setTitle('')
      setDescription('')
      setMethod('')
    } else {
      const data = await res.json()
      setError(data.error)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-4">Submit Assignment</h2>
        {error && <p className="text-red-500 mb-4">{error}</p>}
        {success && <p className="text-[#14532d] mb-4">{success}</p>}
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        />
        <textarea
          placeholder="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          rows={4}
        />
        <select
          value={method}
          onChange={(e) => setMethod(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
          required
        >
          <option value="">Select Method</option>
          <option value="PPF">PPF</option>
          <option value="Beyond">Beyond</option>
          <option value="Contrast">Contrast</option>
        </select>
        <button type="submit" className="w-full bg-[#14532d] text-white p-2 rounded">Submit</button>
      </form>
    </div>
  )
}
