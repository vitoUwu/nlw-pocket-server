import { createId } from "@paralleldrive/cuid2";
import { db } from "../db";
import { users } from "../db/schema";

export async function createUser() {
  const [user] = await db
    .insert(users)
    .values([{ id: createId() }])
    .returning();

  return user;
}
