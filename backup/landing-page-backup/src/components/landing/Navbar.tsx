import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Zap, Menu, X, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';

const navLinks = ['Comment ça marche', 'Tarifs', 'contact'];

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-background/90 backdrop-blur-md border-b border-border py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
            <Zap size={18} className="text-primary-foreground fill-current" />
          </div>
          <span className="font-ui font-semibold text-xl tracking-tight text-foreground">
            FeoSync
          </span>
        </a>

        <div className="hidden md:flex items-center gap-8 text-sm font-ui text-muted-foreground">
          {navLinks.map((item) => (
            <a
              key={item}
              href={`#${item.toLowerCase().replace(/\s+/g, '')}`}
              className="hover:text-primary transition-colors"
            >
              {item}
            </a>
          ))}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <motion.a
            href="#cta"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-3 rounded-[24px] bg-primary text-primary-foreground font-ui text-sm font-medium hover:shadow-lg hover:shadow-primary/20 transition-all"
          >
            Démarrer gratuitement
          </motion.a>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button
            className="text-muted-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:hidden bg-background border-b border-border px-6 pb-6 pt-2"
        >
          <div className="flex flex-col gap-4">
            {navLinks.map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-muted-foreground font-ui text-sm py-2"
                onClick={() => setMobileOpen(false)}
              >
                {item}
              </a>
            ))}
            <a
              href="#cta"
              className="px-6 py-3 rounded-[24px] bg-primary text-primary-foreground font-ui text-sm font-medium text-center"
              onClick={() => setMobileOpen(false)}
            >
              Démarrer gratuitement
            </a>
          </div>
        </motion.div>
      )}
    </nav>
  );
};

export default Navbar;
