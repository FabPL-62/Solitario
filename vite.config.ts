import { defineConfig } from 'vite'

export default defineConfig({
  // Configuración del servidor de desarrollo
  server: {
    port: 3000,
    open: true, // Abre el navegador automáticamente
    host: true, // Permite acceso desde otros dispositivos en la red
  },
  
  // Configuración de build
  build: {
    outDir: 'dist',
    sourcemap: true,
    minify: 'terser',
  },
  
  // Configuración de TypeScript
  esbuild: {
    target: 'es2020',
  },
  
  // Optimizaciones
  optimizeDeps: {
    include: ['typescript'],
  },
  
  // Configuración de alias (opcional)
  resolve: {
    alias: {
      '@': '/src',
    },
  },
})
