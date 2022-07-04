import {
  Form,
  Link,
  useActionData,
  useLoaderData,
  useTransition,
} from "@remix-run/react";
import type { ActionFunction, LoaderFunction } from "@remix-run/server-runtime";
import { json, redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import type { Post } from "~/models/post.server";
import { deletePost, getPost, updatePost } from "~/models/post.server";

const inputClassName = `w-full rounded border border-gray-500 px-2 py-1 text-lg`;

type LoaderData = { post: Post };
export const loader: LoaderFunction = async ({ params }) => {
  invariant(params.slug, `params.slug is required`);

  const post = await getPost(params.slug);
  invariant(post, `Post not found: ${params.slug}`);

  return json<LoaderData>({ post });
};

export default function EditPost() {
  const { post } = useLoaderData<LoaderData>();
  const errors = useActionData<ActionData>();
  const transition = useTransition();
  const isUploading = Boolean(transition.submission);
  return (
    <Form method="put">
      <Link to="../" className="text-red-600 underline">
        Go Back
      </Link>
      <p>
        <label>
          Post Title:{" "}
          {errors?.title ? (
            <em className="text-red-600">{errors.title}</em>
          ) : null}
          <input
            type="text"
            name="title"
            className={inputClassName}
            defaultValue={post.title}
          />
        </label>
      </p>
      <p>
        <label>
          Post Slug:{" "}
          {errors?.slug ? (
            <em className="text-red-600">{errors.slug}</em>
          ) : null}
          <input
            type="text"
            name="slug"
            className={inputClassName}
            defaultValue={post.slug}
          />
        </label>
      </p>
      <p>
        <label htmlFor="markdown">Markdown: </label>
        {errors?.markdown ? (
          <em className="text-red-600">{errors.markdown}</em>
        ) : null}
        <br />
        <textarea
          id="markdown"
          rows={20}
          name="markdown"
          className={`${inputClassName} font-mono`}
          key={`blog-admin-text-area-${post.markdown}`}
          defaultValue={post.markdown}
        />
      </p>
      <p className="text-right">
        <button
          disabled={isUploading}
          type="submit"
          name="_action"
          value="delete"
          formMethod="delete"
          className="mr-4 rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
        >
          {isUploading ? "Updating..." : "Delete Post"}
        </button>
        <button
          disabled={isUploading}
          type="submit"
          name="_action"
          value="update"
          formMethod="put"
          className="rounded bg-blue-500 py-2 px-4 text-white hover:bg-blue-600 focus:bg-blue-400 disabled:bg-blue-300"
        >
          {isUploading ? "Updating..." : "Update Post"}
        </button>
      </p>
    </Form>
  );
}

type ActionData =
  | {
      title: null | string;
      slug: null | string;
      markdown: null | string;
    }
  | undefined;

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  const action = formData.get("_action");
  const slug = formData.get("slug");
  const title = formData.get("title");
  const markdown = formData.get("markdown");
  const errors: ActionData = {
    title: title ? null : "Title is required",
    slug: slug ? null : "Slug is required",
    markdown: markdown ? null : "Markdown in required",
  };
  invariant(typeof slug === "string", "slug must be a string");
  if (action === "delete") {
    console.log("Deleting");
    await deletePost(slug);
    return redirect("/posts/admin");
  }
  const hasErrors = Object.values(errors).some((errorMessage) => errorMessage);
  if (hasErrors) {
    return json<ActionData>(errors);
  }
  invariant(typeof title === "string", "title must be a string");
  invariant(typeof markdown === "string", "markdown must be a string");
  await updatePost({ title, slug, markdown });
  return redirect("/posts/admin");
};
