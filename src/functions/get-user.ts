import { eq } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";

type User = typeof users.$inferSelect;

export async function getUser(userId: string): Promise<User | undefined> {
  const [user] = await db.select().from(users).where(eq(users.id, userId));

  return user;
}
