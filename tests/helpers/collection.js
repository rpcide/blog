import { vi } from "vitest";

/**
 * Build an in-memory stand-in for a MongoDB collection.
 * `find()` returns a chainable cursor whose calls are recorded.
 */
export const createFakeCollection = () => {
  const cursor = {
    docs: [],
    sort: vi.fn(() => cursor),
    skip: vi.fn(() => cursor),
    limit: vi.fn(() => cursor),
    toArray: vi.fn(async () => cursor.docs),
  };

  return {
    cursor,
    count: vi.fn(async () => 0),
    find: vi.fn(() => cursor),
    findOne: vi.fn(async () => null),
    insertOne: vi.fn(async () => ({ insertedId: "new-id" })),
    updateOne: vi.fn(async () => ({ modifiedCount: 1 })),
    deleteMany: vi.fn(async () => ({ deletedCount: 1 })),
  };
};
