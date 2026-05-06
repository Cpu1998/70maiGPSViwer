# 70maiGPSViewer

70迈 行车记录仪 GPSData 文件的可视化工具，支持轨迹回放、速度分析和行程管理。

**GitHub：** https://github.com/Cpu1998/70maiGPSViwer | **在线体验：** https://seven.realtool.workers.dev/

## 功能

- **文件解析** — 拖拽加70迈 GPSData 文件，Web Worker 后台解析不卡界面
- **轨迹可视化** — 地图上显示所有行程轨迹，按速度着色（绿→黄→橙→红→紫）
- **行程管理** — 自动识别行程（按时间间隔分段），按日期分组展示
- **过滤筛选** — 按日期、距离、时长、最高速度等多条件组合过滤
- **排序** — 支持按时间、距离、速度、时长排序，升序/降序切换
- **异常点过滤** — 自动剔除 GPS 漂移产生的异常坐标点
- **多种底图** — 暗色、亮色、彩色、矢量、地形、卫星（带标注）6 种底图切换，全部免费无需 token
- **行程统计** — 距离、时长、平均速度、最高速度

## 技术栈

- Vue 3 + TypeScript + Vite
- Mapbox GL JS（地图渲染）
- Pinia（状态管理）
- Web Worker（文件解析）

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

无需配置任何 API Key，地图底图使用免费的 CARTO / OSM / Esri 瓦片服务。

## 版本历史

见 [CHANGELOG.md](./CHANGELOG.md)
