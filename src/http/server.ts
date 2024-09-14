import fastifyCors from "@fastify/cors";
import fastify from "fastify";
import {
  type ZodTypeProvider,
  serializerCompiler,
  validatorCompiler
} from "fastify-type-provider-zod";
import type { users } from "../db/schema";
import { env } from "../env";
import { handleUserIdMiddleware } from "./middlewares/userId";
import { createGoalCompletionRoute } from "./routes/create-completion";
import { createGoalRoute } from "./routes/create-goal";
import { deleteGoalCompletionRoute } from "./routes/delete-completion";
import { getPendingGoalsRoute } from "./routes/get-pending-goal";
import { getWeekSummaryRoute } from "./routes/get-week-summary";

const PORT = env.PORT;
const ADDRESS = env.ADDRESS;

declare module "fastify" {
  interface FastifyRequest {
    user: typeof users.$inferSelect;
  }
}

const app = fastify({ logger: true }).withTypeProvider<ZodTypeProvider>();
app.addHook("preHandler", handleUserIdMiddleware);

// plugins
app.register(fastifyCors, {
  origin: ["http://localhost:5173"],
  credentials: true
});

// compilers
app.setValidatorCompiler(validatorCompiler);
app.setSerializerCompiler(serializerCompiler);

// routes
app.register(createGoalRoute);
app.register(createGoalCompletionRoute);
app.register(getPendingGoalsRoute);
app.register(getWeekSummaryRoute);
app.register(deleteGoalCompletionRoute);

app
  .listen({
    host: ADDRESS,
    port: Number(PORT)
  })
  .then(() => {
    console.log(`Server listening on port ${PORT}`);
  });
