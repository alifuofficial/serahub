"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAISuggestions, reviewContent } from "@/lib/ai";

function slugify(text: string): string {
  const slug = text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  
  return slug || `item-${Date.now().toString(36)}`;
}

export async function createJobAction(formData: FormData) {
  const title = (formData.get("title") as string || "").trim();
  const description = (formData.get("description") as string || "");
  const source = (formData.get("source") as string || "").trim() || null;
  const applyLink = (formData.get("applyLink") as string || "").trim() || null;
  const deadline = (formData.get("deadline") as string || "").trim() || null;
  const status = (formData.get("status") as string || "PUBLISHED");
  const company = (formData.get("company") as string || "").trim() || null;
  const locationType = (formData.get("locationType") as string || "").trim() || null;
  const careerLevel = (formData.get("careerLevel") as string || "").trim() || null;
  const employmentType = (formData.get("employmentType") as string || "").trim() || null;
  const vacancyCount = (formData.get("vacancyCount") as string || "").trim() || null;
  let categoryId = (formData.get("categoryId") as string || "").trim() || null;

  if (!title) {
    return { error: "Title is required." };
  }

  // AI Suggestions
  let suggestions = null;
  let keywords: string | null = null;
  let metaDescription: string | null = null;

  try {
    suggestions = await getAISuggestions(title, description);

    if (suggestions) {
      keywords = suggestions.keywords.join(", ");
      metaDescription = suggestions.metaDescription;

      // Auto-categorize: upsert AI-suggested category if no category was manually selected
      if (!categoryId && suggestions.categoryName) {
        const catSlug = slugify(suggestions.categoryName);
        const category = await prisma.category.upsert({
          where: { slug: catSlug },
          update: {},
          create: {
            name: suggestions.categoryName,
            slug: catSlug,
          }
        });
        categoryId = category.id;
      }
    }
  } catch (aiError) {
    console.error("[AI] Non-fatal error during job creation:", aiError);
    // AI failure does NOT block job creation
  }

  let slug = slugify(title);
  const existing = await prisma.job.findUnique({ where: { slug } });
  if (existing) {
    slug = slug + "-" + Date.now().toString(36);
  }

  await prisma.job.create({
    data: {
      title,
      slug,
      description,
      source,
      applyLink,
      deadline: deadline ? new Date(deadline) : null,
      status,
      categoryId,
      company,
      locationType,
      careerLevel,
      employmentType,
      vacancyCount,
      keywords,
      metaDescription,
    },
  });

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs/[slug]");
  revalidatePath("/");
  return {
    success: true,
    ai: suggestions ? {
      categoryName: suggestions.categoryName,
      keywords: suggestions.keywords,
      metaDescription: suggestions.metaDescription,
      suggestedTitle: suggestions.suggestedTitle,
      grammarNotes: suggestions.grammarNotes,
      warnings: suggestions.warnings,
    } : null
  };
}

export async function updateJobAction(formData: FormData) {
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string || "").trim();
  const description = (formData.get("description") as string || "");
  const source = (formData.get("source") as string || "").trim() || null;
  const applyLink = (formData.get("applyLink") as string || "").trim() || null;
  const deadline = (formData.get("deadline") as string || "").trim() || null;
  const status = (formData.get("status") as string || "PUBLISHED");
  const company = (formData.get("company") as string || "").trim() || null;
  const locationType = (formData.get("locationType") as string || "").trim() || null;
  const careerLevel = (formData.get("careerLevel") as string || "").trim() || null;
  const employmentType = (formData.get("employmentType") as string || "").trim() || null;
  const vacancyCount = (formData.get("vacancyCount") as string || "").trim() || null;
  let categoryId = (formData.get("categoryId") as string || "").trim() || null;

  if (!title) {
    return { error: "Title is required." };
  }

  // Re-run AI on update to refresh SEO and categorization
  let suggestions = null;
  let keywords: string | null = null;
  let metaDescription: string | null = null;

  try {
    suggestions = await getAISuggestions(title, description);

    if (suggestions) {
      keywords = suggestions.keywords.join(", ");
      metaDescription = suggestions.metaDescription;

      if (!categoryId && suggestions.categoryName) {
        const catSlug = slugify(suggestions.categoryName);
        const category = await prisma.category.upsert({
          where: { slug: catSlug },
          update: {},
          create: {
            name: suggestions.categoryName,
            slug: catSlug,
          }
        });
        categoryId = category.id;
      }
    }
  } catch (aiError) {
    console.error("[AI] Non-fatal error during job update:", aiError);
  }

  let slug = slugify(title);
  const existing = await prisma.job.findFirst({
    where: {
      slug,
      id: { not: id }
    }
  });
  
  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  await prisma.job.update({
    where: { id },
    data: {
      title,
      slug,
      description,
      source,
      applyLink,
      deadline: deadline ? new Date(deadline) : null,
      status,
      categoryId,
      company,
      locationType,
      careerLevel,
      employmentType,
      vacancyCount,
      keywords,
      metaDescription,
    },
  });

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs/[slug]");
  return { success: true };
}

