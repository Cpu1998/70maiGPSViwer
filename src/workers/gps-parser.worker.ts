import { parseRaw, detectTrips, filterOutliers } from '../utils/parser'
import type { ParseProgress } from '../types'

const ctx = self as unknown as Worker

function postProgress(phase: ParseProgress['phase'], progress: number, processed: number, msg: string) {
  ctx.postMessage({ type: 'progress', data: { phase, progress, recordsProcessed: processed, message: msg } } as const)
}

ctx.onmessage = (e: MessageEvent) => {
  const { text, fileName, fileSize, gapSeconds } = e.data

  try {
    postProgress('reading', 10, 0, '正在读取文件...')

    postProgress('parsing', 30, 0, '正在解析 GPS 数据...')
    const { data, skipped, segments } = parseRaw(text)
    postProgress('parsing', 60, data.count, `已解析 ${data.count.toLocaleString()} 条记录`)

    const filtered = filterOutliers(data)
    if (filtered.count < data.count) {
      postProgress('parsing', 65, filtered.count, `已过滤 ${data.count - filtered.count} 个异常点`)
    }

    postProgress('detecting-trips', 75, filtered.count, '正在识别旅程...')
    const summaries = detectTrips(filtered, gapSeconds)
    postProgress('detecting-trips', 90, data.count, `已识别 ${summaries.length} 个旅程`)

    const transferables = [
      filtered.timestamps.buffer,
      filtered.lats.buffer,
      filtered.lons.buffer,
      filtered.speeds.buffer,
      filtered.rawSpeeds.buffer,
      filtered.accels.buffer,
      filtered.signals.buffer,
      filtered.sats.buffer,
      data.lats.buffer,
      data.lons.buffer,
      data.speeds.buffer,
      data.rawSpeeds.buffer,
      data.accels.buffer,
      data.signals.buffer,
      data.sats.buffer,
    ] as ArrayBuffer[]

    postProgress('done', 100, data.count, '解析完成')

    ctx.postMessage(
      {
        type: 'result',
        data: {
          summaries,
          columnar: filtered,
          stats: {
            totalRecords: filtered.count,
            skippedRecords: skipped,
            segmentCount: segments,
            fileSize,
            fileName,
          },
        },
      },
      transferables,
    )
  } catch (err) {
    ctx.postMessage({ type: 'error', data: { message: String(err) } })
  }
}
