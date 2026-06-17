# Elvoria Technologies - Next.js Migration Guide

Your project has been successfully migrated from React + Vite + Express to **Next.js 16.2.4**.

## What Changed

### Before (Vite + React + Express)
- Frontend: React app built with Vite
- Backend: Separate Express server on port 3001
- Two separate development servers

### After (Next.js)
- **Single Framework**: Frontend & API routes in one Next.js app
- **API Routes**: Backend email handling via `/app/api/contact/route.ts`
- **One Dev Server**: Run everything with `npm run dev`
- **Better Performance**: Server-side rendering capabilities
- **Simplified Deployment**: Deploy once instead of managing separate servers

## Project Location

```
/Users/zahoor/Downloads/Work/elvoriatech-nextjs/
```

## Setup Instructions

### 1. Configure Environment Variables

Edit `.env.local` in the project root:

```env
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CONTACT_EMAIL=contact@elvoria.tech
```

### 2. Gmail Setup (Recommended) Adding for updating new version

1. Enable 2-Step Verification: [Google Account Security](https://myaccount.google.com/security)
2. Go to [App Passwords](https://myaccount.google.com/apppasswords)
3. Select "Mail" and "Windows Computer"
4. Copy the 16-character password
5. Paste it as `EMAIL_PASSWORD` in `.env.local`

### 3. Start Development Server

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### 4. Build for Production

```bash
npm run build
npm start
```

## File Structure

```
elvoriatech/
├── app/
│   ├── api/
│   │   └── contact/
│   │       └── route.ts          # Email API endpoint
│   ├── components/
│   │   ├── TopBar.tsx
│   │   ├── Hero.tsx
│   │   ├── About.tsx
│   │   ├── Services.tsx
│   │   ├── Portfolio.tsx
│   │   ├── Contact.tsx           # Updated to use /api/contact
│   │   ├── Footer.tsx
│   │   └── ... (other components)
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home page (renders all components)
│   ├── globals.css
│   ├── fonts.css
│   └── index.css
├── public/
│   └── elvoria.png               # Your company logo
├── .env.local                    # Environment variables
├── package.json
└── tsconfig.json
```

## API Endpoint

### POST `/api/contact`

The contact form now uses the built-in Next.js API route. No need for a separate server!

**Frontend Call:**
```javascript
const response = await fetch('/api/contact', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(formData),
});
```

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "company": "Tech Corp",
  "projectType": "SaaS Product Development",
  "budget": "$100K - $250K",
  "message": "We would like to discuss a new project..."
}
```

## Deployment Options

### Vercel (Recommended for Next.js)

1. Push your code to GitHub
2. Go to [Vercel](https://vercel.com)
3. Import your repository
4. Add environment variables in Vercel settings
5. Deploy

### Docker

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run:
```bash
docker build -t elvoriatech .
docker run -p 3000:3000 -e EMAIL_USER=... -e EMAIL_PASSWORD=... elvoriatech
```

### Traditional Server (AWS, DigitalOcean, etc.)

```bash
npm run build
npm start
```

## Troubleshooting

**"Failed to send email"**
- Check credentials in `.env.local`
- For Gmail, verify 2-Step is enabled and use app-specific password

**Port 3000 already in use**
```bash
npm run dev -- -p 3001
```

**Missing components**
- All components from the old project have been copied to `/app/components/`
- Styles are in `/app/` directory

## Removing Old Project

Once you've verified everything works in the Next.js version:

```bash
rm -rf /Users/zahoor/Downloads/Work/'Professional Company Profile PDF'
```

## Next Steps

1. ✅ Set up environment variables
2. ✅ Test the contact form locally
3. ✅ Deploy to Vercel or your preferred hosting
4. ✅ Update your domain DNS settings
5. ✅ Monitor email deliverability

## Questions?

Refer to:
- [Next.js Documentation](https://nextjs.org/docs)
- [Nodemailer Guide](https://nodemailer.com/)
- [Vercel Deployment Docs](https://vercel.com/docs)
