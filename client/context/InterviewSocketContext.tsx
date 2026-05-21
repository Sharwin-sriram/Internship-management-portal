"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";
import { resolveBaseUrl } from "../lib/api";
import { getToken } from "../lib/auth";
import type { Socket } from "socket.io-client";

export type InterviewSocketEvent =
  | "interview:invitation"
  | "interview:scheduled"
  | "interview:response"
  | "interview:feedback_submitted";

interface InterviewSocketContextValue {
  socket: Socket | null;
  connected: boolean;
  lastPayload: unknown;
  subscribe: (event: InterviewSocketEvent, fn: (payload: unknown) => void) => () => void;
}

const InterviewSocketContext = createContext<InterviewSocketContextValue | null>(null);

const SOCKET_EVENTS: InterviewSocketEvent[] = [
  "interview:invitation",
  "interview:scheduled",
  "interview:response",
  "interview:feedback_submitted",
];

export function InterviewSocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastPayload, setLastPayload] = useState<unknown>(null);
  const listenersRef = useRef<Map<InterviewSocketEvent, Set<(p: unknown) => void>>>(new Map());

  const subscribe = useCallback((event: InterviewSocketEvent, fn: (payload: unknown) => void) => {
    if (!listenersRef.current.has(event)) listenersRef.current.set(event, new Set());
    listenersRef.current.get(event)!.add(fn);
    return () => {
      listenersRef.current.get(event)?.delete(fn);
    };
  }, []);

  useEffect(() => {
    const token = user?.token ?? getToken();
    if (!token) {
      setSocket(null);
      setConnected(false);
      return;
    }

    let s: Socket | null = null;
    let cancelled = false;

    import("socket.io-client").then(({ io }) => {
      if (cancelled) return;
      
      try {
        const connect = async () => {
          const apiBase = await resolveBaseUrl();
          const socketOrigin = apiBase.replace(/\/api\/?$/, "");
          if (cancelled) return;
          s = io(socketOrigin, {
          path: "/socket.io",
          auth: { token },
          transports: ["websocket", "polling"],
          timeout: 5000,
          reconnection: true,
          reconnectionAttempts: 3,
          reconnectionDelay: 1000,
        });

          s.on("connect", () => {
            console.log("Socket.IO connected");
            setConnected(true);
          });
        
          s.on("disconnect", (reason) => {
            console.log("Socket.IO disconnected:", reason);
            setConnected(false);
          });

          s.on("connect_error", (error) => {
            console.warn("Socket.IO connection error:", error.message);
            setConnected(false);
          });

          const handle = (name: InterviewSocketEvent) => (payload: unknown) => {
            setLastPayload(payload);
            listenersRef.current.get(name)?.forEach((fn) => fn(payload));
            if (name === "interview:invitation") showToast("New interview invitation", "info");
            if (name === "interview:response") showToast("Interview update from candidate", "info");
            if (name === "interview:feedback_submitted") showToast("Interview feedback submitted", "info");
            if (name === "interview:scheduled") showToast("Interview scheduled", "info");
          };

          SOCKET_EVENTS.forEach((ev) => {
            s!.on(ev, handle(ev));
          });

          setSocket(s);
        };

        connect().catch((error) => {
          console.warn("Failed to resolve socket origin:", error);
          setSocket(null);
          setConnected(false);
        });
      } catch (error) {
        console.warn("Failed to initialize Socket.IO:", error);
        setSocket(null);
        setConnected(false);
      }
    }).catch((error) => {
      console.warn("Failed to load Socket.IO client:", error);
      setSocket(null);
      setConnected(false);
    });

    return () => {
      cancelled = true;
      if (s) {
        s.removeAllListeners();
        s.close();
      }
      setSocket(null);
      setConnected(false);
    };
  }, [user?.id, user?.token, showToast]);

  const value = useMemo(
    () => ({ socket, connected, lastPayload, subscribe }),
    [socket, connected, lastPayload, subscribe],
  );

  return (
    <InterviewSocketContext.Provider value={value}>
      {children}
    </InterviewSocketContext.Provider>
  );
}

export function useInterviewSocket() {
  const ctx = useContext(InterviewSocketContext);
  if (!ctx) {
    return {
      socket: null,
      connected: false,
      lastPayload: null,
      subscribe: () => () => {},
    };
  }
  return ctx;
}
