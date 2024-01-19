import { getAllPostsByUser } from "../../lib/Posts";

export const GET = async ({ request }) => {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get("page"));
  const authorId = url.searchParams.get("authorId");

  if (!authorId) {
    return new Response(
      JSON.stringify({
        msg: "Field authorId is required",
      }),
      {
        status: 404,
        statusText: "Not found",
      }
    );
  }

  const data = await getAllPostsByUser({ page: page || 1, authorId });

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
