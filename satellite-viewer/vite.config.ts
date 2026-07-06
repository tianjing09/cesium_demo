import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// 注意：不要用 default import，而是用命名空间导入
import cesium from 'vite-plugin-cesium'

export default defineConfig({
  plugins: [
    vue(), 
    cesium.default() 
  ],
  resolve: {
    alias: {
      '@': '/src',
      'cesium': 'cesium/Build/Cesium/Cesium.js'
    }
  }
})

// import { defineConfig } from 'vite'
// import vue from '@vitejs/plugin-vue'

// export default defineConfig({
//   plugins: [vue()],
//   resolve: {
//     alias: {
//       '@': '/src',
//       'cesium': 'cesium/Build/Cesium/Cesium.js'
//     }
//   },
//   define: {
//     // Cesium 需要的全局变量
//     CESIUM_BASE_URL: JSON.stringify('/cesium')
//   },
//   // 优化预构建
//   optimizeDeps: {
//     include: ['cesium', 'sgp4']
//   }
// })