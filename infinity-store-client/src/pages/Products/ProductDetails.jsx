import { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { X, Star, ShoppingCart, Truck, Shield, RotateCcw } from "lucide-react";
import { getProductById } from "@/services/product.api";
import { useAddToCart } from "@/hooks/useAddToCart";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatBDT } from "@/utils/currency";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

function ModalSkeleton() {
  return (
    <div className="flex flex-col gap-6 lg:flex-row">
      <Skeleton className="aspect-square w-full rounded-xl lg:w-1/2" />
      <div className="flex-1 space-y-4">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export default function ProductDetails() {
  const { siteName } = useSettings();
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useAddToCart();
  const { user } = useAuth();
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  const handleAddToCart = async (productId) => {
    await addToCart(productId);
    setAddedToCart(true);
  };

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", id],
    queryFn: () => getProductById(id),
    enabled: !!id,
  });

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === "Escape") navigate(-1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [navigate]);

  const close = () => navigate(-1);

  const hasDiscount = product?.discountPercentage > 0;
  const discountedPrice = hasDiscount
    ? (product.price * (1 - product.discountPercentage / 100)).toFixed(2)
    : null;

  const allImages = useMemo(() => {
    if (!product) return [];
    const imgs = [];
    if (product.thumbnail) imgs.push(product.thumbnail);
    if (product.images?.length) {
      product.images.forEach((img) => {
        if (img !== product.thumbnail) imgs.push(img);
      });
    }
    return imgs.length > 0 ? imgs : [product.thumbnail];
  }, [product]);

  return (
    <AnimatePresence>
      <Helmet><title>{`Product Details | ${siteName}`}</title></Helmet>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        onClick={close}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={close}
            className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
          >
            <X className="size-4" />
          </button>

          <div className="p-5 sm:p-6">
            {isLoading ? (
              <ModalSkeleton />
            ) : !product ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Product not found.
              </div>
            ) : (
              <div className="flex flex-col gap-6 lg:flex-row">
                <div className="flex flex-col gap-3 lg:w-1/2">
                  <div className="relative overflow-hidden rounded-xl bg-muted">
                    <img
                      src={allImages[selectedImage]}
                      alt={product.title}
                      className="aspect-square w-full object-cover"
                    />
                    {hasDiscount && (
                      <div className="absolute left-3 top-3">
                        <Badge variant="destructive" className="text-xs font-semibold">
                          -{Math.round(product.discountPercentage)}%
                        </Badge>
                      </div>
                    )}
                    {product.stock === 0 && (
                      <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                        <Badge variant="destructive" className="text-sm font-semibold">
                          Out of Stock
                        </Badge>
                      </div>
                    )}
                  </div>

                  {allImages.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto pb-1">
                      {allImages.map((img, i) => (
                        <button
                          key={i}
                          onClick={() => setSelectedImage(i)}
                          className={`size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors sm:size-20 ${
                            i === selectedImage
                              ? "border-primary"
                              : "border-border hover:border-muted-foreground/50"
                          }`}
                        >
                          <img
                            src={img}
                            alt={`${product.title} ${i + 1}`}
                            className="h-full w-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-3">
                  {product.brand && (
                    <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {product.brand}
                    </p>
                  )}

                  <h2 className="text-xl font-bold text-foreground sm:text-2xl">
                    {product.title}
                  </h2>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`size-4 ${
                            i < Math.round(product.rating)
                              ? "fill-amber-400 text-amber-400"
                              : "fill-muted text-muted"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm text-muted-foreground">
                      ({product.rating?.toFixed(1)})
                    </span>
                  </div>

                  <div className="flex items-baseline gap-3">
                    <span className="text-2xl font-bold text-foreground">
                      {formatBDT(hasDiscount ? discountedPrice : product.price)}
                    </span>
                    {hasDiscount && (
                      <span className="text-base text-muted-foreground line-through">
                        {formatBDT(product.price)}
                      </span>
                    )}
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>
                      {product.stock > 0
                        ? `${product.stock} in stock`
                        : "Out of stock"}
                    </span>
                    {product.sku && <span>SKU: {product.sku}</span>}
                  </div>

                  {product.stock > 0 && (
                    <div className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className={`text-[11px] ${product.stock <= 5 ? "font-medium text-red-500" : "text-muted-foreground"}`}>
                          {product.stock <= 5 ? `${product.stock} left` : `${product.stock} in stock`}
                        </span>
                        <span className="text-[11px] text-muted-foreground">
                          {Math.round(Math.min((product.stock / 100) * 100, 100))}%
                        </span>
                      </div>
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            product.stock <= 25 ? "bg-red-500" : "bg-primary"
                          }`}
                          style={{ width: `${Math.min((product.stock / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {user?.role !== "admin" && (
                    <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                      <Button
                        size="lg"
                        className="flex-1 rounded-lg"
                        disabled={product.stock === 0}
                        onClick={() => handleAddToCart(product._id)}
                      >
                        <ShoppingCart className="size-4" data-icon="inline-start" />
                        {product.stock === 0 ? "Unavailable" : "Add to Cart"}
                      </Button>
                      <Button
                        variant="outline"
                        size="lg"
                        className="rounded-lg"
                        disabled={product.stock === 0 || !addedToCart}
                        onClick={() => navigate("/checkout")}
                      >
                        {product.stock === 0 ? "Unavailable" : "Buy Now"}
                      </Button>
                    </div>
                  )}

                  <div className="mt-2 grid grid-cols-3 gap-3">
                    <div className="flex flex-col items-center gap-1 rounded-lg border border-border p-2.5 text-center">
                      <Truck className="size-4 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        {product.shippingInformation || "Free Shipping"}
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-lg border border-border p-2.5 text-center">
                      <Shield className="size-4 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        Secure Payment
                      </span>
                    </div>
                    <div className="flex flex-col items-center gap-1 rounded-lg border border-border p-2.5 text-center">
                      <RotateCcw className="size-4 text-muted-foreground" />
                      <span className="text-[11px] text-muted-foreground">
                        {product.returnPolicy || "7 Day Returns"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
