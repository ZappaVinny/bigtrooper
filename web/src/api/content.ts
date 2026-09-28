import { apiFetch } from "./client";
import type {
  Article,
  ArticleInput,
  ArticleListItem,
  Category,
  CategoryInput,
  Statistics,
} from "../types/api";

// Constraint errors from the API carry the failing column and the kind of
// problem, e.g. { field: "slug", issue: "duplicate" } (see API.md).
export class ApiError extends Error {
  status: number;
  field?: string;
  issue?: string;

  constructor(status: number, message: string, field?: string, issue?: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.field = field;
    this.issue = issue;
  }
}

async function request<T>(path: string, init?: Parameters<typeof apiFetch>[1]): Promise<T> {
  const res = await apiFetch(path, init);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.error ?? `HTTP ${res.status}`, data?.field, data?.issue);
  }
  return data as T;
}

const json = (method: string, body: unknown) => ({ method, body: JSON.stringify(body) });

// Public
export const listArticles = () => request<ArticleListItem[]>("/articles");
export const getArticle = (slug: string) =>
  request<Article>(`/articles/${encodeURIComponent(slug)}`);

// Admin
export const getStatistics = () => request<Statistics>("/admin/statistics");

export const adminListArticles = () => request<ArticleListItem[]>("/admin/articles");
export const adminGetArticle = (slug: string) =>
  request<Article>(`/admin/articles/${encodeURIComponent(slug)}`);
export const createArticle = (input: ArticleInput) =>
  request<Article>("/admin/articles", json("POST", input));
export const updateArticle = (slug: string, input: ArticleInput) =>
  request<Article>(`/admin/articles/${encodeURIComponent(slug)}`, json("PATCH", input));
export const deleteArticle = (slug: string) =>
  request<{ message: string }>(`/admin/articles/${encodeURIComponent(slug)}`, { method: "DELETE" });

export const listCategories = () => request<Category[]>("/admin/categories");
export const createCategory = (input: CategoryInput) =>
  request<Category>("/admin/categories", json("POST", input));
export const updateCategory = (id: number, input: CategoryInput) =>
  request<Category>(`/admin/categories/${id}`, json("PATCH", input));
export const deleteCategory = (id: number) =>
  request<{ message: string }>(`/admin/categories/${id}`, { method: "DELETE" });
