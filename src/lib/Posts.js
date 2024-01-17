import { PAGE_LIMIT } from "../config";
import { Posts } from "./mongodb";

/**
 * Get the count posts
 * @returns Count all posts elements
 */
export const count = async () => {
  return (await Posts()).count();
};

export const getAllPosts = async ({ page } = { page: 1 }) => {
  const countPosts = await count();

  const posts = await (
    await Posts()
  )
    .find({})
    .skip(PAGE_LIMIT * (page - 1))
    .limit(PAGE_LIMIT)
    .toArray();

  return {
    page,
    posts,
    count: countPosts,
    hasNext: page * PAGE_LIMIT < countPosts,
  };
};

export const getPostBySlug = async (slug) => {
  return await (
    await Posts()
  ).findOne({
    slug: slug,
  });
};
