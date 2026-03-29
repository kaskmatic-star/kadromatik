import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import AIAssistant from './components/AIAssistant';
import Home from './pages/Home';
import JobSearch from './pages/JobSearch';
import JobDetail from './pages/JobDetail';
import EmployerPortal from './pages/EmployerPortal';
import WorkerList from './pages/WorkerList';
import About from './pages/About';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import { AuthProvider } from './context/AuthContext';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/is-ara" element={<JobSearch />} />
              <Route path="/is/:id" element={<JobDetail />} />
              <Route path="/isci-bul" element={<EmployerPortal />} />
              <Route path="/aktif-isciler" element={<WorkerList />} />
              <Route path="/hakkimizda" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/kayit" element={<Register />} />
              <Route path="/profil" element={<Profile />} />
            </Routes>
          </main>
          <AIAssistant />
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
