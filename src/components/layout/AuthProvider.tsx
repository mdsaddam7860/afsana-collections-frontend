"use client";

import { SessionProvider } from "next-auth/react";
import AuthSessionWatcher from "./AuthSessionWatcher";

export default function AuthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AuthSessionWatcher />
      {children}
    </SessionProvider>
  );
}
