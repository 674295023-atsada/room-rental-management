import { Room, LeaseContract, MeterReading, Invoice, MaintenanceTicket } from '../types';
import { INITIAL_ROOMS, INITIAL_LEASES, INITIAL_METERS, INITIAL_INVOICES, INITIAL_TICKETS } from '../data/mockData';

const STORAGE_KEYS = {
  ROOMS: 'rr_rooms_v1',
  LEASES: 'rr_leases_v1',
  METERS: 'rr_meters_v1',
  INVOICES: 'rr_invoices_v1',
  TICKETS: 'rr_tickets_v1',
  RATES: 'rr_rates_v1'
};

export interface SystemRates {
  waterRate: number;
  electricRate: number;
  commonFee: number;
}

export const DEFAULT_RATES: SystemRates = {
  waterRate: 18,
  electricRate: 8,
  commonFee: 200
};

// Safe localStorage access
export const StorageService = {
  getRooms(): Room[] {
    const raw = localStorage.getItem(STORAGE_KEYS.ROOMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
      return INITIAL_ROOMS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_ROOMS;
    }
  },

  saveRooms(rooms: Room[]) {
    localStorage.setItem(STORAGE_KEYS.ROOMS, JSON.stringify(rooms));
  },

  getLeases(): LeaseContract[] {
    const raw = localStorage.getItem(STORAGE_KEYS.LEASES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.LEASES, JSON.stringify(INITIAL_LEASES));
      return INITIAL_LEASES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_LEASES;
    }
  },

  saveLeases(leases: LeaseContract[]) {
    localStorage.setItem(STORAGE_KEYS.LEASES, JSON.stringify(leases));
  },

  getMeters(): MeterReading[] {
    const raw = localStorage.getItem(STORAGE_KEYS.METERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.METERS, JSON.stringify(INITIAL_METERS));
      return INITIAL_METERS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_METERS;
    }
  },

  saveMeters(meters: MeterReading[]) {
    localStorage.setItem(STORAGE_KEYS.METERS, JSON.stringify(meters));
  },

  getInvoices(): Invoice[] {
    const raw = localStorage.getItem(STORAGE_KEYS.INVOICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(INITIAL_INVOICES));
      return INITIAL_INVOICES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_INVOICES;
    }
  },

  saveInvoices(invoices: Invoice[]) {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  },

  getTickets(): MaintenanceTicket[] {
    const raw = localStorage.getItem(STORAGE_KEYS.TICKETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(INITIAL_TICKETS));
      return INITIAL_TICKETS;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return INITIAL_TICKETS;
    }
  },

  saveTickets(tickets: MaintenanceTicket[]) {
    localStorage.setItem(STORAGE_KEYS.TICKETS, JSON.stringify(tickets));
  },

  getRates(): SystemRates {
    const raw = localStorage.getItem(STORAGE_KEYS.RATES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(DEFAULT_RATES));
      return DEFAULT_RATES;
    }
    try {
      return JSON.parse(raw);
    } catch {
      return DEFAULT_RATES;
    }
  },

  saveRates(rates: SystemRates) {
    localStorage.setItem(STORAGE_KEYS.RATES, JSON.stringify(rates));
  },

  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.ROOMS);
    localStorage.removeItem(STORAGE_KEYS.LEASES);
    localStorage.removeItem(STORAGE_KEYS.METERS);
    localStorage.removeItem(STORAGE_KEYS.INVOICES);
    localStorage.removeItem(STORAGE_KEYS.TICKETS);
    localStorage.removeItem(STORAGE_KEYS.RATES);
    window.location.reload();
  }
};
