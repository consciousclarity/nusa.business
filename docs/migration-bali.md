# bali.business → nusa.business migration

Keep **bali.business** (WordPress) live during the rebuild.

## Export

1. Export listings via WP REST (`/wp-json/wp/v2/job_listing` or the listings CPT endpoint) or SQL dump of listing posts + meta.
2. Map fields:

| Source (WP) | Nusa |
|---|---|
| post_title | `Business.name` |
| post_name | `Business.slug` |
| `_address` / location | `address`, lat/lng |
| categories / listing types | `categories[]` |
| region / location taxonomy | Infer `Place` (Canggu, Ubud, …) else `denpasar` fallback |
| featured image + gallery | MinIO objects + `gallery[]` |
| phone / whatsapp / website | contact fields |
| `_opening_hours` | `openingHours` |
| owner user | `ownerUserId` after claim |

3. Load via API `POST /v1/portal/listings` or direct seed merge into `.data/store.json`.

## URL 301 map (Phase B)

When `bali.nusa.business` is canonical:

```
https://bali.business/en/listing/{slug}/
  → https://{place}.bali.nusa.business/{slug}
```

If place cannot be inferred:

```
→ https://bali.nusa.business/listings/{slug}
```

(Add island-level listing path when implementing fallback routes.)

Preserve language where possible:

```
/en/listing/{slug}/ → https://{place}.bali.nusa.business/en/{slug}
/id/listing/{slug}/ → https://{place}.bali.nusa.business/id/{slug}
```

## Cutover checklist

- [ ] Freeze bali.business writes or dual-write
- [ ] Full listing + media export
- [ ] Place inference report (manual fix list)
- [ ] Seed Nusa + spot-check SEO titles
- [ ] Enable CDN 301 rules
- [ ] Submit updated sitemap for bali.nusa.business
- [ ] Monitor Search Console for 404s
