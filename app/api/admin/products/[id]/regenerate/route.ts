import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { generateOneProduct, type Product } from "@/lib/perplexity";
import { isAdmin } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  ctx: RouteContext<"/api/admin/products/[id]/regenerate">
) {
  const { id } = await ctx.params;

  // Verify admin via Supabase JWT
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { data: { user } } = await supabase.auth.getUser(token);
  if (!user || !isAdmin(user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { index } = await request.json() as { index: number };

  // Fetch the existing drop
  const { data: drop, error: fetchErr } = await supabase
    .from("product_drops")
    .select("products")
    .eq("id", id)
    .single();

  if (fetchErr || !drop) {
    return NextResponse.json({ error: "Drop not found" }, { status: 404 });
  }

  const existingProducts: Product[] = drop.products;
  const existingNames = existingProducts.map((p: Product) => p.name);

  // Generate one new product, excluding all existing names
  const newProduct = await generateOneProduct(existingNames);

  // Replace the product at the given index
  const updatedProducts = [...existingProducts];
  updatedProducts[index] = newProduct;

  const { error: updateErr } = await supabase
    .from("product_drops")
    .update({ products: updatedProducts })
    .eq("id", id);

  if (updateErr) {
    return NextResponse.json({ error: updateErr.message }, { status: 500 });
  }

  return NextResponse.json({ product: newProduct });
}
