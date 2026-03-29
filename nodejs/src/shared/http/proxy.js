'use strict';

function copyRequestHeaders(headers) {
  const outgoing = new Headers();

  Object.entries(headers).forEach(([key, value]) => {
    if (value === undefined || key.toLowerCase() === 'host' || key.toLowerCase() === 'content-length') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => outgoing.append(key, entry));
      return;
    }

    outgoing.set(key, value);
  });

  return outgoing;
}

function proxyTo(targetBaseUrl) {
  return async (req, res, next) => {
    try {
      const targetUrl = `${targetBaseUrl}${req.originalUrl}`;
      const headers = copyRequestHeaders(req.headers);

      const init = {
        method: req.method,
        headers,
      };

      if (!['GET', 'HEAD'].includes(req.method) && req.body && Object.keys(req.body).length > 0) {
        headers.set('content-type', 'application/json');
        init.body = JSON.stringify(req.body);
      }

      const upstreamResponse = await fetch(targetUrl, init);
      const setCookies = typeof upstreamResponse.headers.getSetCookie === 'function'
        ? upstreamResponse.headers.getSetCookie()
        : [];

      upstreamResponse.headers.forEach((value, key) => {
        const lowerKey = key.toLowerCase();
        if (lowerKey === 'content-length' || lowerKey === 'transfer-encoding' || lowerKey === 'set-cookie') {
          return;
        }

        res.setHeader(key, value);
      });

      if (setCookies.length > 0) {
        res.setHeader('Set-Cookie', setCookies);
      }

      const body = Buffer.from(await upstreamResponse.arrayBuffer());
      res.status(upstreamResponse.status).send(body);
    } catch (error) {
      next(error);
    }
  };
}

module.exports = {
  proxyTo,
};
