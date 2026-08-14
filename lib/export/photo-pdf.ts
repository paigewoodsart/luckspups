import { jsPDF } from "jspdf";
import type { Animal } from "@/types/animal";

const BROWN: [number, number, number] = [59, 42, 30]; // --color-brown
const BROWN_SOFT: [number, number, number] = [107, 88, 71]; // --color-brown-soft
const SKY_DEEP: [number, number, number] = [61, 124, 144]; // --color-sky-deep
const SKY_SOFT: [number, number, number] = [228, 244, 248]; // --color-sky-soft

async function loadImageDataUrl(url: string): Promise<string | null> {
  try {
    const res = await fetch(url);
    const blob = await res.blob();
    const bitmap = await createImageBitmap(blob);
    const canvas = document.createElement("canvas");
    canvas.width = bitmap.width;
    canvas.height = bitmap.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.drawImage(bitmap, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.85);
  } catch {
    return null;
  }
}

export async function buildRecordsPdf(animals: Animal[]): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  const marginLeft = 15;
  const marginRight = 15;
  const maxWidth = pageWidth - marginLeft - marginRight;
  const photoSize = 32;

  let y = 18;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(...SKY_DEEP);
  doc.text("LUCK'S PUPS - TRANSPORT LIST", marginLeft, y);
  y += 6;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BROWN_SOFT);
  const today = new Date().toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "America/New_York",
  });
  doc.text(
    `${animals.length} animal${animals.length === 1 ? "" : "s"} selected · Generated ${today}`,
    marginLeft,
    y
  );
  y += 8;

  doc.setDrawColor(...SKY_SOFT);
  doc.line(marginLeft, y, pageWidth - marginRight, y);
  y += 8;

  const ensureSpace = (needed: number) => {
    if (y + needed > pageHeight - 15) {
      doc.addPage();
      y = 20;
    }
  };

  for (const animal of animals) {
    const photo = animal.photoUrl ? await loadImageDataUrl(animal.photoUrl) : null;
    ensureSpace((photo ? photoSize : 24) + 6);

    const textLeft = marginLeft + (photo ? photoSize + 6 : 0);
    const textMaxWidth = maxWidth - (photo ? photoSize + 6 : 0);
    const blockTop = y;

    if (photo) {
      doc.addImage(photo, "JPEG", marginLeft, y, photoSize, photoSize);
    }

    let ty = y + 5;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.setTextColor(...BROWN);
    doc.text(animal.name.toUpperCase(), textLeft, ty);
    ty += 6;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...BROWN_SOFT);

    const breedLine = [animal.breed, animal.secondaryBreed].filter(Boolean).join(" / ");
    const line1 = [animal.species, breedLine].filter(Boolean).join(" · ");
    if (line1) {
      doc.text(line1, textLeft, ty);
      ty += 5;
    }

    const line2 = [animal.gender, animal.estimatedAge, animal.sizeGroup]
      .filter(Boolean)
      .join(" · ");
    if (line2) {
      doc.text(line2, textLeft, ty);
      ty += 5;
    }

    doc.text(`Status: ${animal.animalStatus}`, textLeft, ty);
    ty += 5;

    if (animal.intakeNote) {
      const wrapped = doc.splitTextToSize(`Note: ${animal.intakeNote}`, textMaxWidth);
      doc.text(wrapped, textLeft, ty);
      ty += wrapped.length * 5;
    }

    y = Math.max(blockTop + photoSize, ty) + 6;
    doc.setDrawColor(...SKY_SOFT);
    doc.line(marginLeft, y - 3, pageWidth - marginRight, y - 3);
  }

  return doc;
}
