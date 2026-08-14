export default function Pagination({ currentPage = 1, totalPages = 1, onPageChange }) {
  return (
    <div className="mt-4 flex items-center gap-2">
      <button
        className="rounded border px-3 py-1 disabled:opacity-50"
        disabled={currentPage <= 1}
        onClick={() => onPageChange?.(currentPage - 1)}
      >
        Prev
      </button>
      <span className="text-sm">Page {currentPage} of {totalPages}</span>
      <button
        className="rounded border px-3 py-1 disabled:opacity-50"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange?.(currentPage + 1)}
      >
        Next
      </button>
    </div>
  );
}
