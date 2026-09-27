# BigTrooper API

Reference for the Go API in `api/`. Routes are registered in
[`api/cmd/server/main.go`](api/cmd/server/main.go); handlers live in
[`api/internal/handlers/`](api/internal/handlers/).

- **Base URL (dev):** `http://localhost:8080/api`
- **Format:** JSON in and out. Errors look like `{ "error": "message" }`.
- **Dates:** articles use plain `YYYY-MM-DD` strings.

## Authentication

Logging in sets an HTTP-only `session_token` cookie that lasts 7 days. The
browser sends it automatically (the frontend's `apiFetch` uses
`credentials: "include"`). Non-browser clients can send the same token as
`Authorization: Bearer <token>`.

| Access | Meaning | Failure |
|---|---|---|
| Public | No login needed | – |
| User | Valid session required | `401 unauthorized` |
| Admin | Valid session **and** `users.admin = true` | `401` if logged out, `403 forbidden` if not admin |

To make an account an admin, set `admin = true` on its row in `users`.

---

## Health

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/up` | Public | `{ "status": "up" }` |

## Account

| Method | Path | Access | Body | Success |
|---|---|---|---|---|
| POST | `/signup` | Public | `first_name`, `last_name`, `email`, `phone_number`, `password` (8–72 chars), `preferences: { email, sms }` | `201` `"signup successful"` (a JSON string; does **not** log you in) |
| POST | `/login` | Public | `{ "identifier": { "email": "…" } \| { "phone": "+1…" }, "password": "…" }` | `200` `{ message, user }` + sets cookie. `401` on bad credentials, `409` if already logged in |
| POST | `/logout` | User | – | `200`, clears cookie |
| GET | `/me` | User | – | `200` user object |
| PATCH | `/me` | User | Any of `first_name`, `last_name`, `email`, `phone_number`, `password`, `preferences` | `200` updated user. `409` if email/phone already in use |
| POST | `/change-password` | User | `current_password`, `new_password` (8–72 chars) | `200`. `401` if current password is wrong |

**User object**

```json
{
  "id": 1,
  "first_name": "Vinny",
  "last_name": "Walker",
  "email": "you@example.com",
  "phone_number": "+15555550123",
  "preferences": { "email": true, "sms": false },
  "admin": false
}
```

Phone numbers are stored as `+1` followed by 10 digits, which is how the
frontend's `PhoneInput` formats them.

## Pets

All pet routes require **User** access, and a pet can only be read or changed
by its owner (`403` otherwise).

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/pets` | – | `200` array of pet list items |
| POST | `/pets/create` | `name`, `type`, `age`, `description`, `active` | `201` pet object |
| GET | `/pets/:id` | – | `200` pet object |
| PATCH | `/pets/:id` | Any of `name`, `type`, `age`, `description`, `active` | `200` `{ message }` |
| DELETE | `/pets/:id` | – | `200` `{ message }` (also deletes its photo) |

- `type` must be `Dog`, `Cat`, or `Other` (database constraint).
- `age` is required on create and currently can't be `0` (see `CreatePetRequest`).

**Pet object** (list items have the same fields minus `owner_id`, `code`, and timestamps)

```json
{
  "id": 7,
  "owner_id": 1,
  "code": "Hzi5g",
  "name": "Trooper",
  "type": "Dog",
  "age": 4,
  "description": "Curious nose, amber eyes.",
  "active": true,
  "image_url": "https://images.bigtrooper.com/pets/7/bc7f….jpg",
  "created_at": "…",
  "updated_at": "…"
}
```

`code` is what the pet's QR tag links to (`/found/<code>` on the site).
`image_url` is `null` when the pet has no photo.

### Pet photos (Cloudflare R2)

Photos go straight from the browser to R2 using a presigned URL, so the API
never handles the file itself. The frontend does all three steps in
[`web/src/api/images.ts`](web/src/api/images.ts).

