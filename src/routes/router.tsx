import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layouts/layout";
import Home from "@/pages/Home";
import Note from "@/pages/Note";
import Snippet from "@/pages/Snippet";
import Project from "@/pages/Project";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/notes/:id',
        element: <Note />
      },
      {
        path: '/snippets/:id',
        element: <Snippet />
      },
      {
        path: '/projects/:id',
        element: <Project />
      }
    ],
  },
]);

export default router;
