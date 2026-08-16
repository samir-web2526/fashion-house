import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import {
  DollarSign, ShoppingCart, Package, TrendingUp,
  Clock, CheckCircle, Truck, XCircle, ArrowUpRight,
  BarChart3,
} from "lucide-react";
import { getAllOrders, updateOrderStatus } from "@/services/order.api";
import { formatBDT } from "@/utils/currency";
import { getProducts } from "@/services/product.api";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

const STATUS_CONFIG = {
  pending: { label: "Pending", color: "bg-muted text-muted-foreground", icon: Clock },
  confirmed: { label: "Confirmed", color: "bg-muted text-foreground", icon: CheckCircle },
  processing: { label: "Processing", color: "bg-muted text-foreground", icon: Package },
  shipped: { label: "Shipped", color: "bg-muted text-foreground", icon: Truck },
  delivered: { label: "Delivered", color: "bg-primary text-primary-foreground", icon: CheckCircle },
  cancelled: { label: "Cancelled", color: "bg-muted text-muted-foreground", icon: XCircle },
};

function StatCard({ title, value, icon: Icon, color, loading, delay }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="rounded-xl border border-border bg-card p-5 shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          {loading ? (
            <Skeleton className="mt-2 h-8 w-20" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-foreground">{value}</p>
          )}
        </div>
        <div className={`flex size-12 items-center justify-center rounded-xl ${color}`}>
          <Icon className="size-6" />
        </div>
      </div>
    </motion.div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
      <Skeleton className="h-96 rounded-xl" />
    </div>
  );
}

