// deno-lint-ignore-file no-unused-vars no-explicit-any
import getImagesFromR2 from "./aws.ts";


async function buildCacheFile(){
  const content = await getImagesFromR2()
  return await Deno.writeTextFile(".cache", JSON.stringify({ content: content, expires: (Date.now() * 1000) + 60 * 1000 })) 
}

async function readCacheFile(){
  const cacheFile = await Deno.readFile(".cache");
  const cacheJson = new TextDecoder().decode(cacheFile.buffer);
  const parsedJson = JSON.parse(cacheJson);
  return parsedJson;
}

Deno.serve({ port: 80 }, async(request: Request) => {
  const pathname = new URL(request.url).pathname;
  if (pathname.startsWith('/live')) {
    try {
      const parsedJson = await readCacheFile()
      if(parsedJson.expires){
        if(parseInt(parsedJson.expires) < Date.now() * 1000){
          return Response.json(parsedJson);
        }
      }

      await buildCacheFile();      
      return Response.json(await readCacheFile())

    } catch(error: any){
      await buildCacheFile();
    }

    return Response.json(await readCacheFile())
  }
  
  if(pathname.startsWith('/static/css')){
      const stylesheet = await Deno.open("./static/stylesheet.css", { read: true });
      return new Response(stylesheet.readable)
  }

  const file = await Deno.open("./static/index.html", { read: true });
  return new Response(file.readable, { headers: { "content-type": "text/html" } });
})