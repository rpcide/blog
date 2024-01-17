import { getAllPosts } from "../../lib/Posts";

export const GET = async ({ params, request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page"));

  const data = await getAllPosts({ page: page || 1 });

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
