'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Headphones, LogOut, Upload, BarChart3, Menu, X } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface User {
  id: number;
  email: string;
}

export default function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Load user from localStorage
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsUserLoading(false);

    // Listen for custom user update events
    const handleUserUpdate = () => {
      const updatedUser = localStorage.getItem('user');
      setUser(updatedUser ? JSON.parse(updatedUser) : null);
    };

    window.addEventListener('userLoggedIn', handleUserUpdate);
    window.addEventListener('userLoggedOut', handleUserUpdate);
    
    return () => {
      window.removeEventListener('userLoggedIn', handleUserUpdate);
      window.removeEventListener('userLoggedOut', handleUserUpdate);
    };
  }, []);

  const handleSignOut = async () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userLoggedOut'));
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        {/* Logo - Left */}
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <Headphones className="h-6 w-6 text-accent" />
          <span className="font-bold font-headline text-lg sm:text-xl hidden sm:inline">
            Kahaniwaala
          </span>
        </Link>

        {/* Desktop Navigation - Center */}
        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium absolute left-1/2 transform -translate-x-1/2">
          <Link href="/" className="text-foreground/70 hover:text-foreground transition-colors">
            Home
          </Link>
          <Link href="/explore" className="text-foreground/70 hover:text-foreground transition-colors">
            Explore
          </Link>
        </nav>

        {/* Right Side - Profile/Login */}
        <div className="flex items-center space-x-4">
          {/* Desktop User Menu */}
          <div className="hidden md:block">
            {isUserLoading ? (
              <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
            ) : user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.email[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Account
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/upload" className="cursor-pointer">
                      <Upload className="mr-2 h-4 w-4" />
                      <span>Upload Song</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      <span>My Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild>
                <Link href="/login">Login</Link>
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 bg-background">
          <div className="container py-4 space-y-4">
            <nav className="flex flex-col space-y-3">
              <Link 
                href="/" 
                className="text-foreground/70 hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/explore" 
                className="text-foreground/70 hover:text-foreground transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore
              </Link>
            </nav>

            <div className="border-t border-border/40 pt-4">
              {isUserLoading ? (
                <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
              ) : user ? (
                <div className="space-y-3">
                  <p className="text-sm font-medium text-foreground">{user.email}</p>
                  <Link 
                    href="/upload" 
                    className="flex items-center text-foreground/70 hover:text-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload Song
                  </Link>
                  <Link 
                    href="/dashboard" 
                    className="flex items-center text-foreground/70 hover:text-foreground transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    My Dashboard
                  </Link>
                  <button 
                    onClick={() => {
                      handleSignOut();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center text-foreground/70 hover:text-foreground transition-colors w-full"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </button>
                </div>
              ) : (
                <Button asChild className="w-full">
                  <Link href="/login">Login</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
