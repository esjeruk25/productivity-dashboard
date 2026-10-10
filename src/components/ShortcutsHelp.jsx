import { Fragment, useEffect } from 'react'
import { motion } from 'motion/react'
import { X } from 'lucide-react'
import { MOD_KEY } from '../utils/platform'

const rows = [
  { keys: [MOD_KEY, 'K'], text: 'Buka palet perintah' },
  { keys: ['1 – 5'], text: 'Pindah halaman' },
  { keys: ['N'], text: 'Tugas baru (langsung mengetik)' },
  { keys: ['D'], text: 'Ganti mode gelap / terang' },
  { keys: ['Spasi'], text: 'Mulai / jeda timer (di halaman Pomodoro)' },
  { keys: ['?'], text: 'Tampilkan bantuan ini' },
  { keys: ['Esc'], text: 'Tutup dialog' },
]

export default function ShortcutsHelp({ onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="relative z-10 w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Pintasan keyboard</h3>
          <button onClick={onClose} aria-label="Tutup" className="rounded-lg p-1 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
        </div>
        <ul className="mt-4 space-y-1">
          {rows.map((r, i) => (
            <motion.li
              key={r.text}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 + i * 0.04 }}
              className="flex items-center justify-between rounded-lg px-2 py-2 text-sm hover:bg-slate-50"
            >
              <span className="text-slate-600">{r.text}</span>
              <span className="flex items-center gap-1">
                {r.keys.map((k, j) => (
                  <Fragment key={k}>
                    {j > 0 && <span className="text-xs text-slate-400">+</span>}
                    <kbd className="rounded-md border border-slate-300 bg-slate-100 px-2 py-0.5 text-xs font-medium">
                      {k}
                    </kbd>
                  </Fragment>
                ))}
              </span>
            </motion.li>
          ))}
        </ul>
        <p className="mt-4 text-xs text-slate-400">
          Pintasan satu tombol tidak aktif saat kamu sedang mengetik di kolom isian.
        </p>
      </motion.div>
    </div>
  )
}