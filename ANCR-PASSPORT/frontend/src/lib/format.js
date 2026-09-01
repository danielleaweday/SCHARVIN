export const fmtDateRange = (start, end) => {
  const opts = { month: "short", day: "numeric" };
  const s = new Date(start + "T00:00:00");
  const e = new Date(end + "T00:00:00");
  const yr = e.getFullYear();
  return `${s.toLocaleDateString("en-US", opts)} – ${e.toLocaleDateString("en-US", opts)}, ${yr}`;
};

export const daysUntil = (dateStr) => {
  const target = new Date(dateStr + "T00:00:00");
  const diff = Math.ceil((target - new Date()) / (1000 * 60 * 60 * 24));
  return diff;
};
