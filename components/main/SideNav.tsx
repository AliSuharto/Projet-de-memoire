import Link from 'next/link';
import { Home, Settings, FileText, Users, BarChart2 } from 'lucide-react';

export default function SideNav() {
  const navItems = [
    { href: '/', icon: Home, label: 'Dashboard' },
    { href: '/documents', icon: FileText, label: 'Documents' },
    { href: '/team', icon: Users, label: 'Équipe' },
    { href: '/analytics', icon: BarChart2, label: 'Analytiques' },
    { href: '/settings', icon: Settings, label: 'Paramètres' },
  ];

  return (
   <aside className="fixed top-0 left-0 h-full w-0 md:w-56 pt-16 bg-white border-r border-gray-200 transition-all duration-300">
      <nav className="p-3 overflow-y-auto h-full">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900"
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}