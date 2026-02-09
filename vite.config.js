import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), visualizer()],
  build: {
    // Code splitting optimization
    rollupOptions: {
      output: {
        manualChunks: {
          // Vendor chunk
          // Lưu ý: Đã gộp 'react-vendor' vào đây vì không thể chia 1 thư viện vào 2 chunk khác nhau
          'vendor': ['react', 'react-dom', 'react-router-dom'],

          // UI components
          'ui': [
            './src/components/ui/Button.jsx',
            './src/components/ui/Input.jsx',
            './src/components/ui/Modal.jsx',
            './src/components/ui/Card.jsx',
            './src/components/ui/Badge.jsx',
          ],

          // Pages
          'pages': [
            './src/pages/HomePage/HomePage.jsx',
            './src/pages/Login/Login.jsx',
            './src/pages/Learner/LearnerDashboard.jsx',
          ],

          // Services
          'services': [
            './src/services/authService.js',
            './src/services/courseService.js',
          ],
        },
      },
    },
    
    chunkSizeWarningLimit: 1000,
    // Optimize chunks
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
      },
    },
  },

  // Optimize dependencies
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
    ],
  },

  // Development server optimization
  server: {
    host: true,
    port: 3000,
    open: true,
  },

  // Performance optimization
  css: {
    devSourcemap: false,
    modules: {
      localsConvention: 'camelCase',
    },
  },
})