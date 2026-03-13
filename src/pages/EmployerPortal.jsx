import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserPlus, ClipboardList, TrendingUp, Search, Mic } from 'lucide-react';

const EmployerPortal = () => {
  return (
    <div className="employer-portal container section" style={{paddingTop: '120px'}}>
      <div className="text-center mb-16">
        <h1 style={{fontSize: '3rem', marginBottom: '1rem'}}>İşveren Paneline Hoş Geldiniz</h1>
        <p>İhtiyacınız olan yetenekli işgücüne dakikalar içinde ulaşın.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
        <StatCard icon={<Users />} label="Aktif Başvurular" value="24" color="var(--primary)" />
        <StatCard icon={<ClipboardList />} label="Yayındaki İlanlar" value="5" color="var(--success)" />
        <StatCard icon={<TrendingUp />} label="Görüntülenme" value="1.2k" color="var(--warning)" />
        <StatCard icon={<UserPlus />} label="Yeni Kayıtlar" value="12" color="var(--danger)" />
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        <div className="feature-card">
          <h2 className="mb-8">Hızlı İlan Oluştur</h2>
          <form className="grid gap-4">
            <input type="text" placeholder="İş Başlığı (Örn: Depo Elemanı)" className="p-4 rounded-lg border w-full font-medium" />
            <div className="grid grid-cols-2 gap-4">
              <input type="text" placeholder="Günlük Ücret" className="p-4 rounded-lg border font-medium" />
              <input type="text" placeholder="Vardiya Saatleri" className="p-4 rounded-lg border font-medium" />
            </div>
            <textarea placeholder="İş Açıklaması ve Kriterler" className="p-4 rounded-lg border w-full font-medium" rows="4"></textarea>
            <button className="btn btn-primary py-4">İLAN YAYINLA</button>
          </form>
        </div>

        <div className="feature-card">
          <h2 className="mb-8">Son Sesli CV'ler</h2>
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center justify-between p-4 bg-light rounded-xl">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-white">
                    <Users size={24} />
                  </div>
                  <div>
                    <div className="font-bold">Aday #{i*123}</div>
                    <div className="text-sm text-muted">2.4 km yakınınızda</div>
                  </div>
                </div>
                <button className="btn btn-outline" style={{padding: '0.5rem 1rem'}}>
                  <Mic size={18} /> Dinle
                </button>
              </div>
            ))}
            <button className="btn btn-outline w-full mt-4">Tüm Adayları Gör</button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, color }) => (
  <div className="feature-card text-center">
    <div className="w-12 h-12 mx-auto mb-4 rounded-full flex items-center justify-center" style={{background: color + '22', color: color}}>
      {icon}
    </div>
    <div className="text-3xl font-bold mb-1">{value}</div>
    <div className="text-sm text-muted font-medium">{label}</div>
  </div>
);

export default EmployerPortal;
