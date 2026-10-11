import { eq } from "drizzle-orm";
import { getDb } from "..";
import { user } from "../schema";

export const findUserByUsername = async (username: string) => {
  const db = await getDb();
  const users = await db.select().from(user).where(eq(user.username, username));
  if (users.length === 0) {
    return null;
  }
  return users[0];
};

export const findUserById = async (id: number) => {
  const db = await getDb();
  const users = await db.select().from(user).where(eq(user.id, id));
  if (users.length === 0) {
    return null;
  }
  return users[0];
};
