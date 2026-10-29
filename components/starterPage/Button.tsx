import Link from "next/link";

type ButtonLinkProps = {
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "light";
  size?: "md" | "lg" | "header";
  className?: string;
};

const variants = {
  primary: "bg-green-600 text-white shadow-sm hover:bg-green-700",
  secondary: "border border-stone-200 bg-white text-stone-800 hover:bg-stone-50",
  light: "bg-white text-green-700 shadow-sm hover:bg-green-50",
};

const sizes = {
  md: "px-5 py-2.5 text-sm",
  lg: "px-8 py-4 text-base",
  header: "px-4 py-2.5 text-sm sm:px-6 sm:py-3.5 sm:text-base",
};

export default function ButtonLink({
  href,
  children,
  variant = "primary",
  size = "md",
  className = "",
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center rounded-xl font-semibold transition ${variants[variant]} ${sizes[size]} ${className}`}
    >
      {children}
    </Link>
  );
}