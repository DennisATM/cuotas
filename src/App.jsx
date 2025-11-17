import {HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import { Dashboard } from './pages/Dashboard/Dashboard';
import { Registro } from './pages/Registro/Registro';
import { Alumnos } from './pages/Alumnos/alumnos';
import Pagos from './pages/Pagos/Pagos'
import { Navbar } from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/registro" element={<Registro />} />
        <Route path="/alumnos" element={<Alumnos />} />
        <Route path="/pagos" element={<Pagos />} />
      </Routes>
    </Router>
  )
}

export default App
