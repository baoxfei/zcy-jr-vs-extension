import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
// import { AntDesignXVueResolver } from 'ant-design-x-vue/resolver'
import { URL, fileURLToPath } from 'node:url'
// import { visualizer } from 'rollup-plugin-visualizer'
// import importToCDN from 'vite-plugin-cdn-import'


const isDev = process.env.NODE_ENV === 'development';
const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g;
const DRIVE_LETTER_REGEX = /^[a-z]:/i;

export default defineConfig({
  base: isDev ?  "./" : '/', // / 打包到 dist/webview-vue下面 /zcy-jr-vs-extension 打包到github pages下
  // base: isDev ?  "./" : 'https://baoxfei.github.io/zcy-jr-vs-extension',
  plugins: [
    vue(),
    // importToCDN({
    //   modules: [
    //     { name: 'vue', var: 'Vue', path: 'https://unpkg.com/vue@3.5.13/dist/vue.global.prod.js' },
    //   ],
    // }),
    // viteExternalsPlugin({ vue: 'Vue' }),
    AutoImport({
      dts: './auto-imports.d.ts',
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      dts: './components.d.ts',
      resolvers: [ElementPlusResolver({  importStyle: 'css' })],
    }),

    // mode === 'analyze' &&
    //   visualizer({
    //     open: true,
    //     gzipSize: true,
    //     brotliSize: true,
    //     filename: 'stats.html'
    //   }),
  ],
  
  build: {
    outDir: "../extension/dist/webview-vue",
    emptyOutDir: true,
    modulePreload: false,
    rollupOptions: {
      output: {
        sanitizeFileName(name) {
          const match = DRIVE_LETTER_REGEX.exec(name);
          const driveLetter = match ? match[0] : "";
          // A `:` is only allowed as part of a windows drive letter (ex: C:\foo)
          // Otherwise, avoid them because they can refer to NTFS alternate data streams.
          return (
            driveLetter +
            name.slice(driveLetter.length).replace(INVALID_CHAR_REGEX, "")
          );
        },
      }
    }
  },
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
    extensions: [".js", '.ts', ".vue"]
  },
  server: {
    headers: {
      "access-control-allow-origin": "*"
    },
    historyApiFallback: true,
    proxy: {
      '/compatible-mode': {
        target: 'https://dashscope.aliyuncs.com',
        changeOrigin: true,
      }
    },
  }
})