| Step | Method | Path | Body | Success |
|---|---|---|---|---|
| 1. Get upload URL | POST | `/pets/:id/image/upload-url` | `{ "content_type": "image/jpeg", "size": 123456 }` | `200` `{ method, upload_url, headers, key, expires_in }` |
| 2. Upload | `method` (PUT) | `upload_url` (R2, not our API) | the file, with `headers` | `200` from R2 |
| 3. Confirm | PUT | `/pets/:id/image` | `{ "key": "<key from step 1>" }` | `200` `{ "image_url": "…" }` |
| Remove | DELETE | `/pets/:id/image` | – | `200` `{ message }` |

- Allowed types: `image/jpeg`, `image/png`, `image/webp`; max 5 MB.
- The upload URL expires after 5 minutes.
- Confirming checks that the object really exists and is valid, then replaces
  (and deletes) the previous photo.
- Returns `503` if the `R2_*` env vars aren't set.

## Articles (public)

| Method | Path | Access | Success |
|---|---|---|---|
| GET | `/articles` | Public | `200` array of **published** article list items, newest first |
| GET | `/articles/:slug` | Public | `200` article object. `404` if missing, `403` if it's a draft |

**Article list item**

```json
{
  "id": 1,
  "title": "How to Train Your Dog",
  "excerpt": "A few simple habits…",
  "date_published": "2026-09-23",
  "published": true,
  "category": { "id": 1, "name": "Training", "description": "…" },
  "slug": "how-to-train-your-dog"
}
```

The full **article object** adds `body`.

## Admin

Every route here requires **Admin** access and is prefixed with `/admin`.

### Statistics

| Method | Path | Success |
|---|---|---|
| GET | `/admin/statistics` | `200` `{ "articles": 12, "pets": 340, "users": 128 }` (article count excludes deleted) |

### Categories

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/admin/categories` | – | `200` array of `{ id, name, description }` |
| GET | `/admin/categories/:id` | – | `200` category |
| POST | `/admin/categories` | `name` (required, unique), `description` | `200` category |
| PATCH | `/admin/categories/:id` | Any of `name`, `description` | `200` category |
| DELETE | `/admin/categories/:id` | – | `200` `{ message }`. Fails while articles still use it |

### Articles

Articles are addressed by **slug**. The slug is generated from the title
(`"How to Train Your Dog"` → `how-to-train-your-dog`) and changes when the
title changes.

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/admin/articles` | – | `200` array of list items, **including drafts** |
| GET | `/admin/articles/:slug` | – | `200` article object (drafts too) |
| POST | `/admin/articles` | `title`, `excerpt`, `body`, `category_id` (required); `published`, `date_published` (`YYYY-MM-DD`) | `201` created article |
| PATCH | `/admin/articles/:slug` | Any of `title`, `excerpt`, `body`, `published`, `category_id`, `date_published` | `200` article object |
| DELETE | `/admin/articles/:slug` | – | `200` `{ message }` (soft delete: sets `deleted = true`) |

When **create** fails in the database, the response names the column:

| Status | `issue` | Example cause |
|---|---|---|
| `409` | `duplicate` | Another article already has this slug (same or similar title) |
| `400` | `not_found` | `category_id` doesn't exist |
| `400` | `required` | A required column was empty |

```json
{ "error": "Failed to create article", "field": "slug", "issue": "duplicate" }
```

Soft-deleted articles keep their slug, so a new or renamed article can't reuse
a deleted article's title.

## Planned (not built yet)

These are used by the frontend with stand-in code until the backend exists.
Search the frontend for the marker to find the details.

| Feature | Endpoints | Marker |
|---|---|---|
| Found-pet page | `GET /found/:code`, `POST /found/:code/report` | `!FOUNDPET!` in `web/src/api/found.ts` |
| Tag (3D model) generation | `POST /pets/:id/tag` | `!QRTAG!` in `web/src/api/tags.ts` |
