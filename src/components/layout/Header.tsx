'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
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
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from '@/components/ui/sheet';

interface User {
  id: number;
  email: string;
}

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);
  const [isUserLoading, setIsUserLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Hide header on admin and kwadmin pages
  const isAdminPage = pathname?.startsWith('/kwadmin') || pathname?.startsWith('/admin-login');
  
  if (isAdminPage) {
    return null;
  }

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsUserLoading(false);

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

  const handleSignOut = () => {
    localStorage.removeItem('user');
    window.dispatchEvent(new Event('userLoggedOut'));
    setUser(null);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background supports-[backdrop-filter]:bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex h-14 items-center justify-between px-4 md:px-6">
        {/* Logo - Left */}
        <Link href="/" className="flex items-center space-x-2 shrink-0">
          <Headphones className="h-6 w-6 text-accent" />
          <span className="font-bold font-headline text-lg sm:text-xl">
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
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu size={20} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle>Menu</SheetTitle>
              <div className="space-y-6 py-6">
                {/* Navigation Links */}
                <nav className="flex flex-col space-y-4">
                  <Link 
                    href="/" 
                    className="text-foreground hover:text-accent transition-colors text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Home
                  </Link>
                  <Link 
                    href="/explore" 
                    className="text-foreground hover:text-accent transition-colors text-lg font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Explore
                  </Link>
                </nav>

                <div className="border-t border-border/40 pt-6">
                  {isUserLoading ? (
                    <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
                  ) : user ? (
                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 pb-4 border-b border-border/40">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {user.email[0].toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{user.email}</p>
                        </div>
                      </div>
                      <Link 
                        href="/upload" 
                        className="flex items-center text-foreground hover:text-accent transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <Upload className="mr-3 h-5 w-5" />
                        <span className="font-medium">Upload Song</span>
                      </Link>
                      <Link 
                        href="/dashboard" 
                        className="flex items-center text-foreground hover:text-accent transition-colors"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        <BarChart3 className="mr-3 h-5 w-5" />
                        <span className="font-medium">My Dashboard</span>
                      </Link>
                      <button 
                        onClick={() => {
                          handleSignOut();
                          setIsMobileMenuOpen(false);
                        }}
                        className="flex items-center text-foreground hover:text-accent transition-colors w-full"
                      >
                        <LogOut className="mr-3 h-5 w-5" />
                        <span className="font-medium">Log out</span>
                      </button>
                    </div>
                  ) : (
                    <Button asChild className="w-full" size="lg">
                      <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>Login</Link>
                    </Button>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>


    </header>
  );
}
