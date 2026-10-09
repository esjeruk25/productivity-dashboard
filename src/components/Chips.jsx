import { motion } from 'motion/react'

// Deretan chip dengan indikator yang meluncur ke pilihan aktif
export default function Chips({ options, value, onChange, group }) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`relative rounded-full px-3 py-1 text-xs font-medium transition-colors ${
            value === o.value ? 'text-white' : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          {value === o.value && (
            <motion.span
              layoutId={`pill-${group}`}
              className="absolute inset-0 rounded-full bg-indigo-600"
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
          )}
          <span className="relative">{o.label}</span>
        </button>
      ))}
    </div>
  )
}