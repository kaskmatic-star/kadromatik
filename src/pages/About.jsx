import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Target, Heart, Award } from 'lucide-react';

const About = () => {
  return (
    <div className="about-page container section" style={{paddingTop: '120px'}}>
      <div className="text-center mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{fontSize: '3.5rem', marginBottom: '1rem'}}
        >
          Biz Kimiz?
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          style={{maxWidth: '800px', margin: '0 auto'}}
        >
          Kadromatik, iş arama sürecindeki pürüzleri ortadan kaldırmak ve 
          işverenlerle adayları en hızlı, en güvenilir şekilde buluşturmak için kuruldu.
        </motion.p>
      </div>

      <div className="grid md:grid-cols-2 gap-12 mb-20 items-center">
        <motion.div
           initial={{ opacity: 0, x: -50 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <img 
            src="/hero.png" 
            alt="Kadromatik Vizyon" 
            className="rounded-xl shadow-xl"
            style={{width: '100%', height: 'auto', objectFit: 'cover'}}
          />
        </motion.div>
        <motion.div
           initial={{ opacity: 0, x: 50 }}
           animate={{ opacity: 1, x: 0 }}
        >
          <h2 className="mb-6">Vizyonumuz</h2>
          <p className="mb-6">
            Türkiye'nin her köşesinde, her sektörden insanın hayalindeki işe 
            sadece saniyeler içinde ulaşabileceği bir ekosistem yaratmak. 
            Vardiyalı ve günlük işlerde standardı belirleyen platform olmak.
          </p>
          <div className="grid gap-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="text-primary" />
              <span className="font-semibold">Güvenilir İlanlar</span>
            </div>
            <div className="flex items-center gap-3">
              <Target className="text-primary" />
              <span className="font-semibold">Hızlı Eşleşme</span>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <ValueCard 
          icon={<Heart />} 
          title="İnsan Odaklı" 
          description="Adaylarımızın ve işverenlerimizin deneyimi bizim için her şeyden önemli." 
        />
        <ValueCard 
          icon={<Award />} 
          title="Yenilikçi" 
          description="Sesli CV gibi modern çözümlerle iş bulma sürecini dijitalleştiriyoruz." 
        />
        <ValueCard 
          icon={<ShieldCheck />} 
          title="Güvenli" 
          description="Tüm ilanlar ve aday profilleri güvenlik süzgecinden geçirilir." 
        />
        <ValueCard 
          icon={<Target />} 
          title="Hızlı" 
          description="Vardiyalı ve acil iş ihtiyaçlarına anında çözüm üretiyoruz." 
        />
      </div>
    </div>
  );
};

const ValueCard = ({ icon, title, description }) => (
  <motion.div 
    className="feature-card text-center"
    whileHover={{ y: -5 }}
  >
    <div className="w-12 h-12 bg-primary-light text-primary rounded-full flex items-center justify-center mx-auto mb-4">
      {icon}
    </div>
    <h3 style={{fontSize: '1.25rem'}} className="mb-2">{title}</h3>
    <p style={{fontSize: '0.875rem', marginBottom: 0}}>{description}</p>
  </motion.div>
);

export default About;
