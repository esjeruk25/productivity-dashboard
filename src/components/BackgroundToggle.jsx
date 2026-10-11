import { motion } from 'motion/react'
import { Palette } from 'lucide-react'
import { BG_LABELS } from '../utils/background'

export default function BackgroundToggle({ variant, onCycle }) {
  return (
    <button
      onClick={onCycle}
      aria-label="Ganti latar"
      className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
    >
      <motion.span
        key={variant}
        initial={{ rotate: -60, scale: 0.6 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 400, damping: 15 }}
      >
        <Palette size={18} />
      </motion.span>
      <span className="flex-1 text-left">Latar: {BG_LABELS[variant]}</span>
    </button>
  )
}