"use client";

import ThemeSwitcher from '@/components/ThemeToggle';

import { Button } from '@/components/ui/Button';
import { useAuth } from '@/shared/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Menu, Settings as SettingsIcon, User as UserIcon, LogOut as LogOutIcon } from 'lucide-react';

type HeaderProps = {
  backTo?: string;
};

const Header = ({ backTo }: HeaderProps) => {
  const [isClient, setIsClient] = useState(false);
  const [historyLength, setHistoryLength] = useState(0);
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      setHistoryLength(window.history.length);
    }
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(e.target as Node)
      ) {
        setMenuOpen(false);
      }
    }
    function handleEscape(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  return (
    <header className="fixed conta top-0 left-0 w-full z-40 backdrop-blur from-slate-100 via-slate-200 to-slate-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Left: back button */}
          <div className="flex items-center min-w-12">
            {pathname !== "/" && ((isClient && historyLength > 1) || backTo) && (
              <button
                onClick={() => (backTo ? router.push(backTo) : router.back())}
                aria-label="Back"
                className="p-2 rounded-full hover:bg-blue-100 dark:hover:bg-gray-800 transition flex items-center"
              >
                <ArrowLeft className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </button>
            )}
            
          </div>

          {/* Center: logo/title */}
          <div className="flex-1 fixed top-1/2 right-1/2 translate-1/2 -translate-y-1/2 flex justify-center items-center">
            <Link href="/" className="flex items-center gap-2 select-none">
              <span className="inline-block p-2 bg-linear-to-r from-blue-600 to-purple-600 rounded-md shadow">
              <span className="font-bold text-xl tracking-tight">Tanha App</span>
              </span>
            </Link>
          </div>

          {/* Right: controls */}
          <div className="flex items-center gap-2 min-w-12">
            <ThemeSwitcher />
            {user ? (
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((s) => !s)}
                  aria-haspopup
                  aria-expanded={menuOpen}
                  className="flex items-center gap-2 py-1 px-2 rounded-full transition hover:bg-blue-50 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-400"
                >
                  <div className="h-8 w-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold shadow">
                    {(() => {
                      const name = (user as any)?.username || "U";
                      const parts = name.split(/\s+/).filter(Boolean);
                      const initials = parts.length === 1 ? parts[0].slice(0,2) : (parts[0][0] + parts[1][0]);
                      return initials.toUpperCase();
                    })()}
                  </div>
                  <span className="hidden sm:inline text-gray-900 dark:text-gray-100 font-medium">{(user as any)?.username ?? 'User'}</span>
                  <Menu className="ml-1 text-blue-500 dark:text-gray-300" size={18} />
                </button>
                {menuOpen && (
                  <div className="absolute left-0 mt-2 w-52 bg-white dark:bg-gray-900 rounded-xl shadow-2xl z-50 border border-gray-200 dark:border-gray-800 py-2">
                    <ul className="space-y-1 text-gray-400">
                      <li>
                        <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition">
                          <UserIcon size={18} />
                          <span className="font-medium">Profile</span>
                        </Link>
                      </li>
                      <li>
                        <Link href="/settings" className="flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition">
                          <SettingsIcon size={18} />
                          <span className="font-medium">Settings</span>
                        </Link>
                      </li>
                      <li>
                        <button onClick={async () => { setMenuOpen(false); await logout(); }} className="w-full text-left flex items-center gap-2 px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-gray-800 transition">
                          <LogOutIcon size={18} />
                          <span className="font-medium">Logout</span>
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <Button variant="primary" onClick={() => (window.location.href = '/login')} size="sm">
                Login
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;