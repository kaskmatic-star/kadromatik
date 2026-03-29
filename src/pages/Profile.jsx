import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User, Mail, Shield, Mic, Calendar, Edit3, Trash2, ArrowLeft, Play, Pause, Camera, Download, FileText, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = React.useRef(new Audio());
  const cvRef = React.useRef(null);

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

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setUploading(true);
    try {
      const storageRef = ref(storage, `profiles/${user.uid}/avatar.jpg`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      
      const userDoc = doc(db, "users", user.uid);
      await updateDoc(userDoc, { photoURL: downloadURL });
      setProfileData(prev => ({ ...prev, photoURL: downloadURL }));
      alert("Profil fotoğrafı güncellendi!");
    } catch (err) {
      console.error(err);
      alert("Yükleme hatası!");
    } finally {
      setUploading(false);
    }
  };

  const generatePDF = async () => {
    const element = cvRef.current;
    if (!element) return;

    try {
      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`kadromatik-cv-${profileData?.displayName || 'user'}.pdf`);
    } catch (err) {
      console.error("PDF Hatası:", err);
      alert("PDF oluşturulurken bir hata oluştu.");
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener('ended', handleEnded);
    return () => {
        audio.pause();
        audio.removeEventListener('ended', handleEnded);
    };
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
            <div className="relative w-32 h-32 mx-auto mb-6 group">
              <div className="w-full h-full bg-primary-light rounded-full flex items-center justify-center text-primary shadow-md border-4 border-white overflow-hidden">
                {profileData?.photoURL ? (
                  <img src={profileData.photoURL} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User size={64} />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-primary text-white p-2 rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform">
                <Camera size={16} />
                <input type="file" className="hidden" accept="image/*" onChange={handlePhotoUpload} disabled={uploading} />
              </label>
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

        {/* Right Column - Role Based Section */}
        <div className="lg:col-span-2 space-y-8">
          <motion.div 
            className="feature-card sm:p-10 p-6 flex flex-col md:flex-row justify-between items-center bg-white border border-light shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            {profileData?.role === 'employer' ? (
                <>
                    <div className="flex gap-6 items-center w-full">
                        <div className="w-16 h-16 bg-success rounded-2xl flex items-center justify-center text-white shadow-lg">
                            <Users size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-bold mb-1">Yeni Yetenekleri Keşfedin</h3>
                            <p className="text-muted text-sm mb-0">Aktif işçilerin sesli CV'lerini dinleyerek ekibinizi kurun.</p>
                        </div>
                    </div>
                    <div className="mt-8 md:mt-0 w-full md:w-auto">
                        <Link to="/aktif-isciler" className="btn btn-success py-4 px-8 rounded-xl font-bold text-white shadow-lg whitespace-nowrap">
                            İŞÇİLERİ GÖR
                        </Link>
                    </div>
                </>
            ) : (
                <>
                    <div className="flex gap-6 items-center w-full">
                        <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg animate-pulse">
                            <Mic size={32} />
                        </div>
                        <div className="text-left">
                            <h3 className="text-xl font-bold mb-1">Sesli CV Profilin</h3>
                            <p className="text-muted text-sm mb-0">İşverenlere kendinizi tanıttığınız en etkili silahınız.</p>
                        </div>
                    </div>
                    
                    <div className="mt-8 md:mt-0 w-full md:w-auto">
                        {profileData?.voiceCVUrl ? (
                            <div className="flex gap-3 flex-wrap">
                            <button 
                                onClick={togglePlayback}
                                className="btn btn-primary py-4 px-8 rounded-xl flex items-center gap-3 font-bold"
                            >
                                {isPlaying ? <Pause size={20} fill="white" /> : <Play size={20} fill="white" />}
                                {isPlaying ? 'DURAKLAT' : 'ŞİMDİ DİNLE'}
                            </button>
                            <button 
                                onClick={generatePDF}
                                className="btn btn-success py-4 px-8 rounded-xl flex items-center gap-3 font-bold text-white shadow-lg"
                            >
                                <FileText size={20} /> PDF İNDİR
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
                </>
            )}
          </motion.div>

          {/* Hidden CV Content for PDF Generation */}
          <div style={{ position: 'absolute', left: '-9999px', top: '-9999px' }}>
            <div ref={cvRef} style={{ width: '210mm', padding: '20mm', background: 'white', color: '#333' }}>
               <div style={{ borderBottom: '5px solid #0056b3', paddingBottom: '10mm', marginBottom: '10mm', display: 'flex', alignItems: 'center', gap: '10mm' }}>
                   {profileData?.photoURL ? (
                     <img src={profileData.photoURL} alt="CV" style={{ width: '40mm', height: '40mm', borderRadius: '50%', objectFit: 'cover', border: '2px solid #0056b3' }} />
                   ) : (
                     <div style={{ width: '40mm', height: '40mm', background: '#eee', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>FOTO YOK</div>
                   )}
                   <div>
                     <h1 style={{ margin: 0, fontSize: '28pt', fontWeight: '900' }}>{profileData?.displayName || user?.email.split('@')[0]}</h1>
                     <p style={{ margin: 0, fontSize: '14pt', color: '#0056b3', fontWeight: 'bold' }}>{profileData?.role === 'worker' ? 'İş Arayan' : 'İşveren'}</p>
                     <p style={{ margin: '2mm 0 0', fontSize: '10px' }}>{user?.email}</p>
                   </div>
               </div>
               <div style={{ marginBottom: '10mm' }}>
                  <h3 style={{ borderLeft: '3mm solid #0056b3', paddingLeft: '5mm', margin: '0 0 5mm' }}>Hakkımda</h3>
                  <p style={{ lineHeight: '1.6' }}>Sana en yakın işleri harita veya liste üzerinden keşfeden, geleceğine ses katmak için Kadromatik platformunda yer alan profesyonel bir aday.</p>
               </div>
               <div style={{ background: '#f8fbfc', padding: '10mm', borderRadius: '10mm' }}>
                  <h3 style={{ margin: '0 0 5mm' }}>Sesli CV Detayı</h3>
                  <p>Bu aday, kendisini bizzat sesiyle tanıtmıştır. Ses kaydına platform üzerinden ulaşılabilir veya sisteme kayıtlı işverenler tarafından dinlenebilir.</p>
                  <div style={{ fontSize: '9px', opacity: 0.5, marginTop: '5mm' }}>Belge Kadromatik Dijital CV Sistemi tarafından oluşturulmuştur. {new Date().toLocaleDateString('tr-TR')}</div>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="glass p-8 rounded-3xl border-light">
                <h4 className="mb-6 font-bold flex items-center gap-2">
                   <div className="w-2 h-5 bg-primary rounded-full" />
                   {profileData?.role === 'employer' ? 'Yayınladığım İlanlar' : 'Son Başvurularım'}
                </h4>
                <p className="text-xs text-muted mb-0">Henüz bir kayıt bulunmuyor.</p>
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
    <div className="text-left">
      <div className="text-[10px] text-muted uppercase font-black mb-0 leading-none">{label}</div>
      <div className="font-bold text-sm">{value}</div>
    </div>
  </div>
);

export default Profile;
