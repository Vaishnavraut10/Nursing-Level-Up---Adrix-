import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-white border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-semibold text-dark">NursePrep</span>
            </div>
            <p className="text-muted text-sm max-w-md">
              Structured nursing courses and practice MCQs designed to help you learn, test yourself and track your progress.
            </p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-dark mb-4">Platform</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses" className="text-muted hover:text-primary transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/#how-it-works" className="text-muted hover:text-primary transition-colors">
                  Practice Tests
                </Link>
              </li>
              <li>
                <Link href="/#about" className="text-muted hover:text-primary transition-colors">
                  About
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-dark mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="#" className="text-muted hover:text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted hover:text-primary transition-colors">
                  Terms
                </Link>
              </li>
              <li>
                <Link href="#" className="text-muted hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} NursePrep. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}