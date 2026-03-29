import React, { useState, useRef, useEffect } from 'react';
import { Search, MapPin, Filter, Calendar, Clock, Mic, CheckCircle, X, Download, Save, RefreshCw, ArrowRight, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';

import JobMapView from '../components/JobMapView';

const JobSearch = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
  
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const { user } = useAuth();
  const navigate = useNavigate();

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(new Audio());
  const timerRef = useRef(null);

  const questions = [
    "Adınız ve Soyadınız nelerdir?",
    "Hangi meslek dalında çalışıyorsunuz?",
    "Kaç yıllık iş tecrübeniz var?",
    "En son hangi şirkette veya projede çalıştınız?",
    "Uzman olduğunuz teknik beceriler nelerdir?",
    "Sizi diğer adaylardan ayıran en güçlü özelliğiniz nedir?",
    "Neden bizimle çalışmak istiyorsunuz?",
    "Kısaca gelecek hedeflerinizden bahseder misiniz?"
  ];

  // Fetch Jobs from Firestore
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const q = query(collection(db, "jobs"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        const jobsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        if (jobsList.length === 0) {
           setJobs([
             { id: "1", title: "Vardiyalı Üretim Elemanı", company: "Naturel A.Ş.", location: "Afyon", wage: "1.200 TL", time: "08:00-18:00", date: "Bugün" },
             { id: "2", title: "Depo Görevlisi", company: "Lojistik Center", location: "Tuzla", wage: "1.400 TL", time: "22:00-06:00", date: "Yarın" }
           ]);
        } else {
           setJobs(jobsList);
        }
      } catch (err) {
        console.error("Veri çekme hatası:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  const nextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const startRecording = async () => {
    if (!user) {
      alert("Lütfen önce giriş yapın.");
      navigate('/login');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        audioRef.current.src = url;
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      setCurrentQuestionIndex(0);
      setTimeLeft(60);

      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            stopRecording();
            return 0;
          }
          if (prev % 7 === 0 && prev < 60 && prev > 0) {
            setCurrentQuestionIndex(idx => Math.min(idx + 1, questions.length - 1));
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err) {
      console.error(err);
      alert("Mikrofon izni gerekli.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
    clearInterval(timerRef.current);
    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (isPlaying) audioRef.current.pause();
    else audioRef.current.play();
    setIsPlaying(!isPlaying);
  };

  const handleSave = async () => {
    if (!audioBlob || !user) {
      alert("Kayıt bulunamadı veya oturum açılmamış.");
      return;
    }

    setIsSubmitting(true);
    try {
      const storageRef = ref(storage, `voice-cvs/${user.uid}-${Date.now()}.webm`);
      const snapshot = await uploadBytes(storageRef, audioBlob);
      const downloadURL = await getDownloadURL(snapshot.ref);

      await setDoc(doc(db, "users", user.uid), {
        voiceCVUrl: downloadURL,
        lastRecordDate: new Date().toISOString()
      }, { merge: true });

      alert("Sesli CV'niz başarıyla buluta yüklendi!");
      closeModal();
    } catch (err) {
      console.error("Yükleme hatası:", err);
      alert("Yükleme başarısız oldu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownload = () => {
    if (!audioUrl) return;
    const link = document.createElement('a');
    link.href = audioUrl;
    link.download = `kadromatik-cv-${Date.now()}.webm`;
    link.click();
  };

  const closeModal = () => {
    stopRecording();
    if (isPlaying) audioRef.current.pause();
    setIsPlaying(false);
    setTimeLeft(60);
    setShowVoiceModal(false);
  };

  const filteredJobs = jobs.filter(j => 
    j.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    j.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
    j.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="container section text-center" style={{paddingTop: '200px'}}>İlanlar Yükleniyor...</div>;

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
            <h2 className="mb-1 text-2xl font-bold uppercase">Sesli CV ile Öne Geç!</h2>
            <p className="mb-0 opacity-80">Hemen kaydını yap, işverenler seni dinlesin.</p>
          </div>
        </div>
        <button className="btn btn-primary mt-6 md:mt-0" onClick={() => setShowVoiceModal(true)}>
          {user?.uid ? "SESLİ CV OLUŞTUR" : "GİRİŞ YAP VE KAYDET"}
        </button>
      </motion.div>

      <div className="flex justify-between items-end mb-12 flex-wrap gap-6">
        <div>
          <h1 className="text-4xl font-black">İş Ara</h1>
          <p className="opacity-70 mt-2">Sana en yakın işleri harita veya liste üzerinden keşfet.</p>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-4 bg-white p-2 px-4 rounded-xl shadow-sm border border-light">
                <Search size={20} className="text-muted" />
                <input 
                    type="text" 
                    placeholder="Görev, şirket veya şehir..." 
                    className="outline-none p-2 font-bold bg-transparent"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            
            <div className="flex bg-light p-1 rounded-xl shadow-sm border border-light h-fit">
                <button 
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 font-bold text-sm transition-all ${viewMode === 'list' ? 'bg-white shadow-md text-primary' : 'text-muted hover:text-dark'}`}
                    onClick={() => setViewMode('list')}
                >
                    <Filter size={18} /> LİSTE
                </button>
                <button 
                    className={`px-6 py-3 rounded-lg flex items-center gap-2 font-bold text-sm transition-all ${viewMode === 'map' ? 'bg-white shadow-md text-primary' : 'text-muted hover:text-dark'}`}
                    onClick={() => setViewMode('map')}
                >
                    <MapPin size={18} /> HARİTA
                </button>
            </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div 
            key="list-view"
            className="grid gap-6"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            {filteredJobs.length > 0 ? (
                filteredJobs.map((job) => (
                    <motion.div 
                        key={job.id}
                        className="feature-card flex flex-col md:flex-row justify-between items-center bg-white p-8 rounded-2xl shadow-sm border border-light"
                        whileHover={{ y: -5 }}
                    >
                        <div className="flex gap-6 items-center w-full">
                          <div className="w-16 h-16 bg-primary-light rounded-xl flex items-center justify-center text-primary">
                              <Search size={32} />
                          </div>
                          <div>
                              <h3 className="text-xl font-bold mb-1">{job.title}</h3>
                              <p className="text-primary font-bold mb-4">{job.company}</p>
                              <div className="flex gap-4 text-sm text-muted">
                                <span className="flex items-center gap-1"><MapPin size={14} /> {job.location}</span>
                                <span className="flex items-center gap-1"><Clock size={14} /> {job.time}</span>
                              </div>
                          </div>
                        </div>
                        <div className="text-right mt-6 md:mt-0">
                          <div className="text-2xl font-black text-success mb-4">{job.wage}</div>
                          <Link to={`/is/${job.id}`} className="btn btn-primary">Detaylı Gör</Link>
                        </div>
                    </motion.div>
                ))
            ) : (
                <div className="bg-light p-20 rounded-3xl text-center border-2 border-dashed border-muted/30">
                    <AlertCircle size={48} className="mx-auto text-muted mb-4" />
                    <h3 className="text-muted">Aramanızla eşleşen bir iş bulunamadı.</h3>
                    <p className="text-sm">Lütfen farklı kelimeler deneyin veya filtreyi temizleyin.</p>
                </div>
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="map-view"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
          >
            <JobMapView jobs={filteredJobs} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Voice CV Modal */}
      <AnimatePresence>
        {showVoiceModal && (
          <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
            <motion.div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeModal} />
            <motion.div className="bg-white rounded-3xl p-10 max-w-md w-full relative z-[2001] text-center shadow-2xl">
              <button className="absolute top-4 right-4 p-2" onClick={closeModal}><X /></button>
              
              <h2 className="mb-2">Sesli CV Kaydı</h2>
              <p className="text-sm text-muted mb-8 tracking-tight">Kamera karşısındaymışsınız gibi rahat olun.</p>

              <div className="bg-primary-light p-6 rounded-2xl mb-8 min-h-[140px] flex flex-col justify-center border border-primary/10">
                <span className="text-xs font-bold text-primary uppercase mb-2 block">Soru {currentQuestionIndex + 1}</span>
                <h4 className="font-bold text-lg">{questions[currentQuestionIndex]}</h4>
              </div>

              <div className="relative w-40 h-40 mx-auto mb-10 flex items-center justify-center">
                <div className="text-4xl font-black text-primary">00:{timeLeft < 10 ? `0${timeLeft}` : timeLeft}</div>
              </div>

              {!isRecording && !audioUrl ? (
                <button className="btn btn-primary w-full py-4 gap-4 rounded-xl shadow-lg" onClick={startRecording}>
                  <Mic size={24} /> KAYDA BAŞLA
                </button>
              ) : isRecording ? (
                <div className="flex flex-col gap-4">
                  <button className="btn btn-danger w-full py-4 gap-4 rounded-xl" onClick={stopRecording}>
                    DURDUR
                  </button>
                  <button className="text-primary font-bold text-sm" onClick={nextQuestion}>Sonraki Soru</button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                   <div className="p-4 bg-success/10 rounded-xl text-success flex items-center justify-center gap-2 mb-2">
                    <CheckCircle size={20} />
                    <span className="font-bold">Kayıt Başarılı!</span>
                  </div>
                  <button className="btn btn-outline w-full py-4 gap-3 rounded-xl" onClick={togglePlayback}>
                    {isPlaying ? <X size={20} /> : <Mic size={20} />} {isPlaying ? "DURAKLAT" : "DİNLE"}
                  </button>
                  <div className="grid grid-cols-2 gap-3">
                    <button className="btn btn-outline py-4 w-full" onClick={handleDownload}><Download size={20} /> İndir</button>
                    <button className="btn btn-primary py-4 w-full" onClick={handleSave} disabled={isSubmitting}>
                      {isSubmitting ? "YÜKLENİYOR..." : "KAYDET"}
                    </button>
                  </div>
                  <button className="text-primary font-bold mt-4 text-xs" onClick={() => { setAudioUrl(null); setAudioBlob(null); setTimeLeft(60); }}>Yeniden Kaydet</button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default JobSearch;
