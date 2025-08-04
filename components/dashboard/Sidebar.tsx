import Link from 'next/link'

export default function DashboardSidebar() {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 shadow-md">
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <h1 className="text-xl font-semibold">GMC</h1>
      </div>
      
      <nav className="p-4">
        <ul className="space-y-2">
          <li>
            <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
              Tableau de bord
            </Link>
          </li>
          {/* Ajoutez d'autres liens ici */}
        </ul>
      </nav>
    </aside>
  )
}