import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import {
  User, Mail, Shield, Mic, Calendar, Edit3, Trash2, ArrowLeft,
  Play, Pause, Camera, FileText, Users, Upload, Download,
  CheckCircle, Eye, Clock, FilePlus, Briefcase, Star, Award
} from 'lucide-react';
import { Link } from 'react-router-dom';
import jsPDF from 'jspdf';

const Profile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [savedCVs, setSavedCVs] = useState([]);
  const [showCVPanel, setShowCVPanel] = useState(false);
  const audioRef = React.useRef(new Audio());

  // Kayıtlı CV'leri localStorage'dan yükle
  const loadSavedCVs = useCallback(() => {
    if (!user?.uid) return;
    const stored = localStorage.getItem(`kadromatik_cvs_${user.uid}`);
    if (stored) {
      setSavedCVs(JSON.parse(stored));
    }
  }, [user]);

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
    loadSavedCVs();
  }, [user, loadSavedCVs]);

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

      // Kayıtlı CV listesine ekle
      const newCV = {
        id: Date.now().toString(),
        name: file.name,
        type: 'uploaded',
        url: downloadURL,
        date: new Date().toISOString(),
        size: (file.size / 1024).toFixed(0) + ' KB'
      };
      const updatedCVs = [newCV, ...savedCVs.filter(cv => cv.type !== 'uploaded')];
      setSavedCVs(updatedCVs);
      localStorage.setItem(`kadromatik_cvs_${user.uid}`, JSON.stringify(updatedCVs));

      alert('CV başarıyla yüklendi!');
    } catch (err) {
      console.error(err);
      alert('Yükleme hatası!');
    } finally {
      setCvUploading(false);
    }
  };

  const generatePDF = async () => {
    setPdfGenerating(true);
    try {
      const pdf = new jsPDF('p', 'mm', 'a4');
      const W = pdf.internal.pageSize.getWidth();
      const H = pdf.internal.pageSize.getHeight();
      const name = profileData?.displayName || user?.email?.split('@')[0] || 'İsimsiz';
      const tarih = profileData?.createdAt
        ? new Date(profileData.createdAt).toLocaleDateString('tr-TR')
        : new Date().toLocaleDateString('tr-TR');

      // ── HEADER GRADIENT ──
      pdf.setFillColor(0, 86, 179);
      pdf.rect(0, 0, W, 60, 'F');
      // Alt gradient şerit
      pdf.setFillColor(0, 70, 150);
      pdf.rect(0, 50, W, 10, 'F');

      // Profil fotoğrafı
      if (profileData?.photoURL) {
        try {
          const res = await fetch(profileData.photoURL);
          const blob = await res.blob();
          const dataUrl = await new Promise(resolve => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.readAsDataURL(blob);
          });
          // Beyaz çerçeve
          pdf.setFillColor(255, 255, 255);
          pdf.roundedRect(13, 11, 36, 36, 3, 3, 'F');
          pdf.addImage(dataUrl, 'JPEG', 14, 12, 34, 34);
        } catch { /* fotoğraf yüklenemezse atla */ }
      } else {
        // Fotoğraf yoksa ikon yerine baş harf
        pdf.setFillColor(255, 255, 255);
        pdf.roundedRect(13, 11, 36, 36, 3, 3, 'F');
        pdf.setTextColor(0, 86, 179);
        pdf.setFontSize(24);
        pdf.setFont('helvetica', 'bold');
        pdf.text(name.charAt(0).toUpperCase(), 25, 35);
      }

      // Ad Soyad
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(22);
      pdf.setFont('helvetica', 'bold');
      pdf.text(name, 56, 24);

      // Rol
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const roleText = profileData?.role === 'worker' ? 'İş Arayan / Aktif Çalışan' : 'İşveren';
      pdf.text(roleText, 56, 33);

      // Email
      pdf.setFontSize(9);
      pdf.text(user?.email || '', 56, 41);

      // Kayıt tarihi
      pdf.text(`Platform Kayıt: ${tarih}`, 56, 49);

      // ── KİŞİSEL BİLGİLER ──
      let y = 72;
      pdf.setTextColor(0, 86, 179);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KİŞİSEL BİLGİLER', 14, y);
      pdf.setDrawColor(0, 86, 179);
      pdf.setLineWidth(0.5);
      pdf.line(14, y + 2, W - 14, y + 2);
      y += 10;

      const infoItems = [
        { label: 'Ad Soyad', value: name },
        { label: 'E-posta', value: user?.email || '-' },
        { label: 'Hesap Türü', value: profileData?.role === 'worker' ? 'İş Arayan' : 'İşveren' },
        { label: 'Hesap Durumu', value: 'Onaylı ✓' },
        { label: 'Kayıt Tarihi', value: tarih },
      ];

      pdf.setFontSize(10);
      infoItems.forEach(item => {
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(80, 80, 80);
        pdf.text(`${item.label}:`, 14, y);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(40, 40, 40);
        pdf.text(item.value, 60, y);
        y += 7;
      });

      // ── SESLİ CV BİLGİLERİ ──
      y += 6;
      pdf.setTextColor(0, 86, 179);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text('SESLİ CV PROFİLİ', 14, y);
      pdf.setDrawColor(0, 86, 179);
      pdf.line(14, y + 2, W - 14, y + 2);
      y += 10;

      if (profileData?.voiceCVUrl) {
        // Yeşil kutu
        pdf.setFillColor(232, 255, 232);
        pdf.roundedRect(14, y - 4, W - 28, 28, 3, 3, 'F');
        pdf.setDrawColor(34, 197, 94);
        pdf.setLineWidth(0.3);
        pdf.roundedRect(14, y - 4, W - 28, 28, 3, 3, 'S');

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(34, 130, 60);
        pdf.text('✓ Sesli CV Kaydı Mevcut', 20, y + 4);

        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(80, 80, 80);
        pdf.text('Bu aday Kadromatik platformunda sesli CV oluşturmuştur.', 20, y + 11);
        pdf.text('Kendisini bizzat kendi sesiyle tanıtmıştır.', 20, y + 16);

        y += 32;

        // Ses linki
        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(0, 86, 179);
        pdf.text('Sesli CV Bağlantısı:', 14, y);
        y += 6;
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 100);
        const urlLines = pdf.splitTextToSize(profileData.voiceCVUrl, W - 28);
        pdf.text(urlLines, 14, y);
        y += urlLines.length * 4 + 4;
      } else {
        pdf.setFillColor(255, 243, 224);
        pdf.roundedRect(14, y - 4, W - 28, 18, 3, 3, 'F');
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(180, 120, 0);
        pdf.text('Henüz sesli CV kaydı oluşturulmamış.', 20, y + 5);
        y += 22;
      }

      // ── YÜKLENEN CV ──
      if (profileData?.cvFileUrl) {
        y += 4;
        pdf.setTextColor(0, 86, 179);
        pdf.setFontSize(13);
        pdf.setFont('helvetica', 'bold');
        pdf.text('YÜKLENEN CV DOSYASI', 14, y);
        pdf.setDrawColor(0, 86, 179);
        pdf.line(14, y + 2, W - 14, y + 2);
        y += 10;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.setTextColor(60, 60, 60);
        pdf.text(`Dosya: ${profileData.cvFileName || 'CV Dosyası'}`, 14, y);
        y += 6;
        pdf.setFontSize(7);
        pdf.setTextColor(100, 100, 100);
        const cvUrlLines = pdf.splitTextToSize(profileData.cvFileUrl, W - 28);
        pdf.text(cvUrlLines, 14, y);
      }

      // ── PLATFORM NOTU ──
      y = H - 36;
      pdf.setFillColor(0, 86, 179);
      pdf.rect(0, y, W, 36, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'bold');
      pdf.text('KADROMATIK', 14, y + 12);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Dijital CV & Sesli Özgeçmiş Platformu', 14, y + 18);
      pdf.setFontSize(7);
      pdf.setTextColor(200, 220, 255);
      pdf.text(`Bu belge ${new Date().toLocaleDateString('tr-TR')} tarihinde otomatik oluşturulmuştur.`, 14, y + 25);
      pdf.text('kadromatik.web.app', W - 14 - pdf.getTextWidth('kadromatik.web.app'), y + 25);

      // Kadromatik logosu (metin)
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.text('K', W - 22, y + 16);

      const fileName = `kadromatik-cv-${name.replace(/\s+/g, '-')}.pdf`;
      pdf.save(fileName);

      // Kayıtlı CV listesine ekle
      const newPdfEntry = {
        id: Date.now().toString(),
        name: fileName,
        type: 'generated',
        date: new Date().toISOString(),
        size: (pdf.output('arraybuffer').byteLength / 1024).toFixed(0) + ' KB'
      };
      const updatedCVs = [newPdfEntry, ...savedCVs.filter(cv => !(cv.type === 'generated' && cv.name === fileName))];
      setSavedCVs(updatedCVs);
      localStorage.setItem(`kadromatik_cvs_${user.uid}`, JSON.stringify(updatedCVs));

    } catch (err) {
      console.error('PDF Hatası:', err);
      alert('PDF oluşturulurken bir hata oluştu.');
    } finally {
      setPdfGenerating(false);
    }
  };

  const deleteSavedCV = (cvId) => {
    const updated = savedCVs.filter(cv => cv.id !== cvId);
    setSavedCVs(updated);
    localStorage.setItem(`kadromatik_cvs_${user.uid}`, JSON.stringify(updated));
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
        {/* Sol Kolon - Kullanıcı Bilgileri */}
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

            <h2 className="mb-1">{profileData?.displayName || user?.email?.split('@')[0]}</h2>
            <div className="inline-block px-3 py-1 bg-primary text-white text-[10px] font-black rounded-full uppercase tracking-widest mb-6">
              {profileData?.role === 'worker' ? 'İŞ ARAYAN' : 'İŞVEREN'}
            </div>

            <div className="space-y-4 text-left border-t border-light pt-8">
              <InfoRow icon={<Mail size={16} />} label="E-posta" value={user?.email} />
              <InfoRow icon={<Shield size={16} />} label="Hesap Türü" value="Onaylı" />
              <InfoRow icon={<Calendar size={16} />} label="Kayıt Tarihi" value={profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString('tr-TR') : '—'} />
              {profileData?.voiceCVUrl && (
                <InfoRow icon={<Mic size={16} />} label="Sesli CV" value="Mevcut ✓" />
              )}
              {profileData?.cvFileUrl && (
                <InfoRow icon={<FileText size={16} />} label="CV Dosyası" value="Yüklendi ✓" />
              )}
            </div>

            <button className="btn btn-outline w-full py-4 rounded-xl mt-10 gap-3 font-bold">
              <Edit3 size={18} /> PROFİLİ DÜZENLE
            </button>
          </motion.div>
        </div>

        {/* Sağ Kolon */}
        <div className="lg:col-span-2 space-y-8">

          {/* İşveren / İşçi Yönlendirme */}
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
                        {isPlaying ? 'DURAKLAT' : 'DİNLE'}
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

          {/* ── SESLİ CV'DEN PDF OLUŞTUR ── */}
          {profileData?.role === 'worker' && (
            <motion.div
              className="feature-card p-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 shadow-sm relative overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="relative z-10">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="flex gap-5 items-center w-full">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg, #0056B3 0%, #003D80 100%)' }}>
                      <FilePlus size={28} />
                    </div>
                    <div className="text-left">
                      <h3 className="text-lg font-bold mb-1">Sesli CV'den PDF Oluştur</h3>
                      <p className="text-sm text-muted mb-0">
                        Profil bilgilerin ve sesli CV linkin ile profesyonel bir PDF özgeçmiş oluştur.
                        {!profileData?.voiceCVUrl && (
                          <span className="text-orange-500 font-semibold block mt-1">
                            ⚠ Önce sesli CV kaydı oluşturmalısın.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3 flex-wrap mt-2 md:mt-0">
                    <button
                      onClick={generatePDF}
                      disabled={pdfGenerating}
                      className="btn py-4 px-8 rounded-xl gap-3 font-bold text-white shadow-lg whitespace-nowrap"
                      style={{
                        background: pdfGenerating ? '#94a3b8' : 'linear-gradient(135deg, #0056B3 0%, #003D80 100%)',
                        cursor: pdfGenerating ? 'wait' : 'pointer'
                      }}
                    >
                      {pdfGenerating ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          OLUŞTURULUYOR...
                        </>
                      ) : (
                        <>
                          <FileText size={20} />
                          PDF OLUŞTUR & İNDİR
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* PDF İçerik Önizleme */}
                <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {[
                    { icon: <User size={14} />, text: 'Kişisel Bilgiler', active: true },
                    { icon: <Camera size={14} />, text: 'Profil Fotoğrafı', active: !!profileData?.photoURL },
                    { icon: <Mic size={14} />, text: 'Sesli CV Linki', active: !!profileData?.voiceCVUrl },
                    { icon: <FileText size={14} />, text: 'CV Dosyası', active: !!profileData?.cvFileUrl },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg border ${
                      item.active
                        ? 'bg-green-50 border-green-200 text-green-700'
                        : 'bg-gray-50 border-gray-200 text-gray-400'
                    }`}>
                      {item.active ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-current" />}
                      {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* ── CV YÜKLE KARTI ── */}
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
                  <h3 className="text-lg font-bold mb-1">Özgeçmiş (CV) Dosyası Yükle</h3>
                  {profileData?.cvFileUrl ? (
                    <p className="text-sm text-muted mb-0 truncate max-w-[280px]">
                      ✓ {profileData.cvFileName || 'CV yüklendi'}
                    </p>
                  ) : (
                    <p className="text-sm text-muted mb-0">PDF, Word veya görsel formatında CV dosyanızı yükleyin.</p>
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

          {/* ── KAYITLI CV'LERİM PANELİ ── */}
          {profileData?.role === 'worker' && (
            <motion.div
              className="feature-card p-8 bg-white border border-light shadow-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold flex items-center gap-3 mb-0">
                  <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-600">
                    <Award size={20} />
                  </div>
                  Kayıtlı CV'lerim
                </h3>
                <button
                  onClick={() => setShowCVPanel(!showCVPanel)}
                  className="text-primary font-bold text-sm flex items-center gap-1 hover:underline"
                >
                  <Eye size={16} />
                  {showCVPanel ? 'Gizle' : `Göster (${savedCVs.length + (profileData?.cvFileUrl ? 1 : 0) + (profileData?.voiceCVUrl ? 1 : 0)})`}
                </button>
              </div>

              <AnimatePresence>
                {showCVPanel && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-3">
                      {/* Sesli CV  */}
                      {profileData?.voiceCVUrl && (
                        <CVListItem
                          icon={<Mic size={16} />}
                          name="Sesli CV Kaydı"
                          type="Ses Kaydı"
                          date={profileData?.lastRecordDate || profileData?.createdAt}
                          color="#0056B3"
                          bgColor="#E7F0FF"
                          actions={
                            <div className="flex gap-2">
                              <button onClick={togglePlayback} className="text-xs font-bold px-4 py-2 rounded-lg text-white flex items-center gap-1" style={{background: '#0056B3'}}>
                                {isPlaying ? <Pause size={12} /> : <Play size={12} />}
                                {isPlaying ? 'Dur' : 'Dinle'}
                              </button>
                              <button onClick={generatePDF} className="text-xs font-bold px-4 py-2 rounded-lg border border-blue-200 text-blue-700 flex items-center gap-1 hover:bg-blue-50">
                                <FileText size={12} /> PDF
                              </button>
                            </div>
                          }
                        />
                      )}

                      {/* Yüklenen CV */}
                      {profileData?.cvFileUrl && (
                        <CVListItem
                          icon={<Upload size={16} />}
                          name={profileData.cvFileName || 'Yüklenen CV'}
                          type="Yüklenen Dosya"
                          color="#059669"
                          bgColor="#ECFDF5"
                          actions={
                            <a href={profileData.cvFileUrl} target="_blank" rel="noreferrer"
                              className="text-xs font-bold px-4 py-2 rounded-lg border border-green-200 text-green-700 flex items-center gap-1 hover:bg-green-50">
                              <Download size={12} /> İndir
                            </a>
                          }
                        />
                      )}

                      {/* Oluşturulan PDF'ler */}
                      {savedCVs.filter(cv => cv.type === 'generated').map(cv => (
                        <CVListItem
                          key={cv.id}
                          icon={<FileText size={16} />}
                          name={cv.name}
                          type="Oluşturulan PDF"
                          date={cv.date}
                          size={cv.size}
                          color="#7C3AED"
                          bgColor="#F5F3FF"
                          actions={
                            <div className="flex gap-2">
                              <button onClick={generatePDF} className="text-xs font-bold px-4 py-2 rounded-lg border border-purple-200 text-purple-700 flex items-center gap-1 hover:bg-purple-50">
                                <Download size={12} /> Yeniden İndir
                              </button>
                              <button onClick={() => deleteSavedCV(cv.id)} className="text-xs px-2 py-2 rounded-lg text-red-400 hover:text-red-600 hover:bg-red-50">
                                <Trash2 size={14} />
                              </button>
                            </div>
                          }
                        />
                      ))}

                      {/* Boş durum */}
                      {!profileData?.voiceCVUrl && !profileData?.cvFileUrl && savedCVs.length === 0 && (
                        <div className="text-center py-8 text-muted">
                          <FileText size={32} className="mx-auto mb-3 opacity-30" />
                          <p className="text-sm font-medium mb-1">Henüz kayıtlı CV bulunamadı</p>
                          <p className="text-xs">Sesli CV oluşturun veya CV dosyası yükleyin.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Özet bar */}
              {!showCVPanel && (
                <div className="flex gap-4 flex-wrap">
                  {profileData?.voiceCVUrl && (
                    <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-blue-50 text-blue-700 border border-blue-100">
                      <Mic size={12} /> Sesli CV ✓
                    </div>
                  )}
                  {profileData?.cvFileUrl && (
                    <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-green-50 text-green-700 border border-green-100">
                      <Upload size={12} /> Yüklenen CV ✓
                    </div>
                  )}
                  {savedCVs.filter(cv => cv.type === 'generated').length > 0 && (
                    <div className="flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-lg bg-purple-50 text-purple-700 border border-purple-100">
                      <FileText size={12} /> {savedCVs.filter(cv => cv.type === 'generated').length} PDF oluşturuldu
                    </div>
                  )}
                  {!profileData?.voiceCVUrl && !profileData?.cvFileUrl && savedCVs.length === 0 && (
                    <div className="text-xs text-muted">Henüz CV kaydı yok.</div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* Alt Kartlar */}
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

// ── Yardımcı Bileşenler ──

const InfoRow = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="text-primary">{icon}</div>
    <div className="text-left">
      <div className="text-[10px] text-muted uppercase font-black mb-0 leading-none">{label}</div>
      <div className="font-bold text-sm">{value}</div>
    </div>
  </div>
);

const CVListItem = ({ icon, name, type, date, size, color, bgColor, actions }) => (
  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-gray-200 transition-colors gap-3" style={{ background: bgColor + '30' }}>
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: bgColor, color }}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="font-bold text-sm mb-0 truncate max-w-[200px]">{name}</p>
        <div className="flex items-center gap-2 text-[10px] text-muted">
          <span className="font-semibold px-1.5 py-0.5 rounded" style={{ background: bgColor, color }}>{type}</span>
          {date && (
            <span className="flex items-center gap-1">
              <Clock size={9} />
              {new Date(date).toLocaleDateString('tr-TR')}
            </span>
          )}
          {size && <span>{size}</span>}
        </div>
      </div>
    </div>
    <div className="flex-shrink-0">{actions}</div>
  </div>
);

export default Profile;
