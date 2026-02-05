import Fastify from "fastify";
import dotenv from "dotenv";

import { connect, StringCodec } from "nats";

dotenv.config();
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

  const nc = await connect({ servers: "nats://nats:4222" });
  const sc = StringCodec();
  const subSignup = nc.subscribe("user:signup", {
    queue: "user-service-group",
  });
  const subSignin = nc.subscribe("user:signin", {
    queue: "user-service-group",
  });
  (async () => {
    for await (const msg of subSignup) {
      console.log("signup event", sc.decode(msg.data));
    }
  })();

  (async () => {
    for await (const msg of subSignin) {
      console.log("signin event", sc.decode(msg.data));
    }
  })();
} catch (error) {
  console.error(error);
  process.exit(1);
}
