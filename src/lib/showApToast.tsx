import { toast } from 'sonner'

export function showApToast(points: number, reason?: string) {
  if (points <= 0) return
  try {
    const audio = new Audio('/audio/amazing-reward-sound.mp3')
    void audio.play()
  } catch {
    // ignore audio errors silently
  }
  const suffix = String(reason || '').trim()
  const message = suffix ? `Congratulations! You've got ${points} APs ${suffix}` : `Congratulations! You've got ${points} APs`

  toast.success(message, {
    position: 'top-right',
    duration: 6000,
    icon: '⭐'
  })
}
