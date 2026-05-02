const dtf = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit',
  timeZone: 'Asia/Shanghai',
})

const tf = new Intl.DateTimeFormat('zh-CN', {
  hour: '2-digit', minute: '2-digit',
  timeZone: 'Asia/Shanghai',
})

const df = new Intl.DateTimeFormat('zh-CN', {
  year: 'numeric', month: 'long', day: 'numeric',
  weekday: 'long',
})

export function formatDateTime(ts: number): string {
  return dtf.format(new Date(ts * 1000))
}

export function formatTime(ts: number): string {
  return tf.format(new Date(ts * 1000))
}

export function formatDate(ts: number): string {
  return df.format(new Date(ts * 1000))
}

export function formatDateKey(ts: number): string {
  const d = new Date(ts * 1000)
  const yyyy = d.getFullYear()
  // Use UTC+8
  const utc8 = new Date(d.getTime() + 8 * 3600 * 1000)
  const mm = String(utc8.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(utc8.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds}秒`
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}小时${m > 0 ? m + '分' : ''}`
  return `${m}分钟`
}

export function formatDistance(meters: number): string {
  if (meters < 1000) return `${Math.round(meters)}m`
  return `${(meters / 1000).toFixed(1)}km`
}

export function formatSpeed(kmh: number): string {
  return `${Math.round(kmh)} km/h`
}
