import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { User, Mail, Shield, Mic, Calendar, Edit3, Trash2, ArrowLeft, Play, Pause } from 'lucide-react';
import { Link } from 'react-router-dom';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(new Audio());

  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfileData(docSnap.data());
          }
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchProfile();
  }, [user]);

  const togglePlayback = () => {
    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.src = profileData.voiceCVUrl;
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => audio.removeEventListener('ended', handleEnded);
  }, []);

  if (loading) return <div className="container section text-center" style={{paddingTop: '200px'}}>Profil Yükleniyor...</div>;

  return (
    <div className="profile-page container section" style={{paddingTop: '120px'}}>
      <Link to="/" className="flex items-center gap-2 text-primary font-bold mb-8 hover:translate-x-[-4px] transition-transform w-fit">
        <ArrowLeft size={18} /> Ana Sayfaya Dön
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left Column - User Info */}
        <div className="lg:col-span-1">
          <motion.div 
            className="glass p-10 rounded-3xl border-primary/10 shadow-2xl text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="w-32 h-32 bg-primary-light rounded-full flex items-center justify-center text-primary mx-auto mb-6 shadow-md border-4 border-white">
              <User size={64} />
            </div>
            <h2 className="mb-1">{profileData?.displayName || user?.email.split('@')[0]}</h2>
            <div className="inline-block px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest mb-6">
              {profileData?.role === 'worker' ? 'İŞ ARAYAN' : 'İŞVEREN'}
            </div>

            <div className="space-y-4 text-left border-t border-light pt-8">
              <InfoRow icon={<Mail size={16} />} label="E-posta" value={user?.email} />
              <InfoRow icon={<Shield size={16} />} label="Hesap Türü" value="Onaylı" />
              <InfoRow icon={<Calendar size={16} />} label="Kayıt Tarihi" value={profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('tr-TR') : '14 Mart 2026'} />
            </div>

            <button className="btn btn-outline w-full py-4 rounded-xl mt-10 gap-3 font-bold">
              <Edit3 size={18} /> PROFİLİ DÜZENLE
            </button>
          </motion.div>
        </div>

        {/* Right Column - Voice CV & Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Voice CV Section */}
          <motion.div 
            className="feature-card sm:p-10 p-6 flex flex-col md:flex-row justify-between items-center bg-white border border-light shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="flex gap-6 items-center w-full">
              <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
                <Mic size={32} />
              </div>
              <div>
                <h3 className="text-xl font-bold mb-1">Sesli CV Profilin</h3>
                <p className="text-muted text-sm mb-0">İşverenlere kendinizi tanıttığınız en etkili silahınız.</p>
              </div>
            </div>
            
            <div className="mt-8 md:mt-0 w-full md:w-auto">
              {profileData?.voiceCVUrl ? (
                <div className="flex gap-4">
                  <button 
                    onClick={togglePlayback}
                    className="btn btn-primary py-4 px-8 rounded-xl flex items-center gap-3 font-bold"
                  >
                    {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                    {isPlaying ? 'DURAKLAT' : 'ŞİMDİ DİNLE'}
                  </button>
                  <button className="btn btn-outline p-4 rounded-xl hover:bg-danger/10 hover:text-danger hover:border-danger border-light">
                    <Trash2 size={24} />
                  </button>
                </div>
              ) : (
                <Link to="/is-ara" className="btn btn-primary py-4 px-8 rounded-xl font-bold">
                  HEMEN OLUŞTUR
                </Link>
              )}
            </div>
          </motion.div>

          {/* Activity Section Placeholder */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass p-8 rounded-3xl border-light">
                <h4 className="mb-6 font-bold flex items-center gap-2">
                   <div className="w-2 h-5 bg-primary rounded-full" />
                   Son Başvurularım
                </h4>
                <p className="text-xs text-muted mb-0">Henüz bir başvurunuz bulunmuyor.</p>
             </div>
             <div className="glass p-8 rounded-3xl border-light">
                <h4 className="mb-6 font-bold flex items-center gap-2">
                   <div className="w-2 h-5 bg-success rounded-full" />
                   Gelen Sorular
                </h4>
                <p className="text-xs text-muted mb-0">Sizinle henüz kimse iletişime geçmedi.</p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="text-primary">{icon}</div>
    <div>
      <div className="text-[10px] text-muted uppercase font-black mb-0 leading-none">{label}</div>
      <div className="font-bold text-sm">{value}</div>
    </div>
  </div>
);

export default Profile;
