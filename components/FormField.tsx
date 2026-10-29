"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

type FormFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string;
};

export default function FormField({ label, id, error, type, ...inputProps }: FormFieldProps) {
  const [visible, setVisible] = useState(false);
  const isPassword = type === "password";
  const errorId = `${id}-error`;

  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={isPassword && visible ? "text" : type}
          aria-invalid={!!error}
          aria-describedby={error ? errorId : undefined}
          {...inputProps}
          className={`w-full rounded-xl border bg-white px-5 py-3.5 text-stone-900 outline-none transition placeholder:text-stone-400 focus:ring-2 ${
            isPassword ? "pr-14" : ""
          } ${
            error
              ? "border-red-400 focus:ring-red-400/30"
              : "border-stone-200 focus:border-green-500 focus:ring-green-500/40"
          }`}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            onMouseDown={(e) => e.preventDefault()} // keeps the keyboard open on phones
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-stone-400 transition hover:text-stone-700"
          >
            {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        )}
      </div>

      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}