import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { trailers as initialTrailers } from '@/data/trailers';
import { dealers as initialDealers } from '@/data/dealers';
import { customers as initialCustomers } from '@/data/customers';
import { orders as initialOrders } from '@/data/orders';
import { quotes as initialQuotes } from '@/data/quotes';
import { soldTrailers as initialSoldTrailers } from '@/data/soldTrailers';
import { maintenanceSlots as initialMaintenanceSlots } from '@/data/maintenanceSlots';
import { notifications as initialNotifications } from '@/data/notifications';
import { Dealer, Customer, MaintenanceSlot, Notification, Order, Quote, QuoteItem, SensorData, SoldTrailer, Trailer } from '@/types';

type AppDataState = {
  trailers: Trailer[];
  dealers: Dealer[];
  customers: Customer[];
  orders: Order[];
  quotes: Quote[];
  soldTrailers: SoldTrailer[];
  maintenanceSlots: MaintenanceSlot[];
  notifications: Notification[];
};

type CreateQuoteInput = {
  dealerId: string;
  customerId: string;
  trailerId: string; // Trailer.id
  quantity: number;
  notes?: string;
};

type ConvertQuoteToOrderInput = {
  quoteId: string;
};

type AdvanceOrderInput = {
  orderId: string;
};

type SubmitDealerOrderToBehnkeInput = {
  dealerId: string;
  trailerId: string; // Trailer.id
  quantity: number;
  notes: string;
};

type RequestMaintenanceSlotInput = {
  customerId: string;
  dealerId: string;
  soldTrailerId: string; // SoldTrailer.id
  trailerId: string; // Trailer.id (optional linkage for UI)
  requestedDate: string; // YYYY-MM-DD
  type: 'Scheduled' | 'Emergency' | 'Inspection';
  notes: string;
};

type ConfirmMaintenanceSlotInput = {
  slotId: string;
  message?: string;
  priority?: 'Normal' | 'Urgent';
};

type CompleteMaintenanceSlotInput = {
  slotId: string;
};

type PushHealthWarningInput = {
  soldTrailerId: string; // SoldTrailer.id
  message: string;
};

type AppDataContextType = {
  state: AppDataState;
  actions: {
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;
    createQuoteFromDealer: (input: CreateQuoteInput) => Quote;
    updateQuoteStatus: (quoteId: string, status: Quote['status']) => Quote | null;
    convertQuoteToOrder: (input: ConvertQuoteToOrderInput) => Order | null;
    submitDealerOrderToBehnke: (input: SubmitDealerOrderToBehnkeInput) => Order;
    advanceOrderStatus: (input: AdvanceOrderInput) => Order | null;
    requestMaintenanceSlot: (input: RequestMaintenanceSlotInput) => MaintenanceSlot;
    confirmMaintenanceSlot: (input: ConfirmMaintenanceSlotInput) => MaintenanceSlot | null;
    completeMaintenanceSlot: (input: CompleteMaintenanceSlotInput) => MaintenanceSlot | null;
    cancelMaintenanceSlot: (slotId: string) => void;
    pushHealthWarning: (input: PushHealthWarningInput) => Notification | null;
  };
};

const AppDataContext = createContext<AppDataContextType>({
  state: {
    trailers: [],
    dealers: [],
    customers: [],
    orders: [],
    quotes: [],
    soldTrailers: [],
    maintenanceSlots: [],
    notifications: [],
  },
  actions: {
    markNotificationRead: () => { },
    markAllNotificationsRead: () => { },
    createQuoteFromDealer: () => {
      throw new Error('AppDataContext not initialized');
    },
    updateQuoteStatus: () => null,
    convertQuoteToOrder: () => null,
    submitDealerOrderToBehnke: () => {
      throw new Error('AppDataContext not initialized');
    },
    advanceOrderStatus: () => null,
    requestMaintenanceSlot: () => {
      throw new Error('AppDataContext not initialized');
    },
    confirmMaintenanceSlot: () => null,
    completeMaintenanceSlot: () => null,
    cancelMaintenanceSlot: () => { },
    pushHealthWarning: () => null,
  },
});

