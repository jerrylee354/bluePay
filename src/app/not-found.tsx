import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <h2 className="text-4xl font-bold mb-4">404 - Page Not Found</h2>
      <p className="text-lg mb-8">The page you are looking for does not exist.</p>
      <Link href="/" className="text-primary hover:underline">
        Return Home
      </Link>
    </div>
  )
}