import { getPostsByTag } from "../../lib/Posts";

export const GET = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page"));
  const s = url.searchParams.get("s") || "";
  const tags = url.searchParams.get("tags");

  const data = await getPostsByTag({
    tags,
    search: s,
    page: page || 1,
  });

  if (!data) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  return new Response(JSON.stringify(data), {
    status: 200,
  });
};
