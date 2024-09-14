import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import { getWeekSummary } from "../../functions/get-week-summary";

export const getWeekSummaryRoute: FastifyPluginAsyncZod = async (app) => {
  app.get("/summary", async (req) => {
    const { summary } = await getWeekSummary(req.user.id);

    return summary;
  });
};
