import Fastify from "fastify";
import dotenv from "dotenv";
import axios from "axios";
import { connect, StringCodec } from "nats";
dotenv.config();
const fastify = Fastify({});
const natsUrl = process.env.NATS_URL ?? "nats://nats:4222";
const publishEvent = async (subject, payload) => {
  if (!nc || !sc) return;
  await nc.publish(subject, sc.encode(JSON.stringify(payload)));
};
const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";
let nc;
let sc;

fastify.get("/ag/health", (req, res) => {
  res.send({
    status: "good",
    node: process.env.instance,
  });
});
fastify.get("/catalog/health", async (req, res) => {
  const reply = await axios.get("http://nginx_catalog/health");
  return res.send({
    node: process.env.instance,
    catalog: reply.data,
  });
});
fastify.post("/signup", async (req, reply) => {
  const { email, username, password } = req.body ?? {};
  if (!email || !username || !password) {
    return reply
      .code(400)
      .send({ error: "email, password and username are required" });
  }

  await publishEvent("user:signup", {
    type: "user:signup",
    email,
    username,
    password,
    at: new Date().toISOString(),
  });

  return reply.code(201).send({ status: "ok" });
});
fastify.post("/signin", async (req, reply) => {
  const { email } = req.body ?? {};
  if (!email) {
    return reply.code(400).send({ error: "email is required" });
  }

  await publishEvent("user:signin", {
    type: "user:signin",
    email,
    at: new Date().toISOString(),
  });

  return reply.send({ status: "ok" });
});
fastify.get("/user/health", async (req, res) => {
  const reply = await axios.get("http://nginx_user/health");
  return res.send({
    node: process.env.instance,
    user: reply.data,
  });
});
const start = async () => {
  try {
    nc = await connect({ servers: natsUrl });
    sc = StringCodec();
    fastify.log.info({ natsUrl }, "connected to nats");

    await fastify.listen({ port, host });
  } catch (err) {
    console.log(err);
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