export async function deleteJobAction(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.job.delete({ where: { id } });
  revalidatePath("/admin/jobs");
  revalidatePath("/jobs");
  return { success: true };
}

export async function createBidAction(formData: FormData) {
  const title = (formData.get("title") as string || "").trim();
  const description = (formData.get("description") as string || "");
  const source = (formData.get("source") as string || "").trim() || null;
  const applyLink = (formData.get("applyLink") as string || "").trim() || null;
  const deadline = (formData.get("deadline") as string || "").trim() || null;
  const status = (formData.get("status") as string || "PUBLISHED");
  let categoryId = (formData.get("categoryId") as string || "").trim() || null;

  if (!title) {
    return { error: "Title is required." };
  }

  // AI Suggestions
  let suggestions = null;
  let keywords: string | null = null;
  let metaDescription: string | null = null;

  try {
    suggestions = await getAISuggestions(title, description);

    if (suggestions) {
      keywords = suggestions.keywords.join(", ");
      metaDescription = suggestions.metaDescription;

      // Auto-categorize: upsert AI-suggested category if no category was manually selected
      if (!categoryId && suggestions.categoryName) {
        const catSlug = slugify(suggestions.categoryName);
        const category = await prisma.category.upsert({
          where: { slug: catSlug },
          update: {},
          create: {
            name: suggestions.categoryName,
            slug: catSlug,
          }
        });
        categoryId = category.id;
      }
    }
  } catch (aiError) {
    console.error("[AI] Non-fatal error during bid creation:", aiError);
    // AI failure does NOT block bid creation
  }

  let slug = slugify(title);
  const existing = await prisma.bid.findUnique({ where: { slug } });
  if (existing) {
    slug = slug + "-" + Date.now().toString(36);
  }

  await prisma.bid.create({
    data: {
      title,
      slug,
      description,
      source,
      applyLink,
      deadline: deadline ? new Date(deadline) : null,
      status,
      categoryId,
      keywords,
      metaDescription,
    },
  });

  revalidatePath("/admin/bids");
  revalidatePath("/bids/[slug]");
  revalidatePath("/");
  return {
    success: true,
    ai: suggestions ? {
      categoryName: suggestions.categoryName,
      keywords: suggestions.keywords,
      metaDescription: suggestions.metaDescription,
      suggestedTitle: suggestions.suggestedTitle,
      grammarNotes: suggestions.grammarNotes,
      warnings: suggestions.warnings,
    } : null
  };
}

export async function updateBidAction(formData: FormData) {
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string || "").trim();
  const description = (formData.get("description") as string || "");
  const source = (formData.get("source") as string || "").trim() || null;
  const applyLink = (formData.get("applyLink") as string || "").trim() || null;
  const deadline = (formData.get("deadline") as string || "").trim() || null;
  const status = (formData.get("status") as string || "PUBLISHED");
  let categoryId = (formData.get("categoryId") as string || "").trim() || null;

  if (!title) {
    return { error: "Title is required." };
  }

  // Re-run AI on update to refresh SEO and categorization
  let suggestions = null;
  let keywords: string | null = null;
  let metaDescription: string | null = null;

  try {
    suggestions = await getAISuggestions(title, description);

    if (suggestions) {
      keywords = suggestions.keywords.join(", ");
      metaDescription = suggestions.metaDescription;

      if (!categoryId && suggestions.categoryName) {
        const catSlug = slugify(suggestions.categoryName);
        const category = await prisma.category.upsert({
          where: { slug: catSlug },
          update: {},
          create: {
            name: suggestions.categoryName,
            slug: catSlug,
          }
        });
        categoryId = category.id;
      }
    }
  } catch (aiError) {
    console.error("[AI] Non-fatal error during bid update:", aiError);
  }

  let slug = slugify(title);
  const existing = await prisma.bid.findFirst({
    where: {
      slug,
      id: { not: id }
    }
  });

  if (existing) {
    slug = `${slug}-${Date.now().toString(36)}`;
  }

  await prisma.bid.update({
    where: { id },
    data: {
      title,
      slug,
      description,
      source,
      applyLink,
      deadline: deadline ? new Date(deadline) : null,
      status,
      categoryId,
      keywords,
      metaDescription,
    },
  });

  revalidatePath("/admin/bids");
  revalidatePath("/bids/[slug]");
  return { success: true };
}

export async function deleteBidAction(formData: FormData) {
  const id = formData.get("id") as string;
  await prisma.bid.delete({ where: { id } });
  revalidatePath("/admin/bids");
  revalidatePath("/bids");
  return { success: true };
}

export async function reviewJobAction(formData: FormData) {
  const title = (formData.get("title") as string || "").trim();
  const description = (formData.get("description") as string || "");

  if (!title) {
    return { error: "Title is required for review." };
  }

  try {
    const review = await reviewContent(title, description);
    if (!review) {
      return { error: "AI review failed. Check your AI configuration and try again." };
    }
    return { success: true, review };
  } catch (error) {
    console.error("[AI Review] Job review error:", error);
    return { error: "AI review encountered an error. Please try again." };
  }
}

