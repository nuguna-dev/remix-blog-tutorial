import { Outlet, useLoaderData, useTransition } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Link } from "react-router-dom";
import { getPosts } from "~/models/post.server";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader: LoaderFunction = async () => {
  return json<LoaderData>({ posts: await getPosts() });
};

export default function PostAdmin() {
  const { posts } = useLoaderData<LoaderData>();
  const optimisticNewPost = useOptimisticNewPost();
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="my-6 mb-2 border-b-2 text-center text-3xl">Blog Admin</h1>
      <div className="grid grid-cols-4 gap-6">
        <nav className="col-span-4 md:col-span-1">
          <ul>
            {posts.map((post) => {
              return (
                <li key={post.slug}>
                  <Link to={post.slug} className="text-blue-600 underline">
                    {post.title}
                  </Link>
                </li>
              );
            })}
            {optimisticNewPost}
          </ul>
        </nav>
        <main className="col-span-4 md:col-span-3">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function useOptimisticNewPost() {
  const transition = useTransition();
  const isSubmitting = transition.state === "submitting";
  const formData = transition.submission?.formData;
  const isCreating = isSubmitting && formData?.get("_action") === "create";
  const newTitle = formData?.get("title");
  const newSlug = formData?.get("slug");
  return (
    isCreating &&
    typeof newTitle === "string" &&
    typeof newSlug === "string" && (
      <li>
        <Link to={newSlug} className="text-blue-600 underline">
          {newTitle}
        </Link>
      </li>
    )
  );
}
