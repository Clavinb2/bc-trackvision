export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    const parseRangeHeader = (value) => {
      if (!value || !value.startsWith('bytes=')) return null;
      const [startStr, endStr] = value.replace('bytes=', '').split('-');
      const start = Number(startStr);
      if (Number.isNaN(start)) return null;
      const end = endStr ? Number(endStr) : undefined;
      if (endStr && Number.isNaN(end)) return null;
      return { start, end };
    };

    if (url.pathname.startsWith('/videos/')) {
      const objectKey = url.pathname.replace(/^\/videos\//, '');
      const rangeHeader = request.headers.get('Range');
      const range = parseRangeHeader(rangeHeader);

      const getOptions = {};
      if (range) {
        getOptions.range = {
          offset: range.start,
          length: range.end !== undefined ? range.end - range.start + 1 : undefined,
        };
      }

      let object;
      try {
        object = await env.trackvision_bucket.get(objectKey, getOptions);
      } catch (error) {
        return new Response('Error retrieving video', { status: 500 });
      }

      if (!object) {
        return new Response('Video not found', { status: 404 });
      }

      const ext = objectKey.split('.').pop().toLowerCase();
      const mimeTypes = {
        mp4: 'video/mp4',
        webm: 'video/webm',
        mov: 'video/quicktime',
      };
      const contentType = mimeTypes[ext] || 'application/octet-stream';

      const headers = new Headers({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Accept-Ranges': 'bytes',
      });

      const size = object.size;

      if (range && object.range) {
        const { offset, length } = object.range;
        const end = range.end !== undefined ? range.end : offset + length - 1;
        headers.set('Content-Range', `bytes ${offset}-${end}/${size ?? '*'}`);
        headers.set('Content-Length', String(length));
        if (request.method === 'HEAD') {
          return new Response(null, { status: 206, headers });
        }
        return new Response(object.body, { status: 206, headers });
      }

      if (size !== undefined) {
        headers.set('Content-Length', String(size));
      }

      if (request.method === 'HEAD') {
        return new Response(null, { status: 200, headers });
      }

      return new Response(object.body, { status: 200, headers });
    }

    let response = await env.ASSETS.fetch(request);

    if (response.status === 404) {
      const isAsset = url.pathname.includes('.') && !url.pathname.endsWith('.');

      if (!isAsset) {
        url.pathname = url.pathname.endsWith('/')
          ? `${url.pathname}index.html`
          : `${url.pathname}/index.html`;

        response = await env.ASSETS.fetch(new Request(url, request));
      }
    }

    if (response.status === 404) {
      return new Response('Not Found', { status: 404 });
    }

    return response;
  },
};
