import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/lib/Posts.js", () => ({
  getAllPosts: vi.fn(),
  createPost: vi.fn(),
  updatePost: vi.fn(),
  removePost: vi.fn(),
}));

vi.mock("../../src/lib/user.js", () => ({
  verifyToken: vi.fn(),
}));

const Posts = await import("../../src/lib/Posts.js");
const { verifyToken } = await import("../../src/lib/user.js");
const { GET, POST, PUT, DELETE } = await import("../../src/pages/api/posts.js");

const URL_BASE = "http://localhost/api/posts";

const jsonRequest = (method, body) =>
  new Request(URL_BASE, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

describe("api/posts", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    verifyToken.mockResolvedValue({ id: "u1" });
  });

  describe("GET", () => {
    it("defaults to page 1", async () => {
      Posts.getAllPosts.mockResolvedValue({ page: 1, posts: [] });

      const res = await GET({ request: new Request(URL_BASE) });

      expect(Posts.getAllPosts).toHaveBeenCalledWith({ page: 1 });
      expect(res.status).toBe(200);
      expect(await res.json()).toEqual({ page: 1, posts: [] });
    });

    it("reads the page param", async () => {
      Posts.getAllPosts.mockResolvedValue({ page: 3 });

      await GET({ request: new Request(`${URL_BASE}?page=3`) });

      expect(Posts.getAllPosts).toHaveBeenCalledWith({ page: 3 });
    });

    it("returns 404 when there is no data", async () => {
      Posts.getAllPosts.mockResolvedValue(null);

      const res = await GET({ request: new Request(URL_BASE) });

      expect(res.status).toBe(404);
    });
  });

  describe("POST", () => {
    it("returns 401 with an invalid token", async () => {
      verifyToken.mockResolvedValue({ error: "invalid" });

      const res = await POST({ request: jsonRequest("POST", { token: "t" }) });

      expect(res.status).toBe(401);
      expect(Posts.createPost).not.toHaveBeenCalled();
    });

    it("creates the post and returns 201", async () => {
      const data = { title: "Hola" };
      Posts.createPost.mockResolvedValue({ ...data, slug: "hola" });

      const res = await POST({
        request: jsonRequest("POST", { token: "t", data }),
      });

      expect(verifyToken).toHaveBeenCalledWith("t");
      expect(Posts.createPost).toHaveBeenCalledWith(data);
      expect(res.status).toBe(201);
      expect(await res.json()).toEqual({ title: "Hola", slug: "hola" });
    });

    it("returns 404 when the post is not created", async () => {
      Posts.createPost.mockResolvedValue(null);

      const res = await POST({
        request: jsonRequest("POST", { token: "t", data: {} }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe("PUT", () => {
    it("returns 401 with an invalid token", async () => {
      verifyToken.mockResolvedValue({ error: "invalid" });

      const res = await PUT({ request: jsonRequest("PUT", { token: "t" }) });

      expect(res.status).toBe(401);
      expect(Posts.updatePost).not.toHaveBeenCalled();
    });

    it("updates the post", async () => {
      const data = { id: "1", authorId: "u1", title: "Nuevo" };
      Posts.updatePost.mockResolvedValue(data);

      const res = await PUT({ request: jsonRequest("PUT", { token: "t", data }) });

      expect(Posts.updatePost).toHaveBeenCalledWith(data);
      expect(res.status).toBe(201);
      expect(await res.json()).toEqual(data);
    });

    it("returns 404 when nothing is updated", async () => {
      Posts.updatePost.mockResolvedValue(null);

      const res = await PUT({
        request: jsonRequest("PUT", { token: "t", data: {} }),
      });

      expect(res.status).toBe(404);
    });
  });

  describe("DELETE", () => {
    it("requires id and authorId", async () => {
      const res = await DELETE({
        request: jsonRequest("DELETE", { token: "t", id: "1" }),
      });

      expect(res.status).toBe(404);
      expect(verifyToken).not.toHaveBeenCalled();
    });

    it("returns 401 with an invalid token", async () => {
      verifyToken.mockResolvedValue({ error: "invalid" });

      const res = await DELETE({
        request: jsonRequest("DELETE", { token: "t", id: "1", authorId: "u1" }),
      });

      expect(res.status).toBe(401);
      expect(Posts.removePost).not.toHaveBeenCalled();
    });

    it("removes the post", async () => {
      Posts.removePost.mockResolvedValue(true);

      const res = await DELETE({
        request: jsonRequest("DELETE", { token: "t", id: "1", authorId: "u1" }),
      });

      expect(Posts.removePost).toHaveBeenCalledWith("1", "u1");
      expect(res.status).toBe(201);
      expect(await res.json()).toBe(true);
    });

    it("returns 404 when nothing is removed", async () => {
      Posts.removePost.mockResolvedValue(false);

      const res = await DELETE({
        request: jsonRequest("DELETE", { token: "t", id: "1", authorId: "u1" }),
      });

      expect(res.status).toBe(404);
    });
  });
});
