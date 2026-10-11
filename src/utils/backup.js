const PREFIX = 'focusboard-'

const appKeys = () =>
  Object.keys(localStorage).filter((k) => k.startsWith(PREFIX))

// Unduh semua data aplikasi sebagai satu file JSON
export function exportData() {
  const data = {}
  appKeys().forEach((k) => {
    try {
      data[k] = JSON.parse(localStorage.getItem(k))
    } catch {
      /* lewati data yang rusak */
    }
  })
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `focusboard-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

// Pilih file JSON, lalu pulihkan datanya
export function importData() {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = 'application/json'
  input.onchange = async () => {
    const file = input.files?.[0]
    if (!file) return
    try {
      const data = JSON.parse(await file.text())
      const keys = Object.keys(data).filter((k) => k.startsWith(PREFIX))
      if (keys.length === 0) throw new Error('kosong')
      if (!confirm('Data saat ini akan diganti dengan isi file. Lanjutkan?')) return
      keys.forEach((k) => localStorage.setItem(k, JSON.stringify(data[k])))
      location.reload()
    } catch {
      alert('File tidak valid. Pilih file hasil ekspor FocusBoard.')
    }
  }
  input.click()
}

// Hapus semua data aplikasi
export function resetData() {
  if (!confirm('Semua tugas, catatan, dan statistik akan dihapus permanen. Lanjutkan?')) return
  appKeys().forEach((k) => localStorage.removeItem(k))
  sessionStorage.removeItem('focusboard-loaded')
  location.reload()
}