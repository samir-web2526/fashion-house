import { createBrowserRouter } from "react-router";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import AdminRoute from "./AdminRoute";

import Home from "../pages/Home/Home";
import Login from "../pages/Auth/Login";
import Products from "../pages/Products/Products";
import ProductDetails from "../pages/Products/ProductDetails";
import Cart from "../pages/Cart/Cart";
import Checkout from "../pages/Checkout/Checkout";
import MyOrders from "../pages/Orders/MyOrders";
import OrderDetails from "../pages/Orders/OrderDetails";
import AdminDashboard from "../pages/Dashboard/AdminDashboard";
import AdminProducts from "../pages/Dashboard/AdminProducts";
import AdminProductDetails from "@/pages/Dashboard/AdminProductDetails";
import NotFound from "../pages/Error/NotFound";
import AdminCategories from "@/pages/Dashboard/AdminCategories";
import AdminOrders from "@/pages/Dashboard/AdminOrders";
import AdminOrderDetails from "@/pages/Dashboard/AdminOrderDetails";
import AdminUsers from "@/pages/Dashboard/AdminUsers";
import AdminSettings from "@/pages/Dashboard/AdminSettings";
import AdminBanners from "@/pages/Dashboard/AdminBanners";

import Terms from "@/pages/Static/Terms";
import Privacy from "@/pages/Static/Privacy";
import ReturnPolicy from "@/pages/Static/ReturnPolicy";
import DeliveryRules from "@/pages/Static/DeliveryRules";
import Contact from "@/pages/Static/Contact";
import About from "@/pages/Static/About";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Home />,
      },
      {
        path: "products",
        element: <Products />,
      },
      {
        path: "product/:id",
        element: <ProductDetails />,
      },
      {
        path: "cart",
        element: <Cart />,
      },
      {
        path: "checkout",
        element: <Checkout />,
      },
      {
        path: "orders",
        element: <MyOrders />,
      },
      {
        path: "orders/:id",
        element: <OrderDetails />,
      },
      {
        path: "terms",
        element: <Terms />,
      },
      {
        path: "privacy",
        element: <Privacy />,
      },
      {
        path: "return-policy",
        element: <ReturnPolicy />,
      },
      {
        path: "delivery-rules",
        element: <DeliveryRules />,
      },
      {
        path: "contact",
        element: <Contact />,
      },
      {
        path: "about",
        element: <About />,
      },
    ],
  },

  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Login />,
      },
    ],
  },

  {
    path: "/dashboard",
    element: <AdminRoute><DashboardLayout /></AdminRoute>,
    children: [
      {
        index: true,
        element: <AdminDashboard />,
      },
      {
        path: "products",
        element: <AdminProducts />,
      },
      {
        path: "products/:id",
        element: <AdminProductDetails />,
      },
      {
        path: "categories",
        element: <AdminCategories />,
      },
      {
        path: "orders",
        element: <AdminOrders />,
      },
      {
        path: "orders/:id",
        element: <AdminOrderDetails />,
      },
      {
        path: "users",
        element: <AdminUsers />,
      },
      {
        path: "settings",
        element: <AdminSettings />,
      },
      {
        path: "banners",
        element: <AdminBanners />,
      }
    ],
  },

  {
    path: "*",
    element: <NotFound />,
  },
]);

export default router;
