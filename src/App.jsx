import React, { useState, useEffect } from 'react';
import { 
  Users, 
  MapPin, 
  Mic, 
  Search, 
  ShieldCheck, 
  ArrowRight, 
  Download, 
  Menu, 
  X, 
  PhoneCall, 
  Briefcase 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import './App.css';

function App() {
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
    <div className="app">
      {/* Navigation */}
      <nav className={`navbar ${isScrolled ? 'scrolled' : ''}`}>
        <div className="container nav-content">
          <div className="logo cursor-pointer">
            <Briefcase size={32} />
            <span>KADROMATİK</span>
          </div>
          
          <div className="nav-links">
            <a href="#features" className="nav-link">Özellikler</a>
            <a href="#how-it-works" className="nav-link">Nasıl Çalışır</a>
            <a href="#showcase" className="nav-link">Uygulama</a>
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

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container hero-grid">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1>İşinizi ve İşçinizi Saniyeler İçinde Bulun</h1>
            <p>
              Kadromatik, Türkiye'nin en dinamik iş ve işçi bulma platformudur. 
              Vardiyalı sistem, sesli CV ve harita entegrasyonu ile aradığınızı hemen bulun.
            </p>
            <div className="hero-btns">
              <button className="btn btn-primary">
                İŞ ARIYORUM
                <ArrowRight size={20} />
              </button>
              <button className="btn btn-outline">
                İŞÇİ ARIYORUM
              </button>
            </div>
          </motion.div>
          
          <motion.div 
            className="hero-image"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <img src="/hero.png" alt="Kadromatik App Mockup" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="section container">
        <div className="text-center">
          <h2>Modern Çözümler, Hızlı Sonuçlar</h2>
          <p>İş bulma sürecini dijitalleştiriyor ve hızlandırıyoruz.</p>
        </div>

        <div className="features-grid">
          <FeatureCard 
            icon={<Mic size={32} />}
            title="60 Saniye Sesli CV"
            description="Kendinizi sadece yazı ile değil, sesinizle de ifade edin. Hızlı ve etkileyici bir giriş yapın."
          />
          <FeatureCard 
            icon={<MapPin size={32} />}
            title="Harita Üzerinden İş Arama"
            description="Size en yakın iş ilanlarını harita üzerinde görün. Yol stresini hayatınızdan çıkarın."
          />
          <FeatureCard 
            icon={<Users size={32} />}
            title="Anlık Eşleşme"
            description="Yeteneklerinize ve tercihlerinize en uygun ilanlarla anında bildirim alın."
          />
        </div>
      </section>

      {/* Showcase Section */}
      <section id="showcase" className="section bg-light">
        <div className="container showcase-grid">
          <div className="showcase-image">
            <img src="/voice-cv.png" alt="Sesli CV Özelliği" />
          </div>
          <div className="showcase-content">
            <h2>Sesli CV ile Bir Adım Öne Geçin</h2>
            <p>
              Telefon doğrulaması sonrası 60 saniyelik ses kaydı ile yeteneklerinizi 
              ve tecrübelerinizi anlatın. İşverenler sizi dinlesin, kararını daha hızlı versin.
            </p>
            <ul className="gap-4 flex flex-col mt-4">
              <li className="flex items-center gap-2">
                <ShieldCheck className="text-primary" />
                <span>Güvenli Ses Kaydı</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="text-primary" />
                <span>Profesyonel Profil</span>
              </li>
              <li className="flex items-center gap-2">
                <ShieldCheck className="text-primary" />
                <span>Kolay Düzenleme</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section container text-center">
        <div className="glass p-16 rounded-xl shadow-xl">
          <h2 className="mb-8">Geleceğin İş Dünyasına Bugün Katılın</h2>
          <p className="mb-12">Hemen Kadromatik'i indirin ve kariyerinizde yeni bir sayfa açın.</p>
          <div className="flex justify-center gap-6">
            <button className="btn btn-primary py-4 px-12">
              App Store
            </button>
            <button className="btn btn-primary py-4 px-12">
              Play Store
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div>
              <div className="footer-logo">KADROMATİK</div>
              <p style={{color: '#adb5bd', fontSize: '0.875rem'}}>
                Türkiye'nin en yenilikçi iş ve işçi bulma platformu.
                Vardiyalı işler için en doğru adres.
              </p>
            </div>
            <div>
              <h4 className="footer-title">Kurumsal</h4>
              <div className="footer-links">
                <a href="#" className="footer-link">Hakkımızda</a>
                <a href="#" className="footer-link">Kariyer</a>
                <a href="#" className="footer-link">Basın</a>
              </div>
            </div>
            <div>
              <h4 className="footer-title">Yasal</h4>
              <div className="footer-links">
                <a href="#" className="footer-link">Kullanım Şartları</a>
                <a href="#" className="footer-link">Gizlilik Politikası</a>
                <a href="#" className="footer-link">KVKK</a>
              </div>
            </div>
            <div>
              <h4 className="footer-title">İletişim</h4>
              <div className="footer-links">
                <span className="footer-link">info@kadromatik.com</span>
                <span className="footer-link">+90 (212) 123 45 67</span>
              </div>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© 2026 Kadromatik. Tüm hakları saklıdır.</span>
            <div className="flex gap-4">
              <span>Twitter</span>
              <span>LinkedIn</span>
              <span>Instagram</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <motion.div 
      className="feature-card"
      whileHover={{ y: -10 }}
    >
      <div className="feature-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </motion.div>
  );
}

export default App;
