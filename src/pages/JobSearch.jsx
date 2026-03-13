import React, { useState } from 'react';
import { Search, MapPin, Filter, Calendar, Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const JOBS = [
  {
    id: 1,
    title: "Vardiyalı Üretim Elemanı",
    company: "Naturel A.Ş.",
    location: "Afyonkarahisar",
    wage: "1.200 TL / Gün",
    type: "Tam Zamanlı",
    time: "08:00 - 18:00",
    date: "Bugün"
  },
  {
    id: 2,
    title: "Depo Görevlisi",
    company: "Lojistik Center",
    location: "İstanbul, Tuzla",
    wage: "1.400 TL / Gün",
    type: "Günlük",
    time: "22:00 - 06:00",
    date: "Yarın"
  },
  {
    id: 3,
    title: "Moto Kurye",
    company: "Hızlı Gelsin",
    location: "Ankara, Çankaya",
    wage: "1.100 TL + Prim",
    type: "Esnek",
    time: "Serbest Zamanlı",
    date: "Bugün"
  },
  {
    id: 4,
    title: "Garson / Komi",
    company: "Lezzet Restoran",
    location: "İzmir, Karşıyaka",
    wage: "900 TL / Gün",
    type: "Haftalık",
    time: "12:00 - 22:00",
    date: "15 Mart"
  }
];

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");

  return (
    <div className="job-search-page container section" style={{paddingTop: '120px'}}>
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>İş İlanlarını Keşfet</h1>
          <p>Sana en uygun günlük veya vardiyalı işi hemen bul.</p>
        </div>
        <button className="btn btn-outline">
          <Filter size={20} />
          Filtrele
        </button>
      </div>

      {/* Search Bar */}
      <div className="glass p-6 rounded-xl mb-12 flex gap-4 shadow-md">
        <div className="flex-1 flex items-center bg-white rounded-lg px-4 border">
          <Search className="text-muted" />
          <input 
            type="text" 
            placeholder="Pozisyon veya şirket ara..." 
            className="w-full p-3 border-none outline-none font-medium"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex items-center bg-white rounded-lg px-4 border w-64">
          <MapPin className="text-muted" />
          <input 
            type="text" 
            placeholder="Şehir veya ilçe..." 
            className="w-full p-3 border-none outline-none font-medium"
          />
        </div>
        <button className="btn btn-primary px-8">İş Bul</button>
      </div>

      {/* Job Grid */}
      <div className="grid gap-6">
        {JOBS.map((job) => (
          <motion.div 
            key={job.id}
            className="feature-card flex justify-between items-center"
            whileHover={{ scale: 1.01 }}
            style={{padding: '2rem'}}
          >
            <div className="flex gap-6 items-center">
              <div className="w-16 h-16 bg-primary-light rounded-xl flex items-center justify-center text-primary">
                <Search size={32} />
              </div>
              <div>
                <h3 style={{marginBottom: '0.25rem'}}>{job.title}</h3>
                <p style={{marginBottom: '0.5rem', fontWeight: 600, color: 'var(--primary)'}}>{job.company}</p>
                <div className="flex gap-4 text-sm text-muted">
                  <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                  <span className="flex items-center gap-1"><Clock size={14} /> {job.time}</span>
                  <span className="flex items-center gap-1"><Calendar size={14} /> {job.date}</span>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-2xl font-bold mb-4" style={{color: 'var(--success)'}}>{job.wage}</div>
              <Link to={`/is/${job.id}`} className="btn btn-primary">
                Detayları Gör
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default JobSearch;
