import uniqid from "uniqid";

import { PAGE_LIMIT } from "../config";
import { Posts } from "./mongodb";

/**
 * Get the count posts
 * @returns Count all posts elements
 */
export const count = async () => {
  return (await Posts()).count();
};

/**
 * Get all posts
 * @param {*} page
 * @returns {
 *  page: number,
 *  posts: Post[],
 *  count: number.
 *  hasNext: boolean
 * }
 */
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
    posts: posts.map((el) => {
      return { ...el, id: el._id };
    }),
    count: countPosts,
    hasNext: page * PAGE_LIMIT < countPosts,
  };
};

export const getPostsBySlug = async ({ slug }) => {
  return await (await Posts()).findOne({ slug });
};

export const getPostsByTag = async (
  { tags, search, page } = { search: "", page: 1 }
) => {
  const filters = {};

  if (tags && tags.length > 0) {
    filters.tags = {
      $all: [tags],
    };
  } else {
    filters.title = {
      $regex: search,
      $options: "i",
    };
  }

  const countPosts = await (await Posts()).count(filters);

  const posts = await (
    await Posts()
  )
    .find(filters)
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

export const createPost = async (post) => {
  // create unique slug
  let slug = post.title.toLowerCase().replaceAll(" ", "-");

  const existPosts = await getPostsBySlug({ slug });

  if (existPosts) {
    slug += "-" + uniqid();
  }

  const response = await (await Posts()).insertOne({ ...post, slug });

  if (!response) {
    return null;
  }

  return {
    ...post,
    slug,
    id: response.insertedId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};
