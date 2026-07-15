import "dotenv/config";
import "./proxy.js";
import Fastify from "fastify";
import { chatRequestSchema } from "./schemas.js";
import { llm } from "./llm.js";

const app = Fastify({ logger: true });

app.get("/health", async () => {
  return { status: "ok" };
});

app.post("/chat", async (request, reply) => {
  const parsed = chatRequestSchema.safeParse(request.body);

  if (!parsed.success) {
    return reply.status(400).send({ error: parsed.error.flatten() });
  }

  const { message } = parsed.data;

  const completion = await llm.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [{ role: "user", content: message }],
  });

  return { reply: completion.choices[0].message.content };
});

const port = Number(process.env.PORT) || 4000;

app.listen({ port }, (err) => {
  if (err) {
    app.log.error(err);
    process.exit(1);
  }
});
