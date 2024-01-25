import { getPostById } from "../../lib/Posts";

export const GET = async ({ request }) => {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  if (!id) {
    return new Response(
      JSON.stringify({
        msg: "field id is required",
      }),
      {
        status: 404,
        statustext: "not found",
      }
    );
  }

  try {
    const data = await getPostById({ id });

    if (!data) {
      return new Response(null, {
        status: 404,
        statustext: "not found",
      });
    }

    return new Response(JSON.stringify({ ...data, id: data._id }), {
      status: 200,
    });
  } catch (err) {
    console.log(err)
    return new Response(null, {
      status: 500,
      statustext: "Server error",
    });

  }

};
