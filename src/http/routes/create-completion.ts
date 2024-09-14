import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { createGoalCompletion } from "../../functions/create-goal-completion";

export const createGoalCompletionRoute: FastifyPluginAsyncZod = async (app) => {
  app.post(
    "/completions",
    {
      schema: {
        body: z.object({
          goalId: z.string()
        })
      }
    },
    async (req) => {
      const { goalId } = req.body;

      const result = await createGoalCompletion({
        goalId,
        userId: req.user.id
      });

      return result;
    }
  );
};
