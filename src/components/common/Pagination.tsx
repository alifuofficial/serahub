import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalCount: number;
  pageSize: number;
  baseUrl: string;
  searchParams: Record<string, string | undefined>;
}

export default function Pagination({
  currentPage,
  totalCount,
  pageSize,
  baseUrl,
  searchParams,
}: PaginationProps) {
  const totalPages = Math.ceil(totalCount / pageSize);

  if (totalPages <= 1) return null;

  const getPageUrl = (page: number) => {
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value && key !== "page") params.set(key, value);
    });
    params.set("page", page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  // Generate page numbers to show
  const pages = [];
  const maxVisible = 5;
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  let end = Math.min(totalPages, start + maxVisible - 1);

  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }

  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12">
      {currentPage > 1 && (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Previous
        </Link>
      )}

      {pages.map((p) => (
        <Link
          key={p}
          href={getPageUrl(p)}
          className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
            p === currentPage
              ? "bg-primary text-white"
              : "text-slate-600 bg-white border border-slate-200 hover:bg-slate-50"
          }`}
        >
          {p}
        </Link>
      ))}

      {currentPage < totalPages && (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
        >
          Next
        </Link>
      )}
    </div>
  );
}
