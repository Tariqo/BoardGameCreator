# Backend API Documentation

## Authentication & User Management

### Register User
**Endpoint:** `POST /api/auth/register`

**Usage:**
```javascript
// Example Request
fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: "user@example.com",
    username: "username",
    password: "password123"
  })
})
```

**Important Implementation Details:**
- Supports both email and username for registration
- Password is hashed using bcrypt before storage
- Automatically checks for duplicate usernames/emails
- Returns JWT token on successful registration

**Response:**
```javascript
{
  "status": "success",
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "username",
    "email": "user@example.com"
  }
}
```

### Login
**Endpoint:** `POST /api/auth/login`

**Usage:**
```javascript
// Can login with either username or email
fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    login: "username_or_email",
    password: "password123"
  })
})
```

**Implementation Notes:**
- Supports login with either email or username
- Returns same JWT token format as registration
- Token contains user ID and role information

### Profile Management
**Endpoints:**
- `GET /api/profile` - Get user profile
- `PUT /api/profile` - Update profile

**Authentication Required:**
```javascript
// Required headers for authenticated endpoints
headers: {
  'Authorization': 'Bearer your_jwt_token',
  'Content-Type': 'application/json'
}
```

**Example Update:**
```javascript
fetch('/api/profile', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer your_jwt_token',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    username: "new_username"
    // Add other profile fields as needed
  })
})
```

## Project Management

### Create Project
**Endpoint:** `POST /api/projects`

**Features:**
- Automatic file upload to Cloudinary
- Project metadata storage
- Owner assignment

**Example Usage:**
```javascript
// Using FormData for file upload
const formData = new FormData();
formData.append('title', 'Project Title');
formData.append('description', 'Project Description');
formData.append('files', fileObject);

fetch('/api/projects', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  },
  body: formData
})
```

### Retrieve Projects
**Endpoints:**
- `GET /api/projects` - List all projects
- `GET /api/projects/:projectId` - Get specific project

**Implementation Notes:**
- Projects are paginated (default 10 per page)
- Includes owner information
- Returns Cloudinary URLs for files

## Project Like System

### Like/Unlike Project
**Endpoints:**
- `POST /api/projects/:projectId/like` - Like a project
- `POST /api/projects/:projectId/unlike` - Unlike a project
- `GET /api/projects/liked` - Get user's liked projects

**Example Like Operation:**
```javascript
fetch('/api/projects/123/like', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer your_jwt_token'
  }
})
```

**Implementation Details:**
- Automatically prevents duplicate likes
- Updates project like count
- Maintains list of liked projects in user model
- Handles race conditions in like/unlike operations

## Error Handling

### Common Error Responses
```javascript
// Authentication Error
{
  "status": "error",
  "message": "Invalid token",
  "code": "AUTH_ERROR"
}

// Validation Error
{
  "status": "error",
  "message": "Invalid input data",
  "code": "VALIDATION_ERROR",
  "details": {
    "field": "error description"
  }
}

// Resource Error
{
  "status": "error",
  "message": "Resource not found",
  "code": "NOT_FOUND"
}
```

## Development Notes

### Authentication Flow
1. All protected routes require valid JWT token
2. Token format: `Bearer your_jwt_token`
3. Token expiration: 24 hours
4. Refresh token not implemented yet (planned for future)

### Database Models

**User Model Key Fields:**
```javascript
{
  username: String,  // unique
  email: String,     // unique
  password: String,  // hashed
  likedProjects: [ObjectId]  // references Project model
}
```

**Project Model Key Fields:**
```javascript
{
  title: String,
  description: String,
  owner: ObjectId,    // references User model
  files: Map,         // Cloudinary URLs
  likes: Number,
  createdAt: Date
}
```

### Testing API Endpoints
For testing endpoints, you can use the following curl commands:

```bash
# Example: Register User
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"test","password":"test123"}'

# Example: Create Project
curl -X POST http://localhost:3000/api/projects \
  -H "Authorization: Bearer your_jwt_token" \
  -F "title=Test Project" \
  -F "file=@/path/to/file"
```

### Known Limitations
1. File upload size limit: 10MB
2. Project title must be unique per user
3. Username changes limited to once per 24 hours
4. Maximum 100 likes per user per day 