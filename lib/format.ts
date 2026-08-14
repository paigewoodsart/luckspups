export function formatDate(value: string | null): string | null {
  if (!value) return null;
  const d = new Date(`${value}T00:00:00`);
  return isNaN(d.getTime())
    ? value
    : d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
}
