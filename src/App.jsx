import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { LayoutDashboard, CheckSquare, Timer, StickyNote, Sun, Moon } from 'lucide-react'
import TaskPage from './components/TaskPage'
import Dashboard from './components/Dashboard'
import PomodoroPage from './components/PomodoroPage'
import NotesPage from './components/NotesPage'
import LoadingScreen from './components/LoadingScreen'
import ThemeToggle from './components/ThemeToggle'
import useLocalStorage from './hooks/useLocalStorage'
import usePomodoro, { formatTime } from './hooks/usePomodoro'

const menus = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'tasks', label: 'Tugas', icon: CheckSquare },
  { id: 'pomodoro', label: 'Pomodoro', icon: Timer },
  { id: 'notes', label: 'Catatan', icon: StickyNote },
]

export default function App() {
  const [active, setActive] = useState('dashboard')
  const [tasks, setTasks] = useLocalStorage('focusboard-tasks', [])
  const [notes, setNotes] = useLocalStorage('focusboard-notes', [])
  const pomo = usePomodoro(tasks)
  const [loading, setLoading] = useState(() => {
    try {
      return sessionStorage.getItem('focusboard-loaded') !== '1'
    } catch {
      return true
    }
  })
  const [theme, setTheme] = useLocalStorage(
    'focusboard-theme',
    window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
  )

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => {
    const root = document.documentElement
    root.classList.add('theme-switching')
    setTheme(theme === 'dark' ? 'light' : 'dark')
    setTimeout(() => root.classList.remove('theme-switching'), 350)
  }

  const finishLoading = () => {
    try {
      sessionStorage.setItem('focusboard-loaded', '1')
    } catch {
      /* abaikan */
    }
    setLoading(false)
  }

  return (
    <>
      <AnimatePresence>
        {loading && <LoadingScreen key="loader" onFinish={finishLoading} />}
      </AnimatePresence>

      <div className="flex min-h-screen flex-col bg-slate-50 text-slate-800 md:flex-row">
        {/* Sidebar (layar lebar) */}
        <aside className="hidden w-56 shrink-0 flex-col border-r border-slate-200 bg-white p-4 md:flex">
          <h1 className="mb-6 text-lg font-bold text-indigo-600">FocusBoard</h1>
          <nav className="space-y-1">
            {menus.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActive(id)}
                className={`relative flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active === id ? 'text-indigo-600' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {active === id && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-lg bg-indigo-50"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                <Icon size={18} className="relative" />
                <span className="relative">{label}</span>
                {id === 'pomodoro' && pomo.running && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="relative ml-auto flex items-center gap-1.5 text-xs tabular-nums"
                  >
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                    {formatTime(pomo.secondsLeft)}
                  </motion.span>
                )}
              </button>
            ))}
          </nav>
          <ThemeToggle theme={theme} onToggle={toggleTheme} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          {/* Header (HP) */}
          <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
            <h1 className="text-lg font-bold text-indigo-600">FocusBoard</h1>
            <div className="flex items-center gap-3">
              {pomo.running && (
                <span className="flex items-center gap-1.5 text-xs font-medium tabular-nums text-slate-600">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {formatTime(pomo.secondsLeft)}
                </span>
              )}
              <motion.button
                whileTap={{ scale: 0.85, rotate: 20 }}
                onClick={toggleTheme}
                aria-label="Ganti tema"
                className="rounded-lg p-2 text-slate-600 transition-colors hover:bg-slate-100"
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </motion.button>
            </div>
          </header>

          <main className="flex-1 p-4 pb-24 md:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={active}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {active === 'dashboard' && (
                  <Dashboard
                    tasks={tasks}
                    setTasks={setTasks}
                    goTo={setActive}
                    sessionsToday={pomo.todaySessions.length}
                    notesCount={notes.length}
                  />
                )}
                {active === 'tasks' && <TaskPage tasks={tasks} setTasks={setTasks} />}
                {active === 'pomodoro' && <PomodoroPage pomo={pomo} tasks={tasks} />}
                {active === 'notes' && <NotesPage notes={notes} setNotes={setNotes} />}
              </motion.div>
            </AnimatePresence>
          </main>
        </div>

        {/* Navigasi bawah (HP) */}
        <nav
          className="fixed inset-x-0 bottom-0 z-30 flex border-t border-slate-200 bg-white md:hidden"
          style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
          {menus.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActive(id)}
              className={`relative flex flex-1 flex-col items-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                active === id ? 'text-indigo-600' : 'text-slate-500'
              }`}
            >
              {active === id && (
                <motion.span
                  layoutId="nav-top"
                  className="absolute inset-x-5 top-0 h-0.5 rounded-full bg-indigo-600"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">
                <Icon size={20} />
                {id === 'pomodoro' && pomo.running && (
                  <span className="absolute -right-1 -top-1 h-2 w-2 animate-pulse rounded-full bg-emerald-500" />
                )}
              </span>
              {label}
            </button>
          ))}
        </nav>
      </div>
    </>
  )
}