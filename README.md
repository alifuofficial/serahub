# SeraHub 🚀

SeraHub is a modern, high-performance job and tender aggregation platform designed to connect professionals with the latest career and procurement opportunities in Ethiopia. 

![SeraHub Preview](https://images.unsplash.com/photo-1521737711867-e3b97375f902?q=80&w=1200&auto=format&fit=crop)

## ✨ Features

- **Dynamic Job & Bid Aggregation**: Real-time listing of jobs and tenders from various sources.
- **Modern UI/UX**: Built with a sleek, responsive design using Tailwind CSS 4.0 and glassmorphism aesthetics.
- **Admin Dashboard**: Comprehensive management suite for controlling jobs, bids, categories, and users.
- **Partner Management**: Dynamic "Trusted By" marquee section manageable from the admin panel.
- **Advanced Search**: Filter through opportunities with a fast, intuitive search interface.
- **Secure Authentication**: Robust session-based authentication with role-based access control (RBAC).
- **File Management**: Integrated support for document attachments and partner logo uploads (Local & FTP).

## 🛠️ Tech Stack

- **Framework**: [Next.js 15 (App Router)](https://nextjs.org/)
- **Database**: [SQLite](https://www.sqlite.org/) with [Prisma ORM](https://www.prisma.io/)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Logic**: TypeScript, Server Actions
- **Icons**: Lucide React
- **Editor**: Editor.js for rich content management

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ 
- npm or bun

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/alifuofficial/serahub.git
   cd serahub
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-secret-key"
   ```

4. **Initialize the database:**
   ```bash
   npx prisma db push
   npx prisma db seed
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

## 📂 Project Structure

```text
src/
├── actions/      # Server Actions (CRUD, Auth, etc.)
├── app/          # Next.js App Router (Public & Admin)
├── components/   # Reusable UI components
├── hooks/        # Custom React hooks
├── lib/          # Utilities (Prisma, Session, etc.)
└── types/        # TypeScript interfaces
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the Apache-2.0 License.

---
Built with ❤️ by [Ali Fuad](https://github.com/alifuofficial)
