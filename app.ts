// A lot of the code for this came from https://auth0.com/blog/2016/03/07/hapijs-authentication-secure-your-api-with-json-web-tokens/
// Specifically mostly the code around the security bits.

// To access secured routes, an Authorization header must be set. 
// ex: Authorization: Bearer <TOKEN>

'use strict';

import { Server } from "hapi";
import * as glob from "glob";
import * as path from "path";
import { key as secret } from "./app/config";
import * as hapiAuthJwt from "hapi-auth-jwt";

// Routes import
import { raceRoutes } from "./app/routes/races";
import { challengesRoutes } from "./app/routes/challenges";
import { driverRoutes } from "./app/routes/drivers";
import { userRoutes } from "./app/routes/users";
import { blogRoutes } from "./app/routes/blogs";
import { trackRoutes } from "./app/routes/tracks";

// Start the server
const PORT = process.env.PORT || 8080;

const server = new Server();
server.connection({ port: PORT });

server.register([{
  register: hapiAuthJwt,
  options: {}
}, {
  register: require('inert'),
  options: {}
}], (err) => {

  if (err) {
    throw err;
  }

  server.auth.strategy('jwt', 'jwt', {
    key: secret,
    verifyOptions: { algorithms: ['HS256'] }
  });
});

server.route(raceRoutes);
server.route(challengesRoutes);
server.route(driverRoutes);
server.route(userRoutes);
server.route(blogRoutes);
server.route(trackRoutes);

server.route({
  method: 'GET',
  path: '/{param*}',
  handler: {
    directory: {
      path: 'dist',
      redirectToSlash: false,
      index: true
    }
  }
});

server.start((err) => {
  if (err) {
    throw err;
  }
  console.log('server running on port ' + PORT);
});