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
});
