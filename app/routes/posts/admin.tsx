import { useLoaderData } from "@remix-run/react";
import type { LoaderFunction } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import { Link, Outlet } from "react-router-dom";
import LoadedComponent from "~/components/loaded";
import { getPosts } from "~/models/post.server";

type LoaderData = {
  posts: Awaited<ReturnType<typeof getPosts>>;
};

export const loader: LoaderFunction = async () => {
  console.log("Loader is called");
  return json<LoaderData>({ posts: await getPosts() });
};

export default function PostAdmin() {
  const { posts } = useLoaderData<LoaderData>();
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
          </ul>
        </nav>
        <main className="col-span-4 md:col-span-3">
          <LoadedComponent />
          <LoadedComponent />
          <LoadedComponent />
          <LoadedComponent />
          <Outlet />
        </main>
      </div>
    </div>
  );
}
