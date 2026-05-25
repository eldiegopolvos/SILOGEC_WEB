import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";

function ModuleCard({ title, description, tags = [], path, index = 0 }) {
  const content = (
    <>
      <div className="flex items-start justify-between gap-4">
        <h3 className="font-bold text-[#061a2f]">
          {title}
        </h3>

        <ChevronRight
          size={18}
          className="text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#061a2f]"
        />
      </div>

      <p className="mt-3 text-sm leading-6 text-slate-500">
        {description}
      </p>

      {tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </>
  );

  const className =
    "silogec-fade-up group block rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4af37] focus:ring-offset-2";

  const style = {
    animationDelay: `${index * 120}ms`,
  };

  if (!path) {
    return (
      <article className={className} style={style}>
        {content}
      </article>
    );
  }

  return (
    <Link to={path} className={className} style={style}>
      {content}
    </Link>
  );
}

export default ModuleCard;