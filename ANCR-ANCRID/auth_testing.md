# ANCRID Auth Testing Playbook

Seeded admin: `aaron@ancr.io` / `ancrid2026`.

## Login (sets httpOnly cookies)
```
curl -c cookies.txt -X POST $API/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"aaron@ancr.io","password":"ancrid2026"}'
```

## Session verification
```
curl -b cookies.txt $API/api/auth/me
```

## Overview (protected)
```
curl -b cookies.txt $API/api/ancrid/overview
```

## Register a new creator
```
curl -c cookies.txt -X POST $API/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"new@ancr.io","password":"testpass","professional_name":"New Creator"}'
```

## Logout
```
curl -b cookies.txt -X POST $API/api/auth/logout
```

Cookies use `Secure` + `SameSite=None` so the preview domain allows cross-origin credentials.
