import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import JobSearch from './pages/JobSearch';
import JobDetail from './pages/JobDetail';
import EmployerPortal from './pages/EmployerPortal';
import './App.css';

function App() {
  return (
    <Router>
      <div className="app">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/is-ara" element={<JobSearch />} />
            <Route path="/is/:id" element={<JobDetail />} />
            <Route path="/isci-bul" element={<EmployerPortal />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
