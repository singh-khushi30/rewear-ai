import type { Metadata } from "next";
import { NewItemFlow } from "@/components/wardrobe/new-item-flow";

export const metadata: Metadata = {
  title: "Add a piece — REWEAR",
  description:
    "Upload a clear photo of something you already own. REWEAR will understand the piece before styling it.",
};

export default function NewWardrobeItemPage() {
  return (
    <main id="main">
      <NewItemFlow />
    </main>
  );
}
