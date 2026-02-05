import Fastify from "fastify";
import dotenv from "dotenv";

dotenv.configDotenv();
const fastify = Fastify({});

fastify.get("/health", (req, res) => {
  res.send({
    status: "good",
    node: process.env.instance,
  });
});

try {
  await fastify.listen({ host: process.env.host, port: process.env.port });
  console.log(
    `Server is now listening on ${process.env.host}:${process.env.port}`,
  );
} catch (error) {
  console.error(error);
  process.exit(1);
}
