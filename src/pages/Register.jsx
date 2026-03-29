import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Briefcase, ArrowRight, ShieldCheck, Check, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [role, setRole] = useState('worker');
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await signup(email, password, displayName, role);
      alert("Hesabınız oluşturuldu!");
      navigate(role === 'worker' ? '/is-ara' : '/isci-bul');
    } catch (err) {
      console.error(err);
      setError("Kayıt olunamadı. Belki bu e-posta adresi zaten kullanımda?");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="register-page container section flex items-center justify-center" style={{minHeight: '100vh', paddingTop: '100px'}}>
      <motion.div 
        className="glass p-8 md:p-12 rounded-3xl max-w-lg w-full shadow-2xl border-white/20"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="text-center mb-10">
          <h1 style={{fontSize: '2rem'}} className="mb-2">Hesap Oluştur</h1>
          <p className="text-sm">Hemen kaydolun ve saniyeler içinde iş aramaya başlayın.</p>
        </div>

        {error && (
          <div className="bg-danger/10 p-4 rounded-xl text-danger text-sm flex items-center gap-3 mb-6 font-semibold border border-danger/20">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Stepper UI */}
        <div className="flex justify-center items-center gap-4 mb-10">
          <StepCircle num={1} active={step >= 1} current={step === 1} />
          <div className={`h-[2px] w-12 ${step === 2 ? 'bg-primary' : 'bg-light'}`} />
          <StepCircle num={2} active={step === 2} current={step === 2} />
        </div>

        <form onSubmit={handleRegister}>
          {step === 1 ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid gap-6"
            >
              <p className="font-bold text-center mb-2">Hangi amaçla kullanacaksınız?</p>
              <div className="grid grid-cols-2 gap-4 mb-4">
                <button 
                  type="button"
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${role === 'worker' ? 'border-primary bg-primary-light text-primary shadow-lg' : 'border-light bg-light hover:border-muted'}`}
                  onClick={() => setRole('worker')}
                >
                  <User size={32} />
                  <span className="font-bold">İŞ ARIYORUM</span>
                </button>
                <button 
                  type="button"
                  className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${role === 'employer' ? 'border-primary bg-primary-light text-primary shadow-lg' : 'border-light bg-light hover:border-muted'}`}
                  onClick={() => setRole('employer')}
                >
                  <Briefcase size={32} />
                  <span className="font-bold">İŞÇİ ARIYORUM</span>
                </button>
              </div>

              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input 
                  type="text" 
                  placeholder="Adınız Soyadınız" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-light outline-none font-medium" 
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  required 
                />
              </div>

              <button type="button" onClick={() => setStep(2)} className="btn btn-primary py-4 rounded-xl shadow-lg gap-3">
                DEVAM ET <ArrowRight size={20} />
              </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="grid gap-6"
            >
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input 
                  type="email" 
                  placeholder="E-posta Adresi" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-light outline-none font-medium" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
                <input 
                  type="password" 
                  placeholder="Şifre Oluşturun" 
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-light outline-none font-medium" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              <div className="flex items-start gap-3 p-4 bg-light rounded-xl">
                 <ShieldCheck className="text-success mt-1" size={20} />
                 <p className="text-xs text-muted mb-0">Bilgileriniz 256-bit SSL güvenlik sertifikası ile korunmaktadır. Üçüncü taraflarla asla paylaşılmaz.</p>
              </div>
              <div className="flex gap-4">
                <button type="button" onClick={() => setStep(1)} className="btn btn-outline flex-1 py-4 rounded-xl font-bold">GERİ DÖN</button>
                <button 
                  type="submit" 
                  className="btn btn-primary flex-2 py-4 rounded-xl shadow-lg font-bold disabled:opacity-50"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "KAYDEDİLİYOR..." : "KAYIT OL"}
                </button>
              </div>
            </motion.div>
          )}
        </form>

        <p className="text-center text-sm text-muted mt-10">
          Zaten hesabınız var mı? <Link to="/login" className="text-primary font-bold hover:underline">Giriş Yapın</Link>
        </p>
      </motion.div>
    </div>
  );
};

const StepCircle = ({ num, active, current }) => (
  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${active ? 'bg-primary text-white shadow-md' : 'bg-light text-muted'} ${current ? 'ring-4 ring-primary-light' : ''}`}>
    {active && !current && num < 2 ? <Check size={20} /> : num}
  </div>
);

export default Register;
