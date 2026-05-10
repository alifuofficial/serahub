"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSidebarProps {
  categories: { id: string; name: string }[];
  type: "jobs" | "bids";
}

const LOCATION_TYPES = [
  { label: "Remote", value: "Remote" },
  { label: "On-site", value: "Office" },
  { label: "Hybrid", value: "Hybrid" },
];

const EMPLOYMENT_TYPES = [
  { label: "Full-time", value: "Full-time" },
  { label: "Part-time", value: "Part-time" },
  { label: "Contract", value: "Contract" },
  { label: "Internship", value: "Internship" },
];

const CAREER_LEVELS = [
  { label: "Entry Level", value: "Entry Level" },
  { label: "Junior", value: "Junior" },
  { label: "Senior", value: "Senior" },
  { label: "Manager", value: "Manager" },
];

export default function FilterSidebar({ categories, type }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (name: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      params.delete("page"); // Reset page on filter change
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    const current = searchParams.get(name);
    const nextValue = current === value ? null : value;
    const queryString = createQueryString(name, nextValue);
    router.push(`/${type}?${queryString}`);
  };

  const clearFilters = () => {
    router.push(`/${type}`);
  };

  const activeCount = Array.from(searchParams.keys()).filter(k => k !== "q" && k !== "page").length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 sticky top-24">
      <div className="flex items-center justify-between mb-6">
        <h3 className="font-bold text-slate-900">Filters</h3>
        {activeCount > 0 && (
          <button 
            onClick={clearFilters}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="space-y-8">
        {/* Categories */}
        <div>
          <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Category</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto pr-2 scrollbar-thin">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                  checked={searchParams.get("category") === cat.id}
                  onChange={() => handleFilterChange("category", cat.id)}
                />
                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                  {cat.name}
                </span>
              </label>
            ))}
          </div>
        </div>

        {type === "jobs" && (
          <>
            {/* Location Type */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Work Mode</h4>
              <div className="space-y-2">
                {LOCATION_TYPES.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      checked={searchParams.get("location") === opt.value}
                      onChange={() => handleFilterChange("location", opt.value)}
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Employment Type */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Employment</h4>
              <div className="space-y-2">
                {EMPLOYMENT_TYPES.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      checked={searchParams.get("employment") === opt.value}
                      onChange={() => handleFilterChange("employment", opt.value)}
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Career Level */}
            <div>
              <h4 className="text-sm font-semibold text-slate-900 mb-4 uppercase tracking-wider">Level</h4>
              <div className="space-y-2">
                {CAREER_LEVELS.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-slate-300 text-primary focus:ring-primary"
                      checked={searchParams.get("level") === opt.value}
                      onChange={() => handleFilterChange("level", opt.value)}
                    />
                    <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                      {opt.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
