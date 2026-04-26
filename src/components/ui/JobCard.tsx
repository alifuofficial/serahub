import Link from "next/link";
import { Job } from "@prisma/client";
import BookmarkButton from "@/components/common/BookmarkButton";
import { getPlainText } from "@/components/editor/Renderer";

interface JobCardProps {
  job: Pick<Job, "id" | "title" | "slug" | "description" | "source" | "deadline" | "createdAt" | "company" | "employmentType" | "locationType">;
  isBookmarked?: boolean;
}

export default function JobCard({ job, isBookmarked = false }: JobCardProps) {
  const timeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    return Math.floor(seconds) + "s";
  };

  return (
    <div className="card p-6 flex flex-col h-full bg-white relative hover:border-primary/20 group">
      <div className="flex items-center gap-2 mb-4">
        <span className="bg-[#e6fbf4] text-primary px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
          {job.employmentType || "Full-time"}
        </span>
        {job.locationType && (
          <span className="bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            {job.locationType}
          </span>
        )}
      </div>

      <h3 className="font-bold text-lg leading-snug text-slate-800 mb-2 group-hover:text-primary transition-colors">
        <Link href={`/jobs/${job.slug}`} className="before:absolute before:inset-0">
          {job.title}
        </Link>
      </h3>
      
      <p className="text-slate-500 text-sm line-clamp-2 mb-5 flex-grow font-normal leading-relaxed">
        {getPlainText(job.description)}
      </p>

      <div className="flex flex-wrap gap-2 mb-6">
        {job.source && <span className="bg-slate-50 border border-slate-100 text-slate-500 px-2.5 py-1 rounded-lg text-xs font-medium">{job.source}</span>}
        {job.deadline && (
          <span className="bg-red-50 border border-red-100 text-red-500 px-2.5 py-1 rounded-lg text-xs font-medium">
            Ends {new Date(job.deadline).toLocaleDateString()}
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
        <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-700">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-emerald-400 flex items-center justify-center text-white font-bold text-[10px] shadow-sm shadow-primary/20">
            {job.company?.[0]?.toUpperCase() || "SH"}
          </div>
          {job.company || "SeraHub"}
        </div>
        
        <div className="flex items-center gap-3">
          <span className="text-slate-400 text-xs font-medium">
            {timeAgo(job.createdAt)}
          </span>
          <BookmarkButton id={job.id} type="JOB" initialIsBookmarked={isBookmarked} />
        </div>
      </div>
    </div>
  );
}