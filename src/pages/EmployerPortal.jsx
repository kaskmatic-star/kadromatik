import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Plus, Users, MapPin, DollarSign, Clock, Calendar, CheckCircle, ShieldCheck, ArrowRight, X, AlertCircle } from 'lucide-react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const EmployerPortal = () => {
  const [showPostModal, setShowPostModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    company: '',
    location: '',
    wage: '',
    time: '08:00 - 18:00',
    type: 'Tam Zamanlı',
    description: '',
    details: ['SGK', 'Yemek', 'Servis']
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Lütfen önce giriş yapın.");
      navigate('/login');
      return;
    }

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, "jobs"), {
        ...formData,
        employerId: user.uid,
        createdAt: new Date().toISOString(),
        date: "Bugün"
      });
      alert("İş ilanı başarıyla yayınlandı!");
      setShowPostModal(false);
      navigate('/is-ara');
    } catch (err) {
      console.error(err);
      alert("Hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="employer-portal container section" style={{paddingTop: '120px'}}>
      
      {/* Hero Section */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-16 gap-12">
        <div className="flex-1">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <span className="text-primary font-bold uppercase tracking-widest text-sm mb-4 block">İŞÇİ ARA & İLAN YAYINLA</span>
            <h1 style={{fontSize: '3rem', lineHeight: 1.1}} className="mb-6 font-black">İşçi Ara & Ekibini Hemen Kur</h1>
            <p className="text-lg text-muted mb-8 leading-relaxed max-w-md">
              Adayların sadece CV'sini değil, sesini de duyun. Kadromatik ile doğru adayı bulmak hiç bu kadar kolay olmamıştı.
            </p>
            <div className="flex gap-4">
              <button 
                className="btn btn-primary py-4 px-8 rounded-xl shadow-lg gap-3 text-lg"
                onClick={() => setShowPostModal(true)}
              >
                <Plus size={24} /> YENİ İLAN YAYINLA
              </button>
              <button className="btn btn-outline py-4 px-8 rounded-xl font-bold flex items-center gap-2">
                <Users size={20} /> AKTİF İŞÇİLERİ GÖR
              </button>
            </div>
          </motion.div>
        </div>
        <div className="flex-1 relative">
          <motion.div 
            className="glass p-8 rounded-3xl border-primary bg-primary-light/30 relative z-10"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
                <Users size={24} />
              </div>
              <div>
                <div className="text-xs font-bold text-primary uppercase">Aktif Adaylar</div>
                <div className="text-2xl font-black text-dark">2,740+ Kişi</div>
              </div>
            </div>
            <p className="text-sm font-medium mb-0">Bugün 150 yeni aday sesli CV oluşturdu.</p>
          </motion.div>
          
          {/* Decorative elements */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-primary-light/20 blur-[100px] rounded-full -z-10" />
        </div>
      </div>

      {/* Benefits Grid */}
      <h2 className="text-center mb-12">Neden Kadromatik İşveren Portalı?</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <BenefitCard 
          icon={<Mic size={32} />} 
          title="Sesli Eleme" 
          desc="Yüzlerce kâğıt CV arasında boğulmak yerine, adayların sesini dinleyerek enerjilerini hissedin." 
        />
        <BenefitCard 
          icon={<ShieldCheck size={32} />} 
          title="Hızlı Onay" 
          desc="Vardiyalı veya günlük ihtiyaçlarınız için anında bildirim gönderin, dakikalar içinde ekibinizi kurun." 
        />
        <BenefitCard 
          icon={<Clock size={32} />} 
          title="Vakit Kazanın" 
          desc="Geleneksel mülakat süreçlerini %70 oranında kısaltan modern işe alım teknolojimizi kullanın." 
        />
      </div>

      {/* Post Modal */}
      <AnimatePresence>
        {showPostModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowPostModal(false)} />
            <motion.div 
              className="bg-white rounded-3xl p-8 md:p-12 max-w-2xl w-full relative z-[2001] shadow-2xl overflow-y-auto max-h-[90vh]"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
            >
               <button className="absolute top-6 right-6 p-2 hover:bg-light rounded-full" onClick={() => setShowPostModal(false)}>
                <X size={24} />
              </button>

              <h2 className="mb-2">Yeni İş İlanı Oluştur</h2>
              <p className="text-muted mb-8">Hızlıca ekibinizi büyütmek için gereken bilgileri girin.</p>

              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-muted uppercase">İlan Başlığı</label>
                  <input 
                    type="text" 
                    placeholder="Örn: Vardiyalı Üretim Elemanı" 
                    className="w-full p-4 rounded-xl border border-light focus:border-primary outline-none font-bold"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase">Şirket Adı</label>
                  <input 
                    type="text" 
                    placeholder="Örn: Naturel A.Ş." 
                    className="w-full p-4 rounded-xl border border-light outline-none font-bold"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase">Konum</label>
                  <input 
                    type="text" 
                    placeholder="Örn: Afyon OSB" 
                    className="w-full p-4 rounded-xl border border-light outline-none font-bold"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase">Günlük/Ortalama Ücret</label>
                  <input 
                    type="text" 
                    placeholder="Örn: 1.250 TL / Gün" 
                    className="w-full p-4 rounded-xl border border-light outline-none font-bold"
                    value={formData.wage}
                    onChange={(e) => setFormData({...formData, wage: e.target.value})}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-muted uppercase">Çalışma Saatleri</label>
                  <input 
                    type="text" 
                    placeholder="Örn: 08:00 - 18:00" 
                    className="w-full p-4 rounded-xl border border-light outline-none font-bold"
                    value={formData.time}
                    onChange={(e) => setFormData({...formData, time: e.target.value})}
                    required
                  />
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-xs font-bold text-muted uppercase">İş Tanımı</label>
                  <textarea 
                    rows="4" 
                    placeholder="İşin detaylarını ve aradığınız özellikleri yazın..." 
                    className="w-full p-4 rounded-xl border border-light outline-none font-medium text-sm"
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    required
                  ></textarea>
                </div>

                <div className="md:col-span-2 mt-4">
                  <button 
                    type="submit" 
                    className="btn btn-primary w-full py-5 rounded-2xl shadow-lg gap-3 text-lg font-black disabled:opacity-50"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "YAYINLANIYOR..." : "HEMEN YAYINLA"} <ArrowRight size={24} />
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const BenefitCard = ({ icon, title, desc }) => (
  <motion.div 
    className="feature-card text-center p-10 bg-white shadow-xl hover:-translate-y-2 transition-transform"
    whileHover={{ scale: 1.02 }}
  >
    <div className="w-20 h-20 bg-primary-light rounded-2xl flex items-center justify-center text-primary mx-auto mb-6 shadow-sm">
      {icon}
    </div>
    <h3 className="mb-4">{title}</h3>
    <p className="text-muted text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

const Mic = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
);

export default EmployerPortal;
