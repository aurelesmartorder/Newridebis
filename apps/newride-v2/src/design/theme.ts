export const theme = {
  colors: {
    canvas: "#F5F3EF",
    surface: "#FFFFFF",
    primary: "#182C35",
    ink: "#182C35",
    secondary: "#5F6C70",
    muted: "#687478",
    line: "#E3E6E2",
    accent: "#FF6746",
    accentSoft: "#FFF0E9",
    forest: "#365C47",
    forestSoft: "#EDF2E9",
    live: "#10232B",
    danger: "#B32F35",
    success: "#24613E",
  },
  radius: { card: 20, control: 12 },
  touch: 48,
  font: "'Inter', system-ui, -apple-system, sans-serif",
} as const;

export function applyTheme() {
  for (const [name, value] of Object.entries(theme.colors)) {
    document.documentElement.style.setProperty(`--${name}`, value);
  }
}
