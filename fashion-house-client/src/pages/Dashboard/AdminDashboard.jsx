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
    queryKey: ["admin-products"],
    queryFn: () => getProducts({ limit: 1000 }),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, orderStatus }) => updateOrderStatus(id, { orderStatus }),
    onMutate: async ({ id, orderStatus }) => {
      await queryClient.cancelQueries({ queryKey: ["admin-orders"] });
      const prev = queryClient.getQueryData(["admin-orders"]);
      queryClient.setQueryData(["admin-orders"], (old) => {
        const orders = Array.isArray(old) ? old : old?.orders ?? [];
        const updated = orders.map((o) =>
          (o._id === id) ? { ...o, orderStatus } : o
        );
        return Array.isArray(old) ? updated : { ...old, orders: updated };
      });
      return { prev };
    },
    onError: (_err, _vars, ctx) => {
      if (ctx?.prev) queryClient.setQueryData(["admin-orders"], ctx.prev);
      toast.error("Failed to update status");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onSuccess: () => {
      toast.success("Order status updated");
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
            return (
              <div key={key} className="rounded-lg border border-border p-3 text-center">
                <div className={`mx-auto mb-2 flex size-8 items-center justify-center rounded-full ${config.color}`}>
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
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/orders">
              View All
              <ArrowUpRight className="size-4" data-icon="inline-start" />
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
                const cfg = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.pending;
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
                      <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${cfg.color}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <select
                        value={order.orderStatus}
                        disabled={statusMutation.isPending}
                        onChange={(e) =>
                          statusMutation.mutate({ id: order._id, orderStatus: e.target.value })
                        }
                        className="rounded-lg border border-border bg-background px-2 py-1 text-xs outline-none focus:border-ring"
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
    </div>
  );
}
