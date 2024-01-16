import { getAllPosts } from "../../lib/Posts";

export const get = async () => {
  const { posts } = await getAllPosts({ page: 1 });

  if (!posts) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  return new Response(JSON.stringify(posts), {
    status: 200,
  });
};
