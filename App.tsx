
import React, { useState, useEffect } from 'react';
import { ViewType, Client, Project, TeamMember, Transaction, Package, AddOn, TeamProjectPayment, Profile, FinancialPocket, TeamPaymentRecord, Lead, RewardLedgerEntry } from './types';
import { useClients, useProjects, useTeamMembers, useTransactions, usePackages, useAddOns, useTeamProjectPayments, useProfile, usePockets, useTeamPaymentRecords, useLeads, useRewardLedgerEntries } from './hooks/useSupabase';
import { useAuth } from './hooks/useAuth';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Clients from './components/Clients';
import Projects from './components/Projects';
import Team from './components/Team';
import Finance from './components/Finance';
import Packages from './components/Packages';
import Settings from './components/Settings';
import CalendarView from './components/CalendarView';
import ClientKPI from './components/ClientKPI';
import Login from './components/Login';
import Signup from './components/Signup';
import SuggestionForm from './components/SuggestionForm';
import Header from './components/Header';

export type NavigationAction = {
  type: string;
  id?: string;
  tab?: 'info' | 'project' | 'payment' | 'invoice';
};

const App: React.FC = () => {
  // Authentication state
  const { user, session, loading: authLoading, signOut } = useAuth();
  const [isLoginMode, setIsLoginMode] = useState(true);

  // UI state
  const [currentView, setCurrentView] = useState<ViewType>(ViewType.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [initialAction, setInitialAction] = useState<NavigationAction | null>(null);

  // Supabase hooks for data management
  const { data: clients, addItem: addClient, updateItem: updateClient, deleteItem: deleteClient, loading: clientsLoading } = useClients();
  const { data: projects, addItem: addProject, updateItem: updateProject, deleteItem: deleteProject, loading: projectsLoading } = useProjects();
  const { data: teamMembers, addItem: addTeamMember, updateItem: updateTeamMember, deleteItem: deleteTeamMember, loading: teamLoading } = useTeamMembers();
  const { data: transactions, addItem: addTransaction, updateItem: updateTransaction, deleteItem: deleteTransaction, loading: transactionsLoading } = useTransactions();
  const { data: packages, addItem: addPackage, updateItem: updatePackage, deleteItem: deletePackage, loading: packagesLoading } = usePackages();
  const { data: addOns, addItem: addAddOn, updateItem: updateAddOn, deleteItem: deleteAddOn, loading: addOnsLoading } = useAddOns();
  const { data: teamProjectPayments, addItem: addTeamProjectPayment, updateItem: updateTeamProjectPayment, deleteItem: deleteTeamProjectPayment } = useTeamProjectPayments();
  const { data: teamPaymentRecords, addItem: addTeamPaymentRecord, updateItem: updateTeamPaymentRecord, deleteItem: deleteTeamPaymentRecord } = useTeamPaymentRecords();
  const { data: pockets, addItem: addPocket, updateItem: updatePocket, deleteItem: deletePocket, loading: pocketsLoading } = usePockets();
  const { profile, updateProfile, loading: profileLoading } = useProfile();
  const { data: leads, addItem: addLead, updateItem: updateLead, deleteItem: deleteLead, loading: leadsLoading } = useLeads();
  const { data: rewardEntries, addItem: addRewardEntry, updateItem: updateRewardEntry, deleteItem: deleteRewardEntry } = useRewardLedgerEntries();

  const showNotification = (message: string) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleLogout = async () => {
    await signOut();
    setCurrentView(ViewType.DASHBOARD);
  };

  // Show loading screen while authentication is being checked
  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat aplikasi...</p>
        </div>
      </div>
    );
  }

  // Show authentication screens if user is not logged in
  if (!user || !session) {
    return (
      <div className="min-h-screen bg-slate-50">
        {isLoginMode ? (
          <Login 
            onLoginSuccess={() => {
              setCurrentView(ViewType.DASHBOARD);
              showNotification('Login berhasil!');
            }}
            switchToSignup={() => setIsLoginMode(false)}
            switchToSuggestion={() => {
              // Handle suggestion form if needed
              console.log('Switch to suggestion form');
            }}
          />
        ) : (
          <Signup 
            onSignupSuccess={() => {
              setCurrentView(ViewType.DASHBOARD);
              showNotification('Akun berhasil dibuat!');
            }}
            switchToLogin={() => setIsLoginMode(true)} 
          />
        )}
      </div>
    );
  }

  // Show loading screen while user data is being fetched
  if (profileLoading || clientsLoading || projectsLoading || packagesLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-800 mx-auto mb-4"></div>
          <p className="text-slate-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  // Show error if profile is not available
  if (!profile) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center p-8">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Gagal Memuat Profil</h2>
          <p className="text-slate-600 mb-4">Terjadi kesalahan saat memuat profil pengguna.</p>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-700"
          >
            Logout & Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentView) {
      case ViewType.CLIENTS:
        return (
          <Clients
            clients={clients}
            addClient={addClient}
            updateClient={updateClient}
            deleteClient={deleteClient}
            projects={projects}
            addProject={addProject}
            updateProject={updateProject}
            deleteProject={deleteProject}
            packages={packages}
            addOns={addOns}
            transactions={transactions}
            addTransaction={addTransaction}
            updateTransaction={updateTransaction}
            deleteTransaction={deleteTransaction}
            userProfile={profile}
            showNotification={showNotification}
            initialAction={initialAction}
            setInitialAction={setInitialAction}
          />
        );
      case ViewType.PROJECTS:
        return (
          <Projects
            projects={projects}
            setProjects={() => {}} // We'll handle via hooks
            clients={clients}
            packages={packages}
            teamMembers={teamMembers}
            teamProjectPayments={teamProjectPayments}
            setTeamProjectPayments={() => {}} // We'll handle via hooks
            transactions={transactions}
            setTransactions={() => {}} // We'll handle via hooks
            initialAction={initialAction}
            setInitialAction={setInitialAction}
            profile={profile}
            showNotification={showNotification}
          />
        );
      case ViewType.TEAM:
        return (
          <Team
            teamMembers={teamMembers}
            addTeamMember={addTeamMember}
            updateTeamMember={updateTeamMember}
            deleteTeamMember={deleteTeamMember}
            projects={projects}
            teamProjectPayments={teamProjectPayments}
            addTeamProjectPayment={addTeamProjectPayment}
            updateTeamProjectPayment={updateTeamProjectPayment}
            deleteTeamProjectPayment={deleteTeamProjectPayment}
            teamPaymentRecords={teamPaymentRecords}
            addTeamPaymentRecord={addTeamPaymentRecord}
            updateTeamPaymentRecord={updateTeamPaymentRecord}
            deleteTeamPaymentRecord={deleteTeamPaymentRecord}
            rewardEntries={rewardEntries}
            addRewardEntry={addRewardEntry}
            updateRewardEntry={updateRewardEntry}
            deleteRewardEntry={deleteRewardEntry}
            transactions={transactions}
            addTransaction={addTransaction}
            updateTransaction={updateTransaction}
            deleteTransaction={deleteTransaction}
            showNotification={showNotification}
          />
        );
      case ViewType.FINANCE:
        return (
          <Finance
            transactions={transactions}
            setTransactions={() => {}} // We'll handle via hooks
            pockets={pockets}
            setPockets={() => {}} // We'll handle via hooks
            projects={projects}
            profile={profile}
          />
        );
      case ViewType.CALENDAR:
        return (
          <CalendarView
            projects={projects}
            setProjects={() => {}} // We'll handle via hooks
            teamMembers={teamMembers}
            profile={profile}
          />
        );
      case ViewType.PACKAGES:
        return (
          <Packages
            packages={packages}
            setPackages={() => {}} // We'll handle via hooks
            addOns={addOns}
            setAddOns={() => {}} // We'll handle via hooks
            projects={projects}
          />
        );
      case ViewType.SETTINGS:
        return (
          <Settings
            profile={profile}
            updateProfile={updateProfile}
            showNotification={showNotification}
            onLogout={handleLogout}
          />
        );
      case ViewType.KPI_KLIEN:
        return (
          <ClientKPI
            clients={clients}
            setClients={() => {}} // We'll handle via hooks
            projects={projects}
            leads={leads}
            setLeads={() => {}} // We'll handle via hooks
            showNotification={showNotification}
          />
        );
      default:
        return (
          <Dashboard
            clients={clients}
            projects={projects}
            teamMembers={teamMembers}
            transactions={transactions}
            pockets={pockets}
            leads={leads}
            profile={profile}
            onNavigate={(action) => setInitialAction(action)}
            setCurrentView={setCurrentView}
            showNotification={showNotification}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        user={user}
        onLogout={handleLogout}
      />
      
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          user={user}
          onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
          onLogout={handleLogout}
        />
        
        <main className="flex-1 p-4 lg:p-8 overflow-auto">
          {renderContent()}
        </main>
      </div>

      {/* Notification */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 bg-emerald-600 text-white px-6 py-3 rounded-lg shadow-lg">
          {notification}
        </div>
      )}
    </div>
  );
};

export default App;
