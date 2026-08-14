import { notFound } from "next/navigation";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { ReviewClient } from "@/components/admin/ReviewClient";
import { createServerClient } from "@/lib/supabase-server";

export default async function ReviewPage({ params }: PageProps<"/admin/review/[uploadId]">) {
  const { uploadId } = await params;
  const supabase = createServerClient();

  const { data: upload } = await supabase
    .from("uploads")
    .select("*")
    .eq("id", uploadId)
    .single();

  if (!upload) notFound();

  const { data: stagedAnimals } = await supabase
    .from("staged_animals")
    .select(
      "id, name, species, breed, match_status, matched_animal_id, match_confidence, match_reasons"
    )
    .eq("upload_id", uploadId)
    .order("page_number");

  const matchedIds = [
    ...new Set((stagedAnimals ?? []).map((s) => s.matched_animal_id).filter(Boolean)),
  ] as string[];

  const existingNamesById: Record<string, string> = {};
  if (matchedIds.length > 0) {
    const { data: matchedAnimals } = await supabase
      .from("animals")
      .select("id, name")
      .in("id", matchedIds);
    for (const a of matchedAnimals ?? []) {
      existingNamesById[a.id] = a.name;
    }
  }

  return (
    <div className="flex flex-1 flex-col">
      <AdminHeader title={`Review: ${upload.filename}`} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-10 sm:px-10">
        <ReviewClient
          uploadId={uploadId}
          stagedAnimals={stagedAnimals ?? []}
          existingNamesById={existingNamesById}
        />
      </main>
    </div>
  );
}
