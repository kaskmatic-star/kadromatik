import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { User, Mail, Shield, Mic, Calendar, Edit3, Trash2, ArrowLeft, Play, Pause, Camera, FileText, Users, Upload, Download, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../firebase';
import jsPDF from 'jspdf';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
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

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    setCvUploading(true);
    try {
      const storageRef = ref(storage, `cv-files/${user.uid}/${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);
      await updateDoc(doc(db, 'users', user.uid), { cvFileUrl: downloadURL, cvFileName: file.name });
      setProfileData(prev => ({ ...prev, cvFileUrl: downloadURL, cvFileName: file.name }));
      alert('CV başarıyla yüklendi!');
    } catch (err) {
      console.error(err);
      alert('Yükleme hatası!');
    } finally {
      setCvUploading(false);
    }
  };

  const generatePDF = async () => {
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const W = pdf.internal.pageSize.getWidth();

      // Header mavi blok
      pdf.setFillColor(0, 86, 179);
      pdf.rect(0, 0, W, 55, 'F');

      // Profil fotoğrafı varsa yükle
      if (profileData?.photoURL) {
        try {
          const res = await fetch(profileData.photoURL);
          const blob = await res.blob();
          const dataUrl = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          pdf.addImage(dataUrl, 'JPEG', 12, 10, 32, 32);
        } catch { /* fotoğraf yüklenemezse atla */ }
      }

      // Ad Soyad
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text(profileData?.displayName || user?.email.split('@')[0], 52, 24);

      // Rol + email
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      pdf.text(profileData?.role === 'worker' ? 'İş Arayan' : 'İşveren', 52, 33);
      pdf.setFontSize(9);
      pdf.text(user?.email || '', 52, 41);

      // Kayıt tarihi
      const tarih = profileData?.createdAt
        ? new Date(profileData.createdAt).toLocaleDateString('tr-TR')
        : new Date().toLocaleDateString('tr-TR');
      pdf.text(`Kayıt: ${tarih}`, 52, 49);

      // Bölüm başlığı
      pdf.setTextColor(0, 86, 179);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Sesli CV Profili', 12, 72);

      pdf.setDrawColor(0, 86, 179);
      pdf.line(12, 74, W - 12, 74);

      // Açıklama
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const desc = 'Bu aday Kadromatik platformunda sesli CV oluşturmuştur. Kendisini bizzat sesiyle tanıtmış olup ses kaydına platform üzerinden ulaşılabilir.';
      const descLines = pdf.splitTextToSize(desc, W - 24);
      pdf.text(descLines, 12, 82);

      // Sesli CV linki
      if (profileData?.voiceCVUrl) {
        pdf.setTextColor(0, 86, 179);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Sesli CV Bağlantısı:', 12, 102);
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(8);
        pdf.setTextColor(80, 80, 80);
        const urlLines = pdf.splitTextToSize(profileData.voiceCVUrl, W - 24);
        pdf.text(urlLines, 12, 109);
      }

      // Footer
      pdf.setFillColor(248, 249, 250);
      pdf.rect(0, 262, W, 35, 'F');
      pdf.setTextColor(140, 140, 140);
      pdf.setFontSize(8);
      pdf.text('Kadromatik Dijital CV Sistemi tarafından oluşturulmuştur.', 12, 275);
      pdf.text(`Oluşturma tarihi: ${new Date().toLocaleDateString('tr-TR')}`, 12, 282);

      pdf.save(`kadromatik-cv-${profileData?.displayName || 'user'}.pdf`);
    } catch (err) {
      console.error('PDF Hatası:', err);
      alert('PDF oluşturulurken bir hata oluştu.');
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

          {/* CV Yükle Kartı */}
          <motion.div
            className="feature-card p-8 bg-white border border-light shadow-sm"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex gap-5 items-center w-full">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md flex-shrink-0"
                  style={{ background: profileData?.cvFileUrl ? 'var(--success)' : 'var(--secondary)' }}>
                  {profileData?.cvFileUrl ? <CheckCircle size={28} /> : <Upload size={28} />}
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-bold mb-1">Özgeçmiş (CV) Dosyası</h3>
                  {profileData?.cvFileUrl ? (
                    <p className="text-sm text-muted mb-0 truncate max-w-[220px]">
                      ✓ {profileData.cvFileName || 'CV yüklendi'}
                    </p>
                  ) : (
                    <p className="text-sm text-muted mb-0">PDF, Word veya görsel formatında CV yükleyin.</p>
                  )}
                </div>
              </div>
              <div className="flex gap-3 flex-wrap mt-2 md:mt-0">
                {profileData?.cvFileUrl && (
                  <a
                    href={profileData.cvFileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-outline py-3 px-6 rounded-xl gap-2 font-bold text-sm"
                    style={{ borderColor: 'var(--success)', color: 'var(--success)' }}
                  >
                    <Download size={18} /> İNDİR
                  </a>
                )}
                <label className="btn btn-primary py-3 px-6 rounded-xl gap-2 font-bold text-sm cursor-pointer"
                  style={{ opacity: cvUploading ? 0.6 : 1 }}>
                  <Upload size={18} />
                  {cvUploading ? 'YÜKLENİYOR...' : profileData?.cvFileUrl ? 'DEĞİŞTİR' : 'CV YÜKLE'}
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,image/*"
                    className="hidden"
                    onChange={handleCVUpload}
                    disabled={cvUploading}
                  />
                </label>
              </div>
            </div>
          </motion.div>

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
