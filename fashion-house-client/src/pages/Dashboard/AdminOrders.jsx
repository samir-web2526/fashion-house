import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Package, Eye, ChevronDown } from "lucide-react";
import { getAllOrders, updateOrderStatus } from "@/services/order.api";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

const statusOptions = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const statusColors = {
  pending: "bg-muted text-muted-foreground border-border",
  confirmed: "bg-muted text-foreground border-border",
  processing: "bg-foreground text-background border-foreground",
  shipped: "bg-muted text-foreground border-border",
  delivered: "bg-primary text-primary-foreground border-primary",
  cancelled: "bg-muted text-muted-foreground border-border",
};

export default function AdminOrders() {
  const { siteName } = useSettings();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => {
      const res = await getAllOrders();
      return Array.isArray(res) ? res : res.orders ?? [];
    },
  });

  const orders = Array.isArray(data) ? data : [];

  const statusMutation = useMutation({
    mutationFn: ({ id, orderStatus }) => updateOrderStatus(id, orderStatus),
    onSuccess: () => {
      toast.success("Order status updated");
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to update status");
    },
  });

  const filteredOrders =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => o.orderStatus === statusFilter);

  const statusCounts = orders.reduce((acc, o) => {
    const s = o.orderStatus || "pending";
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const formatDate = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  const formatStatus = (s) =>
    s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, " ");

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{`Admin Orders | ${siteName}`}</title>
      </Helmet>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          Orders ({filteredOrders.length})
        </h1>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setStatusFilter("all")}
          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
            statusFilter === "all"
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-card text-muted-foreground hover:bg-muted"
          }`}
        >
          All ({orders.length})
        </button>
        {statusOptions.map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === status
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card text-muted-foreground hover:bg-muted"
            }`}
          >
            {formatStatus(status)}
            {statusCounts[status] ? ` (${statusCounts[status]})` : ""}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-xl border border-border bg-card py-20 text-center">
          <Package className="mx-auto size-12 text-muted-foreground/30" />
          <p className="mt-3 text-sm text-muted-foreground">No orders found.</p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border bg-muted/50">
              <tr>
                <th className="px-4 py-3 font-medium text-muted-foreground">Order ID</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Customer</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Items</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Total</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Payment</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Date</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredOrders.map((order, i) => (
                <motion.tr
                  key={order._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="bg-card transition-colors hover:bg-muted/30"
                >
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                    {order._id?.slice(-8)}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-foreground">
                      {order.shippingAddress?.fullName || "N/A"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {order.shippingAddress?.phone || ""}
                    </p>
                  </td>
                  <td className="px-4 py-3 text-foreground">
                    {order.items?.length ?? 0}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">
                    ৳{(order.totalPrice ?? 0).toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs text-muted-foreground">
                      {order.paymentMethod}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {formatDate(order.createdAt)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="relative inline-block">
                      <select
                        value={order.orderStatus || "pending"}
                        disabled={statusMutation.isPending}
                        onChange={(e) =>
                          statusMutation.mutate({
                            id: order._id,
                            orderStatus: e.target.value,
                          })
                        }
                        className={`appearance-none rounded-full border px-3 py-1 pr-7 text-xs font-medium ${
                          statusColors[order.orderStatus] || "bg-gray-100 text-gray-800"
                        } cursor-pointer focus:outline-none`}
                      >
                        {statusOptions.map((s) => (
                          <option key={s} value={s}>
                            {formatStatus(s)}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 size-3 -translate-y-1/2 text-current" />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Button asChild variant="ghost" size="sm">
                      <Link to={`/dashboard/orders/${order._id}`}>
                        <Eye className="size-4" />
                      </Link>
                    </Button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
