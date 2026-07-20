import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { execSync } from 'child_process';

try {
  console.log('--- RUNNING SUPABASE MIGRATION AUTOMATICALLY ---');
  execSync('npx supabase migration up', { stdio: 'inherit' });
  console.log('--- MIGRATION COMPLETE ---');
} catch (e) {
  console.error('Migration failed:', e);
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('scheduler')) {
              return 'vendor-react';
            }
            if (id.includes('@supabase')) {
              return 'vendor-supabase';
            }
            return 'vendor-libs';
          }
        },
      },
    },
  },
});
