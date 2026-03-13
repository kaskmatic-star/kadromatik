import React from 'react';

const Footer = () => {
  return (
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
  );
};

export default Footer;
