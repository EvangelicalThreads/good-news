'use client';

import Link from 'next/link';
import { useUser } from '@/context/UserContext';
import { useRouter } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';

const avatarOptions: Record<string, string> = {
  lamb: '/lamb.jpg',
  bread: '/bread.jpg',
  dove: '/dove.jpg',
};

export default function Header() {
  const { avatar, name } = useUser();
  const router = useRouter();
  const avatarUrl = avatarOptions[avatar] || avatarOptions['lamb'];

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="w-full flex justify-between items-center px-6 py-4 shadow-md bg-white sticky top-0 z-50">
      {/* App Logo / Name */}
      <Link
        href="/"
        className="text-2xl font-bold text-purple-600 tracking-tight hover:text-purple-700 transition-colors duration-200"
      >
        Good News
      </Link>

      {/* Avatar + Name Dropdown */}
      <div className="relative" ref={dropdownRef}>
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-3 cursor-pointer group p-1 rounded-full hover:bg-gray-100 transition-colors duration-200"
        >
          <span className="font-medium text-gray-800 group-hover:text-purple-600 transition-colors duration-200">
            {name || 'Friend'}
          </span>
          <div className="relative">
            <div className="w-10 h-10 rounded-full p-[1px] bg-gradient-to-tr from-purple-400 to-pink-400">
              <img
                src={avatarUrl}
                alt="User Avatar"
                className="w-full h-full rounded-full border-2 border-white shadow-md hover:shadow-xl transition-all duration-200 object-cover"
              />
            </div>
          </div>
        </div>

        {/* Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden animate-fadeInScale z-50">
            <Link
              href="/profile"
              className="block px-4 py-3 hover:bg-purple-50 transition-colors duration-200 text-gray-700"
              onClick={() => setDropdownOpen(false)}
            >
              Profile
            </Link>
            <button
              type="button"
              onClick={() => router.push('/login')}
              className="w-full text-left px-4 py-3 hover:bg-purple-50 transition-colors duration-200 text-gray-700"
            >
              Login
            </button>
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: translateY(-5px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fadeInScale {
          animation: fadeInScale 0.2s ease-out forwards;
        }
      `}</style>
    </header>
  );
}
