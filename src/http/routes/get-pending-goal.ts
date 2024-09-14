import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getWeekPendingGoals } from "../../functions/get-week-pending-goals";

export const getPendingGoalsRoute: FastifyPluginAsyncZod = async (app) => {
  app.get("/pending-goals", async (req) => {
    const { pendingGoals } = await getWeekPendingGoals(req.user.id);

    return pendingGoals;
  });
};
