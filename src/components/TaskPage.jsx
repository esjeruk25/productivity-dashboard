import { useState } from 'react'
import { Plus, Trash2, Check, ListChecks } from 'lucide-react'

export default function TaskPage({ tasks, setTasks }) {
const [text, setText] = useState('')
const [error, setError] = useState('')

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
      createdAt: new Date().toISOString(),
    }
    setTasks([newTask, ...tasks])
    setText('')
    setError('')
  }

  const toggleTask = (id) => {
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)))
  }

  const deleteTask = (id) => {
    setTasks(tasks.filter((t) => t.id !== id))
  }

  const total = tasks.length
  const remaining = tasks.filter((t) => !t.done).length
  const percent = total === 0 ? 0 : Math.round(((total - remaining) / total) * 100)

  return (
    <div className="mx-auto max-w-2xl">
      <h2 className="text-2xl font-semibold">Tugas</h2>
      <p className="mt-1 text-slate-500">Catat apa yang harus kamu selesaikan hari ini.</p>

      <form onSubmit={addTask} className="mt-6 flex gap-2">
        <input
          value={text}
          onChange={(e) => {
            setText(e.target.value)
            if (error) setError('')
          }}
          placeholder="Tulis tugas baru, lalu tekan Enter..."
          className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 active:scale-95"
        >
          <Plus size={16} />
          Tambah
        </button>
      </form>
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}

      <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="font-medium">
            {remaining} tugas tersisa
          </span>
          <span className="text-slate-500">{percent}% selesai</span>
        </div>
        <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-indigo-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-xl border border-dashed border-slate-300 bg-white py-12 text-slate-400">
          <ListChecks size={36} />
          <p className="mt-3 text-sm">Belum ada tugas. Tambahkan yang pertama!</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-2">
          {tasks.map((task) => (
            <li
              key={task.id}
              className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition hover:shadow-sm"
            >
              <button
                onClick={() => toggleTask(task.id)}
                aria-label="Tandai selesai"
                className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${
                  task.done
                    ? 'border-indigo-600 bg-indigo-600 text-white'
                    : 'border-slate-300 hover:border-indigo-400'
                }`}
              >
                {task.done && <Check size={12} strokeWidth={3} />}
              </button>
              <span
                className={`flex-1 text-sm transition ${
                  task.done ? 'text-slate-400 line-through' : 'text-slate-700'
                }`}
              >
                {task.text}
              </span>
              <button
                onClick={() => deleteTask(task.id)}
                aria-label="Hapus tugas"
                className="text-slate-300 transition hover:text-red-500"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}