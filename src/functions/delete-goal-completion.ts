import { and, eq } from "drizzle-orm";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";

interface DeleteGoalCompletionRequest {
  completionId: string;
  goalId: string;
  userId: string;
}

export async function deleteGoalCompletion({
  completionId,
  goalId,
  userId
}: DeleteGoalCompletionRequest) {
  const [goal] = await db
    .select({ id: goals.id })
    .from(goals)
    .where(and(eq(goals.id, goalId), eq(goals.userId, userId)));

  const result = await db
    .delete(goalCompletions)
    .where(
      and(
        eq(goalCompletions.id, completionId),
        eq(goalCompletions.goalId, goalId)
      )
    )
    .returning({ id: goalCompletions.id });

  return result;
}
