import { createBrowserRouter } from "react-router-dom";
import Layout from "@/layouts/layout";
import Home from "@/pages/Home";
import Note from "@/pages/Note";

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      {
        path: '/',
        element: <Home />
      },
      {
        path: '/note/:id',
        element: <Note />
      }
    ],
  },
]);

export default router;
