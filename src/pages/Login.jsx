import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Github, Chrome, Briefcase, User, Info, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [role, setRole] = useState('worker');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      await login(email, password);
      navigate(role === 'worker' ? '/is-ara' : '/isci-bul');
    } catch (err) {
      console.error(err);
      setError("Giriş yapılamadı. E-posta veya şifre hatalı.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle(role);
      navigate(role === 'worker' ? '/is-ara' : '/isci-bul');
    } catch (err) {
      console.error(err);
      setError("Google ile giriş sırasında bir hata oluştu.");
    }
  };

  return (
    <div className="login-page container section flex items-center justify-center" style={{minHeight: '100vh', paddingTop: '100px'}}>
      <motion.div 
        className="glass p-8 md:p-12 rounded-3xl max-w-md w-full shadow-2xl border-white/20"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-center mb-10">
          <Link to="/" className="logo text-primary justify-center mb-6">
            <Briefcase size={40} />
            <span style={{fontSize: '2rem'}}>KADROMATİK</span>
          </Link>
          <h1 style={{fontSize: '1.75rem'}} className="mb-2">Hoş Geldiniz!</h1>
          <p className="text-sm">Hesabınıza giriş yaparak devam edin.</p>
        </div>

        {error && (
          <div className="bg-danger/10 p-4 rounded-xl text-danger text-sm flex items-center gap-3 mb-6 font-semibold border border-danger/20">
            <AlertCircle size={20} /> {error}
          </div>
        )}

        {/* Role Switcher */}
        <div className="flex bg-light p-1 rounded-xl mb-8">
          <button 
            className={`flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${role === 'worker' ? 'bg-white shadow-md text-primary' : 'text-muted hover:text-dark'}`}
            onClick={() => setRole('worker')}
          >
            <User size={18} /> İŞ ARALAYAN
          </button>
          <button 
            className={`flex-1 py-3 rounded-lg font-bold text-sm flex items-center justify-center gap-2 transition-all ${role === 'employer' ? 'bg-white shadow-md text-primary' : 'text-muted hover:text-dark'}`}
            onClick={() => setRole('employer')}
          >
            <Briefcase size={18} /> İŞVEREN
          </button>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-6">
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input 
              type="email" 
              placeholder="E-posta Adresi" 
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-light focus:border-primary outline-none font-medium transition-colors"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input 
              type="password" 
              placeholder="Şifre" 
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-light focus:border-primary outline-none font-medium transition-colors"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <div className="text-right">
            <Link to="#" className="text-sm text-primary font-semibold hover:underline">Şifremi Unuttum</Link>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary py-4 rounded-xl shadow-lg gap-3 text-lg disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? "GİRİŞ YAPILIYOR..." : "GİRİŞ YAP"} <ArrowRight size={20} />
          </button>
        </form>

        <div className="my-8 flex items-center gap-4 text-muted text-xs font-bold uppercase tracking-widest">
          <div className="h-[1px] bg-light flex-1" />
          Veya
          <div className="h-[1px] bg-light flex-1" />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <button onClick={handleGoogleLogin} className="btn btn-outline py-3 rounded-xl gap-2 text-sm border-light text-dark hover:bg-light">
            <Chrome size={18} /> Google
          </button>
          <button className="btn btn-outline py-3 rounded-xl gap-2 text-sm border-light text-dark hover:bg-light">
            <Github size={18} /> Github
          </button>
        </div>

        <p className="text-center text-sm text-muted">
          Henüz hesabınız yok mu? <Link to="/kayit" className="text-primary font-bold hover:underline">Kaydolun</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
