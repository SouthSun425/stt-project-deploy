# Copy this file to local-secrets.ps1. The copied file is ignored by Git.
$env:SECRET_KEY = "replace-with-a-random-secret"
$env:INTERNAL_API_KEY = "replace-with-a-random-internal-key"
$env:FASTAPI_INTERNAL_API_KEY = $env:INTERNAL_API_KEY
$env:JWT_SECRET = "replace-with-at-least-32-random-characters"
$env:LOCAL_ADMIN_EMAIL = "admin@example.com"
$env:LOCAL_ADMIN_PASSWORD = "replace-with-a-strong-local-password"
