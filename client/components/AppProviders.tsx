"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ToastProvider } from "../context/ToastContext";
import { InterviewSocketProvider } from "../context/InterviewSocketContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <InterviewSocketProvider>{children}</InterviewSocketProvider>
      </ToastProvider>
    </SessionProvider>
  );
}
