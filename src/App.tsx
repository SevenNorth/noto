import "@/index.css";
import { RouterProvider } from "react-router-dom";
import router from "@/routes/router";
import { Toaster } from "@/components/ui/sonner"

const App = () => {
  return <>
    <Toaster
      richColors
      position="top-center"
      duration={2000}   // 自动消失时间，ms
    />
    <RouterProvider router={router} />
  </>;
};

export default App;
