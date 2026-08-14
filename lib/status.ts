const POSITIVE = new Set(["Available", "Transport Approved", "Foster To Adopt"]);
const PENDING = new Set(["Status Pending"]);

export function statusVariant(animalStatus: string): "available" | "pending" | "inactive" {
  if (POSITIVE.has(animalStatus)) return "available";
  if (PENDING.has(animalStatus)) return "pending";
  return "inactive";
}

export const statusBadgeClasses: Record<string, string> = {
  available: "bg-status-available",
  pending: "bg-status-pending",
  inactive: "bg-status-inactive",
};
