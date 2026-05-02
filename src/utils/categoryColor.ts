const COLORS = [
  { bg: "#eff6ff", text: "#1a6fd4", border: "#bfdbfe", bar: "#1a6fd4" },
  { bg: "#f5f3ff", text: "#7c3aed", border: "#ddd6fe", bar: "#7c3aed" },
  { bg: "#f0fdfa", text: "#0d9488", border: "#99f6e4", bar: "#0d9488" },
  { bg: "#fff7ed", text: "#ea580c", border: "#fed7aa", bar: "#ea580c" },
  { bg: "#fdf2f8", text: "#c026d3", border: "#f5d0fe", bar: "#c026d3" },
  { bg: "#f0fdf4", text: "#16a34a", border: "#bbf7d0", bar: "#16a34a" },
  { bg: "#fefce8", text: "#ca8a04", border: "#fde68a", bar: "#ca8a04" },
  { bg: "#fff1f2", text: "#e11d48", border: "#fecdd3", bar: "#e11d48" },
];

export function getCategoryColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return COLORS[Math.abs(hash) % COLORS.length];
}
