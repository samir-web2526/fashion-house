import { Link, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { Package, Truck, X, ArrowLeft, MapPin, Calendar, ShoppingBag } from "lucide-react";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import { getOrders, cancelOrder } from "@/services/order.api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT } from "@/utils/currency";

const STATUS_COLORS = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  confirmed: "bg-blue-100 text-blue-800 border-blue-200",
  processing: "bg-indigo-100 text-indigo-800 border-indigo-200",
  shipped: "bg-purple-100 text-purple-800 border-purple-200",
  delivered: "bg-green-100 text-green-800 border-green-200",
  cancelled: "bg-red-100 text-red-800 border-red-200",
};

const STATUS_STEP = {
  pending: 0,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
};

const STEPS = ["Pending", "Confirmed", "Processing", "Shipped", "Delivered"];

function OrderSkeleton() {
  return (
    <div className="space-y-5">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-2xl border border-border bg-card">
          <div className="p-5">
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="mt-3 h-4 w-48" />
          </div>
          <div className="flex gap-3 border-t border-border p-5">
            <Skeleton className="size-16 rounded-xl" />
            <Skeleton className="size-16 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function ProgressTracker({ status }) {
  const currentStep = STATUS_STEP[status] ?? 0;

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, i) => (
        <div key={step} className="flex items-center">
          <div
            className={`size-2 rounded-full transition-colors ${
              i <= currentStep ? "bg-primary" : "bg-muted"
            }`}
          />
          {i < STEPS.length - 1 && (
            <div
              className={`h-0.5 w-4 ${
                i < currentStep ? "bg-primary" : "bg-muted"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function MyOrders() {
  const { siteName } = useSettings();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: getOrders,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast.success("Order cancelled");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to cancel order");
    },
  });

  const orders = data?.orders ?? [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <Helmet>
          <title>{`My Orders | ${siteName}`}</title>
        </Helmet>
        <div className="mx-auto max-w-4xl">
          <h1 className="mb-6 text-2xl font-bold tracking-tight text-foreground">My Orders</h1>
          <OrderSkeleton />
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <Helmet>
          <title>{`My Orders | ${siteName}`}</title>
        </Helmet>
        <div className="mx-auto max-w-4xl text-center">
          <div className="flex flex-col items-center gap-4 py-20">
            <div className="flex size-20 items-center justify-center rounded-full bg-muted">
              <Package className="size-10 text-muted-foreground/40" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">No orders yet</h1>
            <p className="max-w-sm text-sm text-muted-foreground">
              You haven&apos;t placed any orders yet. Start exploring our products and make your first purchase!
            </p>
            <Button asChild className="mt-2 rounded-lg">
              <Link to="/products">Start Shopping</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <Helmet>
        <title>My Orders | {siteName}</title>
      </Helmet>
      <div className="mx-auto max-w-4xl">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/")}>
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back to Home
        </Button>

        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            My Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length} {orders.length === 1 ? "order" : "orders"} placed
          </p>
        </div>

        <div className="space-y-5">
          {orders.map((order, i) => (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
            >
              <div className="border-b border-border bg-muted/30 px-4 py-3 sm:px-5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <h3 className="truncate text-sm font-bold text-foreground">
                      Order #{order._id?.slice(-8).toUpperCase()}
                    </h3>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize ${STATUS_COLORS[order.orderStatus] || "bg-gray-100 text-gray-800 border-gray-200"}`}>
                      {order.orderStatus}
                    </span>
                    <ProgressTracker status={order.orderStatus} />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <Button variant="outline" size="sm" asChild className="rounded-lg text-xs">
                    <Link to={`/orders/${order._id}`} className="flex items-center gap-1">
                      <Truck className="size-3" />
                      Track
                    </Link>
                  </Button>
                  {order.orderStatus === "pending" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg border-red-200 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                      disabled={cancelMutation.isPending}
                      onClick={() => cancelMutation.mutate(order._id)}
                    >
                      <X className="size-3" data-icon="inline-start" />
                      Cancel
                    </Button>
                  )}
                </div>
              </div>

              <div className="p-4 sm:p-5">
                <div className="mb-4 flex gap-3 overflow-x-auto">
                  {order.items?.slice(0, 5).map((item) => (
                    <img
                      key={item.productId}
                      src={item.thumbnail}
                      alt={item.title}
                      className="size-14 shrink-0 rounded-xl object-cover ring-1 ring-border sm:size-16"
                    />
                  ))}
                  {order.items?.length > 5 && (
                    <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-muted text-xs font-medium text-muted-foreground sm:size-16">
                      +{order.items.length - 5}
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 border-t border-border pt-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground sm:text-xs">
                    <span className="flex items-center gap-1">
                      <Calendar className="size-3" />
                      {formatDate(order.createdAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShoppingBag className="size-3" />
                      {order.totalItems} {order.totalItems === 1 ? "item" : "items"}
                    </span>
                    {order.shippingAddress?.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="size-3" />
                        {order.shippingAddress.city}
                      </span>
                    )}
                  </div>
                  <span className="text-base font-bold text-foreground sm:text-lg">
                    {formatBDT(order.totalPrice)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
