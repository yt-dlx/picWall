// server/controllers/index.ts
import metaBase from "../database";
import { RequestHandler } from "express";
import { EnvironmentEntry } from "@/types/database";
export const getAllCategories: RequestHandler = (req, res) => {
  const categories = Object.keys(metaBase).map((parent) => ({
    name: parent,
    subcategories: Object.keys(metaBase[parent])
  }));
  res.json(categories);
};
export const getCategoryContent: RequestHandler = (req, res) => {
  const { parent, child } = req.params;
  const parentCategory = metaBase[parent as keyof typeof metaBase];
  if (!parentCategory) {
    res.status(404).json({ error: "Category not found" });
    return;
  }
  if (child) {
    const content = parentCategory[child as keyof typeof parentCategory];
    if (!content) {
      res.status(404).json({ error: "Subcategory not found" });
      return;
    }
    res.json(content);
  } else {
    const allContent = Object.values(parentCategory);
    res.json(allContent);
  }
};

export const searchImages: RequestHandler = (req, res) => {
  const { query } = req.query;
  if (!query || typeof query !== "string") {
    res.status(400).json({ error: "Search query required and must be a string" });
    return;
  }
  const searchResults: EnvironmentEntry[] = [];

  Object.values(metaBase).forEach((category: Record<string, EnvironmentEntry>) => {
    Object.values(category).forEach((entry: EnvironmentEntry) => {
      const matchedImages = entry.images.filter((img) => img.original_file_name.toLowerCase().includes(query.toLowerCase()));
      if (matchedImages.length > 0) {
        searchResults.push({ ...entry, images: matchedImages });
      }
    });
  });

  res.json(searchResults);
};
