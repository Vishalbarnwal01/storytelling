import Link from 'next/link';
import { Headphones, Github, Twitter, Instagram } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
		<Link href="/" className="flex items-center space-x-2 shrink-0">
        	  <Headphones className="h-6 w-6 text-accent" />
         	  <span className="font-bold font-headline text-lg sm:text-xl">
            Kahaniwaala
          </span>
        </Link>
            <p className="text-sm text-muted-foreground">
              Share and discover audio stories from around the world.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Navigation</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/story" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Explore
                </Link>
              </li>
              <li>
                <Link href="/upload" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Upload
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Legal</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <div className="flex space-x-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram size={20} />
              </a>
            </div>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t text-center">
         <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} Kahaniwaala. All rights reserved. • Made with ❤️ by Codestackhub
        </p>
         
        </div>
      </div>
    </footer>
  );
};

export default Footer;
