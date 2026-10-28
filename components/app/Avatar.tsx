"use client";

import { useState } from "react";

type AvatarProps = {
  name: string;
  version: number | null;
  className?: string;
};

export default function Avatar({ name, version, className = "" }: AvatarProps) {
  const [failed, setFailed] = useState<number | null>(null);
  const showImage = version !== null && failed !== version;

  return (
    <span
      className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-green-100 font-semibold uppercase text-green-700 ${className}`}
    >
      {showImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`/api/avatar?v=${version}`}
          alt=""
          width={256}
          height={256}
          decoding="async"
          onError={() => setFailed(version)}
          className="h-full w-full object-cover"
        />
      ) : (
        name.trim()[0] ?? "?"
      )}
    </span>
  );
}