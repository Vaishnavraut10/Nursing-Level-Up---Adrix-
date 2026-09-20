'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface border-t border-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-xl font-semibold text-dark">Nursing Level Up</span>
            </div>
            <p className="text-muted text-sm max-w-md">
              Nursing-focused test series designed to help you practice MCQs, test your preparation, and understand where you need to improve.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-dark mb-4">Test Series</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="/test-series" className="hover:text-primary transition-colors">
                  All Test Series
                </Link>
              </li>
              <li>
                <Link href="/test-series" className="hover:text-primary transition-colors">
                  Free Tests
                </Link>
              </li>
              <li>
                <Link href="/test-series" className="hover:text-primary transition-colors">
                  Premium Tests
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-dark mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-muted">
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link href="#" className="hover:text-primary transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-border mt-8 pt-8 text-center text-sm text-muted">
          <p>&copy; {new Date().getFullYear()} Nursing Level Up. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}