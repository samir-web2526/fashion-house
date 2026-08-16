import { lazy, Suspense } from "react";
import { createBrowserRouter } from "react-router";

import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import DashboardLayout from "../layouts/DashboardLayout";

import AdminRoute from "./AdminRoute";

const Loading = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-foreground border-t-transparent" />
  </div>
);

const Home = lazy(() => import("../pages/Home/Home"));
const Login = lazy(() => import("../pages/Auth/Login"));
const Products = lazy(() => import("../pages/Products/Products"));
const ProductDetails = lazy(() => import("../pages/Products/ProductDetails"));
const Cart = lazy(() => import("../pages/Cart/Cart"));
const Checkout = lazy(() => import("../pages/Checkout/Checkout"));
const MyOrders = lazy(() => import("../pages/Orders/MyOrders"));
const OrderDetails = lazy(() => import("../pages/Orders/OrderDetails"));
const AdminDashboard = lazy(() => import("../pages/Dashboard/AdminDashboard"));
const AdminProducts = lazy(() => import("../pages/Dashboard/AdminProducts"));
const AdminProductDetails = lazy(() => import("@/pages/Dashboard/AdminProductDetails"));
const NotFound = lazy(() => import("../pages/Error/NotFound"));
const AdminCategories = lazy(() => import("@/pages/Dashboard/AdminCategories"));
const AdminOrders = lazy(() => import("@/pages/Dashboard/AdminOrders"));
const AdminOrderDetails = lazy(() => import("@/pages/Dashboard/AdminOrderDetails"));
const AdminSettings = lazy(() => import("@/pages/Dashboard/AdminSettings"));
const AdminBanners = lazy(() => import("@/pages/Dashboard/AdminBanners"));

const Terms = lazy(() => import("@/pages/Static/Terms"));
const Privacy = lazy(() => import("@/pages/Static/Privacy"));
const ReturnPolicy = lazy(() => import("@/pages/Static/ReturnPolicy"));
const DeliveryRules = lazy(() => import("@/pages/Static/DeliveryRules"));
const Contact = lazy(() => import("@/pages/Static/Contact"));
const About = lazy(() => import("@/pages/Static/About"));
const Profile = lazy(() => import("@/pages/Profile/Profile"));
const ChangePassword = lazy(() => import("@/pages/Profile/ChangePassword"));

const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Suspense fallback={<Loading />}><Home /></Suspense>,
      },
      {
        path: "products",
        element: <Suspense fallback={<Loading />}><Products /></Suspense>,
      },
      {
        path: "product/:id",
        element: <Suspense fallback={<Loading />}><ProductDetails /></Suspense>,
      },
      {
        path: "cart",
        element: <Suspense fallback={<Loading />}><Cart /></Suspense>,
      },
      {
        path: "checkout",
        element: <Suspense fallback={<Loading />}><Checkout /></Suspense>,
      },
      {
        path: "orders",
        element: <Suspense fallback={<Loading />}><MyOrders /></Suspense>,
      },
      {
        path: "orders/:id",
        element: <Suspense fallback={<Loading />}><OrderDetails /></Suspense>,
      },
      {
        path: "terms",
        element: <Suspense fallback={<Loading />}><Terms /></Suspense>,
      },
      {
        path: "privacy",
        element: <Suspense fallback={<Loading />}><Privacy /></Suspense>,
      },
      {
        path: "return-policy",
        element: <Suspense fallback={<Loading />}><ReturnPolicy /></Suspense>,
      },
      {
        path: "delivery-rules",
        element: <Suspense fallback={<Loading />}><DeliveryRules /></Suspense>,
      },
      {
        path: "contact",
        element: <Suspense fallback={<Loading />}><Contact /></Suspense>,
      },
      {
        path: "about",
        element: <Suspense fallback={<Loading />}><About /></Suspense>,
      },
    ],
  },

  {
    element: <AuthLayout />,
    children: [
      {
        path: "/login",
        element: <Suspense fallback={<Loading />}><Login /></Suspense>,
      },
    ],
  },

  {
    path: "/dashboard",
    element: <AdminRoute><DashboardLayout /></AdminRoute>,
    children: [
      {
        index: true,
        element: <Suspense fallback={<Loading />}><AdminDashboard /></Suspense>,
      },
      {
        path: "products",
        element: <Suspense fallback={<Loading />}><AdminProducts /></Suspense>,
      },
      {
        path: "products/:id",
        element: <Suspense fallback={<Loading />}><AdminProductDetails /></Suspense>,
      },
      {
        path: "categories",
        element: <Suspense fallback={<Loading />}><AdminCategories /></Suspense>,
      },
      {
        path: "orders",
        element: <Suspense fallback={<Loading />}><AdminOrders /></Suspense>,
      },
      {
        path: "orders/:id",
        element: <Suspense fallback={<Loading />}><AdminOrderDetails /></Suspense>,
      },
      {
        path: "settings",
        element: <Suspense fallback={<Loading />}><AdminSettings /></Suspense>,
      },
      {
        path: "banners",
        element: <Suspense fallback={<Loading />}><AdminBanners /></Suspense>,
      },
      {
        path: "profile",
        element: <Suspense fallback={<Loading />}><Profile /></Suspense>,
      },
      {
        path: "change-password",
        element: <Suspense fallback={<Loading />}><ChangePassword /></Suspense>,
      }
    ],
  },

  {
    path: "*",
    element: <Suspense fallback={<Loading />}><NotFound /></Suspense>,
  },
]);

export default router;
