import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL;

export const isDatabaseConfigured = Boolean(
  connectionString &&
  !connectionString.includes("username:password@ep-cool-sample") &&
  connectionString.startsWith("postgres")
);

// Neon HTTP client and Drizzle instance
export const db = isDatabaseConfigured
  ? drizzle(neon(connectionString!), { schema })
  : (null as unknown as ReturnType<typeof drizzle>);

export { schema };
