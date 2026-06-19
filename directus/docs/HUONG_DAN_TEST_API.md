# Huong Dan Test API Directus

Tai lieu nay la ban tom tat bang tieng Viet cho tester.
Ban tieng Anh o [API_TESTING_GUIDE.md](./API_TESTING_GUIDE.md) la nguon tham chieu chinh.

## Truy cap nhanh

- Swagger UI: `http://localhost:8055/docs`
- Live spec: `http://localhost:8055/docs/spec`
- Export OpenAPI: `cd directus && npm run openapi:export`
- Directus Admin: `http://localhost:8055`

## Cac endpoint chinh

### OTP

- `POST /otp/issue`
- `POST /otp/verify`

Purpose:
- `register`
- `login-2fa`

### Dang ky khach hang

- `POST /customer-onboarding/register`

Body can co:
- `company_name`
- `contact_name`
- `email`
- `phone`
- `password`
- `confirm_password`
- `agree`
- `agree_at`
- `verified_token`

Ket qua:
- tao `directus_users` active
- tao `customers` active
- luu consent vao `customers.consented_at`

### Reset va doi mat khau

- `POST /password-reset-request/send`
- `POST /password-reset-request/reset`
- `POST /password-change/change`

Luu y:
- `password-change` dung `email` + `verified_token`
- khong dung `current_password`

### Commercial import

- `POST /commercial-import/preview`
- `POST /commercial-import/commit`

Chi role:
- Admin
- Sales

### Media policy

- `POST /media-policy/soft-delete`
- `POST /media-policy/hard-delete`

Quyen:
- soft delete: Admin, Editor, Sales
- hard delete: chi Admin

## Flow test nhanh

1. Dang nhap Admin UI de lay token.
2. Mo `http://localhost:8055/docs`.
3. Test theo thu tu:
   - OTP
   - Onboarding
   - Commercial import
   - Media policy
   - Password reset / change
4. Kiem tra side effect trong Directus Admin va Mailpit.

## Tai lieu lien quan

- [overview.md](./overview.md)
- [SCHEMA.md](./SCHEMA.md)
- [verify_onboarding.mjs](../testing/verify_onboarding.mjs)
- [verify_commercial_data_import.mjs](../testing/verify_commercial_data_import.mjs)
- [verify_media_policy.mjs](../testing/verify_media_policy.mjs)

