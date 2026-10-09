import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { Flame, Lock, Sigma, TrendingUp, Medal } from 'lucide-react'
import Chips from './Chips'
import AnimatedNumber from './AnimatedNumber'
import { lastDays, dayKey } from '../utils/stats'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const WEEKDAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab']
const metricOptions = [
  { value: 'focus', label: 'Sesi fokus' },
  { value: 'minutes', label: 'Menit fokus' },
  { value: 'done', label: 'Tugas selesai' },
]
const rangeOptions = [
  { value: '7', label: '7 hari' },
  { value: '30', label: '30 hari' },
]
const UNITS = { focus: 'sesi', minutes: 'menit', done: 'tugas' }
const HEAT = ['bg-slate-100', 'bg-indigo-200', 'bg-indigo-400', 'bg-indigo-600']

export default function StatsPage({ ctx, achievements }) {
  const [metric, setMetric] = useState('focus')
  const [range, setRange] = useState('7')
  const [hover, setHover] = useState(null)

  const n = Number(range)
  const days = lastDays(n)
  const source = ctx.counts[metric]
  const values = days.map((d) => source[d.key] || 0)
  const maxVal = Math.max(...values)
  const niceMax = maxVal <= 4 ? 4 : Math.ceil(maxVal / 4) * 4
  const total = values.reduce((a, b) => a + b, 0)
  const avg = total / n
  const bestIdx = values.indexOf(maxVal)
  const todayKey = dayKey(new Date())

  // Heatmap 12 minggu, baris = hari (Senin di atas)
  const heatDays = lastDays(84)
  const offset = (heatDays[0].date.getDay() + 6) % 7
  const cells = [...Array(offset).fill(null), ...heatDays]
  const level = (k) => {
    const c = (ctx.counts.focus[k] || 0) + (ctx.counts.done[k] || 0)
    return c === 0 ? 0 : c === 1 ? 1 : c <= 3 ? 2 : 3
  }

  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const card = 'rounded-xl border border-slate-200 bg-white p-4'

  const summary = [
    { label: `Total ${UNITS[metric]}`, icon: Sigma, content: <AnimatedNumber value={total} /> },
    { label: 'Rata-rata per hari', icon: TrendingUp, content: avg.toFixed(1) },
    {
      label: 'Hari terbaik',
      icon: Medal,
      content: maxVal > 0 ? `${days[bestIdx].date.getDate()} ${MONTHS[days[bestIdx].date.getMonth()]}` : '-',
    },
    { label: 'Hari beruntun', icon: Flame, content: <AnimatedNumber value={ctx.streak} /> },
  ]

  return (
    <div className="mx-auto max-w-4xl">
      <h2 className="text-2xl font-semibold">Statistik</h2>
      <p className="mt-1 text-slate-500">Lihat perkembangan fokus dan produktivitasmu.</p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <Chips
          options={metricOptions}
          value={metric}
          onChange={(v) => {
            setMetric(v)
            setHover(null)
          }}
          group="stats-metric"
        />
        <Chips
          options={rangeOptions}
          value={range}
          onChange={(v) => {
            setRange(v)
            setHover(null)
          }}
          group="stats-range"
        />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
        {summary.map(({ label, icon: Icon, content }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.06 }}
            whileHover={{ y: -3 }}
            className={card}
          >
            <Icon size={18} className={label === 'Hari beruntun' ? 'text-amber-500' : 'text-indigo-600'} />
            <p className="mt-2 text-2xl font-bold tabular-nums">{content}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </motion.div>
        ))}
      </div>

      <div className={`${card} mt-4`}>
        <h3 className="font-semibold">
          {metricOptions.find((m) => m.value === metric).label} · {n} hari terakhir
        </h3>
        <div className="relative mt-6 h-52 pl-8">
          {[0, 0.5, 1].map((f) => (
            <div
              key={f}
              className="absolute left-8 right-0 border-t border-dashed border-slate-200"
              style={{ bottom: `${f * 100}%` }}
            >
              <span className="absolute -left-8 -top-2 w-6 text-right text-[10px] text-slate-400">
                {Math.round(niceMax * f)}
              </span>
            </div>
          ))}
          <div key={`${metric}-${range}`} className="absolute inset-0 left-8 flex items-end gap-0.5 sm:gap-1">
            {days.map((d, i) => {
              const pct = (values[i] / niceMax) * 100
              const isToday = d.key === todayKey
              return (
                <div
                  key={d.key}
                  className="relative flex h-full flex-1 cursor-pointer flex-col justify-end"
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                  onClick={() => setHover(hover === i ? null : i)}
                >
                  <AnimatePresence>
                    {hover === i && (
                      <motion.div
                        initial={{ opacity: 0, y: 6, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 6 }}
                        className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#0f172a] px-2 py-1 text-xs text-white shadow-lg"
                        style={{ bottom: `calc(${pct}% + 8px)` }}
                      >
                        {d.date.getDate()} {MONTHS[d.date.getMonth()]} · {values[i]} {UNITS[metric]}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: values[i] === 0 ? 3 : `${pct}%` }}
                    transition={{ duration: 0.6, delay: i * (n === 7 ? 0.05 : 0.015), ease: 'easeOut' }}
                    className={`w-full rounded-t-md transition-colors ${
                      values[i] === 0
                        ? 'bg-slate-200'
                        : hover === i
                          ? 'bg-indigo-600'
                          : isToday
                            ? 'bg-indigo-500'
                            : 'bg-indigo-300'
                    }`}
                  />
                </div>
              )
            })}
          </div>
        </div>
        <div className="mt-2 flex gap-0.5 pl-8 sm:gap-1">
          {days.map((d, i) => (
            <span key={d.key} className="flex-1 text-center text-[10px] text-slate-400">
              {n === 7 ? WEEKDAYS[d.date.getDay()] : i % 5 === 0 || i === n - 1 ? d.date.getDate() : ''}
            </span>
          ))}
        </div>
      </div>

      <div className={`${card} mt-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Aktivitas 12 minggu</h3>
          <div className="flex items-center gap-1 text-[10px] text-slate-400">
            Sedikit
            {HEAT.map((c) => (
              <span key={c} className={`h-3 w-3 rounded-sm ${c}`} />
            ))}
            Banyak
          </div>
        </div>
        <div className="mt-3 grid auto-cols-fr grid-flow-col grid-rows-7 gap-1">
          {cells.map((c, i) =>
            c === null ? (
              <span key={`blank-${i}`} />
            ) : (
              <motion.div
                key={c.key}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.004 }}
                whileHover={{ scale: 1.5 }}
                title={`${c.date.getDate()} ${MONTHS[c.date.getMonth()]}: ${
                  (ctx.counts.focus[c.key] || 0) + (ctx.counts.done[c.key] || 0)
                } aktivitas`}
                className={`aspect-square rounded-sm ${HEAT[level(c.key)]}`}
              />
            ),
          )}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <h3 className="text-lg font-semibold">Pencapaian</h3>
        <span className="text-sm text-slate-500">
          {unlockedCount}/{achievements.length} terbuka
        </span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {achievements.map((a, i) => {
          const Icon = a.icon
          return (
            <motion.div
              key={a.id}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -3 }}
              className={`rounded-xl border p-4 ${
                a.unlocked ? 'border-amber-200 bg-amber-50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={a.unlocked ? { rotate: [0, -12, 12, 0], scale: [1, 1.15, 1] } : {}}
                  transition={{ delay: 0.5 + i * 0.05, duration: 0.5 }}
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                    a.unlocked ? 'bg-amber-400 text-[#0f172a]' : 'bg-slate-100 text-slate-400'
                  }`}
                >
                  {a.unlocked ? <Icon size={20} /> : <Lock size={17} />}
                </motion.div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold">{a.title}</p>
                  <p className="text-xs text-slate-500">{a.desc}</p>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(a.current / a.target) * 100}%` }}
                    transition={{ duration: 0.8, delay: 0.2 + i * 0.05 }}
                    className={`h-full rounded-full ${a.unlocked ? 'bg-amber-400' : 'bg-indigo-400'}`}
                  />
                </div>
                <span className="text-xs tabular-nums text-slate-400">
                  {a.current}/{a.target}
                </span>
              </div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}