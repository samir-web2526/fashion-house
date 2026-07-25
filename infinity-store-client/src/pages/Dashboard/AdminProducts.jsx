import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { Plus, Eye, Pencil, X, Package, Camera, ImagePlus, Upload, Search, Filter, ChevronDown } from "lucide-react";
import { Link } from "react-router";
import { getProducts, createProduct } from "@/services/product.api";
import { formatBDT } from "@/utils/currency";
import { getCategories } from "@/services/category.api";
import { Button } from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Helmet } from "react-helmet-async";
import useSettings from "@/hooks/useSettings";

const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Category is required"),
  price: z.coerce.number().positive("Price must be greater than 0"),
  discountPercentage: z.coerce.number().min(0).max(100).optional().default(0),
  stock: z.coerce.number().min(0, "Stock cannot be negative"),
  brand: z.string().optional().default(""),
  tags: z.string().optional().default(""),
  warrantyInformation: z.string().optional().default(""),
  shippingInformation: z.string().optional().default(""),
  returnPolicy: z.string().optional().default(""),
});

function ProductSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-lg" />
      ))}
    </div>
  );
}

function getAllCategorySlugs(categories) {
  const slugs = [];
  for (const parent of categories) {
    for (const child of parent.children ?? []) {
      for (const s of child.categories ?? []) {
        slugs.push(s);
      }
    }
  }
  return [...new Set(slugs)];
}

