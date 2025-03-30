import Link from "next/link"
import { School } from "lucide-react"

interface AdminHeaderProps {
  title: string
}

export function AdminHeader({ title }: AdminHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <School className="h-6 w-6 text-primary" />
          <span className="font-bold text-xl">EduConnect Admin</span>
        </div>
        <h1 className="text-xl font-semibold">{title}</h1>
        <nav>
          <ul className="flex gap-4">
            <li>
              <Link href="/admin/dashboard" className="text-sm font-medium text-gray-600 hover:text-primary">
                Dashboard
              </Link>
            </li>
            <li>
              <Link href="/admin/teachers" className="text-sm font-medium text-primary">
                Teachers
              </Link>
            </li>
            <li>
              <Link href="/admin/students" className="text-sm font-medium text-gray-600 hover:text-primary">
                Students
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}

