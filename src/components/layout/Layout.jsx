import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { ToastContainer } from '../common/Toast';

export const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="app-main">
        <Header />
        <main className="page-container">
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <ToastContainer />
    </div>
  );
};
