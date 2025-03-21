import { Database } from "bun:sqlite";

export const db = new Database("app.db", { create: true });

// Example: Enable foreign key constraints
db.run("PRAGMA foreign_keys = ON;");

// Export helper functions if needed (e.g., transactions)
export const transaction = (callback: () => void) => {
  db.transaction(callback)();
};