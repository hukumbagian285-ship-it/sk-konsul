export const config = { runtime: "edge" };

export default async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      headers: { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Methods": "GET, OPTIONS" },
    });
  }
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) return new Response("Missing ?id=", { status: 400 });

  const gdrive = await fetch(`https://drive.google.com/uc?export=download&confirm=t&id=${id}`);
  const headers = new Headers(gdrive.headers);
  headers.set("Access-Control-Allow-Origin", "*");
  return new Response(gdrive.body, { status: gdrive.status, headers });
};
