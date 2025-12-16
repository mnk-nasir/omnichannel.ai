'use strict';

/**
 * Authentication Plugin
 * Registers the JWT authenticate decorator used by protected routes.
 */
const fp = require('fastify-plugin');

async function authPlugin(fastify) {
  fastify.decorate('authenticate', async function (request, reply) {
    try {
      await request.jwtVerify();
    } catch (err) {
      reply.send(err);
    }
  });
}

module.exports = fp(authPlugin);
