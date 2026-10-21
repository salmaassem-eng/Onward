type PageHeaderProps = {
  title: string;
  subtitle?: string;
};

export default function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <div>
      <h1 className="font-heading text-3xl font-bold text-stone-900 sm:text-4xl">
        {title}
      </h1>
      {subtitle && <p className="mt-2 text-lg text-stone-500">{subtitle}</p>}
    </div>
  );
}