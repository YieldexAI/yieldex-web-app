'use client';

import Link from 'next/link';
import { PixelXIcon, PixelDocsIcon } from './icons';
import './footer.css';

export function Footer() {
  return (
    <footer className="w-full border-t-4 border-[#2A303C] bg-[#1F242D] font-['Press_Start_2P']">
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="text-xs text-gray-400 pixel-corners">
            © {new Date().getFullYear()} Yieldex
          </div>
          <div className="flex items-center gap-6">
            <Link
              href="https://x.com/YieldexAi"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 text-gray-400 transition-colors hover:text-white pixel-corners hover:bg-[#2A303C]"
            >
              <div className="h-5 w-5">
                <PixelXIcon />
              </div>
              <span className="hidden text-xs sm:inline">X</span>
            </Link>
            <Link
              href="https://yieldex.gitbook.io/yieldex-docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 px-4 py-2 text-gray-400 transition-colors hover:text-white pixel-corners hover:bg-[#2A303C]"
            >
              <div className="h-5 w-5">
                <PixelDocsIcon />
              </div>
              <span className="hidden text-xs sm:inline">DOCS</span>
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 