export default function AdminProducts() {
  const { siteName } = useSettings();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [imageFiles, setImageFiles] = useState([]);
  const [thumbnailPreview, setThumbnailPreview] = useState("");
  const [imagePreviews, setImagePreviews] = useState([]);
  const [thumbnailDrag, setThumbnailDrag] = useState(false);
  const [imagesDrag, setImagesDrag] = useState(false);
  const thumbnailInputRef = useRef(null);
  const imagesInputRef = useRef(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stockFilter, setStockFilter] = useState("");
  const [discountFilter, setDiscountFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-products"],
    queryFn: () => getProducts({ limit: 1000 }),
  });

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  const categories = categoriesData ?? [];
  const categorySlugs = getAllCategorySlugs(categories);

  const products = data?.products ?? [];

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(search.toLowerCase()) ||
      product.brand?.toLowerCase().includes(search.toLowerCase()) ||
      product.category?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = !categoryFilter || product.category === categoryFilter;
    const matchesStock =
      stockFilter === "" ||
      (stockFilter === "in-stock" && product.stock > 10) ||
      (stockFilter === "low-stock" && product.stock > 0 && product.stock <= 10) ||
      (stockFilter === "out-of-stock" && product.stock === 0);
    const matchesDiscount =
      discountFilter === "" ||
      (discountFilter === "with-discount" && product.discountPercentage > 0) ||
      (discountFilter === "no-discount" && product.discountPercentage === 0);
    return matchesSearch && matchesCategory && matchesStock && matchesDiscount;
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      price: 0,
      discountPercentage: 0,
      stock: 0,
      brand: "",
      tags: "",
      warrantyInformation: "",
      shippingInformation: "",
      returnPolicy: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Product created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      setShowForm(false);
      resetForm();
    },
    onError: (err) => {
      const data = err?.response?.data;
      if (data?.errors && Array.isArray(data.errors)) {
        data.errors.forEach((e) => {
          const field = e.path?.[e.path.length - 1];
          if (field) setError(field, { message: e.message });
        });
        toast.error("Please fix the errors below");
      } else {
        toast.error(data?.message || data?.error || "Failed to create product");
      }
    },
  });

  const toBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });

  const resetForm = () => {
    setThumbnailFile(null);
    setImageFiles([]);
    setThumbnailPreview("");
    setImagePreviews([]);
    reset();
  };

  const onSubmit = async (formData) => {
    let thumbnail = "";
    let images = [];

    if (thumbnailFile) {
      thumbnail = await toBase64(thumbnailFile);
    }

    if (imageFiles.length > 0) {
      images = await Promise.all(imageFiles.map((f) => toBase64(f)));
    }

    if (!thumbnail && images.length > 0) {
      thumbnail = images[0];
    }

    const payload = {
      ...formData,
      tags: formData.tags ? formData.tags.split(",").map((t) => t.trim()).filter(Boolean) : [],
      thumbnail,
      images,
    };
    createMutation.mutate(payload);
  };

  return (
    <div className="space-y-6">
      <Helmet>
        <title>{`Admin Products | ${siteName}`}</title>
      </Helmet>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Products ({filteredProducts.length})</h1>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="size-4" data-icon="inline-start" />
          Add Product
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card p-4 shadow-sm"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-3">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            >
              <option value="">All Categories</option>
              {categorySlugs.map((slug) => (
                <option key={slug} value={slug}>{slug}</option>
              ))}
            </select>
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            >
              <option value="">All Stock</option>
              <option value="in-stock">In Stock (&gt;10)</option>
              <option value="low-stock">Low Stock (1-10)</option>
              <option value="out-of-stock">Out of Stock</option>
            </select>
            <select
              value={discountFilter}
              onChange={(e) => setDiscountFilter(e.target.value)}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring"
            >
              <option value="">All Discounts</option>
              <option value="with-discount">With Discount</option>
              <option value="no-discount">No Discount</option>
            </select>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
            onClick={() => setShowForm(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-background p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setShowForm(false)}
                className="absolute right-3 top-3 z-10 flex size-8 items-center justify-center rounded-full bg-background/80 text-foreground shadow-sm backdrop-blur-sm transition-colors hover:bg-background"
              >
                <X className="size-4" />
              </button>

              <h2 className="mb-6 text-lg font-semibold text-foreground">Add New Product</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-foreground">Title *</label>
                    <Input {...register("title")} placeholder="Product title" className={errors.title ? "border-red-500" : ""} />
                    {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-foreground">Description *</label>
                    <textarea
                      {...register("description")}
                      rows={3}
                      placeholder="Product description"
                      className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring ${errors.description ? "border-red-500" : ""}`}
                    />
                    {errors.description && <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Category *</label>
                    <select
                      {...register("category")}
                      className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-ring ${errors.category ? "border-red-500" : ""}`}
                    >
                      <option value="">Select category</option>
                      {categorySlugs.map((slug) => (
                        <option key={slug} value={slug}>{slug}</option>
                      ))}
                    </select>
                    {errors.category && <p className="mt-1 text-xs text-red-500">{errors.category.message}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Brand</label>
                    <Input {...register("brand")} placeholder="Brand name" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Price *</label>
                    <Input {...register("price")} type="number" step="0.01" placeholder="$0.00" className={errors.price ? "border-red-500" : ""} />
                    {errors.price && <p className="mt-1 text-xs text-red-500">{errors.price.message}</p>}
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Discount %</label>
                    <Input {...register("discountPercentage")} type="number" step="0.1" min="0" max="100" placeholder="0" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Stock *</label>
                    <Input {...register("stock")} type="number" min="0" placeholder="0" className={errors.stock ? "border-red-500" : ""} />
                    {errors.stock && <p className="mt-1 text-xs text-red-500">{errors.stock.message}</p>}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-foreground">Tags (comma separated)</label>
                    <Input {...register("tags")} placeholder="e.g. wireless, bluetooth, headphones" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-foreground">Thumbnail</label>
                    <input
                      ref={thumbnailInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setThumbnailFile(file);
                          setThumbnailPreview(URL.createObjectURL(file));
                        }
                      }}
                    />
                    <div
                      onClick={() => thumbnailInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setThumbnailDrag(true); }}
                      onDragLeave={() => setThumbnailDrag(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setThumbnailDrag(false);
                        const file = e.dataTransfer.files?.[0];
                        if (file && file.type.startsWith("image/")) {
                          setThumbnailFile(file);
                          setThumbnailPreview(URL.createObjectURL(file));
                        }
                      }}
                      className={`cursor-pointer rounded-xl border-2 border-dashed p-5 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ${thumbnailDrag ? "border-primary bg-primary/10 scale-[1.01]" : "border-border"}`}
                    >
                      {thumbnailPreview ? (
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="relative">
                            <img src={thumbnailPreview} alt="Thumbnail" className="size-20 rounded-xl object-cover ring-2 ring-border" />
                            <div className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                              <Camera className="size-3" />
                            </div>
                          </div>
                          <div className="text-sm font-medium text-foreground">Change thumbnail</div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 py-4">
                          <div className={`flex size-16 items-center justify-center rounded-xl transition-colors ${thumbnailDrag ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <Camera className="size-7" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-foreground">Click to upload thumbnail</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">Any image format up to 5MB</p>
                            <p className="mt-1.5 text-xs text-primary">or drag & drop</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-foreground">Images</label>
                    <input
                      ref={imagesInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []);
                        setImageFiles((prev) => [...prev, ...files]);
                        setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
                        e.target.value = "";
                      }}
                    />
                    <div
                      onClick={() => imagesInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setImagesDrag(true); }}
                      onDragLeave={() => setImagesDrag(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setImagesDrag(false);
                        const files = Array.from(e.dataTransfer.files ?? []).filter((f) => f.type.startsWith("image/"));
                        if (files.length > 0) {
                          setImageFiles((prev) => [...prev, ...files]);
                          setImagePreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
                        }
                      }}
                      className={`cursor-pointer rounded-xl border-2 border-dashed p-5 transition-all duration-200 hover:border-primary/50 hover:bg-primary/5 ${imagesDrag ? "border-primary bg-primary/10 scale-[1.01]" : "border-border"}`}
                    >
                      {imagePreviews.length > 0 ? (
                        <div className="flex flex-wrap gap-3">
                          {imagePreviews.map((src, i) => (
                            <div key={i} className="relative">
                              <img src={src} alt="" className="size-20 rounded-xl object-cover ring-2 ring-border" />
                              <div className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                                <span className="text-[10px] font-bold">{i + 1}</span>
                              </div>
                            </div>
                          ))}
                          <div className="flex size-20 items-center justify-center rounded-xl border-2 border-dashed border-primary/30 bg-primary/5 text-primary transition-colors hover:bg-primary/10">
                            <Plus className="size-6" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 py-4">
                          <div className={`flex size-16 items-center justify-center rounded-xl transition-colors ${imagesDrag ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"}`}>
                            <ImagePlus className="size-7" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-medium text-foreground">Click to upload images</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">Any image format — multiple files supported</p>
                            <p className="mt-1.5 text-xs text-primary">or drag & drop</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Warranty</label>
                    <Input {...register("warrantyInformation")} placeholder="e.g. 1 year warranty" />
                  </div>

                  <div>
                    <label className="mb-1 block text-sm font-medium text-foreground">Shipping</label>
                    <Input {...register("shippingInformation")} placeholder="e.g. Free shipping" />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1 block text-sm font-medium text-foreground">Return Policy</label>
                    <Input {...register("returnPolicy")} placeholder="e.g. 30 day returns" />
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <Button type="submit" disabled={createMutation.isPending} className="rounded-lg">
                    {createMutation.isPending ? "Creating..." : "Create Product"}
                  </Button>
                  <Button type="button" variant="ghost" onClick={() => { setShowForm(false); resetForm(); }}>
                    Cancel
                  </Button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border bg-card shadow-sm"
      >
        {isLoading ? (
          <div className="p-5"><ProductSkeleton /></div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 text-center">
            <Package className="mx-auto size-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">
              {products.length === 0 ? "No products yet." : "No products match your filters."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="px-5 py-3 font-medium">Product</th>
                  <th className="px-5 py-3 font-medium">Category</th>
                  <th className="px-5 py-3 font-medium">Price</th>
                  <th className="px-5 py-3 font-medium">Stock</th>
                  <th className="px-5 py-3 font-medium">Discount</th>
                  <th className="px-5 py-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredProducts.map((product) => (
                  <tr key={product._id} className="hover:bg-muted/30">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.thumbnail || product.images?.[0] || ""}
                          alt={product.title}
                          className="size-10 shrink-0 rounded-lg object-cover"
                        />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{product.title}</p>
                          {product.brand && <p className="truncate text-[11px] text-muted-foreground">{product.brand}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <Badge variant="secondary" className="text-[11px]">{product.category}</Badge>
                    </td>
                    <td className="px-5 py-3 font-medium text-foreground">{formatBDT(product.price)}</td>
                    <td className="px-5 py-3">
                      <span className={`font-medium ${product.stock <= 10 ? "text-red-600" : "text-foreground"}`}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {product.discountPercentage > 0 ? (
                        <Badge variant="destructive" className="text-[11px]">-{product.discountPercentage}%</Badge>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <Button asChild variant="ghost" size="sm">
                        <Link to={`/dashboard/products/${product._id}`}>
                          <Eye className="size-4" />
                        </Link>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </div>
  );
}
