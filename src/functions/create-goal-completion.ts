import dayjs from "dayjs";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";

interface CreateGoalCompletionRequest {
  goalId: string;
  userId: string;
}

export async function createGoalCompletion({
  goalId,
  userId
}: CreateGoalCompletionRequest) {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();

  const goalCompletionCount = db.$with("goal_completion_counts").as(
    db
      .select({
        goalId: goalCompletions.goalId,
        completionCount: count(goalCompletions.id).as("completionCount")
      })
      .from(goalCompletions)
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek),
          eq(goalCompletions.goalId, goalId)
        )
      )
      .groupBy(goalCompletions.goalId)
  );

  const [result] = await db
    .with(goalCompletionCount)
    .select({
      desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
      completionCount:
        sql/*sql*/ `COALESCE(${goalCompletionCount.completionCount}, 0)`.mapWith(
          Number
        )
    })
    .from(goals)
    .leftJoin(
      goalCompletionCount,
      and(
        gte(goals.createdAt, firstDayOfWeek),
        lte(goals.createdAt, lastDayOfWeek)
      )
    )
    .where(eq(goals.id, goalId))
    .limit(1);

  if (!result) {
    throw new Error("Goal not found");
  }

  if (result.desiredWeeklyFrequency <= result.completionCount) {
    throw new Error("Goal already completed");
  }

  const insertResult = await db
    .insert(goalCompletions)
    .values({ goalId })
    .returning();

  return insertResult[0];
}
