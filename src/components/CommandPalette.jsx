import { useState, useEffect } from 'react'
import { motion } from 'motion/react'
import { Search, Plus, Play, Pause, Moon, Sun, Keyboard, CheckCircle2, Trash2, StickyNote } from 'lucide-react'

// Susun daftar perintah sesuai teks yang diketik
function buildCommands(query, ctx) {
  const { tasks, setTasks, notes, setNotes, pomo, menus, theme, toggleTheme, goTo, newTask, openHelp } = ctx
  const text = query.trim()
  const words = text.toLowerCase().split(/\s+/).filter(Boolean)
  const matches = (s) => words.every((w) => s.toLowerCase().includes(w))

  const base = [
    ...menus.map((m, i) => ({
      id: `go-${m.id}`,
      group: 'Navigasi',
      label: `Buka ${m.label}`,
      icon: m.icon,
      hint: String(i + 1),
      keywords: m.label,
      run: () => goTo(m.id),
    })),
    { id: 'new-task', group: 'Aksi', label: 'Tugas baru', icon: Plus, hint: 'N', keywords: 'tambah buat task', run: newTask },
    {
      id: 'timer',
      group: 'Aksi',
      label: pomo.running ? 'Jeda timer' : 'Mulai timer fokus',
      icon: pomo.running ? Pause : Play,
      keywords: 'pomodoro timer fokus start pause jeda mulai',
      run: () => {
        if (!pomo.running) goTo('pomodoro')
        pomo.toggle()
      },
    },
    {
      id: 'theme',
      group: 'Aksi',
      label: theme === 'dark' ? 'Ganti ke mode terang' : 'Ganti ke mode gelap',
      icon: theme === 'dark' ? Sun : Moon,
      hint: 'D',
      keywords: 'tema theme dark light gelap terang',
      run: toggleTheme,
    },
    { id: 'help', group: 'Aksi', label: 'Tampilkan pintasan keyboard', icon: Keyboard, hint: '?', keywords: 'bantuan help shortcut', run: openHelp },
  ]
  if (tasks.some((t) => t.done)) {
    base.push({
      id: 'clear-done',
      group: 'Aksi',
      label: 'Bersihkan tugas selesai',
      icon: Trash2,
      keywords: 'hapus clear selesai',
      run: () => setTasks(tasks.filter((t) => !t.done)),
    })
  }

  const items = base.filter((c) => !text || matches(`${c.label} ${c.keywords}`))
  if (!text) return items

  tasks
    .filter((t) => matches(t.text))
    .slice(0, 4)
    .forEach((t) =>
      items.push({
        id: `task-${t.id}`,
        group: 'Tugas',
        label: `${t.done ? 'Buka kembali' : 'Selesaikan'}: ${t.text}`,
        icon: CheckCircle2,
        run: () =>
          setTasks(
            tasks.map((x) =>
              x.id === t.id ? { ...x, done: !x.done, doneAt: x.done ? null : new Date().toISOString() } : x,
            ),
          ),
      }),
    )

  notes
    .filter((n) => matches(`${n.title} ${n.body}`))
    .slice(0, 3)
    .forEach((n) =>
      items.push({
        id: `note-${n.id}`,
        group: 'Catatan',
        label: `Catatan: ${n.title || 'Tanpa judul'}`,
        icon: StickyNote,
        run: () => goTo('notes'),
      }),
    )

  items.push(
    {
      id: 'create-task',
      group: 'Buat baru',
      label: `Tambah tugas: "${text}"`,
      icon: Plus,
      run: () => {
        setTasks([
          {
            id: Date.now(),
            text,
            done: false,
            category: 'kuliah',
            priority: 'sedang',
            deadline: null,
            createdAt: new Date().toISOString(),
          },
          ...tasks,
        ])
        goTo('tasks')
      },
    },
    {
      id: 'create-note',
      group: 'Buat baru',
      label: `Buat catatan: "${text}"`,
      icon: StickyNote,
      run: () => {
        setNotes([
          { id: Date.now(), title: text, body: '', color: 'default', pinned: false, updatedAt: new Date().toISOString() },
          ...notes,
        ])
        goTo('notes')
      },
    },
  )
  return items
}

export default function CommandPalette({ onClose, ctx }) {
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const items = buildCommands(query, ctx)
  const idx = Math.min(active, items.length - 1)

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowDown') {
        e.preventDefault()
        setActive((idx + 1) % items.length)
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setActive((idx - 1 + items.length) % items.length)
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const item = items[idx]
        if (item) {
          item.run()
          onClose()
        }
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [items, idx, onClose])

  useEffect(() => {
    document.getElementById(`cmd-${idx}`)?.scrollIntoView({ block: 'nearest' })
  }, [idx])

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[12vh]">
      <motion.div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, y: -24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -24, scale: 0.96 }}
        transition={{ type: 'spring', stiffness: 500, damping: 35 }}
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
      >
        <div className="flex items-center gap-3 border-b border-slate-200 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActive(0)
            }}
            placeholder="Ketik perintah, cari tugas, atau tulis tugas baru..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
          />
          <kbd className="rounded border border-slate-200 px-1.5 text-[10px] text-slate-400">Esc</kbd>
        </div>

        <div className="max-h-80 overflow-y-auto p-2">
          {items.map((item, i) => {
            const Icon = item.icon
            const showGroup = i === 0 || items[i - 1].group !== item.group
            return (
              <div key={item.id}>
                {showGroup && (
                  <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    {item.group}
                  </p>
                )}
                <button
                  id={`cmd-${i}`}
                  onMouseMove={() => setActive(i)}
                  onClick={() => {
                    item.run()
                    onClose()
                  }}
                  className="relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm"
                >
                  {i === idx && (
                    <motion.span
                      layoutId="cmd-active"
                      className="absolute inset-0 rounded-lg bg-indigo-50"
                      transition={{ type: 'spring', stiffness: 500, damping: 38 }}
                    />
                  )}
                  <Icon size={17} className={`relative shrink-0 ${i === idx ? 'text-indigo-600' : 'text-slate-400'}`} />
                  <span className={`relative flex-1 truncate ${i === idx ? 'text-indigo-600' : ''}`}>{item.label}</span>
                  {item.hint && (
                    <kbd className="relative rounded border border-slate-200 px-1.5 text-[10px] text-slate-400">
                      {item.hint}
                    </kbd>
                  )}
                </button>
              </div>
            )
          })}
        </div>

        <div className="flex items-center gap-4 border-t border-slate-200 px-4 py-2 text-[11px] text-slate-400">
          <span>↑↓ pilih</span>
          <span>Enter jalankan</span>
          <span>Esc tutup</span>
        </div>
      </motion.div>
    </div>
  )
}