export default function AdminDashboard() {
  const { siteName } = useSettings();
  const queryClient = useQueryClient();

  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: getAllOrders,
  });

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ["admin-dashboard-products"],
    queryFn: () => getProducts({ limit: 50 }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, orderStatus }) => updateOrderStatus(id, { orderStatus }),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update status");
    },
  });

  const orders = ordersData?.orders ?? [];
  const products = productsData?.products ?? [];
  const isLoading = ordersLoading || productsLoading;

  const totalRevenue = orders
    .filter((o) => o.orderStatus !== "cancelled")
    .reduce((sum, o) => sum + (o.totalPrice ?? 0), 0);

  const ordersByStatus = orders.reduce((acc, o) => {
    acc[o.orderStatus] = (acc[o.orderStatus] || 0) + 1;
    return acc;
  }, {});

  const recentOrders = orders.slice(0, 8);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Helmet>
          <title>{`Admin Dashboard | ${siteName}`}</title>
        </Helmet>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>
        <DashboardSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Helmet>
        <title>Admin Dashboard | {siteName}</title>
      </Helmet>
      <h1 className="text-2xl font-bold tracking-tight text-foreground">Admin Dashboard</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Revenue"
          value={formatBDT(totalRevenue)}
          icon={DollarSign}
          color="bg-muted text-foreground"
          delay={0}
        />
        <StatCard
          title="Total Orders"
          value={ordersData?.totalOrders ?? orders.length}
          icon={ShoppingCart}
          color="bg-muted text-foreground"
          delay={0.05}
          loading={ordersLoading}
        />
        <StatCard
          title="Total Products"
          value={productsData?.total ?? products.length}
          icon={Package}
          color="bg-muted text-foreground"
          delay={0.1}
          loading={productsLoading}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="mb-4 flex items-center gap-2">
          <BarChart3 className="size-5 text-muted-foreground" />
          <h2 className="text-base font-semibold text-foreground">Orders by Status</h2>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {Object.entries(STATUS_CONFIG).map(([key, config]) => {
            const Icon = config.icon;
            const count = ordersByStatus[key] || 0;
            const colorClass =
              key === "pending" ? "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400" :
              key === "confirmed" ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" :
              key === "processing" ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400" :
              key === "shipped" ? "bg-cyan-100 text-cyan-600 dark:bg-cyan-900/30 dark:text-cyan-400" :
              key === "delivered" ? "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400" :
              key === "cancelled" ? "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400" :
              "bg-muted text-muted-foreground";
            return (
              <div key={key} className="rounded-lg border border-border p-3 text-center">
                <div className={`mx-auto mb-2 flex size-8 items-center justify-center rounded-full ${colorClass}`}>
                  <Icon className="size-4" />
                </div>
                <p className="text-lg font-bold text-foreground">{count}</p>
                <p className="text-[11px] text-muted-foreground">{config.label}</p>
              </div>
            );
          })}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="rounded-xl border border-border bg-card shadow-sm"
      >
        <div className="flex items-center justify-between border-b border-border p-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-muted-foreground" />
            <h2 className="text-base font-semibold text-foreground">Recent Orders</h2>
          </div>
          <Button variant="ghost" size="sm" asChild className="text-muted-foreground hover:text-foreground">
            <Link to="/dashboard/orders" className="flex items-center gap-1.5">
              View All
              <ArrowUpRight className="size-4" />
            </Link>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-border text-muted-foreground">
                <th className="px-5 py-3 font-medium">Order ID</th>
                <th className="px-5 py-3 font-medium">Customer</th>
                <th className="px-5 py-3 font-medium">Items</th>
                <th className="px-5 py-3 font-medium">Total</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3 font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentOrders.map((order) => {
                return (
                  <tr key={order._id} className="hover:bg-muted/30">
                    <td className="px-5 py-3 font-medium text-foreground">
                      #{order._id?.slice(-8).toUpperCase()}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">
                      {order.shippingAddress?.fullName || "—"}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{order.totalItems}</td>
                    <td className="px-5 py-3 font-medium text-foreground">
                      {formatBDT(order.totalPrice)}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        order.orderStatus === "pending" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                        order.orderStatus === "confirmed" ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
                        order.orderStatus === "processing" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" :
                        order.orderStatus === "shipped" ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" :
                        order.orderStatus === "delivered" ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" :
                        order.orderStatus === "cancelled" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                        "bg-muted text-muted-foreground"
                      }`}>
                        {STATUS_CONFIG[order.orderStatus]?.label || order.orderStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={order.orderStatus}
                        disabled={statusMutation.isPending}
                        onChange={(e) =>
                          statusMutation.mutate({ id: order._id, orderStatus: e.target.value })
                        }
                        className={`rounded-full border px-3 py-1 pr-7 text-xs font-medium focus:outline-none ${
                          order.orderStatus === "pending" ? "border-amber-300 bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-700" :
                          order.orderStatus === "confirmed" ? "border-blue-300 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-700" :
                          order.orderStatus === "processing" ? "border-purple-300 bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-700" :
                          order.orderStatus === "shipped" ? "border-cyan-300 bg-cyan-50 text-cyan-700 dark:bg-cyan-900/20 dark:text-cyan-400 dark:border-cyan-700" :
                          order.orderStatus === "delivered" ? "border-green-300 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 dark:border-green-700" :
                          order.orderStatus === "cancelled" ? "border-red-300 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 dark:border-red-700" :
                          "border-border bg-background text-foreground"
                        }`}
                      >
                        {Object.keys(STATUS_CONFIG).map((s) => (
                          <option key={s} value={s}>
                            {STATUS_CONFIG[s].label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                );
              })}
              {recentOrders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted-foreground">
                    No orders yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="rounded-xl border border-border bg-card p-5 shadow-sm"
      >
        <h3 className="mb-3 text-sm font-semibold text-foreground">Low Stock Products</h3>
        <div className="space-y-2">
          {products
            .filter((p) => p.stock <= 10 && p.stock > 0)
            .sort((a, b) => a.stock - b.stock)
            .slice(0, 5)
            .map((p) => (
              <div key={p._id} className="flex items-center justify-between text-sm">
                <span className="truncate text-muted-foreground">{p.title}</span>
                <span className="ml-2 shrink-0 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:bg-red-900/30 dark:text-red-400">
                  {p.stock} left
                </span>
              </div>
            ))}
          {products.filter((p) => p.stock <= 10 && p.stock > 0).length === 0 && (
            <p className="text-xs text-muted-foreground">All products well stocked.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}
