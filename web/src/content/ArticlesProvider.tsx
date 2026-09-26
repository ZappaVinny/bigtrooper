import { useCallback, useState, type ReactNode } from "react";
import { ArticlesContext } from "./ArticlesContext";
import { SEED_ARTICLES, SEED_CATEGORIES, type Article } from "./articles";

// PLACEHOLDER STORE: articles and categories live in memory, seeded from
// ./articles.ts, so admin edits show up on /articles immediately but reset
// on reload. When the backend is ready, load these from the API and make
// each action below call its endpoint (e.g. POST/PATCH/DELETE /articles,
// /article-categories) before updating state.
export function ArticlesProvider({ children }: { children: ReactNode }) {
  const [articles, setArticles] = useState<Article[]>(SEED_ARTICLES);
  const [categories, setCategories] = useState<string[]>(SEED_CATEGORIES);

  const saveArticle = useCallback(
    (input: Omit<Article, "id"> & { id?: number }) => {
      const saved: Article = {
        ...input,
        id: input.id ?? Math.max(0, ...articles.map((a) => a.id)) + 1,
      };
      setArticles((prev) =>
        prev.some((a) => a.id === saved.id)
          ? prev.map((a) => (a.id === saved.id ? saved : a))
          : [...prev, saved],
      );
      return saved;
    },
    [articles],
  );

  const deleteArticle = useCallback((id: number) => {
    setArticles((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const addCategory = useCallback((name: string) => {
    setCategories((prev) => (prev.includes(name) ? prev : [...prev, name]));
  }, []);

  const renameCategory = useCallback((from: string, to: string) => {
    setCategories((prev) => prev.map((c) => (c === from ? to : c)));
    setArticles((prev) => prev.map((a) => (a.category === from ? { ...a, category: to } : a)));
  }, []);

  const deleteCategory = useCallback((name: string) => {
    setCategories((prev) => prev.filter((c) => c !== name));
  }, []);

  return (
    <ArticlesContext.Provider
      value={{ articles, categories, saveArticle, deleteArticle, addCategory, renameCategory, deleteCategory }}
    >
      {children}
    </ArticlesContext.Provider>
  );
}
