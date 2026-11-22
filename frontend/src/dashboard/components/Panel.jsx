// Generic card wrapper. All visual styling lives here + Tailwind classes,
// so the Pinterest look can be applied in one place later.
export default function Panel({ title, action, className = '', children }) {
  return (
    <section className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
      <header className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold">{title}</h2>
        {action}
      </header>
      {children}
    </section>
  )
}
