import Link from "next/link";
import { ArrowRight } from "lucide-react";

type LogoProps = {
  variant?: "onDark" | "onLight";
  size?: "md" | "lg";
};


export default function Logo({ variant = "onDark", size = "lg" }: LogoProps) {
    const isLarge = size === "lg";

  return (
    <Link href="/" className="flex items-center gap-3">
      <span
        className={`flex items-center justify-center rounded-xl bg-green-600 ${
          isLarge ? "h-11 w-11" : "h-9 w-9"
        }`}
      >
        <ArrowRight
          className={isLarge ? "h-5 w-5 text-white" : "h-4 w-4 text-white"}
          strokeWidth={2.5}
        />
      </span>
      <span
        className={`font-heading font-bold ${
          isLarge ? "text-2xl" : "text-xl"
        } ${variant === "onDark" ? "text-white" : "text-stone-900"}`}
      >
        Onward
      </span>
    </Link>
  );
}