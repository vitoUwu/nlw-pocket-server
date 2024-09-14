import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import { and, desc, eq, gte, lte, sql } from "drizzle-orm";
import { db } from "../db";
import { goalCompletions, goals } from "../db/schema";

dayjs.extend(weekOfYear);

export async function getWeekSummary(userId: string) {
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

  const goalsCompletedInWeek = db.$with("goals_completed_in_week").as(
    db
      .select({
        id: goalCompletions.id,
        title: goals.title,
        goalId: goalCompletions.goalId,
        completedAt: goalCompletions.createdAt,
        completedAtDate: sql/*sql*/ `DATE(${goalCompletions.createdAt})`.as(
          "completedAtDate"
        )
      })
      .from(goalCompletions)
      .innerJoin(goals, eq(goalCompletions.goalId, goals.id))
      .where(
        and(
          gte(goalCompletions.createdAt, firstDayOfWeek),
          lte(goalCompletions.createdAt, lastDayOfWeek),
          eq(goals.userId, userId)
        )
      )
      .orderBy(desc(goalCompletions.createdAt))
  );

  const goalsCompletedByWeekDay = db.$with("goals_completed_by_week_day").as(
    db
      .select({
        completedAtDate: goalsCompletedInWeek.completedAtDate,
        completions: sql/*sql*/ `JSON_AGG(
            JSON_BUILD_OBJECT(
              'id', ${goalsCompletedInWeek.id},
              'goalId', ${goalsCompletedInWeek.goalId},
              'title', ${goalsCompletedInWeek.title},
              'completedAt', ${goalsCompletedInWeek.completedAt}
            )
          )`.as("completions")
      })
      .from(goalsCompletedInWeek)
      .groupBy(goalsCompletedInWeek.completedAtDate)
      .orderBy(desc(goalsCompletedInWeek.completedAtDate))
  );

  const [summary] = await db
    .with(goalsCreatedUpToWeek, goalsCompletedInWeek, goalsCompletedByWeekDay)
    .select({
      completed: sql/*sql*/ `(SELECT COUNT(*) FROM ${goalsCompletedInWeek})`
        .mapWith(Number)
        .as("completed"),
      total:
        sql/*sql*/ `(SELECT SUM(${goalsCreatedUpToWeek.desiredWeeklyFrequency}) FROM ${goalsCreatedUpToWeek})`
          .mapWith(Number)
          .as("total"),
      goalsPerDay:
        sql/*sql*/ `JSON_OBJECT_AGG(${goalsCompletedByWeekDay.completedAtDate}, ${goalsCompletedByWeekDay.completions})`.as(
          "goalsPerDay"
        )
    })
    .from(goalsCompletedByWeekDay);

  console.log({
    summary,
    userId
  });

  return {
    summary
  };
}
