import { beforeEach, describe, expect, it, vi } from "vitest";
import { ObjectId } from "mongodb";

import { createFakeCollection } from "../helpers/collection.js";

const fake = vi.hoisted(() => ({ collection: null }));

vi.mock("../../src/lib/mongodb.js", () => ({
  Posts: async () => fake.collection,
}));

vi.mock("uniqid", () => ({ default: () => "abc123" }));

// Posts.js grabs the collection at import time, so create it before importing.
fake.collection = createFakeCollection();

const Posts = await import("../../src/lib/Posts.js");

const ID = "65a1b2c3d4e5f60718293a4b";

describe("lib/Posts", () => {
  let collection;

  beforeEach(() => {
    // Reset the shared fake in place: Posts.js keeps the reference it got at import time.
    collection = fake.collection;
    Object.assign(collection, createFakeCollection());
  });

  describe("getAllPosts", () => {
    it("returns the first page sorted by date and adds id", async () => {
      collection.count.mockResolvedValue(25);
      collection.cursor.docs = [{ _id: "a", title: "A" }];

      const result = await Posts.getAllPosts();

      expect(collection.find).toHaveBeenCalledWith({});
      expect(collection.cursor.sort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(collection.cursor.skip).toHaveBeenCalledWith(0);
      expect(collection.cursor.limit).toHaveBeenCalledWith(10);
      expect(result).toEqual({
        page: 1,
        posts: [{ _id: "a", title: "A", id: "a" }],
        count: 25,
        hasNext: true,
      });
    });

    it("skips previous pages and reports no next page at the end", async () => {
      collection.count.mockResolvedValue(25);

      const result = await Posts.getAllPosts({ page: 3 });

      expect(collection.cursor.skip).toHaveBeenCalledWith(20);
      expect(result.hasNext).toBe(false);
    });

    it("has no next page when the count is an exact multiple", async () => {
      collection.count.mockResolvedValue(20);

      const result = await Posts.getAllPosts({ page: 2 });

      expect(result.hasNext).toBe(false);
    });
  });

  describe("getAllPostsByUser", () => {
    it("returns null without authorId", async () => {
      expect(await Posts.getAllPostsByUser({ page: 1 })).toBeNull();
      expect(collection.find).not.toHaveBeenCalled();
    });

    it("filters by authorId", async () => {
      collection.count.mockResolvedValue(11);
      collection.cursor.docs = [{ _id: "x" }];

      const result = await Posts.getAllPostsByUser({ page: 1, authorId: "u1" });

      expect(collection.count).toHaveBeenCalledWith({ authorId: "u1" });
      expect(collection.find).toHaveBeenCalledWith({ authorId: "u1" });
      expect(result).toEqual({
        page: 1,
        posts: [{ _id: "x", id: "x" }],
        count: 11,
        hasNext: true,
      });
    });
  });

  describe("getPostsByTag", () => {
    it("filters by tag when tags are given", async () => {
      await Posts.getPostsByTag({ tags: "astro", search: "", page: 1 });

      expect(collection.find).toHaveBeenCalledWith({
        tags: { $all: ["astro"] },
      });
    });

    it("searches the title case-insensitively without tags", async () => {
      collection.count.mockResolvedValue(1);
      collection.cursor.docs = [{ _id: "p" }];

      const result = await Posts.getPostsByTag({ search: "hola", page: 2 });

      const filter = { title: { $regex: "hola", $options: "i" } };
      expect(collection.count).toHaveBeenCalledWith(filter);
      expect(collection.find).toHaveBeenCalledWith(filter);
      expect(collection.cursor.skip).toHaveBeenCalledWith(10);
      expect(result.posts).toEqual([{ _id: "p", id: "p" }]);
      expect(result.hasNext).toBe(false);
    });
  });

  describe("getters by slug and id", () => {
    it("getPostBySlug and getPostsBySlug query by slug", async () => {
      collection.findOne.mockResolvedValue({ slug: "s" });

      expect(await Posts.getPostBySlug("s")).toEqual({ slug: "s" });
      expect(await Posts.getPostsBySlug({ slug: "s" })).toEqual({ slug: "s" });
      expect(collection.findOne).toHaveBeenNthCalledWith(1, { slug: "s" });
      expect(collection.findOne).toHaveBeenNthCalledWith(2, { slug: "s" });
    });

    it("getPostById converts the id to ObjectId", async () => {
      await Posts.getPostById({ id: ID });

      const [query] = collection.findOne.mock.calls[0];
      expect(query._id).toBeInstanceOf(ObjectId);
      expect(query._id.toHexString()).toBe(ID);
    });
  });

  describe("createPost", () => {
    it("builds the slug from the title", async () => {
      const post = { title: "Hola Mundo Astro", content: "# hi", authorId: "u1" };

      const result = await Posts.createPost(post);

      expect(collection.insertOne).toHaveBeenCalledWith({
        ...post,
        slug: "hola-mundo-astro",
      });
      expect(result).toMatchObject({
        ...post,
        slug: "hola-mundo-astro",
        id: "new-id",
      });
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it("adds a unique suffix when the slug already exists", async () => {
      collection.findOne.mockResolvedValue({ slug: "hola" });

      const result = await Posts.createPost({ title: "Hola" });

      expect(result.slug).toBe("hola-abc123");
    });

    it("returns null when the insert fails", async () => {
      collection.insertOne.mockResolvedValue(null);

      expect(await Posts.createPost({ title: "x" })).toBeNull();
    });
  });

  describe("updatePost", () => {
    it("filters by id and authorId and sets updatedAt", async () => {
      const post = { id: ID, authorId: "u1", title: "Nuevo" };

      const result = await Posts.updatePost(post);

      const [filter, update] = collection.updateOne.mock.calls[0];
      expect(filter._id.toHexString()).toBe(ID);
      expect(filter.authorId).toBe("u1");
      expect(update.$set).toMatchObject(post);
      expect(update.$set.updatedAt).toBeInstanceOf(Date);
      expect(result).toEqual(post);
    });

    it("returns null when nothing was modified", async () => {
      collection.updateOne.mockResolvedValue({ modifiedCount: 0 });

      expect(await Posts.updatePost({ id: ID, authorId: "other" })).toBeNull();
    });
  });

  describe("removePost", () => {
    it("filters by id and authorId", async () => {
      expect(await Posts.removePost(ID, "u1")).toBe(true);

      const [filter] = collection.deleteMany.mock.calls[0];
      expect(filter._id.toHexString()).toBe(ID);
      expect(filter.authorId).toBe("u1");
    });

    it("returns false when nothing was deleted", async () => {
      collection.deleteMany.mockResolvedValue({ deletedCount: 0 });

      expect(await Posts.removePost(ID, "other")).toBe(false);
    });
  });
});
