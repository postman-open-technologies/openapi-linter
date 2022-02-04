import Fastify from "fastify";
import { handlers } from "@spec-linter-api/core";
import { adapter as requestAdapter } from "./request-adapter";

const fastify = Fastify({
  logger: true,
});

fastify.removeAllContentTypeParsers();
fastify.addContentTypeParser(
  "application/json",
  { parseAs: "string" },
  (_req, body, done) => {
    try {
      const json = JSON.parse(body as string);
      done(null, json);
    } catch (err) {
      err.statusCode = 400;
      done(err, undefined);
    }
  }
);

fastify.all("/", async (request, reply) => {
  const response = await handlers.home(requestAdapter(request));
  reply.code(response.statusCode);
  reply.headers(response.headers);
  reply.send(response.body);
});

fastify.all("/linter", async (request, reply) => {
  const response = await handlers.linter(requestAdapter(request));
  reply.code(response.statusCode);
  reply.headers(response.headers);
  reply.send(response.body);
});

fastify.listen(process.env.PORT || 3000, "0.0.0.0");
