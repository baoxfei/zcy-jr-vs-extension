import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import { AntDesignXVueResolver } from 'ant-design-x-vue/resolver'
import { URL, fileURLToPath } from 'node:url'

const isDev = process.env.NODE_ENV === 'development';
const INVALID_CHAR_REGEX = /[\u0000-\u001F"#$&*+,:;<=>?[\]^`{|}\u007F]/g;
const DRIVE_LETTER_REGEX = /^[a-z]:/i;

// https://vite.dev/config/
export default defineConfig({
  base: isDev ?  "./" : '/zcy-jr-vs-extension',
  plugins: [
    vue(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver(), AntDesignXVueResolver()],
    }),
  ],
  
  build: {
    outDir: "../../dist/webview-vue",
    emptyOutDir: true,
    modulePreload: {
      polyfill: false,
    },
    polyfillModulePreload: false,
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
        }
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
