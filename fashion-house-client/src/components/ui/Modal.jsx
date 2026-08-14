export default function Modal({ open, children, title }) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded bg-white p-6 shadow-lg">
        {title ? <h3 className="mb-4 text-lg font-semibold">{title}</h3> : null}
        {children}
      </div>
    </div>
  );
}
