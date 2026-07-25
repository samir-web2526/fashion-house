import { Link, useParams, useNavigate } from "react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { ArrowLeft, Package, Truck, MapPin, CreditCard, X } from "lucide-react";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";
import { getOrderById, cancelOrder } from "@/services/order.api";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT } from "@/utils/currency";

const STATUS_STEPS = ["pending", "confirmed", "processing", "shipped", "delivered"];

function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-64 w-full rounded-xl" />
    </div>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function OrderDetails() {
  const { siteName } = useSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: order, isLoading } = useQuery({
    queryKey: ["order", id],
    queryFn: () => getOrderById(id),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: cancelOrder,
    onSuccess: () => {
      toast.success("Order cancelled");
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["order", id] });
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || "Failed to cancel order");
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <Helmet>
          <title>{`Order Details | ${siteName}`}</title>
        </Helmet>
        <div className="mx-auto max-w-4xl">
          <DetailSkeleton />
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
        <Helmet>
          <title>{`Order Details | ${siteName}`}</title>
        </Helmet>
        <div className="mx-auto max-w-4xl text-center py-20">
          <p className="text-sm text-muted-foreground">Order not found.</p>
          <Button className="mt-4 rounded-lg" onClick={() => navigate("/orders")}>
            Back to Orders
          </Button>
        </div>
      </div>
    );
  }

  const currentStep = STATUS_STEPS.indexOf(order.orderStatus);

  return (
    <div className="min-h-screen bg-background px-4 py-8 sm:px-6 lg:px-8">
      <Helmet>
        <title>Order Details | {siteName}</title>
      </Helmet>
      <div className="mx-auto max-w-4xl">
        <Button
          variant="ghost"
          size="sm"
          className="mb-6"
          onClick={() => navigate("/orders")}
        >
          <ArrowLeft className="size-4" data-icon="inline-start" />
          Back to Orders
        </Button>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Order #{order._id?.slice(-8).toUpperCase()}
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            {order.orderStatus === "pending" && (
              <Button
                variant="destructive"
                size="sm"
                className="rounded-lg"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate(order._id)}
              >
                <X className="size-4" data-icon="inline-start" />
                Cancel Order
              </Button>
            )}
          </div>

          {order.orderStatus !== "cancelled" && (
            <div className="mb-8 rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
              <div className="flex items-center justify-between">
                {STATUS_STEPS.map((step, i) => (
                  <div key={step} className="flex flex-1 items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex size-7 items-center justify-center rounded-full text-[11px] font-bold sm:size-8 sm:text-xs ${
                          i <= currentStep
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {i + 1}
                      </div>
                      <span className="mt-1 hidden text-[9px] capitalize text-muted-foreground sm:block sm:text-[11px]">
                        {step}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div
                        className={`mx-0.5 h-0.5 flex-1 sm:mx-1 ${
                          i < currentStep ? "bg-primary" : "bg-muted"
                        }`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {order.orderStatus === "cancelled" && (
            <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
              This order has been cancelled.
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <div className="mb-4 flex items-center gap-2">
                  <Package className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">Items ({order.totalItems})</h2>
                </div>
                <div className="divide-y divide-border">
                  {order.items?.map((item) => (
                    <div key={item.productId} className="flex gap-3 py-3 first:pt-0 last:pb-0 sm:gap-4">
                      <img
                        src={item.thumbnail}
                        alt={item.title}
                        className="size-14 shrink-0 rounded-lg object-cover sm:size-16"
                      />
                      <div className="min-w-0 flex-1">
                        <Link
                          to={`/products/${item.productId}`}
                          className="text-sm font-medium text-foreground hover:underline"
                        >
                          {item.title}
                        </Link>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          Qty: {item.quantity} × {formatBDT(item.price)}
                        </p>
                      </div>
                      <span className="shrink-0 text-sm font-medium text-foreground">
                        {formatBDT(item.subtotal)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6 lg:col-span-1">
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <h2 className="mb-3 text-sm font-semibold text-foreground">Order Total</h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatBDT(order.subtotal ?? order.totalPrice)}</span>
                  </div>
                  {order.shippingCost != null && (
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping {order.deliveryArea === "inside_dhaka" ? "(Dhaka)" : order.deliveryArea === "outside_dhaka" ? "(Outside Dhaka)" : ""}</span>
                      {order.shippingCost > 0 ? (
                        <span>{formatBDT(order.shippingCost)}</span>
                      ) : (
                        <span className="text-emerald-600">Free</span>
                      )}
                    </div>
                  )}
                  <div className="border-t border-border pt-2">
                    <div className="flex justify-between font-bold text-foreground">
                      <span>Total</span>
                      <span>{formatBDT(order.totalPrice)}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <MapPin className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">Shipping Address</h2>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium text-foreground">{order.shippingAddress?.fullName}</p>
                  <p>{order.shippingAddress?.phone}</p>
                  <p>{order.shippingAddress?.address}</p>
                  <p>{order.shippingAddress?.city}, {order.shippingAddress?.postalCode}</p>
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm sm:p-6">
                <div className="mb-3 flex items-center gap-2">
                  <CreditCard className="size-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">Payment</h2>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>{order.paymentMethod}</p>
                  <p className="mt-1 capitalize">Status: {order.paymentStatus}</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
