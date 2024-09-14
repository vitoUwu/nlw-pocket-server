import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { and, count, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";

dayjs.extend(weekOfYear);

export async function getWeekPendingGoals(userId: string) {
  const firstDayOfWeek = dayjs().startOf("week").toDate();
  const lastDayOfWeek = dayjs().endOf("week").toDate();

  const goalsCreatedUpToWeek = db.$with("goals_created_up_to_week").as(
    db
      .select({
        id: goals.id,
        title: goals.title,
        desiredWeeklyFrequency: goals.desiredWeeklyFrequency,
        createdAt: goals.createdAt
      })
      .from(goals)
      .where(and(lte(goals.createdAt, lastDayOfWeek), eq(goals.userId, userId)))
  );

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
          lte(goalCompletions.createdAt, lastDayOfWeek)
        )
      )
      .groupBy(goalCompletions.goalId)
  );

  const pendingGoals = await db
    .with(goalsCreatedUpToWeek, goalCompletionCount)
    .select({
      id: goalsCreatedUpToWeek.id,
      title: goalsCreatedUpToWeek.title,
      desiredWeeklyFrequency: goalsCreatedUpToWeek.desiredWeeklyFrequency,
      createdAt: goalsCreatedUpToWeek.createdAt,
      completionCount:
        sql/*sql*/ `COALESCE(${goalCompletionCount.completionCount}, 0)`.mapWith(
          Number
        )
    })
    .from(goalsCreatedUpToWeek)
    .leftJoin(
      goalCompletionCount,
      eq(goalCompletionCount.goalId, goalsCreatedUpToWeek.id)
    );

  return { pendingGoals };
}
