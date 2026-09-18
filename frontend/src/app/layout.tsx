import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "NursePrep - Nursing Courses & MCQ Practice",
  description: "Structured nursing courses and practice MCQs designed to help you learn, test yourself and track your progress.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