export async function reviewBidAction(formData: FormData) {
  const title = (formData.get("title") as string || "").trim();
  const description = (formData.get("description") as string || "");

  if (!title) {
    return { error: "Title is required for review." };
  }

  try {
    const review = await reviewContent(title, description);
    if (!review) {
      return { error: "AI review failed. Check your AI configuration and try again." };
    }
    return { success: true, review };
  } catch (error) {
    console.error("[AI Review] Bid review error:", error);
    return { error: "AI review encountered an error. Please try again." };
  }
}

export async function saveJobDraftAction(formData: FormData) {
  const id = (formData.get("id") as string || "").trim() || null;
  const title = (formData.get("title") as string || "").trim();
  const description = (formData.get("description") as string || "");
  const source = (formData.get("source") as string || "").trim() || null;
  const applyLink = (formData.get("applyLink") as string || "").trim() || null;
  const deadline = (formData.get("deadline") as string || "").trim() || null;
  const company = (formData.get("company") as string || "").trim() || null;
  const locationType = (formData.get("locationType") as string || "").trim() || null;
  const careerLevel = (formData.get("careerLevel") as string || "").trim() || null;
  const employmentType = (formData.get("employmentType") as string || "").trim() || null;
  const vacancyCount = (formData.get("vacancyCount") as string || "").trim() || null;
  const categoryId = (formData.get("categoryId") as string || "").trim() || null;

  if (!title) {
    return { error: "Title is required to save draft." };
  }

  if (id) {
    const slug = slugify(title);
    await prisma.job.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        source,
        applyLink,
        deadline: deadline ? new Date(deadline) : null,
        status: "DRAFT",
        categoryId,
        company,
        locationType,
        careerLevel,
        employmentType,
        vacancyCount,
      },
    });
    revalidatePath("/admin/jobs");
    return { success: true, id };
  }

  let slug = slugify(title);
  const existing = await prisma.job.findUnique({ where: { slug } });
  if (existing) {
    slug = slug + "-" + Date.now().toString(36);
  }

  const job = await prisma.job.create({
    data: {
      title,
      slug,
      description,
      source,
      applyLink,
      deadline: deadline ? new Date(deadline) : null,
      status: "DRAFT",
      categoryId,
      company,
      locationType,
      careerLevel,
      employmentType,
      vacancyCount,
    },
  });

  revalidatePath("/admin/jobs");
  return { success: true, id: job.id };
}

export async function attachBidFileAction(formData: FormData) {
  const bidId = formData.get("bidId") as string;
  const name = (formData.get("name") as string || "").trim();
  const filePath = (formData.get("path") as string || "").trim();
  const size = parseInt(formData.get("size") as string || "0", 10);

  if (!bidId || !name || !filePath) {
    return { error: "bidId, name, and path are required." };
  }

  await prisma.file.create({
    data: { name, path: filePath, size, bidId },
  });

  revalidatePath("/admin/bids");
  revalidatePath("/bids/[slug]");
  return { success: true };
}

export async function detachBidFileAction(formData: FormData) {
  const fileId = formData.get("fileId") as string;
  if (!fileId) return { error: "fileId is required." };

  await prisma.file.delete({ where: { id: fileId } });

  revalidatePath("/admin/bids");
  revalidatePath("/bids/[slug]");
  return { success: true };
}

export async function saveBidDraftAction(formData: FormData) {
  const id = (formData.get("id") as string || "").trim() || null;
  const title = (formData.get("title") as string || "").trim();
  const description = (formData.get("description") as string || "");
  const source = (formData.get("source") as string || "").trim() || null;
  const applyLink = (formData.get("applyLink") as string || "").trim() || null;
  const deadline = (formData.get("deadline") as string || "").trim() || null;
  const categoryId = (formData.get("categoryId") as string || "").trim() || null;

  if (!title) {
    return { error: "Title is required to save draft." };
  }

  if (id) {
    const slug = slugify(title);
    await prisma.bid.update({
      where: { id },
      data: {
        title,
        slug,
        description,
        source,
        applyLink,
        deadline: deadline ? new Date(deadline) : null,
        status: "DRAFT",
        categoryId,
      },
    });
    revalidatePath("/admin/bids");
    return { success: true, id };
  }

  let slug = slugify(title);
  const existing = await prisma.bid.findUnique({ where: { slug } });
  if (existing) {
    slug = slug + "-" + Date.now().toString(36);
  }

  const bid = await prisma.bid.create({
    data: {
      title,
      slug,
      description,
      source,
      applyLink,
      deadline: deadline ? new Date(deadline) : null,
      status: "DRAFT",
      categoryId,
    },
  });

  revalidatePath("/admin/bids");
  return { success: true, id: bid.id };
}