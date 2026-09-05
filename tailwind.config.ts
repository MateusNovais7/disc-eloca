import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        eloca: {
          navy: "#131220",      // fundo escuro / headers - identidade Eloca
          navyLight: "#1D1B30",
          green: "#07C97F",     // verde-esmeralda de marca (CTA primário)
          greenDark: "#059A61",
          ink: "#1A1A2E",
          muted: "#6B7280",
          bg: "#F7F8FA",         // fundo claro para leitura do teste
          border: "#E5E7EB",
        },
        disc: {
          d: "#E4572E", // Dominância - vermelho (harmonizado)
          i: "#F2B705", // Influência - amarelo
          s: "#07C97F", // Estabilidade - verde (alinhado à marca Eloca)
          c: "#2E6BE4", // Conformidade - azul
        },
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
