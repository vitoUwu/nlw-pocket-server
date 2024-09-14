import "dotenv/config";
import z from "zod";

export const schema = z.object({
  DATABASE_URL: z.string().url(),
  ADDRESS: z.string().default("localhost"),
  PORT: z.string().default("3333")
});

export const env = schema.parse(process.env);
