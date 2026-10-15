type FormFieldProps = React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  id: string;
  error?: string;
};

export default function FormField({ label, id, error, ...inputProps }: FormFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-2 block text-sm font-medium text-stone-700">
        {label}
      </label>
      <input
        id={id}
        {...inputProps}
        className={`w-full rounded-xl border bg-white px-5 py-3.5 text-stone-900 outline-none transition placeholder:text-stone-400 focus:ring-2 focus:ring-green-500/40 ${
          error ? "border-red-400" : "border-stone-200 focus:border-green-500"
        }`}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}