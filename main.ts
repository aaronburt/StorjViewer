import getImagesFromR2 from "./aws.ts";

Deno.serve({ port: 80 }, async(request: Request) => {
  const pathname = new URL(request.url).pathname;

  if(pathname.startsWith('/live')){
    const images: Record<string, string> = await getImagesFromR2();
    return Response.json(images)
  }

  const file = await Deno.open("index.html", { read: true });
  return new Response(file.readable);
})