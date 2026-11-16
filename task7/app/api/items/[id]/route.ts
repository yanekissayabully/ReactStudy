import { seedItems } from "@/lib/api/seed";

export function generateStaticParams() {
  return seedItems.map((item) => ({ id: String(item.id) }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const item = seedItems.find((candidate) => candidate.id === Number(id));
  if (!item) return Response.json({ error: "Not found" }, { status: 404 });
  return Response.json(item);
}
