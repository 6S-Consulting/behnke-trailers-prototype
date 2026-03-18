import { MaintenanceSlot } from '@/types';

export const maintenanceSlots: MaintenanceSlot[] = [
  { id: 'ms1', trailerId: 'st2', customerId: 'c1', dealerId: 'd1', requestedDate: '2025-05-20', confirmedDate: '2025-05-20', status: 'Confirmed', type: 'Scheduled', notes: 'Annual maintenance — belt conveyor and bearings' },
  { id: 'ms2', trailerId: 'st4', customerId: 'c3', dealerId: 'd1', requestedDate: '2025-04-01', status: 'Requested', type: 'Scheduled', notes: 'Brake pad replacement needed — wear at 22%' },
  { id: 'ms3', trailerId: 'st6', customerId: 'c4', dealerId: 'd2', requestedDate: '2025-03-25', status: 'Requested', type: 'Emergency', notes: 'CRITICAL: Brake pad wear 12%, frame microfractures. Immediate inspection needed.' },
  { id: 'ms4', trailerId: 'st10', customerId: 'c7', dealerId: 'd4', requestedDate: '2025-03-22', confirmedDate: '2025-03-22', status: 'Confirmed', type: 'Emergency', notes: 'Frame integrity alert — full inspection and brake service' },
  { id: 'ms5', trailerId: 'st9', customerId: 'c7', dealerId: 'd4', requestedDate: '2025-08-20', status: 'Requested', type: 'Scheduled', notes: 'Annual service' },
  { id: 'ms6', trailerId: 'st12', customerId: 'c9', dealerId: 'd5', requestedDate: '2025-05-05', confirmedDate: '2025-05-05', status: 'Confirmed', type: 'Scheduled', notes: 'Six-month check — high mileage unit' },
  { id: 'ms7', trailerId: 'st1', customerId: 'c1', dealerId: 'd1', requestedDate: '2024-09-15', confirmedDate: '2024-09-15', status: 'Completed', type: 'Scheduled', notes: 'Annual inspection completed' },
  { id: 'ms8', trailerId: 'st7', customerId: 'c5', dealerId: 'd2', requestedDate: '2025-04-05', status: 'Requested', type: 'Scheduled', notes: 'Annual service — warranty expiring soon' },
  { id: 'ms9', trailerId: 'st5', customerId: 'c3', dealerId: 'd1', requestedDate: '2025-07-18', status: 'Requested', type: 'Scheduled', notes: 'Annual hydraulic system service' },
  { id: 'ms10', trailerId: 'st14', customerId: 'c10', dealerId: 'd7', requestedDate: '2025-08-14', status: 'Requested', type: 'Inspection', notes: 'Six-month inspection' },
  { id: 'ms11', trailerId: 'st3', customerId: 'c2', dealerId: 'd1', requestedDate: '2025-06-14', status: 'Requested', type: 'Scheduled', notes: 'First annual maintenance' },
  { id: 'ms12', trailerId: 'st11', customerId: 'c8', dealerId: 'd4', requestedDate: '2025-10-10', status: 'Requested', type: 'Scheduled', notes: 'Annual service' },
  { id: 'ms13', trailerId: 'st13', customerId: 'c9', dealerId: 'd5', requestedDate: '2025-06-20', status: 'Requested', type: 'Scheduled', notes: 'Annual service' },
  { id: 'ms14', trailerId: 'st8', customerId: 'c6', dealerId: 'd3', requestedDate: '2025-10-12', status: 'Requested', type: 'Scheduled', notes: 'Annual service' },
];
