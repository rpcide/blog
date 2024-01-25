import uniqid from "uniqid";

import { PAGE_LIMIT } from "../config";
import { Posts } from "./mongodb";
import { ObjectId } from "mongodb";

const collection = await Posts();

/**
 * Get the count posts
 * @returns Count all posts elements
 */
export const count = async () => {
  return collection.count();
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

  const posts = await collection
    .find({})
    .sort({ createdAt: -1 })
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
  return await collection.findOne({ slug });
};

export const getPostById = async ({ id }) => {
  return await collection.findOne({ _id: new ObjectId(id) });
};


/**
 * Get all posts by author user
 * @params {*} page: number, authorId: string
 * @returns {
 *  page: number,
 *  posts: Post[],
 *  count: number.
 *  hasNext: boolean
 * }
 */
export const getAllPostsByUser = async ({ page, authorId } = { page: 1 }) => {
  if (!authorId) return null;

  const countPosts = await collection.count({ authorId: authorId });

  const posts = await collection
    .find({
      authorId: authorId,
    })
    .sort({ createdAt: -1 })
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

  const countPosts = await collection.count(filters);

  const posts = await collection
    .find(filters)
    .skip(PAGE_LIMIT * (page - 1))
    .limit(PAGE_LIMIT)
    .toArray();

  return {
    page,
    posts: posts.map(post => {
      return { ...post, id: post._id }
    }),
    count: countPosts,
    hasNext: page * PAGE_LIMIT < countPosts,
  };
};

export const getPostBySlug = async (slug) => {
  return await collection.findOne({
    slug: slug,
  });
};

/**
 * Create post article
 * @param {*} post
 * @returns Post
 */
export const createPost = async (post) => {
  // create unique slug
  let slug = post.title.toLowerCase().replaceAll(" ", "-");

  const existPosts = await getPostsBySlug({ slug });

  if (existPosts) slug += "-" + uniqid();

  const response = await collection.insertOne({ ...post, slug });

  if (!response) return null;

  return {
    ...post,
    slug,
    id: response.insertedId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };
};

/**
 * Update post article
 * @param {*} post
 * @returns Post
 */
export const updatePost = async (post) => {
  // Search by post id and author uid
  const response = await collection.updateOne(
    { _id: new ObjectId(post.id), authorId: post.authorId },
    {
      $set: { ...post, updatedAt: new Date() },
    }
  );

  if (response.modifiedCount === 0) return null;

  return {
    ...post,
  };
};

/**
 * Remove post article
 * @param {*} id: string, authorId: string
 * @returns boolean
 */
export const removePost = async (id, authorId) => {
  // Search by post id and author uid
  const response = await collection.deleteMany({
    _id: new ObjectId(id),
    authorId: authorId,
  });

  if (response.deletedCount === 0) return false;

  return true;
};
