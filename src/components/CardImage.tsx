'use client';

import { useState } from 'react';
import Image from 'next/image';

interface CardImageProps {
  imageUrl: string | null;
  title: string;
  isVideo: boolean;
}

export default function CardImage({ imageUrl, title, isVideo }: CardImageProps) {
  const [hasError, setHasError] = useState(false);
  const showFallback = !imageUrl || hasError;

  return (
    <div className="relative h-48 w-full bg-gradient-to-br from-blue-50 to-slate-100 overflow-hidden flex-shrink-0">
      {!showFallback ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          onError={() => setHasError(true)}
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50">
          <span className="text-2xl font-black text-slate-300 tracking-widest select-none">
            TKP-DBPP
          </span>
        </div>
      )}

      {isVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/10 group-hover:bg-transparent transition-colors">
          <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-blue-600 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M4 4l12 6-12 6z" />
            </svg>
          </div>
        </div>
      )}
    </div>
  );
}
