import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { CheckSquare, ArrowRight } from 'lucide-react'

const messages = [
  { at: 0, text: 'Menyiapkan ruang kerja...' },
  { at: 30, text: 'Memuat tugas kamu...' },
  { at: 60, text: 'Merapikan dashboard...' },
  { at: 90, text: 'Hampir siap!' },
]

export default function LoadingScreen({ onFinish }) {
  const [progress, setProgress] = useState(0)
  const [glow, setGlow] = useState({ x: 50, y: 50 })
  const ready = progress >= 100
  const message = [...messages].reverse().find((m) => progress >= m.at).text

  useEffect(() => {
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) {
          clearInterval(id)
          return 100
        }
        return Math.min(100, p + Math.floor(Math.random() * 7) + 3)
      })
    }, 150)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!ready) return
    const onKey = (e) => e.key === 'Enter' && onFinish()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [ready, onFinish])

  const handleMove = (e) =>
    setGlow({
      x: (e.clientX / window.innerWidth) * 100,
      y: (e.clientY / window.innerHeight) * 100,
    })

  return (
    <motion.div
      onMouseMove={handleMove}
      exit={{ y: '-100%' }}
      transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0f172a] text-white"
      style={{
        backgroundImage: `radial-gradient(circle at ${glow.x}% ${glow.y}%, rgba(99,102,241,0.25), transparent 40%)`,
      }}
    >
      <div className="relative flex h-36 w-36 items-center justify-center">
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-dashed border-indigo-400/40"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 8, ease: 'linear' }}
        />
        <motion.div
          className="absolute inset-4 rounded-full border-2 border-dashed border-violet-400/40"
          animate={{ rotate: -360 }}
          transition={{ repeat: Infinity, duration: 5, ease: 'linear' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ repeat: Infinity, duration: 1.6 }}
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-600 shadow-lg shadow-indigo-500/40"
        >
          <CheckSquare size={30} />
        </motion.div>
      </div>

      <h1 className="mt-8 text-3xl font-bold tracking-tight">FocusBoard</h1>

      <div className="mt-2 h-6">
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="text-sm text-[#94a3b8]"
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>

      <div className="mt-6 w-64">
        <div className="h-1.5 overflow-hidden rounded-full bg-[#334155]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400"
            animate={{ width: `${progress}%` }}
            transition={{ ease: 'easeOut', duration: 0.2 }}
          />
        </div>
        <p className="mt-2 text-center text-2xl font-semibold tabular-nums">{progress}%</p>
      </div>

      <div className="mt-8 h-14">
        {ready ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', stiffness: 400, damping: 20 }}
            className="flex flex-col items-center"
          >
            <motion.button
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.94 }}
              onClick={onFinish}
              className="flex items-center gap-2 rounded-full bg-[#ffffff] px-6 py-2.5 text-sm font-semibold text-[#0f172a]"
            >
              Mulai
              <ArrowRight size={16} />
            </motion.button>
            <span className="mt-2 text-xs text-[#64748b]">atau tekan Enter</span>
          </motion.div>
        ) : (
          <button
            onClick={onFinish}
            className="text-xs text-[#64748b] transition hover:text-[#cbd5e1]"
          >
            Lewati
          </button>
        )}
      </div>
    </motion.div>
  )
}