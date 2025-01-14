// server/models/Category.ts
import { EnvironmentEntry } from "@/types/database";
interface Category {
  name: string;
  subcategories: {
    name: string;
    environments: EnvironmentEntry[];
  }[];
}
export type { Category };
