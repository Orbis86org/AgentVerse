import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';

export default function Layout({ darkMode }) {
  return (
    <div className={`${darkMode ? 'cs_dark' : ''}`}>
      <Header
        logoUrl={darkMode ? '/images/logo_white.svg' : '/images/logo.svg'}
        actionBtnText="Getting Started"
        actionBtnUrl="/contact"
      />
      <Outlet />
      <Footer />
    </div>
  );
}
