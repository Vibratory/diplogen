# Database Implementation

This document describes the database implementation for the Diploma Generator platform.

## Database Schema

The application uses SQLite with Prisma ORM. The database includes the following tables:

### Templates
- `id`: Unique identifier
- `uploader`: Clerk user ID of the uploader
- `name`: Template name
- `description`: Template description
- `category`: Template category (education, awards, training, etc.)
- `image`: URL to template image
- `approved`: Boolean approval status
- `approvedBy`: Admin user ID who approved
- `approvedAt`: Approval timestamp
- `createdAt`: Creation timestamp
- `uses`: Number of times template was used
- `generatedDiplomas`: Number of diplomas generated from this template

### Users
- `id`: Clerk user ID
- `email`: User email
- `signedUpAt`: Registration timestamp
- `languagePreference`: User's preferred language
- `diplomasCreated`: Total diplomas created by user
- `templatesUploaded`: Number of templates uploaded
- `lastActive`: Last activity timestamp

### UserTemplateUsed
- Tracks which templates each user has used
- Links users to templates with usage timestamp

### GenerationSession
- Records each diploma generation session
- Tracks user, template, count, and timestamp

### Admin
- `id`: Clerk user ID
- `name`: Admin name
- `email`: Admin email
- `uploadedTemplates`: Number of templates uploaded by admin
- `approvedTemplates`: Number of templates approved by admin

### Visitor
- Tracks active visitors for real-time statistics
- `sessionId`: Unique session identifier
- `lastSeen`: Last activity timestamp
- `userAgent`: Browser user agent
- `ipAddress`: Visitor IP address

### Statistics
- Global platform statistics
- `totalDiplomas`: Total diplomas generated
- `totalUsers`: Total registered users
- `totalTemplates`: Total templates
- `approvedTemplates`: Approved templates count
- `pendingTemplates`: Pending templates count
- `activeUsers`: Currently active users
- `monthlyGrowth`: Monthly growth percentage

## API Endpoints

### Templates
- `GET /api/templates` - Get templates (with filtering)
- `POST /api/templates` - Create new template
- `POST /api/templates/approve` - Approve/reject template (admin only)
- `POST /api/templates/track-use` - Track template usage
- `POST /api/templates/track-generation` - Track diploma generation

### Users
- `GET /api/users` - Get users (admin only)
- `GET /api/users/preferences` - Get user preferences
- `POST /api/users/preferences` - Update user preferences
- `POST /api/users/track-generation` - Track user generation activity

### Visitors
- `POST /api/visitors/heartbeat` - Update visitor activity
- `GET /api/visitors/active` - Get active visitor count

### Statistics
- `GET /api/statistics` - Get platform statistics (admin only)

### Webhooks
- `POST /api/webhooks/clerk` - Clerk user events webhook

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install prisma @prisma/client svix
   ```

2. Initialize database:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

3. Seed database with sample data:
   ```bash
   npm run db:seed
   ```

4. Set up environment variables in `.env`:
   ```
   DATABASE_URL="file:./dev.db"
   CLERK_WEBHOOK_SECRET="your_webhook_secret"
   ```

## Admin Setup

To create an admin user:

1. Sign up through Clerk authentication
2. Get your Clerk user ID
3. Add a record to the `admins` table:
   ```sql
   INSERT INTO admins (id, name, email) VALUES ('your_clerk_user_id', 'Admin Name', 'admin@example.com');
   ```

## Features Implemented

### Template Management
- Database-backed template storage
- Admin approval workflow
- Usage tracking and statistics
- Category-based organization

### User Tracking
- Clerk integration for user management
- Language preference storage
- Activity tracking
- Generation session history

### Real-time Statistics
- Live visitor tracking
- Template usage analytics
- User engagement metrics
- Admin dashboard with real data

### Admin Panel
- Template approval interface
- User management
- Platform statistics
- Real-time visitor count

## Database Maintenance

### Reset Database
```bash
npm run db:reset
```

### Test Database Connection
```bash
npx tsx scripts/test-db.ts
```

### View Database
You can use any SQLite browser or:
```bash
npx prisma studio
```

## Production Considerations

For production deployment:

1. Switch to PostgreSQL:
   ```
   DATABASE_URL="postgresql://user:password@host:port/database"
   ```

2. Set up proper Clerk webhook endpoint
3. Configure proper admin user management
4. Set up database backups
5. Monitor database performance
6. Implement rate limiting
7. Add proper error handling and logging

## Security Notes

- All admin endpoints require authentication
- Template uploads require user authentication
- Visitor tracking is anonymized
- Database queries use Prisma's built-in SQL injection protection
- Webhook endpoints verify signatures