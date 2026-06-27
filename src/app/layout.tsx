import "@/app/globals.css";

import { type Metadata } from "next";

import { TRPCReactProvider } from "@/trpc/react";

export const metadata: Metadata = {
  title: "Underpin — AI workspace for Gmail & Calendar",
  description: "An AI-native operating system for email and calendar, powered by Corsair.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className="light">
      <body>
        <TRPCReactProvider>{children}</TRPCReactProvider>
      </body>
    </html>
  );
}
