// worker.js
var worker_default = {
  async fetch(request, env) {
    let response = await env.ASSETS.fetch(request);
    if (response.status === 404) {
      const url = new URL(request.url);
      const isAsset = url.pathname.includes(".") && !url.pathname.endsWith(".");
      if (!isAsset) {
        url.pathname = url.pathname.endsWith("/") ? `${url.pathname}index.html` : `${url.pathname}/index.html`;
        response = await env.ASSETS.fetch(new Request(url, request));
      }
    }
    if (response.status === 404) {
      return new Response("Not Found", { status: 404 });
    }
    return response;
  }
};
export {
  worker_default as default
};
//# sourceMappingURL=worker.js.map
