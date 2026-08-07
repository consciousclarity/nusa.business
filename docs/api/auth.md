# Auth (MVP)

## Login

`POST /v1/auth/login`

```json
{ "email": "owner@example.com", "password": "owner123" }
```

Response:

```json
{
  "user": { "id": "usr-owner", "email": "…", "name": "…", "role": "owner" },
  "token": "dev.usr-owner"
}
```

## Authenticated calls

Header: `Authorization: Bearer dev.{userId}`

`GET /v1/me` returns the user without password.

## Production plan

Replace demo tokens with **Better Auth** (or equivalent OSS):

- HTTP-only cookies  
- Domain `.nusa.business` for SSO across subdomains  
- Argon2/bcrypt password hashes — never seed plaintext in production  

Portal currently stores the session in `localStorage` under `nusa.session`.
