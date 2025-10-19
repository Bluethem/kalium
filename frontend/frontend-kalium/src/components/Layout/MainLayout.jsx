import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import ChatButton from './ChatButton';

function MainLayout() {
  return (
    <div className="flex flex-col min-h-screen bg-[#f6f6f8] dark:bg-[#111621]">
      <Header />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      <ChatButton />
    </div>
  );
}

export default MainLayout;
