// server/routes/index.ts
import { Router } from "express";
import { getAllCategories, getCategoryContent, searchImages } from "../controllers";
export const router = Router();
router.get("/search", searchImages);
router.get("/categories", getAllCategories);
router.get("/category/:parent/:child?", getCategoryContent);
