import type { Metadata } from "next";
import { MyWardrobe } from "@/components/wardrobe/my-wardrobe";
import { requireUser } from "@/lib/auth/require-user";
import {
  listWardrobeItemsWithClient,
  WardrobeError,
  type WardrobeItem,
} from "@/lib/wardrobe/list-garments";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "My Wardrobe — REWEAR",
  description: "The pieces REWEAR can plan with.",
};

export default async function WardrobePage() {
  const { supabase } = await requireUser("/wardrobe");

  let items: WardrobeItem[] | null = null;
  let initialError: string | null = null;

  try {
    items = await listWardrobeItemsWithClient(supabase);
  } catch (caught) {
    initialError =
      caught instanceof WardrobeError
        ? caught.message
        : "We couldn’t load your wardrobe. Try again shortly.";
  }

  return (
    <main id="main">
      <MyWardrobe initialItems={items} initialError={initialError} />
    </main>
  );
}
