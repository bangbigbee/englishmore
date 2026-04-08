import { toast } from 'sonner'

export function showApToast(points: number) {
  if (points <= 0) return
  try {
    const audio = new Audio('/audio/amazing-reward-sound.mp3')
    void audio.play()
  } catch {
    // ignore audio errors silently
  }
  toast.custom(() => (
    <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 shadow-md">
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-amber-500 text-lg text-white">⭐</span>
      <p className="text-sm font-semibold text-amber-800">Congratulations! You&apos;ve got {points} APs</p>
    </div>
  ), { toasterId: 'ap-toast' })
}
