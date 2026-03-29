import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import JobSearch from './pages/JobSearch';
import JobDetail from './pages/JobDetail';
import EmployerPortal from './pages/EmployerPortal';
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
              <Route path="/hakkimizda" element={<About />} />
              <Route path="/login" element={<Login />} />
              <Route path="/kayit" element={<Register />} />
              <Route path="/profil" element={<Profile />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
