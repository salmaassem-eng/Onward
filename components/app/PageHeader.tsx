type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div className="min-w-0">
      <h1 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">{title}</h1>
      {subtitle && <p className="mt-2 text-base text-stone-500 sm:text-lg">{subtitle}</p>}
    </div>
  );
}