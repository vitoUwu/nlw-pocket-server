import { db } from ".";
import { goalCompletions, goals } from "./schema";

export async function clear() {
  await db.delete(goalCompletions);
  await db.delete(goals);
}
