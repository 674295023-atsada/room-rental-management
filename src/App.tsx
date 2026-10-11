import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { RoomManagementView } from './components/RoomManagementView';
import { LeaseManagementView } from './components/LeaseManagementView';
import { MeterBillingView } from './components/MeterBillingView';
import { InvoicePaymentView } from './components/InvoicePaymentView';
import { MaintenanceView } from './components/MaintenanceView';
import { DatabaseView } from './components/DatabaseView';
import { DeploymentGuideView } from './components/DeploymentGuideView';
import { LoginPage } from './components/LoginPage';
import { TenantPortalView } from './components/TenantPortalView';
import { ChatbotWidget } from './components/ChatbotWidget';

import { Room, LeaseContract, MeterReading, Invoice, MaintenanceTicket, User } from './types';
import { StorageService, SystemRates } from './services/storage';
import { AuthService } from './services/auth';
import { apiUrl } from './services/api';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(() => AuthService.getCurrentUser());
  const isAdmin = currentUser?.role === 'ADMIN';

  const [activeTab, setActiveTab] = useState<TabType>(() => {
    const user = AuthService.getCurrentUser();
    return user?.role === 'ADMIN' ? 'dashboard' : 'tenant-portal';
  });

  // Application Data States
  const [rooms, setRooms] = useState<Room[]>(() => StorageService.getRooms());
  const [leases, setLeases] = useState<LeaseContract[]>(() => StorageService.getLeases());
  const [meters, setMeters] = useState<MeterReading[]>(() => StorageService.getMeters());
  const [invoices, setInvoices] = useState<Invoice[]>(() => StorageService.getInvoices());
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => StorageService.getTickets());
  const [rates, setRates] = useState<SystemRates>(() => StorageService.getRates());
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  // Two-way sync with Cloudflare D1 database
  const refreshDataFromD1 = async () => {
    try {
      const res = await fetch(apiUrl('/api/data'));
      if (res.ok) {
        const data = await res.json();
        if (data.rooms && data.rooms.length > 0) {
          setRooms(data.rooms);
          StorageService.saveRooms(data.rooms);
        }
        if (data.leases && data.leases.length > 0) {
          setLeases(data.leases);
          StorageService.saveLeases(data.leases);
        }
        if (data.meters && data.meters.length > 0) {
          setMeters(data.meters);
          StorageService.saveMeters(data.meters);
        }
        if (data.invoices && data.invoices.length > 0) {
          setInvoices(data.invoices);
          StorageService.saveInvoices(data.invoices);
        }
        if (data.tickets && data.tickets.length > 0) {
          setTickets(data.tickets);
          StorageService.saveTickets(data.tickets);
        }
        if (data.rates) {
          setRates(data.rates);
          StorageService.saveRates(data.rates);
        }
        if (data.users && data.users.length > 0) {
          setRegisteredUsers(data.users);
        }
        console.log('✅ Connected & Synced with Cloudflare D1 Database:', data.counts);
      }
    } catch (err) {
      console.warn('D1 local fallback:', err);
    }
  };

  useEffect(() => {
    if (!currentUser) return;
    refreshDataFromD1();
  }, [currentUser]);

  const handleUpdateRooms = (updatedRooms: Room[]) => {
    setRooms(updatedRooms);
    StorageService.saveRooms(updatedRooms);
    fetch(apiUrl('/api/data'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SAVE_ROOMS', data: updatedRooms })
    }).catch(console.warn);
  };

  const handleUpdateLeases = (
    updatedLeases: LeaseContract[], 
    actionMeta?: { action: 'SAVE_LEASE' | 'TERMINATE_LEASE'; data: any }
  ) => {
    setLeases(updatedLeases);
    StorageService.saveLeases(updatedLeases);
    if (actionMeta) {
      fetch(apiUrl('/api/data'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(actionMeta)
      })
      .then(() => refreshDataFromD1())
      .catch(console.warn);
    } else if (updatedLeases.length > 0) {
      fetch(apiUrl('/api/data'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_LEASE', data: updatedLeases[0] })
      })
      .then(() => refreshDataFromD1())
      .catch(console.warn);
    }
  };

  const handleUpdateMeters = (updatedMeters: MeterReading[]) => {
    setMeters(updatedMeters);
    StorageService.saveMeters(updatedMeters);
    fetch(apiUrl('/api/data'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SAVE_METERS', data: updatedMeters })
    }).catch(console.warn);
  };

  const handleUpdateInvoices = (updatedInvoices: Invoice[]) => {
    setInvoices(updatedInvoices);
    StorageService.saveInvoices(updatedInvoices);
    fetch(apiUrl('/api/data'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SAVE_INVOICES', data: updatedInvoices })
    }).catch(console.warn);
  };

  const handleUpdateTickets = (updatedTickets: MaintenanceTicket[]) => {
    setTickets(updatedTickets);
    StorageService.saveTickets(updatedTickets);
    if (updatedTickets.length > 0) {
      fetch(apiUrl('/api/data'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'SAVE_TICKET', data: updatedTickets[0] })
      }).catch(console.warn);
    }
  };

  const handleUpdateRates = (updatedRates: SystemRates) => {
    setRates(updatedRates);
    StorageService.saveRates(updatedRates);
    fetch(apiUrl('/api/data'), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'SAVE_RATES', data: updatedRates })
    }).catch(console.warn);
  };

  const handleResetData = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      StorageService.resetAllData();
    }
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setActiveTab(user.role === 'ADMIN' ? 'dashboard' : 'tenant-portal');
  };

  const handleLogout = () => {
    if (confirm('ต้องการออกจากระบบใช่หรือไม่?')) {
      AuthService.logout();
      setCurrentUser(null);
    }
  };

  // If user is not authenticated with Google, show the Login Page
  if (!currentUser) {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  const pendingInvoicesCount = invoices.filter(i => i.status === 'AWAITING_APPROVAL').length;
  const openTicketsCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar 
        currentUser={currentUser}
        onLogout={handleLogout}
        onDataReset={handleResetData} 
      />

      <div className="flex flex-1">
        <Sidebar
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={{
            pendingInvoices: pendingInvoicesCount,
            openTickets: openTicketsCount
          }}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
          {/* TENANT VIEW: If not admin, always render TenantPortalView */}
          {!isAdmin ? (
            <TenantPortalView
              currentUser={currentUser}
              rooms={rooms}
              invoices={invoices}
              tickets={tickets}
              leases={leases}
              onUpdateInvoices={handleUpdateInvoices}
              onUpdateTickets={handleUpdateTickets}
              onRefresh={refreshDataFromD1}
            />
          ) : (
            /* ADMIN VIEWS */
            <>
              {activeTab === 'dashboard' && (
                <DashboardView
                  rooms={rooms}
                  invoices={invoices}
                  tickets={tickets}
                  leases={leases}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'rooms' && (
                <RoomManagementView
                  rooms={rooms}
                  onUpdateRooms={handleUpdateRooms}
                />
              )}

              {activeTab === 'leases' && (
                <LeaseManagementView
                  leases={leases}
                  rooms={rooms}
                  registeredUsers={registeredUsers}
                  onUpdateLeases={handleUpdateLeases}
                  onUpdateRooms={handleUpdateRooms}
                />
              )}

              {activeTab === 'meters' && (
                <MeterBillingView
                  rooms={rooms}
                  meters={meters}
                  rates={rates}
                  invoices={invoices}
                  onUpdateMeters={handleUpdateMeters}
                  onUpdateInvoices={handleUpdateInvoices}
                  onUpdateRates={handleUpdateRates}
                  onNavigateToInvoices={() => setActiveTab('invoices')}
                />
              )}

              {activeTab === 'invoices' && (
                <InvoicePaymentView
                  invoices={invoices}
                  onUpdateInvoices={handleUpdateInvoices}
                />
              )}

              {activeTab === 'maintenance' && (
                <MaintenanceView
                  tickets={tickets}
                  rooms={rooms}
                  onUpdateTickets={handleUpdateTickets}
                />
              )}

              {activeTab === 'database' && (
                <DatabaseView
                  currentUser={currentUser}
                />
              )}

              {activeTab === 'deployment' && (
                <DeploymentGuideView />
              )}
            </>
          )}
        </main>
      </div>

      {/* 24/7 AI Chatbot Assistant */}
      <ChatbotWidget currentUser={currentUser} />
    </div>
  );
};

export default App;
