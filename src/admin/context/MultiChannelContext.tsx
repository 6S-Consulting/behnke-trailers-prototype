import React, { createContext, useContext, useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import {
  type Channel,
  type SyncLogEntry,
  initialChannels,
  syncLogTemplates,
} from "@/data/multiChannelData";

interface MultiChannelContextType {
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  syncLogs: SyncLogEntry[];
  setSyncLogs: React.Dispatch<React.SetStateAction<SyncLogEntry[]>>;
  addChannelAndAutoUpgrade: (channel: Channel, feedName: string) => void;
}

const MultiChannelContext = createContext<MultiChannelContextType | undefined>(undefined);

export function MultiChannelProvider({ children }: { children: ReactNode }) {
  const [channels, setChannels] = useState<Channel[]>(initialChannels);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const logCounter = useRef(0);

  // Auto-generate sync logs every 3 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const template = syncLogTemplates[logCounter.current % syncLogTemplates.length];
      logCounter.current += 1;
      const entry: SyncLogEntry = {
        id: `log-${Date.now()}-${logCounter.current}`,
        timestamp: new Date(),
        channel: template.channel,
        message: template.message,
        type: template.type,
      };
      setSyncLogs((prev) => [entry, ...prev].slice(0, 50));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Shared helper: add a channel in "syncing" state, inject feed entries,
  // then auto-upgrade to "connected" after 3 seconds.
  const addChannelAndAutoUpgrade = useCallback((channel: Channel, feedName: string) => {
    setChannels((prev) => [...prev, channel]);

    // Inject feed entries
    setSyncLogs((prev) => [
      {
        id: `log-connect-2-${Date.now()}`,
        timestamp: new Date(),
        channel: feedName,
        message: "Initial inventory sync completed",
        type: "success" as const,
      },
      {
        id: `log-connect-1-${Date.now()}`,
        timestamp: new Date(),
        channel: feedName,
        message: `${feedName} connected successfully`,
        type: "success" as const,
      },
      ...prev,
    ].slice(0, 50));

    // After 3 seconds, upgrade syncing → connected
    setTimeout(() => {
      setChannels((prev) =>
        prev.map((ch) =>
          ch.id === channel.id
            ? {
              ...ch,
              status: "connected" as const,
              syncAccuracy: Math.floor(Math.random() * 8) + 92,
              ordersToday: Math.floor(Math.random() * 10) + 1,
              billedAmount: (Math.floor(Math.random() * 10) + 1) * 150,
            }
            : ch
        )
      );
    }, 3000);
  }, []);

  return (
    <MultiChannelContext.Provider
      value={{ channels, setChannels, syncLogs, setSyncLogs, addChannelAndAutoUpgrade }}
    >
      {children}
    </MultiChannelContext.Provider>
  );
}

export function useMultiChannel() {
  const context = useContext(MultiChannelContext);
  if (context === undefined) {
    throw new Error("useMultiChannel must be used within a MultiChannelProvider");
  }
  return context;
}
