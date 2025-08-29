import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, loadEnv } from "vite"
import { siteConfig } from "./src/config/site"

const siteConfigPlugin = () => {
  return {
    name: 'site-config',
    transformIndexHtml(html: string) {
      return html
        .replace(/\%VITE_SITE_TITLE\%/g, siteConfig.name)
        .replace(/\%VITE_SITE_DESCRIPTION\%/g, siteConfig.description)
        .replace(/\%VITE_SITE_OG_IMAGE\%/g, siteConfig.ogImage)
        .replace(/\%VITE_SITE_URL\%/g, siteConfig.url)
    }
  }
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd())

  return {
    base: env.VITE_BASE_URL ?? "/",
    plugins: [react(), tailwindcss(), siteConfigPlugin()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      port: 5333,
    },
    define: {
      __SITE_CONFIG__: JSON.stringify(siteConfig),
    },
  }
})
