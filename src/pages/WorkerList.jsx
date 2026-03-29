import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase';
import { Search, MapPin, Mic, Play, Pause, Filter, User, ArrowLeft, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const WorkerList = () => {
    const [workers, setWorkers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [playingId, setPlayingId] = useState(null);
    const audioRef = useRef(new Audio());

    useEffect(() => {
        const fetchWorkers = async () => {
            try {
                // Sadece işçi rolündeki ve sesli CV'si olanları getir
                const q = query(collection(db, "users"), where("role", "==", "worker"));
                const querySnapshot = await getDocs(q);
                const workerData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })).filter(w => w.voiceCVUrl); // Sadece sesli CV'si olanlar
                
                setWorkers(workerData);
            } catch (err) {
                console.error("Hata:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWorkers();

        return () => {
            audioRef.current.pause();
        };
    }, []);

    const togglePlay = (id, url) => {
        if (playingId === id) {
            audioRef.current.pause();
            setPlayingId(null);
        } else {
            audioRef.current.src = url;
            audioRef.current.play();
            setPlayingId(id);
        }
    };

    useEffect(() => {
        const audio = audioRef.current;
        const handleEnded = () => setPlayingId(null);
        audio.addEventListener('ended', handleEnded);
        return () => audio.removeEventListener('ended', handleEnded);
    }, []);

    if (loading) return <div className="container section text-center" style={{paddingTop: '200px'}}>Yetenekler Yükleniyor...</div>;

    return (
        <div className="worker-list-page container section" style={{paddingTop: '120px'}}>
             <Link to="/isci-bul" className="flex items-center gap-2 text-primary font-bold mb-8 hover:translate-x-[-4px] transition-transform w-fit">
                <ArrowLeft size={18} /> İşveren Paneline Dön
            </Link>

            <div className="flex justify-between items-end mb-12 flex-wrap gap-6">
                <div>
                    <h1 className="text-4xl font-black">Aktif İşçiler</h1>
                    <p className="opacity-70 mt-2">Sesli CV'si olan adayları dinleyin ve hemen iletişime geçin.</p>
                </div>
                <div className="bg-success/10 text-success px-6 py-2 rounded-full font-bold border border-success/20">
                    {workers.length} Hazır Aday
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {workers.map((worker) => (
                    <motion.div 
                        key={worker.id}
                        className="glass p-8 rounded-[32px] border-light hover:border-primary/30 transition-all shadow-xl flex flex-col items-center text-center relative overflow-hidden group"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        {/* Avatar */}
                        <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden mb-6 bg-light">
                             {worker.profilePhotoUrl || worker.photoURL ? (
                                <img src={worker.profilePhotoUrl || worker.photoURL} alt="Worker" className="w-full h-full object-cover" />
                             ) : (
                                <div className="w-full h-full flex items-center justify-center text-muted">
                                    <User size={40} />
                                </div>
                             )}
                        </div>

                        <h3 className="text-xl font-bold mb-1">{worker.displayName || 'İsimsiz Aday'}</h3>
                        <p className="text-xs font-black text-primary uppercase tracking-widest mb-6">AKTİF İŞÇİ</p>

                        {/* Player */}
                        <div className="w-full bg-light/50 p-4 rounded-2xl mb-6 flex items-center justify-between gap-4">
                            <div className="flex-1 h-1 bg-primary/20 rounded-full relative">
                                {playingId === worker.id && <div className="absolute inset-0 bg-primary rounded-full animate-grow-x" />}
                            </div>
                            <button 
                                onClick={() => togglePlay(worker.id, worker.voiceCVUrl)}
                                className="w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                            >
                                {playingId === worker.id ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" className="ml-1" />}
                            </button>
                        </div>

                        <div className="grid grid-cols-2 gap-4 w-full">
                             <a href={`tel:${worker.phone || '0555'}`} className="btn btn-primary py-3 rounded-xl gap-2 font-bold text-xs">
                                <Phone size={14} /> ARA
                             </a>
                             <a href={`mailto:${worker.email}`} className="btn btn-outline py-3 rounded-xl gap-2 font-bold text-xs">
                                <Mail size={14} /> MESAJ
                             </a>
                        </div>
                    </motion.div>
                ))}
            </div>

            {workers.length === 0 && (
                <div className="text-center py-20 opacity-50">
                    <Mic size={64} className="mx-auto mb-4" />
                    <h3>Henüz sesli CV'si olan bir aday bulunmuyor.</h3>
                </div>
            )}
        </div>
    );
};

export default WorkerList;
