const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

// deadline berformat 'YYYY-MM-DD' (hasil input type="date")
export function deadlineInfo(deadline, done = false) {
  const [y, m, d] = deadline.split('-').map(Number)
  const due = new Date(y, m - 1, d)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((due - today) / 86400000)
  const dateLabel = `${d} ${MONTHS[m - 1]}`

  if (done) return { label: dateLabel, style: 'bg-slate-100 text-slate-500', overdue: false, diff }
  if (diff < 0)
    return { label: `Terlambat ${-diff} hari`, style: 'bg-red-50 text-red-600', overdue: true, diff }
  if (diff === 0) return { label: 'Hari ini', style: 'bg-amber-50 text-amber-600', overdue: false, diff }
  if (diff === 1) return { label: 'Besok', style: 'bg-sky-50 text-sky-600', overdue: false, diff }
  return { label: dateLabel, style: 'bg-slate-100 text-slate-600', overdue: false, diff }
}