import { toast } from 'sonner'

export function showApToast(points: number) {
  if (points <= 0) return
  try {
    const audio = new Audio('/audio/amazing-reward-sound.mp3')
    void audio.play()
  } catch {
    // ignore audio errors silently
  }
  toast.success(`Congratulations! You've got ${points} APs`, {
    position: 'top-right',
    duration: 6000,
    icon: '⭐'
  })
}
