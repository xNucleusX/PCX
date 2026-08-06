import { Link } from 'react-router-dom'

export function NotFound() {
  return (
    <div className="rounded-xl border border-border bg-card p-12 text-center shadow-xl">
      <h1 className="mb-2 text-3xl font-extrabold text-primary">404</h1>
      <p className="mb-6 text-muted-foreground">This page could not be found.</p>
      <Link to="/" className="text-sm font-medium text-primary hover:underline">
        Back to home
      </Link>
    </div>
  )
}
