function PageTitle({ title, subtitle }) {
  return (
    <div className="mb-8">
      <h2 className="text-4xl font-bold text-blue-950">
        {title}
      </h2>

      {subtitle && (
        <p className="text-slate-600 mt-2">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default PageTitle;