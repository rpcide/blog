import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/lib/Posts.js", () => ({
  getPostById: vi.fn(),
  getAllPostsByUser: vi.fn(),
  getPostsByTag: vi.fn(),
}));

const Posts = await import("../../src/lib/Posts.js");
const postById = await import("../../src/pages/api/postById.js");
const postsByUser = await import("../../src/pages/api/postsByUser.js");
const searchPosts = await import("../../src/pages/api/searchPosts.js");

const get = (handler, url) =>
  handler.GET({ request: new Request(`http://localhost${url}`) });

describe("api read endpoints", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe("postById", () => {
    it("requires id", async () => {
      const res = await get(postById, "/api/postById");

      expect(res.status).toBe(404);
      expect(await res.json()).toEqual({ msg: "field id is required" });
    });

    it("returns the post with id", async () => {
      Posts.getPostById.mockResolvedValue({ _id: "abc", title: "T" });

      const res = await get(postById, "/api/postById?id=abc");

      expect(Posts.getPostById).toHaveBeenCalledWith({ id: "abc" });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ _id: "abc", id: "abc", title: "T" });
    });

    it("returns 404 when the post does not exist", async () => {
      Posts.getPostById.mockResolvedValue(null);

      const res = await get(postById, "/api/postById?id=abc");

      expect(res.status).toBe(404);
    });

    it("returns 500 when the lookup throws", async () => {
      vi.spyOn(console, "log").mockImplementation(() => {});
      Posts.getPostById.mockRejectedValue(new Error("bad id"));

      const res = await get(postById, "/api/postById?id=bad");

      expect(res.status).toBe(500);
    });
  });

  describe("postsByUser", () => {
    it("requires authorId", async () => {
      const res = await get(postsByUser, "/api/postsByUser");

      expect(res.status).toBe(404);
      expect(Posts.getAllPostsByUser).not.toHaveBeenCalled();
    });

    it("returns the author's posts", async () => {
      Posts.getAllPostsByUser.mockResolvedValue({ page: 2, posts: [] });

      const res = await get(postsByUser, "/api/postsByUser?authorId=u1&page=2");

      expect(Posts.getAllPostsByUser).toHaveBeenCalledWith({
        page: 2,
        authorId: "u1",
      });
      expect(res.status).toBe(200);
    });

    it("returns 404 when there is no data", async () => {
      Posts.getAllPostsByUser.mockResolvedValue(null);

      const res = await get(postsByUser, "/api/postsByUser?authorId=u1");

      expect(res.status).toBe(404);
    });
  });

  describe("searchPosts", () => {
    it("uses defaults without params", async () => {
      Posts.getPostsByTag.mockResolvedValue({ page: 1, posts: [] });

      const res = await get(searchPosts, "/api/searchPosts");

      expect(Posts.getPostsByTag).toHaveBeenCalledWith({
        tags: null,
        search: "",
        page: 1,
      });
      expect(res.status).toBe(200);
    });

    it("forwards search, tags and page", async () => {
      Posts.getPostsByTag.mockResolvedValue({ page: 2, posts: [] });

      await get(searchPosts, "/api/searchPosts?s=astro&tags=js&page=2");

      expect(Posts.getPostsByTag).toHaveBeenCalledWith({
        tags: "js",
        search: "astro",
        page: 2,
      });
    });

    it("returns 404 when there is no data", async () => {
      Posts.getPostsByTag.mockResolvedValue(null);

      const res = await get(searchPosts, "/api/searchPosts");

      expect(res.status).toBe(404);
    });
  });
});
