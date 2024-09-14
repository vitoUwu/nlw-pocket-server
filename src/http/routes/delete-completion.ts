import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { deleteGoalCompletion } from "../../functions/delete-goal-completion";

export const deleteGoalCompletionRoute: FastifyPluginAsyncZod = async (app) => {
  app.delete(
    "/completions",
    {
      schema: {
        body: z.object({
          completionId: z.string(),
          goalId: z.string()
        })
      }
    },
    async (req) => {
      const { completionId, goalId } = req.body;

      const result = await deleteGoalCompletion({
        completionId,
        userId: req.user.id,
        goalId
      });

      return result;
    }
  );
};
