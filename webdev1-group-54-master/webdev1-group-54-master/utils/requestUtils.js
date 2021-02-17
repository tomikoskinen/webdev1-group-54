/**
 * Decode, parse and return user credentials (username and password)
 * from the Authorization header.
 *
 * @param {http.incomingMessage} request incoming request
 * @returns {Array|null} [username, password] or null if header is missing
 */
const getCredentials = request => {
  // 8.4 Parse user credentials from the "Authorization" request header
  // NOTE: The header is base64 encoded as required by the http standard.
  //       You need to first decode the header back to its original form ("email:password").
  //  See: https://attacomsian.com/blog/nodejs-base64-encode-decode
  //       https://stackabuse.com/encoding-and-decoding-base64-strings-in-node-js/
  const { headers } = request;
  
  if(headers.authorization === undefined) {
    return null;
  }

  const authHeaders = headers.authorization.split(' ');
  
  if(authHeaders[0] !== 'Basic') {
    return null;
  }
  
  const buff = Buffer.from(authHeaders[1], 'base64');
  const decoded = buff.toString('UTF-8');
  const splitted = decoded.split(':');

  return splitted;
  

};

/**
 * Does the client accept JSON responses?
 *
 * @param {http.incomingMessage} request incoming request
 * @returns {boolean} if accepts JSON responses
 */
const acceptsJson = request => {
  const { headers } = request;
  if(headers.accept === undefined) {
    return false;
  }
  if(headers.accept.includes('application/json') || headers.accept.includes('*/*')) {
    return true;
  }
  return false;
};

/**
 * Is the client request content type JSON?
 *
 * @param {http.incomingMessage} request incoming request
 * @returns {boolean} if content type JSON
 */
const isJson = request => {
  const { headers } = request;
  if(headers['content-type'] === undefined) {
    return false;
  }
  if(headers['content-type'].includes('application/json')) {
    return true;
  }
  return false;
};

/**
 * Asynchronously parse request body to JSON
 *
 * Remember that an async function always returns a Promise which
 * needs to be awaited or handled with then() as in:
 *
 *   const json = await parseBodyJson(request);
 *
 *   -- OR --
 *
 *   parseBodyJson(request).then(json => {
 *     // Do something with the json
 *   })
 *
 * @param {http.IncomingMessage} request incoming request
 * @returns {Promise<*>} Promise resolves to JSON content of the body
 */
const parseBodyJson = request => {
  return new Promise((resolve, reject) => {
    let body = '';

    request.on('error', err => reject(err));

    request.on('data', chunk => {
      body += chunk.toString();
    });

    request.on('end', () => {
      resolve(JSON.parse(body));
    });
  });
};

module.exports = { acceptsJson, getCredentials, isJson, parseBodyJson };
