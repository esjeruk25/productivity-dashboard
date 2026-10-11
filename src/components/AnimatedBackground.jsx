import { useEffect, useRef } from 'react'

// Latar belakang animasi. Semua gerakan memakai CSS transform (ringan),
// dan lampu sorot mengikuti kursor tanpa me-render ulang React.
export default function AnimatedBackground({ variant }) {
  const ref = useRef(null)

  useEffect(() => {
    if (variant === 'off') return
    const el = ref.current
    let raf = 0
    const onMove = (e) => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        el.style.setProperty('--mx', `${e.clientX}px`)
        el.style.setProperty('--my', `${e.clientY}px`)
      })
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [variant])

  return (
    <div ref={ref} aria-hidden className="bg-scene pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-slate-50">
      {variant === 'aurora' && (
        <>
          <div className="blob blob-a" />
          <div className="blob blob-b" />
          <div className="blob blob-c" />
        </>
      )}
      {variant === 'grid' && (
        <>
          <div className="grid-wrap">
            <div className="grid-lines" />
          </div>
          <div className="blob blob-a" />
        </>
      )}
      {variant !== 'off' && <div className="spotlight" />}
    </div>
  )
}