import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from '../Header';
import Footer from '../Footer';

export default function Layout2({ darkMode }) {
  return (
    <div className={`${darkMode ? 'cs_dark' : ''}`}>
      <Header
        logoUrl="/images/logo_white.svg"
        colorVariant="cs_color_1"
        actionBtnText="Getting Started"
        actionBtnUrl="/contact"
      />
      <Outlet />
      <Footer />
    </div>
  );
}
