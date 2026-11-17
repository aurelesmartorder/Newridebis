import { defineConfig, loadEnv } from "vite";
const origin = "https://famous-starburst-2555e3.netlify.app";
const functions = new Set([
  "coach-chat",
  "realtime-token",
  "transcribe-audio",
  "analyze-video-session",
  "describe-photo",
  "text-to-speech",
  "send-report",
]);
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const config = {
    SUPABASE_URL: env.VITE_SUPABASE_URL || "",
    SUPABASE_ANON_KEY: env.VITE_SUPABASE_PUBLISHABLE_KEY || "",
    MAPBOX_TOKEN: "",
  };
  const source = "window.NEWRIDE_CONFIG = " + JSON.stringify(config) + ";\n";
  return {
    plugins: [
      {
        name: "newride-public-config",
        configureServer(server) {
          server.middlewares.use("/newridebis/config.js", (_req, res) => {
            res.setHeader(
              "Content-Type",
              "application/javascript; charset=utf-8",
            );
            res.end(source);
          });
        },
        generateBundle() {
          if (!config.SUPABASE_URL || !config.SUPABASE_ANON_KEY)
            this.error(
              "Configuration V2 manquante : VITE_SUPABASE_URL et VITE_SUPABASE_PUBLISHABLE_KEY sont nécessaires au build.",
            );
          this.emitFile({
            type: "asset",
            fileName: "newridebis/config.js",
            source,
          });
        },
      },
    ],
    server: {
      proxy: {
        "^/api/(coach-chat|realtime-token|transcribe-audio|analyze-video-session|describe-photo|text-to-speech|send-report)$":
          {
            target: origin,
            changeOrigin: true,
            rewrite: (path) => {
              const name = path.split("/").pop()!;
              return functions.has(name)
                ? "/.netlify/functions/" + name
                : "/not-found";
            },
          },
      },
    },
  };
});
