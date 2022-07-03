import { useLoaderData } from "@remix-run/react";

export default function LoadedComponent() {
  // components can use a loader data from a routes
  const data = useLoaderData<string>();
  return <h1> Loaded</h1>;
}
