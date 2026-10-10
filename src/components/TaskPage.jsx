import { useState, useRef } from 'react'
import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react'
import confetti from 'canvas-confetti'
import {
  Plus, Trash2, Check, ListChecks, Flag, Search, GripVertical, CalendarDays, Undo2,
} from 'lucide-react'
import { deadlineInfo } from '../utils/deadline'
import Chips from './Chips'

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

// Satu baris tugas, bisa digeser lewat ikon pegangan di kiri
function TaskItem({
  task, isEditing, editText, setEditText, onToggle, onDelete, onStartEdit, onSaveEdit, onCancelEdit,
}) {
  const controls = useDragControls()
  const info = task.deadline ? deadlineInfo(task.deadline, task.done) : null

  return (
    <Reorder.Item
      value={task}
      dragListener={false}
      dragControls={controls}
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      whileDrag={{ scale: 1.03, boxShadow: '0 12px 32px rgba(0,0,0,0.18)', zIndex: 10 }}
      transition={{ type: 'spring', stiffness: 500, damping: 35 }}
      className="relative flex items-center gap-2 rounded-xl border border-slate-200 bg-white py-3 pl-2 pr-4 transition-shadow hover:shadow-md"
    >
      <div
        onPointerDown={(e) => controls.start(e)}
        title="Tarik untuk mengubah urutan"
        className="touch-none cursor-grab p-1 text-slate-300 transition-colors hover:text-slate-500 active:cursor-grabbing"
      >
        <GripVertical size={18} />
      </div>

      <motion.button
        whileTap={{ scale: 0.75 }}
        onClick={onToggle}
        aria-label="Tandai selesai"
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition-colors ${
          task.done ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300 hover:border-indigo-400'
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
        {isEditing ? (
          <input
            autoFocus
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            onBlur={onSaveEdit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onSaveEdit()
              if (e.key === 'Escape') onCancelEdit()
            }}
            className="w-full rounded border border-indigo-300 px-2 py-0.5 text-sm outline-none ring-2 ring-indigo-100"
          />
        ) : (
          <span
            onDoubleClick={onStartEdit}
            title="Klik dua kali untuk mengedit"
            className={`relative inline-block cursor-text break-words text-sm transition-colors ${
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
        <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
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
          {info && (
            <span className={`flex items-center gap-1 rounded-full px-2 py-0.5 font-medium ${info.style}`}>
              <CalendarDays size={12} />
              {info.label}
            </span>
          )}
        </div>
      </div>

      <motion.button
        whileTap={{ scale: 0.8 }}
        onClick={onDelete}
        aria-label="Hapus tugas"
        className="text-slate-300 transition-colors hover:text-red-500"
      >
        <Trash2 size={16} />
      </motion.button>
    </Reorder.Item>
  )
}

export default function TaskPage({ tasks, setTasks }) {
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [category, setCategory] = useState('kuliah')
  const [priority, setPriority] = useState('sedang')
  const [deadline, setDeadline] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [catFilter, setCatFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editText, setEditText] = useState('')
  const [undo, setUndo] = useState(null)
  const cancelled = useRef(false)
  const undoTimer = useRef(null)

  const addTask = (e) => {
    e.preventDefault()
    const clean = text.trim()
    if (!clean) {
      setError('Tugas tidak boleh kosong')
      return
    }
    setTasks([
      {
        id: Date.now(),
        text: clean,
        done: false,
        category,
        priority,
        deadline: deadline || null,
        createdAt: new Date().toISOString(),
      },
      ...tasks,
    ])
    setText('')
    setDeadline('')
    setError('')
  }

  const toggleTask = (id) => {
    const updated = tasks.map((t) =>
      t.id === id ? { ...t, done: !t.done, doneAt: t.done ? null : new Date().toISOString() } : t,
    )
    setTasks(updated)
    if (updated.length > 0 && updated.every((t) => t.done)) {
      confetti({ particleCount: 140, spread: 85, origin: { y: 0.7 } })
    }
  }

  // Hapus dengan kesempatan urungkan selama 5 detik
  const deleteTask = (id) => {
    const index = tasks.findIndex((t) => t.id === id)
    setUndo({ task: tasks[index], index })
    setTasks(tasks.filter((t) => t.id !== id))
    clearTimeout(undoTimer.current)
    undoTimer.current = setTimeout(() => setUndo(null), 5000)
  }

  const undoDelete = () => {
    if (!undo) return
    const copy = [...tasks]
    copy.splice(Math.min(undo.index, copy.length), 0, undo.task)
    setTasks(copy)
    setUndo(null)
    clearTimeout(undoTimer.current)
  }

  // Isi ulang posisi tugas yang tampil dengan urutan baru hasil drag
  const handleReorder = (newOrder) => {
    const ids = new Set(newOrder.map((t) => t.id))
    let i = 0
    setTasks(tasks.map((t) => (ids.has(t.id) ? newOrder[i++] : t)))
  }

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
    if (clean) setTasks(tasks.map((t) => (t.id === editingId ? { ...t, text: clean } : t)))
    setEditingId(null)
  }

  const cancelEdit = () => {
    cancelled.current = true
    setEditingId(null)
  }

  const total = tasks.length
  const remaining = tasks.filter((t) => !t.done).length
  const percent = total === 0 ? 0 : Math.round(((total - remaining) / total) * 100)
  const overdue = tasks.filter((t) => !t.done && t.deadline && deadlineInfo(t.deadline).overdue).length

  const q = query.trim().toLowerCase()
  const visible = tasks.filter((t) => {
    const statusOk = statusFilter === 'all' || (statusFilter === 'done' ? t.done : !t.done)
    const catOk = catFilter === 'all' || t.category === catFilter
    const queryOk = !q || t.text.toLowerCase().includes(q)
    return statusOk && catOk && queryOk
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
            id="task-input"
            placeholder="Tulis tugas baru, lalu tekan Enter..."
            className="min-w-0 flex-1 rounded-lg border border-slate-200 px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
          <motion.button
            whileTap={{ scale: 0.92 }}
            type="submit"
            className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Tambah</span>
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
          <label className="flex items-center gap-2 text-xs text-slate-400">
            <CalendarDays size={14} />
            Deadline
            <input
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="rounded-lg border border-slate-200 px-2 py-1 text-xs text-slate-600 outline-none transition focus:border-indigo-400"
            />
          </label>
        </div>
      </form>

      <div className="mt-4 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {remaining} tugas tersisa
            {overdue > 0 && <span className="ml-2 text-xs font-normal text-red-500">{overdue} terlambat</span>}
          </span>
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

      <div className="relative mt-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari tugas..."
          className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
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
          Tidak ada tugas yang cocok.
        </p>
      )}

      <Reorder.Group axis="y" values={visible} onReorder={handleReorder} className="mt-4 space-y-2">
        <AnimatePresence initial={false}>
          {visible.map((task) => (
            <TaskItem
              key={task.id}
              task={task}
              isEditing={editingId === task.id}
              editText={editText}
              setEditText={setEditText}
              onToggle={() => toggleTask(task.id)}
              onDelete={() => deleteTask(task.id)}
              onStartEdit={() => startEdit(task)}
              onSaveEdit={saveEdit}
              onCancelEdit={cancelEdit}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <AnimatePresence>
        {undo && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, scale: 0.95 }}
            className="fixed bottom-20 left-1/2 z-50 flex -translate-x-1/2 items-center gap-4 rounded-full border border-white/10 bg-[#0f172a] py-2.5 pl-5 pr-3 text-sm text-white shadow-xl md:bottom-8"
          >
            <span className="max-w-[10rem] truncate">Tugas dihapus</span>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={undoDelete}
              className="flex items-center gap-1.5 rounded-full bg-indigo-500 px-3 py-1 text-xs font-semibold"
            >
              <Undo2 size={13} />
              Urungkan
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}