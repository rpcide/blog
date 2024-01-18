import { API_USERS_URL } from "../../config";
import { getAllPosts, createPost } from "../../lib/Posts";

export const GET = async ({ request }) => {
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

export const POST = async ({ request }) => {
  const data = await request.json();

  // check user
  const userResponse = await fetch(`${API_USERS_URL}/user/${data.authorId}`);
  const { data: user } = await userResponse.json();

  if (!user) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  const response = await createPost(data);

  if (!response) {
    return new Response(null, {
      status: 404,
      statusText: "Not found",
    });
  }

  return new Response(JSON.stringify(response), {
    status: 201,
  });
};