const STORAGE_KEY = 'bb_appdata_v1';

const todayISO = () => new Date().toISOString().slice(0, 10);

const addDaysISO = (iso: string, days: number) => {
  const d = new Date(iso + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const formatNowISO = () => new Date().toISOString();

const uid = (prefix: string) => `${prefix}${Math.floor(1000 + Math.random() * 9000)}${Date.now().toString(16).slice(-4)}`;

const makeOrderNumber = (prefix: 'BB' | 'CO') => {
  const yr = new Date().getFullYear().toString().slice(-2);
  return `${prefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const makeQuoteNumber = () => {
  const yr = new Date().getFullYear().toString().slice(-2);
  return `QT-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
};

const computeQuoteTotals = (items: QuoteItem[], taxRate = 0.055) => {
  const subtotal = items.reduce((s, i) => s + i.lineTotal, 0);
  const tax = Math.round(subtotal * taxRate);
  const total = subtotal + tax;
  return { subtotal, tax, total };
};

const categoryHealthSeed = (category: Trailer['category']) => {
  // Lightly bias sensor values by category so charts look reasonable.
  switch (category) {
    case 'Heavy Haul':
      return { tempMin: 150, tempMax: 240, brakeMin: 10, brakeMax: 60, loadMin: 55000, loadMax: 115000 };
    case 'Construction':
      return { tempMin: 140, tempMax: 220, brakeMin: 15, brakeMax: 70, loadMin: 25000, loadMax: 90000 };
    case 'Utility/Telecom':
      return { tempMin: 130, tempMax: 210, brakeMin: 10, brakeMax: 55, loadMin: 18000, loadMax: 72000 };
    default:
      return { tempMin: 120, tempMax: 200, brakeMin: 20, brakeMax: 80, loadMin: 10000, loadMax: 65000 };
  }
};

const generateSensorData = (category: Trailer['category']): SensorData => {
  const seed = categoryHealthSeed(category);
  const overallRoll = Math.random();
  const overallHealth: SensorData['overallHealth'] = overallRoll < 0.66 ? 'Good' : overallRoll < 0.86 ? 'Warning' : 'Critical';

  const axleTemp = Math.round(seed.tempMin + Math.random() * (seed.tempMax - seed.tempMin));
  const brakePadWear = Math.round(seed.brakeMin + Math.random() * (seed.brakeMax - seed.brakeMin));
  const frameMicrofractures = overallHealth === 'Critical' ? true : Math.random() < 0.18;
  const tirePressure = Array.from({ length: 4 }, () => Math.round(88 + Math.random() * 20));
  const loadWeight = Math.round(seed.loadMin + Math.random() * (seed.loadMax - seed.loadMin));
  const mileage = Math.round(3000 + Math.random() * 120000);
  const batteryVoltage = Math.round((10.8 + Math.random() * 2.1) * 10) / 10;

  return {
    lastUpdated: formatNowISO(),
    axleTemp,
    tirePressure,
    brakePadWear,
    frameMicrofractures,
    loadWeight,
    mileage,
    batteryVoltage,
    overallHealth,
  };
};

const AppDataProviderImpl = ({ children }: { children: React.ReactNode }) => {
  const [state, setState] = useState<AppDataState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return {
          trailers: initialTrailers,
          dealers: initialDealers,
          customers: initialCustomers,
          orders: initialOrders,
          quotes: initialQuotes,
          soldTrailers: initialSoldTrailers,
          maintenanceSlots: initialMaintenanceSlots,
          notifications: initialNotifications,
        };
      }
      return JSON.parse(raw) as AppDataState;
    } catch {
      return {
        trailers: initialTrailers,
        dealers: initialDealers,
        customers: initialCustomers,
        orders: initialOrders,
        quotes: initialQuotes,
        soldTrailers: initialSoldTrailers,
        maintenanceSlots: initialMaintenanceSlots,
        notifications: initialNotifications,
      };
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore persistence errors in prototype environments.
    }
  }, [state]);

  const pushNotification = (n: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const notification: Notification = {
      ...n,
      id: uid('n'),
      timestamp: formatNowISO(),
      read: false,
    };
    setState(s => ({ ...s, notifications: [notification, ...s.notifications] }));
    return notification;
  };

  const actions = useMemo<AppDataContextType['actions']>(() => {
    return {
      markNotificationRead: (id: string) => {
        setState(s => ({
          ...s,
          notifications: s.notifications.map(n => (n.id === id ? { ...n, read: true } : n)),
        }));
      },
      markAllNotificationsRead: () => {
        setState(s => ({
          ...s,
          notifications: s.notifications.map(n => ({ ...n, read: true })),
        }));
      },

      createQuoteFromDealer: (input: CreateQuoteInput) => {
        const trailer = state.trailers.find(t => t.id === input.trailerId);
        if (!trailer) throw new Error('Trailer not found');

        const items: QuoteItem[] = [
          {
            trailerId: trailer.id,
            modelNumber: trailer.modelNumber,
            name: trailer.name,
            basePrice: trailer.price,
            selectedOptions: [],
            optionsTotal: 0,
            quantity: input.quantity,
            lineTotal: trailer.price * input.quantity,
          },
        ];
        const { subtotal, tax, total } = computeQuoteTotals(items);
        const quote: Quote = {
          id: uid('q'),
          quoteNumber: makeQuoteNumber(),
          status: 'Sent',
          fromId: input.dealerId,
          toId: input.customerId,
          items,
          subtotal,
          tax,
          total,
          validUntil: addDaysISO(todayISO(), 30),
          createdDate: todayISO(),
          notes: input.notes ?? '',
          customizations: [],
        };

        setState(s => ({ ...s, quotes: [quote, ...s.quotes] }));
        // Notify customer that the dealer sent a quote.
        const dealer = state.dealers.find(d => d.id === input.dealerId);
        pushNotification({
          recipientId: input.customerId,
          recipientType: 'Customer',
          type: 'QuoteReceived',
          title: 'New Quote Received',
          message: `New quote ${quote.quoteNumber} from ${dealer?.name ?? 'your dealer'}: $${quote.total.toLocaleString()}.`,
          actionUrl: '/customer/quotes',
        });

        return quote;
      },

      updateQuoteStatus: (quoteId: string, status: Quote['status']) => {
        const existing = state.quotes.find(q => q.id === quoteId);
        if (!existing) return null;

        const updated: Quote = { ...existing, status };
        setState(s => ({
          ...s,
          quotes: s.quotes.map(q => (q.id === quoteId ? updated : q)),
        }));

        // Side notifications for key state transitions.
        if (status === 'Accepted') {
          pushNotification({
            recipientId: updated.fromId,
            recipientType: 'Dealer',
            type: 'OrderUpdate',
            title: 'Quote Accepted',
            message: `Customer accepted ${updated.quoteNumber}. Dealer will convert it to an order.`,
            actionUrl: '/dealer/quotes',
          });
        }
        if (status === 'Rejected') {
          pushNotification({
            recipientId: updated.fromId,
            recipientType: 'Dealer',
            type: 'OrderUpdate',
            title: 'Quote Rejected',
            message: `Customer rejected ${updated.quoteNumber}.`,
            actionUrl: '/dealer/quotes',
          });
        }
        if (status === 'Sent') {
          pushNotification({
            recipientId: updated.toId,
            recipientType: 'Customer',
            type: 'QuoteReceived',
            title: 'Quote Sent',
            message: `New quote ${updated.quoteNumber} is available. Total: $${updated.total.toLocaleString()}.`,
            actionUrl: '/customer/quotes',
          });
        }

        return updated;
      },

      convertQuoteToOrder: ({ quoteId }: ConvertQuoteToOrderInput) => {
        const quote = state.quotes.find(q => q.id === quoteId);
        if (!quote) return null;
        if (quote.status !== 'Accepted') return null;
        const firstItem = quote.items[0];
        if (!firstItem) return null;
        const trailer = state.trailers.find(t => t.id === firstItem.trailerId);
        if (!trailer) return null;

        const orderNumber = makeOrderNumber('BB');
        const createdDate = todayISO();
        const unitPrice = firstItem.quantity > 0 ? Math.round(firstItem.lineTotal / firstItem.quantity) : trailer.price;

        const order: Order = {
          id: uid('or'),
          orderNumber,
          type: 'Standard',
          status: 'Submitted',
          fromId: quote.fromId, // dealer
          fromType: 'Dealer',
          toId: 'admin',
          toType: 'Admin',
          trailerId: firstItem.trailerId,
          modelNumber: firstItem.modelNumber,
          trailerName: firstItem.name,
          quantity: firstItem.quantity,
          unitPrice,
          totalPrice: firstItem.lineTotal,
          createdDate,
          updatedDate: createdDate,
          estimatedDelivery: addDaysISO(createdDate, trailer.leadTimeDays),
          notes: `Converted from quote ${quote.quoteNumber}.`,
          quoteId: quote.id,
          customerId: quote.toId,
        };

        setState(s => ({ ...s, orders: [order, ...s.orders] }));
        pushNotification({
          recipientId: 'admin',
          recipientType: 'Admin',
          type: 'OrderUpdate',
          title: 'New Order Submitted',
          message: `${order.orderNumber} submitted by ${state.dealers.find(d => d.id === order.fromId)?.name ?? 'dealer'}: ${order.quantity} × ${order.modelNumber}.`,
          actionUrl: '/admin/orders',
        });

        return order;
      },

      submitDealerOrderToBehnke: ({ dealerId, trailerId, quantity, notes }: SubmitDealerOrderToBehnkeInput) => {
        const trailer = state.trailers.find(t => t.id === trailerId);
        if (!trailer) throw new Error('Trailer not found');

        const createdDate = todayISO();
        const order: Order = {
          id: uid('or'),
          orderNumber: makeOrderNumber('BB'),
          type: 'Standard',
          status: 'Submitted',
          fromId: dealerId,
          fromType: 'Dealer',
          toId: 'admin',
          toType: 'Admin',
          trailerId: trailer.id,
          modelNumber: trailer.modelNumber,
          trailerName: trailer.name,
          quantity,
          unitPrice: trailer.price,
          totalPrice: trailer.price * quantity,
          createdDate,
          updatedDate: createdDate,
          estimatedDelivery: addDaysISO(createdDate, trailer.leadTimeDays),
          notes,
        };

        setState(s => ({ ...s, orders: [order, ...s.orders] }));
        pushNotification({
          recipientId: 'admin',
          recipientType: 'Admin',
          type: 'OrderUpdate',
          title: 'New Order Submitted',
          message: `${order.orderNumber} submitted by ${state.dealers.find(d => d.id === dealerId)?.name ?? 'dealer'}: ${order.quantity} × ${order.modelNumber}.`,
          actionUrl: '/admin/orders',
        });
        return order;
      },

      advanceOrderStatus: ({ orderId }: AdvanceOrderInput) => {
        const statusSteps: Order['status'][] = ['Draft', 'Submitted', 'Under Review', 'Approved', 'In Production', 'Shipped', 'Delivered'];
        const existing = state.orders.find(o => o.id === orderId);
        if (!existing) return null;
        if (existing.status === 'Delivered' || existing.status === 'Cancelled') return null;
        const stepIdx = statusSteps.indexOf(existing.status);
        if (stepIdx === -1) return null;

        const nextStatus = statusSteps[Math.min(stepIdx + 1, statusSteps.length - 1)];
        const updatedOrder: Order = { ...existing, status: nextStatus, updatedDate: todayISO() };

        setState(s => ({
          ...s,
          orders: s.orders.map(o => (o.id === orderId ? updatedOrder : o)),
        }));

        const order = updatedOrder;
        const customerId = order.customerId ?? (order.fromType === 'Customer' ? order.fromId : undefined);

        // Notify the origin party.
        if (order.fromType === 'Dealer') {
          pushNotification({
            recipientId: order.fromId,
            recipientType: 'Dealer',
            type: 'OrderUpdate',
            title: 'Order Status Updated',
            message: `${order.orderNumber} is now ${order.status}.`,
            actionUrl: '/dealer/orders',
          });
        } else if (order.fromType === 'Customer' && customerId) {
          pushNotification({
            recipientId: customerId,
            recipientType: 'Customer',
            type: 'OrderUpdate',
            title: 'Order Status Updated',
            message: `${order.orderNumber} is now ${order.status}.`,
            actionUrl: '/customer/health',
          });
        }

        // On Delivered, create a SoldTrailer record for customer health.
        if (order.status === 'Delivered' && order.trailerId) {
          const exists = state.soldTrailers.some(st => st.customerId === customerId && st.trailerId === order.trailerId);
          if (!exists && customerId) {
            const trailer = state.trailers.find(t => t.id === order.trailerId);
            const soldDate = todayISO();
            if (trailer) {
              const sellerDealerId = order.toType === 'Dealer' ? order.toId : order.fromId;
              const sold: SoldTrailer = {
                id: uid('st'),
                vin: `BB${new Date().getFullYear().toString().slice(-2)}-${Math.floor(1000 + Math.random() * 9000)}`,
                trailerId: order.trailerId,
                modelNumber: trailer.modelNumber,
                name: order.trailerName ?? trailer.name,
                category: trailer.category,
                soldDate,
                customerId,
                dealerId: sellerDealerId,
                warrantyExpiry: addDaysISO(soldDate, 365 * 3),
                sensorData: generateSensorData(trailer.category),
                maintenanceHistory: [],
                nextMaintenanceDue: addDaysISO(soldDate, 365),
              };

              setState(s => ({ ...s, soldTrailers: [sold, ...s.soldTrailers] }));

              const cust = state.customers.find(c => c.id === customerId);
              pushNotification({
                recipientId: customerId,
                recipientType: 'Customer',
                type: 'OrderUpdate',
                title: 'Order Delivered',
                message: `${cust?.name ?? 'Your'} trailer ${sold.modelNumber} is delivered. VIN: ${sold.vin}.`,
                actionUrl: '/customer/health',
              });
            }
          }
        }

        return updatedOrder;
      },

      requestMaintenanceSlot: (input: RequestMaintenanceSlotInput) => {
        const slot: MaintenanceSlot = {
          id: uid('ms'),
          trailerId: input.soldTrailerId,
          customerId: input.customerId,
          dealerId: input.dealerId,
          requestedDate: input.requestedDate,
          status: 'Requested',
          type: input.type,
          notes: input.notes,
        };

        setState(s => ({ ...s, maintenanceSlots: [slot, ...s.maintenanceSlots] }));
        return slot;
      },

      confirmMaintenanceSlot: ({ slotId, message, priority }: ConfirmMaintenanceSlotInput) => {
        const existing = state.maintenanceSlots.find(ms => ms.id === slotId);
        if (!existing) return null;

        const nextSlot: MaintenanceSlot = {
          ...existing,
          status: 'Confirmed',
          confirmedDate: existing.confirmedDate ?? existing.requestedDate,
        };

        setState(s => ({
          ...s,
          maintenanceSlots: s.maintenanceSlots.map(ms => (ms.id === slotId ? nextSlot : ms)),
        }));

        const soldTrailer = state.soldTrailers.find(st => st.id === nextSlot.trailerId);
        const defaultMessage = soldTrailer
          ? `Your B-B Trailer ${soldTrailer.modelNumber} (VIN: ${soldTrailer.vin}) has been confirmed for ${nextSlot.type.toLowerCase()} maintenance. Please contact your dealer to prepare service.`
          : 'Your B-B Trailer maintenance has been confirmed.';

        pushNotification({
          recipientId: nextSlot.customerId,
          recipientType: 'Customer',
          type: 'MaintenanceAlert',
          title: `Maintenance Confirmed${priority === 'Urgent' ? ' (Urgent)' : ''}`,
          message: message ?? defaultMessage,
          actionUrl: '/customer/health',
        });

        return nextSlot;
      },

      completeMaintenanceSlot: ({ slotId }: CompleteMaintenanceSlotInput) => {
        const existing = state.maintenanceSlots.find(ms => ms.id === slotId);
        if (!existing) return null;

        const slot = existing;
        const soldTrailerIdx = state.soldTrailers.findIndex(st => st.id === slot.trailerId);
        const sold = soldTrailerIdx === -1 ? null : state.soldTrailers[soldTrailerIdx];

        const nextMaintenanceDue = (() => {
          if (slot.type === 'Emergency') return addDaysISO(todayISO(), 120);
          if (slot.type === 'Inspection') return addDaysISO(todayISO(), 180);
          return addDaysISO(todayISO(), 365);
        })();

        const record = {
          id: uid('m'),
          date: todayISO(),
          type: slot.type,
          description: slot.notes || 'Maintenance completed.',
          technicianName: 'Prototype Technician',
          cost: Math.round(250 + Math.random() * 1250),
          dealerId: slot.dealerId,
        };

        const updatedSold: SoldTrailer | null = sold
          ? {
            ...sold,
            maintenanceHistory: [record, ...sold.maintenanceHistory],
            nextMaintenanceDue,
          }
          : null;

        setState(s => {
          const nextSlots = s.maintenanceSlots.map(ms => (ms.id === slotId ? { ...ms, status: 'Completed' } : ms));
          if (!updatedSold) return { ...s, maintenanceSlots: nextSlots };
          const nextSold = s.soldTrailers.map(st => (st.id === slot.trailerId ? updatedSold : st));
          return { ...s, maintenanceSlots: nextSlots, soldTrailers: nextSold };
        });

        pushNotification({
          recipientId: slot.customerId,
          recipientType: 'Customer',
          type: 'MaintenanceAlert',
          title: 'Maintenance Completed',
          message: 'Your scheduled service has been completed. Health data will update shortly.',
          actionUrl: '/customer/health',
        });

        return { ...slot, status: 'Completed' };
      },

      cancelMaintenanceSlot: (slotId: string) => {
        setState(s => ({
          ...s,
          maintenanceSlots: s.maintenanceSlots.map(ms => (ms.id === slotId ? { ...ms, status: 'Cancelled' } : ms)),
        }));
      },

      pushHealthWarning: ({ soldTrailerId, message }: PushHealthWarningInput) => {
        const sold = state.soldTrailers.find(st => st.id === soldTrailerId);
        if (!sold) return null;
        const notification: Omit<Notification, 'id' | 'timestamp' | 'read'> = {
          recipientId: sold.customerId,
          recipientType: 'Customer',
          type: 'HealthWarning',
          title: 'Health Warning',
          message,
          actionUrl: '/customer/health',
        };
        return pushNotification(notification);
      },
    };
  }, [state]);

  return <AppDataContext.Provider value={{ state, actions }}>{children}</AppDataContext.Provider>;
};

export const AppDataProvider = AppDataProviderImpl;

export const useAppData = () => useContext(AppDataContext);

