import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Download, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
      <div className="container nav-content">
        <Link to="/" className="logo cursor-pointer">
          <Briefcase size={32} />
          <span>KADROMATİK</span>
        </Link>
        
        <div className="nav-links">
          <Link to="/is-ara" className="nav-link">İş Ara</Link>
          <Link to="/isci-bul" className="nav-link">İşçi Bul</Link>
          <Link to="/hakkimizda" className="nav-link">Hakkımızda</Link>
        </div>

        <div className="flex items-center gap-4">
          <button className="btn btn-primary">
            <Download size={20} />
            <span>İndir</span>
          </button>
          <button className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
