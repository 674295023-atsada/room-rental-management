import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar, TabType } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { RoomManagementView } from './components/RoomManagementView';
import { LeaseManagementView } from './components/LeaseManagementView';
import { MeterBillingView } from './components/MeterBillingView';
import { InvoicePaymentView } from './components/InvoicePaymentView';
import { MaintenanceView } from './components/MaintenanceView';
import { DeploymentGuideView } from './components/DeploymentGuideView';

import { Room, LeaseContract, MeterReading, Invoice, MaintenanceTicket } from './types';
import { StorageService, SystemRates } from './services/storage';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');

  // Application Data States
  const [rooms, setRooms] = useState<Room[]>(() => StorageService.getRooms());
  const [leases, setLeases] = useState<LeaseContract[]>(() => StorageService.getLeases());
  const [meters, setMeters] = useState<MeterReading[]>(() => StorageService.getMeters());
  const [invoices, setInvoices] = useState<Invoice[]>(() => StorageService.getInvoices());
  const [tickets, setTickets] = useState<MaintenanceTicket[]>(() => StorageService.getTickets());
  const [rates, setRates] = useState<SystemRates>(() => StorageService.getRates());

  // Keep localStorage synced
  const handleUpdateRooms = (updatedRooms: Room[]) => {
    setRooms(updatedRooms);
    StorageService.saveRooms(updatedRooms);
  };

  const handleUpdateLeases = (updatedLeases: LeaseContract[]) => {
    setLeases(updatedLeases);
    StorageService.saveLeases(updatedLeases);
  };

  const handleUpdateMeters = (updatedMeters: MeterReading[]) => {
    setMeters(updatedMeters);
    StorageService.saveMeters(updatedMeters);
  };

  const handleUpdateInvoices = (updatedInvoices: Invoice[]) => {
    setInvoices(updatedInvoices);
    StorageService.saveInvoices(updatedInvoices);
  };

  const handleUpdateTickets = (updatedTickets: MaintenanceTicket[]) => {
    setTickets(updatedTickets);
    StorageService.saveTickets(updatedTickets);
  };

  const handleUpdateRates = (updatedRates: SystemRates) => {
    setRates(updatedRates);
    StorageService.saveRates(updatedRates);
  };

  const handleResetData = () => {
    if (confirm('คุณต้องการรีเซ็ตข้อมูลตัวอย่างทั้งหมดกลับเป็นค่าเริ่มต้นใช่หรือไม่?')) {
      StorageService.resetAllData();
    }
  };

  const pendingInvoicesCount = invoices.filter(i => i.status === 'AWAITING_APPROVAL').length;
  const openTicketsCount = tickets.filter(t => t.status === 'OPEN' || t.status === 'IN_PROGRESS').length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Navbar onDataReset={handleResetData} />

      <div className="flex flex-1">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          counts={{
            pendingInvoices: pendingInvoicesCount,
            openTickets: openTicketsCount
          }}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full">
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

          {activeTab === 'deployment' && (
            <DeploymentGuideView />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
