import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Calendar, ShieldCheck, Share2, Heart, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

const JobDetail = () => {
  const { id } = useParams();

  // Mock data fetching based on ID
  const job = {
    title: "Vardiyalı Üretim Elemanı",
    company: "Naturel A.Ş.",
    location: "Afyonkarahisar Organize Sanayi Bölgesi",
    wage: "1.200 TL / Gün",
    time: "08:00 - 18:00",
    date: "13 Mart 2026",
    description: "Fabrikamızın üretim hattında görev alacak, vardiyalı çalışma sistemine uyum sağlayabilecek çalışma arkadaşları arıyoruz. İşimiz paketleme ve kalite kontrol süreçlerini kapsamaktadır.",
    details: [
      "Öğle yemeği ve servis imkanı mevcuttur.",
      "Günlük ödeme seçeneği vardır.",
      "İSG kurallarına uyum zorunludur.",
      "En az ilkokul mezunu."
    ]
  };

  return (
    <div className="job-detail-page container section" style={{paddingTop: '120px'}}>
      <Link to="/is-ara" className="flex items-center gap-2 text-primary font-semibold mb-8">
        <ArrowLeft size={20} />
        İlanlara Dön
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="feature-card"
            style={{padding: '3rem'}}
          >
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>{job.title}</h1>
                <p style={{fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)'}}>{job.company}</p>
              </div>
              <div className="flex gap-4">
                <button className="btn btn-outline" style={{padding: '0.5rem'}}><Heart size={20} /></button>
                <button className="btn btn-outline" style={{padding: '0.5rem'}}><Share2 size={20} /></button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 mb-12 p-6 bg-light rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                  <DollarSign />
                </div>
                <div>
                  <div className="text-sm text-muted">Günlük Ücret</div>
                  <div className="font-bold">{job.wage}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                  <Clock />
                </div>
                <div>
                  <div className="text-sm text-muted">Çalışma Saatleri</div>
                  <div className="font-bold">{job.time}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                  <MapPin />
                </div>
                <div>
                  <div className="text-sm text-muted">Konum</div>
                  <div className="font-bold">{job.location}</div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center text-primary shadow-sm">
                  <Calendar />
                </div>
                <div>
                  <div className="text-sm text-muted">Yayınlanma Tarihi</div>
                  <div className="font-bold">{job.date}</div>
                </div>
              </div>
            </div>

            <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>İş Açıklaması</h2>
            <p className="mb-8">{job.description}</p>

            <h2 style={{fontSize: '1.5rem', marginBottom: '1rem'}}>Detaylar & Yan Haklar</h2>
            <ul className="grid gap-4">
              {job.details.map((detail, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <ShieldCheck className="text-success" size={20} />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        <div>
          <div className="glass p-8 rounded-xl sticky" style={{top: '120px'}}>
            <h3 className="mb-6">Başvuru Yap</h3>
            <p className="text-sm mb-8">Bu ilana başvurmak için Sesli CV'nizin güncel olması gerekmektedir.</p>
            <button className="btn btn-primary w-full py-4 mb-4">
              HEMEN BAŞVUR
            </button>
            <button className="btn btn-outline w-full py-4">
              SORU SOR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetail;
