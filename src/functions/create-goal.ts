import { db } from "../db";
import { goals } from "../db/schema";

interface CreateGoalRequest {
  title: string;
  desiredWeeklyFrequency: number;
  userId: string;
}

export async function createGoal({
  title,
  desiredWeeklyFrequency,
  userId
}: CreateGoalRequest) {
  const result = await db
    .insert(goals)
    .values({
      userId,
      title,
      desiredWeeklyFrequency
    })
    .returning();

  return {
    goal: result[0]
  };
}
