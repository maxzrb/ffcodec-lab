// 兼容 Cloudflare Pages 仍以仓库根目录作为项目根的部署配置。
// 业务实现保留在 Web 宿主中，避免两份访问统计逻辑发生漂移。
export { onRequestGet } from '../../apps/web/functions/api/visits'
