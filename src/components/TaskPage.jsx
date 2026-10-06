import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import confetti from 'canvas-confetti'
import { Plus, Trash2, Check, ListChecks, Flag } from 'lucide-react'

const CATEGORIES = {
  kuliah: { label: 'Kuliah', style: 'bg-sky-50 text-sky-600' },
  pribadi: { label: 'Pribadi', style: 'bg-emerald-50 text-emerald-600' },
  proyek: { label: 'Proyek', style: 'bg-violet-50 text-violet-600' },
}

const PRIORITIES = {
  rendah: { label: 'Rendah', flag: 'text-slate-400' },
  sedang: { label: 'Sedang', flag: 'text-amber-500' },
  tinggi: { label: 'Tinggi', flag: 'text-red-500' },
}

const catOptions = Object.entries(CATEGORIES).map(([value, c]) => ({ value, label: c.label }))
const priOptions = Object.entries(PRIORITIES).map(([value, p]) => ({ value, label: p.label }))
const statusOptions = [
  { value: 'all', label: 'Semua' },
  { value: 'active', label: 'Aktif' },
  { value: 'done', label: 'Selesai' },
]
const catFilterOptions = [{ value: 'all', label: 'Semua' }, ...catOptions]

// Deretan chip dengan indikator yang meluncur ke pilihan aktif
function Chips({ options, value, onChange, group }) {
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

export default function TaskPage({ tasks, setTasks }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [category, setCategory] = useState('kuliah')
  const [priority, setPriority] = useState('sedang')
  const [statusFilter, setStatusFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const cancelled = useRef(false)

  const addTask = (e) => {
    e.preventDefault()
    const clean = text.trim()
    if (!clean) {
      setError('Tugas tidak boleh kosong')
      return
    }
    const newTask = {
      id: Date.now(),
      text: clean,
      done: false,
      category,
      priority,
      createdAt: new Date().toISOString(),
    }
    setTasks([newTask, ...tasks])
    setText('')
    setError('')
  }

  const toggleTask = (id) => {
    const updated = tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t))
    setTasks(updated)
    // Konfeti hanya saat centang terakhir membuat semua tugas selesai
    if (updated.length > 0 && updated.every((t) => t.done)) {
      confetti({ particleCount: 140, spread: 85, origin: { y: 0.7 } })
    }
  }

  const deleteTask = (id) => setTasks(tasks.filter((t) => t.id !== id))

  const startEdit = (task) => {
    cancelled.current = false
    setEditingId(task.id)
    setEditText(task.text)
  }

  const saveEdit = () => {
    if (cancelled.current) {
      cancelled.current = false
      return
    }
    const clean = editText.trim()
    if (clean) {
      setTasks(tasks.map((t) => (t.id === editingId ? { ...t, text: clean } : t)))
    }
    setEditingId(null)
  }

  const total = tasks.length
  const remaining = tasks.filter((t) => !t.done).length
  const percent = total === 0 ? 0 : Math.round(((total - remaining) / total) * 100)

  const visible = tasks.filter((t) => {
    const statusOk =
      statusFilter === 'all' || (statusFilter === 'done' ? t.done : !t.done)
    const catOk = catFilter === 'all' || t.category === catFilter
    return statusOk && catOk
  })

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-2xl font-semibold">Tugas</h2>
      <p className="mt-1 text-slate-500">Catat apa yang harus kamu selesaikan hari ini.</p>

      <form onSubmit={addTask} className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex gap-2">
          <input
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              if (error) setError('')
            }}
            placeholder="Tulis tugas baru, lalu tekan Enter..."
            className="flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
          >
            <Plus size={16} />
            Tambah
          </motion.button>
        </div>
        {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
        <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Kategori</span>
            <Chips options={catOptions} value={category} onChange={setCategory} group="form-cat" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Prioritas</span>
            <Chips options={priOptions} value={priority} onChange={setPriority} group="form-pri" />
          </div>
        </div>
      </form>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">{remaining} tugas tersisa</span>
          <span className="text-slate-500">{percent}% selesai</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percent === 100 ? 'bg-emerald-500' : 'bg-indigo-500'
            }`}
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
        <Chips options={statusOptions} value={statusFilter} onChange={setStatusFilter} group="f-status" />
        <Chips options={catFilterOptions} value={catFilter} onChange={setCatFilter} group="f-cat" />
      </div>

      {tasks.length === 0 && (
        <div className="mt-4 flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white py-12 text-slate-400">
          <ListChecks size={36} />
          <p className="mt-3 text-sm">Belum ada tugas. Tambahkan yang pertama!</p>
        </div>
      )}

      {tasks.length > 0 && visible.length === 0 && (
        <p className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white py-8 text-center text-sm text-slate-400">
          Tidak ada tugas yang cocok dengan filter ini.
        </p>
      )}

      <ul className="mt-4 space-y-2">
        <AnimatePresence initial={false} mode="popLayout">
          {visible.map((task) => (
            <motion.li
              key={task.id}
              layout
              initial={{ opacity: 0, y: -12, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 80, scale: 0.9 }}
              transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-shadow hover:shadow-md"
            >
              <motion.button
                whileTap={{ scale: 0.75 }}
                onClick={() => toggleTask(task.id)}
                aria-label="Tandai selesai"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  task.done
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300 hover:border-indigo-400'
                }`}
              >
                {task.done && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 600, damping: 20 }}
                  >
                    <Check size={12} strokeWidth={3} />
                  </motion.span>
                )}
              </motion.button>

              <div className="min-w-0 flex-1">
                {editingId === task.id ? (
                  <input
                    autoFocus
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    onBlur={saveEdit}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEdit()
                      if (e.key === 'Escape') {
                        cancelled.current = true
                        setEditingId(null)
                      }
                    }}
                    className="w-full rounded border border-indigo-300 px-2 py-0.5 text-sm outline-none ring-2 ring-indigo-100"
                  />
                ) : (
                  <span
                    onDoubleClick={() => startEdit(task)}
                    title="Klik dua kali untuk mengedit"
                    className={`relative inline-block cursor-text text-sm transition-colors ${
                      task.done ? 'text-slate-400' : 'text-slate-700'
                    }`}
                  >
                    {task.text}
                    <span
                      className="pointer-events-none absolute left-0 top-1/2 h-px bg-slate-400 transition-all duration-300"
                      style={{ width: task.done ? '100%' : '0%' }}
                    />
                  </span>
                )}
                <div className="mt-1 flex items-center gap-2 text-xs">
                  <span
                    className={`rounded-full px-2 py-0.5 font-medium ${
                      CATEGORIES[task.category]?.style ?? 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {CATEGORIES[task.category]?.label ?? 'Umum'}
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Flag size={12} className={PRIORITIES[task.priority]?.flag} />
                    {PRIORITIES[task.priority]?.label ?? 'Sedang'}
                  </span>
                </div>
              </div>

              <motion.button
                whileTap={{ scale: 0.8 }}
                onClick={() => deleteTask(task.id)}
                aria-label="Hapus tugas"
                className="text-slate-300 transition-colors hover:text-red-500"
              >
                <Trash2 size={16} />
              </motion.button>
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>
    </div>
  )
}