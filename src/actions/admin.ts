"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getAISuggestions } from "@/lib/ai";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function createJobAction(formData: FormData) {
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
  const suggestions = await getAISuggestions(title, description);
  let keywords: string | null = null;
  let metaDescription: string | null = null;

  if (suggestions) {
    keywords = suggestions.keywords.join(", ");
    metaDescription = suggestions.metaDescription;

    // Auto-create category if missing and AI suggested one
    if (!categoryId && suggestions.categoryName) {
      const catSlug = suggestions.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const category = await prisma.category.upsert({
        where: { slug: catSlug },
        update: {},
        create: {
          name: suggestions.categoryName,
          slug: catSlug
        }
      });
      categoryId = category.id;
    }
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
      keywords,
      metaDescription,
    },
  });

  revalidatePath("/admin/jobs");
  revalidatePath("/jobs/[slug]");
  return { success: true };
}

export async function updateJobAction(formData: FormData) {
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string || "").trim();
  const description = (formData.get("description") as string || "");
  const source = (formData.get("source") as string || "").trim() || null;
  const applyLink = (formData.get("applyLink") as string || "").trim() || null;
  const deadline = (formData.get("deadline") as string || "").trim() || null;
  const status = (formData.get("status") as string || "PUBLISHED");
  const categoryId = (formData.get("categoryId") as string || "").trim() || null;

  if (!title) {
    return { error: "Title is required." };
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
  const suggestions = await getAISuggestions(title, description);
  let keywords: string | null = null;
  let metaDescription: string | null = null;

  if (suggestions) {
    keywords = suggestions.keywords.join(", ");
    metaDescription = suggestions.metaDescription;

    // Auto-create category if missing and AI suggested one
    if (!categoryId && suggestions.categoryName) {
      const catSlug = suggestions.categoryName.toLowerCase().replace(/[^a-z0-9]+/g, "-");
      const category = await prisma.category.upsert({
        where: { slug: catSlug },
        update: {},
        create: {
          name: suggestions.categoryName,
          slug: catSlug
        }
      });
      categoryId = category.id;
    }
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
  return { success: true };
}

export async function updateBidAction(formData: FormData) {
  const id = formData.get("id") as string;
  const title = (formData.get("title") as string || "").trim();
  const description = (formData.get("description") as string || "");
  const source = (formData.get("source") as string || "").trim() || null;
  const applyLink = (formData.get("applyLink") as string || "").trim() || null;
  const deadline = (formData.get("deadline") as string || "").trim() || null;
  const status = (formData.get("status") as string || "PUBLISHED");
  const categoryId = (formData.get("categoryId") as string || "").trim() || null;

  if (!title) {
    return { error: "Title is required." };
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

export async function saveJobDraftAction(formData: FormData) {
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