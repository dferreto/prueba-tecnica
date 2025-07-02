
import React from 'react';
import { FaWhatsapp, FaTiktok, FaInstagram } from 'react-icons/fa';
import './header.css';

export default function Header() {
  return (
  <header className="main-header">
  <div className="left-section">
    <h1 className="titulo-superquads">SUPER QUADS</h1>

    <nav className="nav-links">
      <a href="#tour">Tour</a>
      <a href="#galeria">Galería de Aventuras</a>
      <a href="#acerca">Acerca de</a>
    </nav>
  </div>

  <div className="social-reserva">
    <div className="icons">
      <FaWhatsapp />
      <FaTiktok />
      <FaInstagram />
    </div>
    <button className="reserva-btn">
  RESERVAR <span className="arrow">➜</span>
</button>
  </div>
</header>
    

  );
}
