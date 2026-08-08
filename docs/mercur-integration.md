# Mercur / Medusa integration notes

Nusa ships a **local marketplace module** providing vendor stores (vendor linked 1:1 to a `Business`, products, 0% commission).

## Production path

1. Deploy [Mercur](https://github.com/mercurjs/mercur) (MIT) on Medusa using the commented service in `docker/compose.yml`.
2. On vendor create (`POST /v1/marketplace/vendors`), also create a Mercur vendor and store `mercur_vendor_id` on the Nusa vendor record.
3. Portal “Vendor shop” deep-links to Mercur Vendor Panel for product/order/payout management.
4. Public Astro listing “Shop” tab can call Mercur storefront APIs for live catalog/checkout.

Until Mercur is up, seeded vendors (Celuk Silver, Gianyar Batik, Malioboro Batik) demonstrate multi-vendor UX end-to-end.
