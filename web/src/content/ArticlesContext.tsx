import { createContext, useContext } from "react";
import type { Article } from "./articles";

export type ArticlesContextValue = {
  articles: Article[];
  categories: string[];
  /** Creates the article if its id is new, otherwise replaces it. Returns the saved article. */
  saveArticle: (article: Omit<Article, "id"> & { id?: number }) => Article;
  deleteArticle: (id: number) => void;
  addCategory: (name: string) => void;
  renameCategory: (from: string, to: string) => void;
  deleteCategory: (name: string) => void;
};

export const ArticlesContext = createContext<ArticlesContextValue | null>(null);

export function useArticles() {
  const ctx = useContext(ArticlesContext);
  if (!ctx) throw new Error("useArticles must be inside <ArticlesProvider>");
  return ctx;
}
