import { createBrowserRouter } from "react-router";
import Layout from "./components/Layout.tsx";
import Home from "./pages/Home.tsx";
import Create from "./pages/Create.tsx";
import Gallery from "./pages/Gallery.tsx";
import NotFound from "./pages/NotFound.tsx";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: "create", Component: Create },
      { path: "gallery", Component: Gallery },
      { path: "*", Component: NotFound },
    ],
  },
]);
