import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Plus, Search, Pin, Trash2, StickyNote } from 'lucide-react'

const COLORS = {
  default: { card: 'bg-white border-slate-200', dot: 'bg-slate-300' },
  amber: { card: 'bg-amber-50 border-amber-200', dot: 'bg-amber-400' },
  rose: { card: 'bg-rose-50 border-rose-200', dot: 'bg-rose-400' },
  sky: { card: 'bg-sky-50 border-sky-200', dot: 'bg-sky-400' },
  emerald: { card: 'bg-emerald-50 border-emerald-200', dot: 'bg-emerald-400' },
  violet: { card: 'bg-violet-50 border-violet-200', dot: 'bg-violet-400' },
}

export default function NotesPage({ notes, setNotes }) {
  const [query, setQuery] = useState('')
  const [openId, setOpenId] = useState(null)
  const open = notes.find((n) => n.id === openId)

  const updateNote = (id, patch, touch = true) =>
    setNotes(
      notes.map((n) =>
        n.id === id ? { ...n, ...patch, ...(touch && { updatedAt: new Date().toISOString() }) } : n,
      ),
    )

  const addNote = () => {
    const note = {
      id: Date.now(),
      title: '',
      body: '',
      color: 'default',
      pinned: false,
      updatedAt: new Date().toISOString(),
    }
    setNotes([note, ...notes])
    setOpenId(note.id)
  }

  const deleteNote = (id) => {
    setNotes(notes.filter((n) => n.id !== id))
    setOpenId(null)
  }

  // Catatan kosong otomatis dibuang saat ditutup
  const closeNote = useCallback(() => {
    const n = notes.find((x) => x.id === openId)
    if (n && !n.title.trim() && !n.body.trim()) setNotes(notes.filter((x) => x.id !== openId))
    setOpenId(null)
  }, [notes, openId, setNotes])

  useEffect(() => {
    if (openId === null) return
    const onKey = (e) => e.key === 'Escape' && closeNote()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [openId, closeNote])

  const q = query.trim().toLowerCase()
  const visible = notes
    .filter((n) => !q || n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q))
    .sort((a, b) => Number(b.pinned) - Number(a.pinned) || b.updatedAt.localeCompare(a.updatedAt))

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="text-2xl font-semibold">Catatan</h2>
      <p className="mt-1 text-slate-500">
        {notes.length} catatan. Klik kartu untuk membuka dan mengedit.
      </p>

      <div className="mt-6 flex gap-2">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Cari catatan..."
            className="w-full rounded-lg border border-slate-200 py-2.5 pl-9 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.93 }}
          onClick={addNote}
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          <Plus size={16} />
          Catatan baru
        </motion.button>
      </div>

      {notes.length === 0 && (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white py-14 text-slate-400">
          <motion.div animate={{ y: [0, -6, 0] }} transition={{ repeat: Infinity, duration: 2 }}>
            <StickyNote size={40} />
          </motion.div>
          <p className="mt-3 text-sm">Belum ada catatan. Buat yang pertama!</p>
        </div>
      )}
      {notes.length > 0 && visible.length === 0 && (
        <p className="mt-6 text-center text-sm text-slate-400">Tidak ada catatan yang cocok.</p>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {visible.map((n) => (
            <motion.div
              key={n.id}
              layoutId={`note-${n.id}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -4 }}
              onClick={() => setOpenId(n.id)}
              className={`group relative cursor-pointer rounded-xl border p-4 transition-shadow hover:shadow-lg ${COLORS[n.color].card}`}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  updateNote(n.id, { pinned: !n.pinned }, false)
                }}
                aria-label="Sematkan"
                className={`absolute right-3 top-3 transition-opacity ${
                  n.pinned ? 'text-indigo-600' : 'text-slate-400 opacity-0 group-hover:opacity-100'
                }`}
              >
                <Pin size={15} className={n.pinned ? 'fill-current' : ''} />
              </button>
              <h3 className="line-clamp-1 pr-6 font-semibold">
                {n.title || <span className="font-normal text-slate-400">Tanpa judul</span>}
              </h3>
              <p className="mt-1 line-clamp-4 whitespace-pre-wrap text-sm text-slate-600">{n.body}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>
                  {new Date(n.updatedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    deleteNote(n.id)
                  }}
                  aria-label="Hapus catatan"
                  className="opacity-0 transition hover:text-red-500 group-hover:opacity-100"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {open && (
          <div key="modal" className="fixed inset-0 z-40 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeNote}
            />
            <motion.div
              layoutId={`note-${open.id}`}
              className={`relative z-10 flex w-full max-w-lg flex-col rounded-2xl border p-6 shadow-2xl ${COLORS[open.color].card}`}
            >
              <input
                autoFocus={!open.title}
                value={open.title}
                onChange={(e) => updateNote(open.id, { title: e.target.value })}
                placeholder="Judul"
                className="w-full bg-transparent text-xl font-semibold outline-none placeholder:text-slate-400"
              />
              <textarea
                value={open.body}
                onChange={(e) => updateNote(open.id, { body: e.target.value })}
                placeholder="Tulis catatanmu di sini..."
                className="mt-3 h-64 w-full resize-none bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-3">
                <div className="flex items-center gap-2">
                  {Object.entries(COLORS).map(([id, c]) => (
                    <motion.button
                      key={id}
                      whileHover={{ scale: 1.25 }}
                      whileTap={{ scale: 0.85 }}
                      onClick={() => updateNote(open.id, { color: id }, false)}
                      aria-label={`Warna ${id}`}
                      className={`h-5 w-5 rounded-full ${c.dot} ${
                        open.color === id ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-transparent' : ''
                      }`}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-xs text-slate-400">
                    {open.body.trim() ? open.body.trim().split(/\s+/).length : 0} kata · tersimpan
                  </span>
                  <button
                    onClick={() => updateNote(open.id, { pinned: !open.pinned }, false)}
                    aria-label="Sematkan"
                    className={open.pinned ? 'text-indigo-600' : 'text-slate-400 hover:text-slate-600'}
                  >
                    <Pin size={17} className={open.pinned ? 'fill-current' : ''} />
                  </button>
                  <button
                    onClick={() => deleteNote(open.id)}
                    aria-label="Hapus catatan"
                    className="text-slate-400 hover:text-red-500"
                  >
                    <Trash2 size={17} />
                  </button>
                  <motion.button
                    whileTap={{ scale: 0.93 }}
                    onClick={closeNote}
                    className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white"
                  >
                    Selesai
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}