export function OrganizationJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SeraHub",
    url: "https://serahub.com",
    logo: "https://serahub.com/logo.png",
    description: "Discover the latest jobs, bids, and tender opportunities. SeraHub connects you with top companies and talented professionals.",
    sameAs: [],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function WebSiteJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SeraHub",
    url: "https://serahub.com",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://serahub.com/jobs?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function JobPostingJsonLd({ title, description, datePosted, validThrough, employmentType, hiringOrganization, jobLocation }: {
  title: string;
  description: string;
  datePosted: string;
  validThrough?: string | null;
  employmentType?: string;
  hiringOrganization?: string;
  jobLocation?: string;
}) {
  const jsonLd: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "JobPosting",
    title,
    description,
    datePosted,
  };

  if (validThrough) jsonLd.validThrough = validThrough;
  if (employmentType) jsonLd.employmentType = employmentType;
  if (hiringOrganization) jsonLd.hiringOrganization = { "@type": "Organization", name: hiringOrganization };
  if (jobLocation) jsonLd.jobLocation = { "@type": "Place", address: jobLocation };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}