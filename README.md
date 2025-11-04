# LR-CHIP Website

Premium website for LR-CHIP - exclusive Land Rover and Jaguar retrofit service.

## Features

- 🎨 Apple-inspired design
- 📱 Fully responsive (mobile, tablet, desktop)
- 🛒 Shopping cart functionality
- 👨‍💼 Admin panel for managing vehicles and services
- 📋 Order management system
- 🔒 Secure authentication

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Zustand (state management)
- Framer Motion (animations)

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd lr-chip
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file (optional, for admin password):
```bash
cp .env.example .env
# Edit .env and set ADMIN_PASSWORD
```

4. Run development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Deployment

See [DEPLOY.md](./DEPLOY.md) for detailed deployment instructions to Netlify.

## Project Structure

```
lr-chip/
├── src/
│   ├── app/              # Next.js app router pages
│   ├── components/        # React components
│   ├── data/             # JSON data files
│   ├── store/            # Zustand stores
│   └── middleware.ts     # Auth middleware
├── public/               # Static assets
└── netlify.toml          # Netlify configuration
```

## Admin Panel

Access the admin panel at `/admin/login` (default password can be set in `.env`).

Features:
- Manage vehicles (add, edit, delete, reorder)
- Manage services (add, edit, delete)
- View and manage orders
- Change order statuses

## License

Private project - All rights reserved.
