import React, { useState } from 'react';
import { Search, MapPin, Filter, Calendar, Clock, Mic, Smartphone, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);

  const startRecording = () => {
    setIsRecording(true);
    let timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsRecording(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  return (
    <div className="job-search-page container section" style={{paddingTop: '120px'}}>
      
      {/* Voice CV Banner */}
      <motion.div 
        className="glass p-8 rounded-xl mb-12 flex flex-col md:flex-row items-center justify-between border-primary overflow-hidden relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{borderLeft: '5px solid var(--primary)', background: 'linear-gradient(90deg, var(--white) 0%, var(--primary-light) 100%)'}}
      >
        <div className="flex gap-6 items-center">
          <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-white shadow-lg">
            <Mic size={32} />
          </div>
          <div>
            <h2 style={{fontSize: '1.5rem', marginBottom: '0.25rem'}}>Sesli CV ile İşverenleri Etkileyin!</h2>
            <p style={{marginBottom: 0}}>60 saniyelik ses kaydı ile tecrübelerinizi anlatın, iş bulma şansınızı 3 kat artırın.</p>
          </div>
        </div>
        <button 
          className="btn btn-primary mt-6 md:mt-0" 
          onClick={() => setShowVoiceModal(true)}
          style={{padding: '1rem 2rem'}}
        >
          <Mic size={20} />
          SESLİ CV OLUŞTUR
        </button>
      </motion.div>

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
      <div className="glass p-6 rounded-xl mb-12 flex flex-col md:flex-row gap-4 shadow-md">
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
        <div className="flex items-center bg-white rounded-lg px-4 border">
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
            className="feature-card flex flex-col md:flex-row justify-between items-center"
            whileHover={{ scale: 1.01 }}
            style={{padding: '2rem'}}
          >
            <div className="flex gap-6 items-center w-full">
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
            
            <div className="text-right w-full md:w-auto mt-6 md:mt-0">
              <div className="text-2xl font-bold mb-4" style={{color: 'var(--success)'}}>{job.wage}</div>
              <Link to={`/is/${job.id}`} className="btn btn-primary w-full md:w-auto">
                Detayları Gör
              </Link>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Voice CV Modal */}
      <AnimatePresence>
        {showVoiceModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowVoiceModal(false)}
            />
            <motion.div 
              className="bg-white rounded-3xl p-12 max-w-md w-full relative z-[2001] text-center shadow-2xl"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <button 
                className="absolute top-6 right-6 p-2 hover:bg-light rounded-full"
                onClick={() => setShowVoiceModal(false)}
              >
                <X size={24} />
              </button>

              <h2 className="mb-4">60 Saniye Sesli CV</h2>
              <p className="text-muted mb-8">Kendinizi tanıtın ve tecrübelerinizden bahsedin.</p>

              <div className="relative w-48 h-48 mx-auto mb-8 flex items-center justify-center">
                <div className={`absolute inset-0 border-4 border-primary-light rounded-full ${isRecording ? 'animate-pulse' : ''}`} />
                <div className="text-4xl font-bold text-primary">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div>
              </div>

              {!isRecording ? (
                <button 
                  className="btn btn-primary w-full py-4 gap-4"
                  onClick={startRecording}
                  disabled={timeLeft === 0}
                >
                  <Mic size={24} />
                  KAYDI BAŞLAT
                </button>
              ) : (
                <button 
                  className="btn btn-danger w-full py-4 gap-4"
                  style={{backgroundColor: 'var(--danger)', color: 'white'}}
                  onClick={() => setIsRecording(false)}
                >
                  <Smartphone size={24} className="animate-bounce" />
                  KAYDI DURDUR
                </button>
              )}

              {timeLeft === 0 && (
                <div className="mt-6 p-4 bg-success/10 rounded-lg text-success flex items-center justify-center gap-2">
                  <CheckCircle size={20} />
                  Sesli CV Hazır!
                </div>
              )}

              <p className="text-xs text-muted mt-8">
                Kaydınız tamamlandığında otomatik olarak profilinize eklenecektir.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobSearch;
