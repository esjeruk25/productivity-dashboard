import { useState } from 'react'
import { LayoutDashboard, CheckSquare, Timer, StickyNote } from 'lucide-react'
import TaskPage from './components/TaskPage'

const menus = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tugas', icon: CheckSquare },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'notes', label: 'Catatan', icon: StickyNote },
]

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [tasks, setTasks] = useState([])
  const current = menus.find((m) => m.id === active)

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      <aside className="w-56 shrink-0 border-r border-slate-200 bg-white p-4">
        <h1 className="mb-6 text-lg font-bold text-indigo-600">FocusBoard</h1>
        <nav className="space-y-1">
          {menus.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active === id
                  ? 'bg-indigo-50 text-indigo-600'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Icon size={18} />
              {label}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 p-8">
        {active === 'tasks' ? (
          <TaskPage tasks={tasks} setTasks={setTasks} />
        ) : (
          <>
            <h2 className="text-2xl font-semibold">{current.label}</h2>
            <p className="mt-2 text-slate-500">
              Halaman {current.label} akan dibangun di hari berikutnya.
            </p>
          </>
        )}
      </main>
    </div>
  )
}