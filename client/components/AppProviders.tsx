"use client";

import React from "react";
import { ToastProvider } from "../context/ToastContext";
import { InterviewSocketProvider } from "../context/InterviewSocketContext";

export default function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <InterviewSocketProvider>{children}</InterviewSocketProvider>
    </ToastProvider>
  );
}
