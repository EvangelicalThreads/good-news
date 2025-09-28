'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Home, BookOpen, FileText, CheckSquare, User } from 'lucide-react';

export default function BottomNav() {
  const pathname = usePathname();
  const [incompleteCount, setIncompleteCount] = useState(0);

  // Fetch tasks every 2s
  const fetchTasks = async () => {
    try {
      const res = await fetch('/api/daily-tasks');
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data: { completed: boolean }[] = await res.json();
      const incomplete = data.filter((t) => !t.completed).length;
      setIncompleteCount(incomplete);
    } catch (err) {
      console.error(err);
      setIncompleteCount(0);
    }
  };

  useEffect(() => {
    fetchTasks();
    const interval = setInterval(fetchTasks, 2000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { label: 'Home', href: '/', icon: <Home size={20} /> },
    { label: 'Journals', href: '/journals', icon: <BookOpen size={20} /> },
    { label: 'Reflections', href: '/reflections', icon: <FileText size={20} /> },
    { label: 'Tasks', href: '/daily-tasks', icon: <CheckSquare size={20} />, badge: true },
    { label: 'Profile', href: '/profile', icon: <User size={20} /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 shadow-lg flex justify-around items-center p-2 z-50">
      {navItems.map(({ label, href, icon, badge }) => {
        const isActive = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center justify-center px-3 py-2 rounded-lg transition-all duration-200 ${
              isActive ? 'bg-purple-100 text-purple-600' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="relative">
              {icon}
              {badge && incompleteCount > 0 && (
                <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full animate-pulse transition-all duration-300">
                  {incompleteCount}
                </span>
              )}
            </div>
            <span className="mt-1 font-medium text-xs sm:text-sm">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
