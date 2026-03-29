import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Calendar, ShieldCheck, Share2, Heart, ArrowLeft, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

const JobDetail = () => {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const docRef = doc(db, "jobs", id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setJob({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Fallback or Error handle
          console.error("No such job!");
        }
      } catch (err) {
        console.error("Error fetching job:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [id]);

  if (loading) {
    return <div className="container section text-center" style={{paddingTop: '200px'}}>İlan Detayları Yükleniyor...</div>;
  }

  if (!job) {
    return (
      <div className="container section text-center" style={{paddingTop: '200px'}}>
        <AlertCircle size={64} className="text-danger mb-4 mx-auto" strokeWidth={1} />
        <h1 className="mb-4">İlan Bulunamadı</h1>
        <p className="mb-8">Aradığınız iş ilanı sistemimizde bulunamadı veya süresi dolmuş olabilir.</p>
        <Link to="/is-ara" className="btn btn-primary">
          DİĞER İLANLARA GÖZ AT
        </Link>
      </div>
    );
  }

  return (
    <div className="job-detail-page container section" style={{paddingTop: '120px'}}>
      <Link to="/is-ara" className="flex items-center gap-2 text-primary font-semibold mb-8 hover:translate-x-[-4px] transition-transform w-fit">
        <ArrowLeft size={20} />
        İlanlara Dön
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="feature-card bg-white p-12 rounded-3xl shadow-sm border border-light"
          >
            <div className="flex justify-between items-start mb-8 flex-wrap gap-4">
              <div>
                <motion.h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem'}} className="font-black">
                  {job.title}
                </motion.h1>
                <p style={{fontSize: '1.25rem', fontWeight: 600, color: 'var(--primary)'}}>{job.company}</p>
              </div>
              <div className="flex gap-4">
                <button className="btn btn-outline p-3 rounded-xl hover:bg-danger/10">
                  <Heart size={20} />
                </button>
                <button className="btn btn-outline p-3 rounded-xl">
                  <Share2 size={20} />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 p-6 bg-light rounded-xl">
              <InfoItem icon={<DollarSign />} label="Günlük Ücret" value={job.wage} />
              <InfoItem icon={<Clock />} label="Saatler" value={job.time} />
              <InfoItem icon={<MapPin />} label="Konum" value={job.location} />
              <InfoItem icon={<Calendar />} label="Tarih" value={job.date} />
            </div>

            <h2 className="text-xl font-bold mb-6">İş Açıklaması</h2>
            <p className="mb-12 text-lg leading-relaxed">{job.description || "Bu ilan için henüz bir açıklama girilmemiş."}</p>

            <h2 className="text-xl font-bold mb-6">Detaylar</h2>
            <ul className="grid gap-4">
              {job.details?.map((detail, idx) => (
                <li key={idx} className="flex items-center gap-3 p-4 bg-success-light/30 rounded-lg">
                  <ShieldCheck className="text-success" size={20} />
                  <span className="font-medium">{detail}</span>
                </li>
              )) || <p className="text-muted">Detay bilgisi yok.</p>}
            </ul>
          </motion.div>
        </div>

        <div className="lg:col-span-1">
          <div className="glass p-8 rounded-2xl sticky top-[120px] shadow-xl border border-primary/10">
            <h3 className="mb-4">Hemen Başvur</h3>
            <p className="text-sm text-muted mb-8 leading-relaxed">
              Bu ilana başvurmak için Sesli CV'niz kullanılacaktır. Profilinizin güncel olduğundan emin olun.
            </p>
            <button className="btn btn-primary w-full py-5 rounded-xl text-lg mb-4 font-black tracking-wide">
              BAŞVURUMU TAMAMLA
            </button>
            <button className="btn btn-outline w-full py-5 rounded-xl font-bold">
              İŞVERENE SORU SOR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-center gap-4">
    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm">
      {icon}
    </div>
    <div>
      <div className="text-xs text-muted uppercase font-bold mb-1">{label}</div>
      <div className="font-bold text-dark">{value}</div>
    </div>
  </div>
);

export default JobDetail;
