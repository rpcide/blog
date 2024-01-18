import { API_USERS_URL } from "../../config";
import { getAllPosts, createPost } from "../../lib/Posts";
import { verifyToken } from "../../lib/user";

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
  const isValidUser = await verifyToken(data.token);

  if (isValidUser.error) {
    return new Response(null, {
      status: 401,
      statusText: "Unauthorized",
    });
  }

  const response = await createPost(data.data);

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
