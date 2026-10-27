"use client";

import { useState } from "react";
import { BookOpen } from "lucide-react";

type CourseThumbProps = {
  src: string | null;
  className?: string;
  children?: React.ReactNode;
};

export default function CourseThumb({ src, className = "", children }: CourseThumbProps) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const showImage = Boolean(src) && failedSrc !== src;

  return (
    <div
      className={`relative overflow-hidden bg-gradient-to-br from-green-900 to-stone-900 ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src!}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailedSrc(src)}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <BookOpen className="absolute left-1/2 top-1/2 h-10 w-10 -translate-x-1/2 -translate-y-1/2 text-white/25" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
      {children}
    </div>
  );
}