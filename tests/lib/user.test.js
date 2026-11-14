import { afterEach, describe, expect, it, vi } from "vitest";

vi.mock("../../src/config/index.js", () => ({
  API_RPCIDE_URL: "https://api.example.test",
}));

const { verifyToken } = await import("../../src/lib/user.js");

describe("lib/user verifyToken", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("sends the token as Bearer to the auth endpoint", async () => {
    const fetchMock = vi.fn(async () => ({
      json: async () => ({ id: "u1" }),
    }));
    vi.stubGlobal("fetch", fetchMock);

    const result = await verifyToken("secret-token");

    expect(fetchMock).toHaveBeenCalledWith("https://api.example.test/auth", {
      method: "GET",
      headers: { Authorization: "Bearer secret-token" },
    });
    expect(result).toEqual({ id: "u1" });
  });

  it("returns the error payload from the API", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({ json: async () => ({ error: "invalid token" }) }))
    );

    expect(await verifyToken("bad")).toEqual({ error: "invalid token" });
  });
});
