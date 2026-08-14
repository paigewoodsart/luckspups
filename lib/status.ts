// Raw values are exactly what the source system (Shelterluv/AnimalsFirst)
// sends, and stay untouched in the database -- these two maps control what
// the public site actually shows for each one.

const DISPLAY_LABELS: Record<string, string> = {
  "Transport Approved": "Transport Pending/Unavailable",
  "Status Pending": "Available",
  Available: "Up for Local Adoption",
};

export function statusLabel(animalStatus: string): string {
  return DISPLAY_LABELS[animalStatus] ?? animalStatus;
}

// Plain-language explanations for the status key/legend, keyed by raw
// status. Only statuses actually present in the data get shown, so this
// can safely cover more than the current dataset uses.
export const STATUS_EXPLANATIONS: Record<string, string> = {
  "Status Pending": "Ready for a transport partner to select now.",
  Available: "Up for adoption locally, not eligible for transport.",
  "Foster To Adopt": "In a foster home, on track to be adopted by that family.",
  "Socialization Hold": "Not yet ready for transport — still being evaluated or worked with.",
  "Transport Approved": "Not currently open for transport requests.",
};

// "Transport Approved" reads as ready-to-go, but operationally it means the
// opposite here -- not yet actually available. It's treated as inactive and
// pulled out of the normal browsing flow entirely (see UNAVAILABLE_STATUS
// below), not just recolored.
export const UNAVAILABLE_STATUS = "Transport Approved";

// Raw "Available" means up for adoption locally, not transport -- these stay
// visible/browsable in place, they just can't be picked for a transport list.
const LOCAL_ADOPTION_ONLY_STATUS = "Available";

export function canSelectForTransport(animalStatus: string): boolean {
  return animalStatus !== UNAVAILABLE_STATUS && animalStatus !== LOCAL_ADOPTION_ONLY_STATUS;
}

const POSITIVE = new Set(["Status Pending", "Available", "Foster To Adopt"]);

export function statusVariant(animalStatus: string): "available" | "pending" | "inactive" {
  if (animalStatus === UNAVAILABLE_STATUS) return "inactive";
  if (POSITIVE.has(animalStatus)) return "available";
  return "inactive";
}

export const statusBadgeClasses: Record<string, string> = {
  available: "bg-status-available",
  pending: "bg-status-pending",
  inactive: "bg-status-inactive",
};

// Sorts raw statuses by their display label, with whichever one displays as
// "Available" always pinned first.
export function sortStatusesByLabel(rawStatuses: string[]): string[] {
  return [...rawStatuses].sort((a, b) => {
    const labelA = statusLabel(a);
    const labelB = statusLabel(b);
    if (labelA === "Available") return -1;
    if (labelB === "Available") return 1;
    return labelA.localeCompare(labelB);
  });
}
