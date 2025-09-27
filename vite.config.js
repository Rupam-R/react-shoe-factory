import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  // css: {
  //   preprocessorOptions: {
  //     scss: {
  //       additionalData: `
  //         @import "@/assets/scss/theme/variables";
  //         @import "@/assets/scss/theme/mixins";
  //         @import "@/assets/scss/theme/predefine";
  //         @import "@/assets/scss/theme/reset";
  //       `
  //     }
  //   }
  // },
  base: '/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  }
});