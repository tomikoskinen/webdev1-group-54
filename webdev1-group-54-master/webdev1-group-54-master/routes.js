const responseUtils = require('./utils/responseUtils');
const { acceptsJson, isJson, parseBodyJson } = require('./utils/requestUtils');
const { renderPublic } = require('./utils/render');
const { getCurrentUser } = require('./auth/auth');

const { getAllProducts, createProduct, getProduct, deleteProduct, updateProduct } = require('./controllers/products');
const { getAllUsers, viewUser, deleteUser, updateUser, registerUser } = require('./controllers/users');
const { getAllOrders, getCustomerOrders, createOrder, getOrder } = require('./controllers/order')



/**
 * Known API routes and their allowed methods
 *
 * Used to check allowed methods and also to send correct header value
 * in response to an OPTIONS request by sendOptions() (Access-Control-Allow-Methods)
 */
const allowedMethods = {
  '/api/register': ['POST'],
  '/api/users': ['GET'],
  '/api/products': ['GET', 'POST'],
  '/api/orders': ['GET', 'POST']
};

/**
 * Send response to client options request.
 *
 * @param {string} filePath pathname of the request URL
 * @param {http.ServerResponse} response response to be send back
 */
const sendOptions = (filePath, response) => {
  if (filePath in allowedMethods) {
    response.writeHead(204, {
      'Access-Control-Allow-Methods': allowedMethods[filePath].join(','),
      'Access-Control-Allow-Headers': 'Content-Type,Accept',
      'Access-Control-Max-Age': '86400',
      'Access-Control-Expose-Headers': 'Content-Type,Accept'
    });
    return response.end();
  }

  return responseUtils.notFound(response);
};

/**
 * Does the url have an ID component as its last part? (e.g. /api/users/dsf7844e)
 *
 * @param {string} url filePath
 * @param {string} prefix searched string
 * @returns {boolean} true/false if prefix and idPAttern match
 */
const matchIdRoute = (url, prefix) => {
  const idPattern = '[0-9a-z]{8,24}';
  const regex = new RegExp(`^(/api)?/${prefix}/${idPattern}$`);
  return regex.test(url);
};

/**
 * Does the URL match /api/users/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} if is found
 */
const matchUserId = url => {
  return matchIdRoute(url, 'users');
};

/**
 * Does the URL match /api/orders/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} if is found
 */
const matchOrderId = url => {
  return matchIdRoute(url, 'orders');
};

/**
 * Does the URL match /api/products/{id}
 *
 * @param {string} url filePath
 * @returns {boolean} if is found
 */
const matchProductsId = url => {
  return matchIdRoute(url, 'products');
};


