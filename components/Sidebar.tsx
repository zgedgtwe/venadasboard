
import React from 'react';
import { ViewType } from '../types';
import { NAV_ITEMS, LogOutIcon } from '../constants';

interface SidebarProps {
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  user: any;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen, user, onLogout }) => {
  const filteredNavItems = NAV_ITEMS.filter(item => item.label !== 'Proyek Freelancer');

  return (
    <>
      {/* Backdrop for mobile */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      ></div>

      <aside className={`fixed md:relative inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex-col flex-shrink-0 flex z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
        <div className="h-16 flex items-center justify-center border-b border-slate-200 flex-shrink-0">
          <h1 className="text-xl font-bold text-slate-800">Vena Pictures</h1>
        </div>
        <nav className="flex-1 px-4 py-4 overflow-y-auto">
          <ul>
            {filteredNavItems.map((item) => (
              <li key={item.view}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setCurrentView(item.view);
                    setIsOpen(false); // Close sidebar on mobile
                  }}
                  className={`flex items-center px-4 py-2.5 my-1 text-sm font-medium rounded-lg transition-colors
                    ${
                      currentView === item.view
                        ? 'bg-slate-800 text-white'
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                >
                  <item.icon className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span>{item.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="px-4 pb-4 flex-shrink-0">
            <button 
                onClick={onLogout} 
                className="flex items-center w-full px-4 py-2.5 my-1 text-sm font-medium rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                aria-label="Keluar dari aplikasi"
            >
                <LogOutIcon className="w-5 h-5 mr-3 flex-shrink-0" />
                <span>Keluar</span>
            </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
