# BigTrooper API

Reference for the Go API in `srv/`. Routes are registered in
[`srv/internal/api/router.go`](srv/internal/api/router.go); handlers live in
[`srv/internal/api/handlers/`](srv/internal/api/handlers/), one package per area. Configuration (database,
R2, cookies, CORS, proxies) is explained in [`.env.example`](.env.example).

- **Base URL (dev):** `http://localhost:8080/api`
- **Format:** JSON in and out. Errors look like `{ "error": "message" }`.
- **Dates:** articles use plain `YYYY-MM-DD` strings.

## Authentication

Logging in sets an HTTP-only `session_token` cookie that lasts 7 days. The
browser sends it automatically (the frontend's `apiFetch` uses
`credentials: "include"`). Non-browser clients can send the same token as
`Authorization: Bearer <token>`.

- **Storage:** the database only stores a SHA-256 hash of each token.
- **HTTPS-only cookie:** set `COOKIE_SECURE=true` in production.

| Access | Meaning | Failure |
|---|---|---|
| Public | No login needed | – |
| User | Valid session required | `401 unauthorized` |
| Admin | Valid session **and** `users.admin = true` | `401` if logged out, `403 forbidden` if not admin |

To make an account an admin, set `admin = true` on its row in `users`.

### Rate limits

Some public routes are limited per client IP. Going over the limit returns
`429 { "error": "too many requests, try again shortly" }`.

| Route | Limit |
|---|---|
| `POST /login` | 10 / minute (bursts of 5) |
| `POST /signup` | 5 / minute (bursts of 3) |
| `GET /found/:code` | 30 / minute (bursts of 10) |
| `POST /found/:code` | 5 / minute (bursts of 3) |

The client IP only comes from proxy headers you've told the API to trust
(`TRUSTED_PLATFORM` / `TRUSTED_PROXIES` in `.env`).

### Constraint errors

When a create, update or delete breaks a database rule, the response names the
field and the problem:

```json
{ "error": "An article with this title already exists", "field": "title", "issue": "duplicate" }
```

| Status | `issue` | Where |
|---|---|---|
| `409` | `duplicate` | Article title already used (`field: "title"`), category name taken (`field: "name"`) |
| `409` | `in_use` | Deleting a category that articles still use (`field: "id"`) |
| `400` | `not_found` | Article `category_id` doesn't exist (`field: "category_id"`) |
| `400` | `invalid` | Pet `type` isn't Dog, Cat or Other (`field: "type"`) |

Anything else is a plain `500`.

---

## Health

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/up` | Public | `{ "status": "up" }` |

## Account

| Method | Path | Access | Body | Success |
|---|---|---|---|---|
| POST | `/signup` | Public | `first_name`, `last_name`, `email`, `phone_number`, `password` (8–72 chars), `preferences: { email, sms }` | `201 { "message": "signup successful" }` (does **not** log you in) |
| POST | `/login` | Public | `{ "identifier": { "email": "…" } \| { "phone": "+1…" }, "password": "…" }` | `200 { message, user }` + sets cookie. `401` bad credentials, `409` already logged in |
| POST | `/logout` | User | – | `200`, clears cookie |
| GET | `/me` | User | – | `200` user object |
| PATCH | `/me` | User | Any of `first_name`, `last_name`, `email`, `phone_number`, `preferences`; plus `current_password` when changing email or phone | `200` updated user. `401` wrong/missing `current_password`, `409` email/phone in use |
| POST | `/change-password` | User | `current_password`, `new_password` (8–72 chars) | `200`, and **logs out every other session**. `401` if current password is wrong |

Passwords can only change through `/change-password`; `PATCH /me` ignores any
`password` field. Invalid request bodies return `400 "Invalid request body"`,
and the details go to the server log only.

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

Phone numbers are unique and stored as `+1` followed by 10 digits. The frontend
normalizes whatever the user types (`web/src/lib/phone.ts`).

## Pets

All pet routes require **User** access. A pet that doesn't exist and a pet
owned by someone else both return `404 pet not found`.

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/pets` | – | `200` array of pet list items |
| POST | `/pets` | `name`, `type`, `age`, `description`, `active` | `201` pet object |
| GET | `/pets/:id` | – | `200` pet object |
| PATCH | `/pets/:id` | Any of `name`, `type`, `age`, `description`, `active` | `200 { message }` |
| DELETE | `/pets/:id` | – | `200 { message }` (also deletes its photo) |

- `type` must be `Dog`, `Cat`, or `Other`. Anything else returns
  `400 { "field": "type", "issue": "invalid" }`.
- `age` is required on create and must be `0` or more.

