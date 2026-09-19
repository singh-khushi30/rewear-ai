import type { Metadata } from "next";
import { NewItemFlow } from "@/components/wardrobe/new-item-flow";
import { requireUser } from "@/lib/auth/require-user";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Add a piece — REWEAR",
  description:
    "Upload a clear photo of something you already own. REWEAR will understand the piece before styling it.",
};

export default async function NewWardrobeItemPage() {
  await requireUser("/wardrobe/new");

  return (
    <main id="main">
      <NewItemFlow />
    </main>
  );
}
