import { RouterProvider } from "react-router-dom";
import { appRouter } from "./app.router";
import { QueryProvider } from "../providers/query.provider";

export function App() {
  return (
    <QueryProvider>
      <RouterProvider router={appRouter} />
    </QueryProvider>
  );
}
