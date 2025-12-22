import "@/index.css";
import { RouterProvider } from "react-router-dom";
import router from "@/routes/router";
import { Toaster } from "@/components/ui/sonner"
import { ConfirmProvider } from "@/components/ConfirmProvider"

const App = () => {
  return <ConfirmProvider>
    <Toaster
      richColors
      position="top-center"
      duration={2000}   // 自动消失时间，ms
    />
    <RouterProvider router={router} />
  </ConfirmProvider>;
};

export default App;
