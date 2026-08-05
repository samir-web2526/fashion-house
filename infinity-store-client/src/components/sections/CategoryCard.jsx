import { Link } from "react-router";
import { motion } from "framer-motion";
import { ImageIcon } from "lucide-react";

export default function CategoryCard({ category, index }) {
  return (
    <motion.div
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-20px" }}
      variants={{
        hidden: { opacity: 0, y: 16 },
        visible: (i) => ({
          opacity: 1,
          y: 0,
          transition: { delay: i * 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] },
        }),
      }}
    >
      <Link
        to={`/products?category=${encodeURIComponent(category.slug)}`}
        className="group flex flex-col items-center gap-3"
      >
        <div className="flex h-28 w-28 items-center justify-center rounded-full border border-gray-200 bg-gray-50 transition-all duration-300 group-hover:border-primary/30 group-hover:shadow-md sm:h-32 sm:w-32 overflow-hidden">
          {category.image ? (
            <img src={category.image} alt={category.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110" />
          ) : (
            <ImageIcon className="h-10 w-10 text-gray-400 transition-transform duration-300 group-hover:scale-110 sm:h-12 sm:w-12" strokeWidth={1.5} />
          )}
        </div>
        <span className="text-center text-sm font-medium text-foreground">
          {category.name}
        </span>
      </Link>
    </motion.div>
  );
}
