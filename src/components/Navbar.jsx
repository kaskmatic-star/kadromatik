import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Briefcase, Download, Menu, X, Home, Search, Users, Info, LogOut, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menuLinks = [
    { title: 'Ana Sayfa', path: '/', icon: <Home size={20} /> },
    { title: 'İş Ara', path: '/is-ara', icon: <Search size={20} /> },
    { title: 'İşçi Bul', path: '/isci-bul', icon: <Users size={20} /> },
    { title: 'Hakkımızda', path: '/hakkimizda', icon: <Info size={20} /> },
  ];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container nav-content">
          <Link to="/" className="logo cursor-pointer" onClick={() => setIsMenuOpen(false)}>
            <Briefcase size={32} />
            <span>KADROMATİK</span>
          </Link>
          
          <div className="nav-links">
            <Link to="/is-ara" className="nav-link">İş Ara</Link>
            <Link to="/isci-bul" className="nav-link">İşçi Bul</Link>
            <Link to="/hakkimizda" className="nav-link">Hakkımızda</Link>
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/profil" className="flex items-center gap-4 hover:opacity-80 transition-opacity">
                  <div className="flex flex-col items-end md:block hidden">
                    <div className="text-xs font-bold text-muted uppercase">Profilim</div>
                    <div className="font-bold text-sm truncate max-w-[120px]">{user.displayName || user.email}</div>
                  </div>
                  <div className="w-10 h-10 bg-primary-light rounded-full flex items-center justify-center text-primary border border-primary/10">
                    <User size={20} />
                  </div>
                </Link>
                <button onClick={handleLogout} className="btn btn-outline md:flex hidden p-2 border-none text-muted hover:text-danger">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="nav-link font-bold md:block hidden">Giriş Yap</Link>
            )}

            <button className="btn btn-primary md:flex hidden">
              <Download size={20} />
              <span>İndir</span>
            </button>
            <button 
              className="md:hidden p-2 text-dark hover:bg-light rounded-lg transition-colors" 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Menüyü Aç/Kapat"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            className="mobile-menu"
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="p-8 h-full flex flex-col">
              <div className="flex justify-between items-center mb-12">
                <div className="logo text-primary">
                  <Briefcase size={28} />
                  <span>KADROMATİK</span>
                </div>
                <button onClick={() => setIsMenuOpen(false)} className="p-2 hover:bg-light rounded-full">
                  <X size={28} />
                </button>
              </div>

              {user && (
                <div className="p-4 bg-primary-light rounded-2xl mb-8 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
                    <User size={24} />
                  </div>
                  <div className="truncate">
                    <div className="text-xs font-bold text-primary mb-1">HOŞ GELDİN!</div>
                    <div className="font-bold truncate">{user.displayName || user.email.split('@')[0]}</div>
                  </div>
                </div>
              )}

              <div className="grid gap-4">
                {menuLinks.map((link) => (
                  <Link 
                    key={link.path} 
                    to={link.path} 
                    className="flex items-center gap-4 p-4 rounded-xl hover:bg-primary-light hover:text-primary transition-all font-semibold text-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                      {link.icon}
                    </div>
                    {link.title}
                  </Link>
                ))}
              </div>

              <div className="mt-auto">
                {user ? (
                  <button onClick={handleLogout} className="btn btn-outline w-full py-4 rounded-xl gap-4 border-danger/20 text-danger hover:bg-danger/10">
                    <LogOut size={24} /> ÇIKIŞ YAP
                  </button>
                ) : (
                  <button onClick={() => { setIsMenuOpen(false); navigate('/login'); }} className="btn btn-primary w-full py-4 rounded-xl shadow-lg gap-4">
                    GİRİŞ YAP
                  </button>
                )}
                <p className="text-center text-xs text-muted mt-6">
                  Türkiye'nin en yenilikçi iş platformu.
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
