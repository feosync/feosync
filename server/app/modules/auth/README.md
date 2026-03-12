# Google OAuth Authentication Setup

## Installation

Install required packages:

```bash
pip install google-auth google-auth-oauthlib google-auth-httplib2
```

Or add to `requirements.txt`:
```
google-auth>=2.0.0
google-auth-httplib2>=0.1.0
```

## Configuration

Add your Google Client ID to `.env`:

```env
# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
```

Update `app/core/config.py` to include:
```python
GOOGLE_CLIENT_ID: str
```

## Frontend Integration

### Getting Google ID Token

Use Google Sign-In library on the frontend:

```html
<script src="https://accounts.google.com/gsi/client" async defer></script>

<div id="g_id_onload"
     data-client_id="YOUR_CLIENT_ID"
     data-callback="handleCredentialResponse">
</div>
<div class="g_id_signin" data-type="standard"></div>

<script>
function handleCredentialResponse(response) {
  // Send token to backend
  fetch('/api/v1/auth/google/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      token: response.credential
    })
  })
  .then(res => res.json())
  .then(data => {
    // Store access_token from response
    localStorage.setItem('access_token', data.access_token);
  });
}
</script>
```

## API Endpoints

### Login
```
POST /api/v1/auth/google/login
```
Request:
```json
{
  "token": "eyJhbGciOiJSUzI1NiIsImtpZCI6IjEifQ..."
}
```

Response:
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "john@example.com",
    "google_id": "123456789",
    "profile_picture": "https://example.com/profile.jpg",
    "is_active": true,
    "created_at": "2026-03-12T10:00:00",
    "updated_at": "2026-03-12T10:00:00"
  }
}
```

### Register
```
POST /api/v1/auth/google/register
```
Same as login but only creates new users.

### Get Current User
```
GET /api/v1/auth/me
Authorization: Bearer <access_token>
```

### Logout
```
POST /api/v1/auth/logout
Authorization: Bearer <access_token>
```

## Using Protected Endpoints

For any endpoint requiring authentication, use the `get_current_user` or `get_active_user` dependencies:

```python
from fastapi import APIRouter, Depends
from app.modules.auth.dependencies import get_current_user
from app.modules.user.user_model import User

router = APIRouter()

@router.get("/protected")
async def protected_route(current_user: User = Depends(get_current_user)):
    return {"user_id": current_user.id, "email": current_user.email}
```

## Error Handling

All auth endpoints return proper HTTP status codes:
- 200: Success
- 400: Bad request (invalid token format, user exists)
- 401: Unauthorized (invalid/expired token)
- 500: Server error

## Token Management

Tokens are JWT-based with configurable expiration time in `.env`:
```env
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=60
```

Tokens are verified using the SECRET_KEY:
```env
SECRET_KEY=your-secret-key-here
```