const handleRequest = async (request, response) => {
  const { url, method, headers } = request;
  const filePath = new URL(url, `http://${headers.host}`).pathname;
  // serve static files from public/ and return immediately
  if (method.toUpperCase() === 'GET' && !filePath.startsWith('/api')) {
    const fileName = filePath === '/' || filePath === '' ? 'index.html' : filePath;
    return renderPublic(fileName, response);
  }




  if (matchUserId(filePath)) {
    // 8.5 Implement view, update and delete a single user by ID (GET, PUT, DELETE)
    // You can use parseBodyJson(request) from utils/requestUtils.js to parse request body
    // Require a correct accept header (require 'application/json' or '*/*')
    const currentUser = await getCurrentUser(request);
    if(method === 'DELETE' || method === 'GET' || method === 'PUT') {
      if(currentUser === null){
        return responseUtils.basicAuthChallenge(response);
      }
      if(currentUser.role === 'customer') {
        return responseUtils.forbidden(response);
      }
      if (!acceptsJson(request)) {
        return responseUtils.contentTypeNotAcceptable(response);
      }
    }
    if(method === 'DELETE') {
      const splitUrl = url.split('/');
      const id = splitUrl[3];
      return await deleteUser(response, id, currentUser);
    } else if(method === 'GET') {
      const splitUrl = url.split('/');
      const id = splitUrl[3];
      
      return await viewUser(response, id, currentUser);

    } else if(method === 'PUT'){
      const splitUrl = url.split('/');
      const id = splitUrl[3];
      const userData = await parseBodyJson(request);
      return await updateUser(response, id, currentUser, userData);
      
    }
    
  }
  // GET, PUT, DELETE product
  if (matchProductsId(filePath)) {
    const currentUser = await getCurrentUser(request);
    if(method === 'DELETE' || method === 'GET' || method === 'PUT') {
      if(currentUser === null){
        return responseUtils.basicAuthChallenge(response);
      }
      if (!acceptsJson(request)) {
        return responseUtils.contentTypeNotAcceptable(response);
      }
    }
    if(method === 'DELETE') {
      if(currentUser.role === 'customer') {
        return responseUtils.forbidden(response)
      }
      const splitUrl = url.split('/');
      const id = splitUrl[3];
      return await deleteProduct(response, id, currentUser);
    } else if(method === 'GET') {
      const splitUrl = url.split('/');
      const id = splitUrl[3];
      
      return await getProduct(response, id, currentUser);

    } else if(method === 'PUT'){
      if(currentUser.role === 'customer') {
        return responseUtils.forbidden(response)
      }
      const splitUrl = url.split('/');
      const id = splitUrl[3];
      const data = await parseBodyJson(request);
      return await updateProduct(response, id, data);
      
    }
  }
  // Get one order
  if (matchOrderId(filePath) && method.toUpperCase() === 'GET') {
    const user = await getCurrentUser(request);
    if(user === null){
      return responseUtils.basicAuthChallenge(response);
    }

    if (!acceptsJson(request)) {
      return responseUtils.contentTypeNotAcceptable(response);
    }
    const splitUrl = url.split('/');
    const id = splitUrl[3];
    
    return await getOrder(response, id, user);
  }
   // Default to 404 Not Found if unknown url
   if (!(filePath in allowedMethods)) return responseUtils.notFound(response);
   // See: http://restcookbook.com/HTTP%20Methods/options/
   if (method.toUpperCase() === 'OPTIONS') return sendOptions(filePath, response);
 
   // Check for allowable methods
   if (!allowedMethods[filePath].includes(method.toUpperCase())) {
     return responseUtils.methodNotAllowed(response);
   }
 
   // Require a correct accept header (require 'application/json' or '*/*')
   if (!acceptsJson(request)) {
     return responseUtils.contentTypeNotAcceptable(response);
   }
   



  // GET all users
  if (filePath === '/api/users' && method.toUpperCase() === 'GET') {
    const user = await getCurrentUser(request);

    //8.4 Add authentication (only allowed to users with role "admin")
    if(user === null){
      return responseUtils.basicAuthChallenge(response);
    }
    if(user.role === 'customer'){
      return responseUtils.forbidden(response);
    }
    return await getAllUsers(response);
    
  }

  // register new user
  if (filePath === '/api/register' && method.toUpperCase() === 'POST') {
    // Fail if not a JSON request
    if (!isJson(request)) {
      return responseUtils.badRequest(response, 'Invalid Content-Type. Expected application/json');
    }
    const userData = await parseBodyJson(request);
    return await registerUser(response, userData);
  }

  // 9.1 GET products 
  if (filePath === '/api/products' && method.toUpperCase() === 'GET') {
    
    const user = await getCurrentUser(request);
    
    if(user === null){
       return responseUtils.basicAuthChallenge(response);
    }

    if(user.role !== 'customer' && user.role !== 'admin'){
      return responseUtils.forbidden(response);
    }

    return await getAllProducts(response);
    
  }

  // Create a new product
  if (filePath === '/api/products' && method.toUpperCase() === 'POST') {
    const user = await getCurrentUser(request);
    if(user === null){
      return responseUtils.basicAuthChallenge(response);
    }
    if(user.role === 'customer'){
      return responseUtils.forbidden(response);
    }
    if(!isJson(request)){
      return responseUtils.badRequest(response);
    }
    const body = await parseBodyJson(request);
    if(body.name === undefined || body.price === undefined){
      return responseUtils.badRequest(response, 'Invalid inputs');
    }

    return await createProduct(response, body);
  }

  // Viewing all orders
  if (filePath === '/api/orders' && method.toUpperCase() === 'GET') {
    
    const user = await getCurrentUser(request);
    if(user === null){
      return responseUtils.basicAuthChallenge(response);
    }
    
    if(user.role === 'customer'){
      return await getCustomerOrders(response, user);
    }
    if(user.role === 'admin'){
      return await getAllOrders(response);
    }
    
  }
  

  // Create a new order
  if (filePath === '/api/orders' && method.toUpperCase() === 'POST') {
    
    const user = await getCurrentUser(request);
    if(user === null){
      return responseUtils.basicAuthChallenge(response);
    }
    if(user.role === 'admin'){
      return responseUtils.forbidden(response);
    }

    if(!isJson(request)){
      return responseUtils.badRequest(response);
    }
    const body = await parseBodyJson(request);
    return await createOrder(response, body, user);
  }
};

module.exports = { handleRequest };
