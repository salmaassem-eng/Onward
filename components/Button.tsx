type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  loading?: boolean;
};

export default function Button({ loading, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className="w-full rounded-xl bg-green-600 py-4 text-base font-semibold text-white shadow-sm transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
    >
      {loading ? "Please wait..." : children}
    </button>
  );
}