**Pet object** (list items have the same fields minus `owner_id`, `code` and the timestamps)

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

`code` is unique and is what the pet's QR tag links to (`/found/<code>` on the
site). `image_url` is `null` when the pet has no photo.

### Pet photos (Cloudflare R2)

Photos go straight from the browser to R2 using a presigned URL, so the API
never handles the file itself. The frontend does all three steps in
[`web/src/api/images.ts`](web/src/api/images.ts).

| Step | Method | Path | Body | Success |
|---|---|---|---|---|
| 1. Get upload URL | POST | `/pets/:id/image/upload-url` | `{ "content_type": "image/jpeg", "size": 123456 }` | `200 { method, upload_url, headers, key, expires_in }` |
| 2. Upload | `method` (PUT) | `upload_url` (R2, not our API) | the file, with `headers` | `200` from R2 |
| 3. Confirm | PUT | `/pets/:id/image` | `{ "key": "<key from step 1>" }` | `200 { "image_url": "…" }` |
| Remove | DELETE | `/pets/:id/image` | – | `200 { message }` |

- Allowed types: `image/jpeg`, `image/png`, `image/webp`; max 5 MB.
- The upload URL expires after 5 minutes.
- Confirming checks that the object really exists and is valid, then replaces
  (and deletes) the previous photo.
- Returns `503` if the `R2_*` env vars aren't set.

## Found pets (public, behind the QR tag)

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/found/:code` | – | `200 { name, type, age, description, image_url }` |
| POST | `/found/:code` | `{ "email": … \| null, "phone": … \| null, "location": { "lat", "lng" } \| null }` (email or phone required) | `200 { "message": "report received" }` |

- An unknown code and a paused tag (`active = false`) both return `404 tag not active`.
- Only finder-safe fields are returned: never the owner, the pet's id or its code.
- Finder phone numbers must use US E.164 format: `+1` followed by 10 digits.
- Latitude must be between `-90` and `90`; longitude must be between `-180`
  and `180`.
- Reports are stored before notifications are attempted. `owner_notified` is
  set when at least one enabled notification channel succeeds.
- Email and SMS are sent concurrently according to the owner's preferences.
  Each delivery attempt uses `NOTIFICATION_TIMEOUT` (`10s` by default).
- Finder coordinates are converted to a city, province and country for email.
  If reverse geocoding fails, the email is still sent without a location.
- SMS messages link to `SITE_URL/pets/<code>/found`.
- Notification failures are logged but still return `200` once the report has
  been stored. A database failure returns `500 Unable to create report`.

## Articles (public)

| Method | Path | Success |
|---|---|---|
| GET | `/articles` | `200` array of **published** article list items, newest first |
| GET | `/articles/:slug` | `200` article object. `404` if it's missing **or** a draft |

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
| GET | `/admin/statistics` | `200 { "articles": 12, "pets": 340, "users": 128 }` (article count excludes deleted) |

### Categories

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/admin/categories` | – | `200` array of `{ id, name, description }` |
| GET | `/admin/categories/:id` | – | `200` category |
| POST | `/admin/categories` | `name` (required, unique), `description` | `201` category |
| PATCH | `/admin/categories/:id` | Any of `name`, `description` | `200` category |
| DELETE | `/admin/categories/:id` | – | `200 { message }`. `409 in_use` while articles still use it |

A missing category id returns `404 Category not found`.

### Articles

Articles are addressed by **slug**. The slug is generated from the title
(`"How to Train Your Dog"` → `how-to-train-your-dog`) and changes when the
title changes.

| Method | Path | Body | Success |
|---|---|---|---|
| GET | `/admin/articles` | – | `200` array of list items, **including drafts** |
| GET | `/admin/articles/:slug` | – | `200` article object (drafts too) |
| POST | `/admin/articles` | `title`, `excerpt`, `body`, `category_id` (required); `published`, `date_published` (`YYYY-MM-DD`) | `201` full article object |
| PATCH | `/admin/articles/:slug` | Any of `title`, `excerpt`, `body`, `published`, `category_id`, `date_published` | `200` full article object, with the current category |
| DELETE | `/admin/articles/:slug` | – | `200 { message }` (soft delete: sets `deleted = true`) |

- **Slug conflicts:** two live articles can't share a slug; you get
  `409 { "field": "title", "issue": "duplicate" }`. Deleted articles don't count,
  so their titles can be reused.
- **Bad category:** an unknown `category_id` returns `400 not_found`.

## Planned (not built yet)

| Feature | Endpoints | Marker |
|---|---|---|
| Tag (3D model) generation | `POST /pets/:id/tag` | `!QRTAG!` in `web/src/api/tags.ts` |
