import React from 'react';
import { Quote } from 'lucide-react';

interface VerseBannerProps {
  verse: string;
  reference: string;
}

export function VerseBanner({ verse, reference }: VerseBannerProps) {
  return (
    <div className="bg-white/50 backdrop-blur-sm border-b border-slate-100 px-6 py-3 flex items-center justify-center text-center relative overflow-hidden">
      <div className="absolute left-0 top-0 w-1 h-full bg-gradient-primary opacity-50"></div>
      <div className="flex items-center gap-3 max-w-4xl">
        <Quote className="w-4 h-4 text-primary-start opacity-40 shrink-0" />
        <p className="text-xs md:text-sm text-slate-500 font-medium tracking-wide">
          "{verse}" <span className="font-bold text-primary-start ml-1">– {reference}</span>
        </p>
      </div>
    </div>
  );
}
