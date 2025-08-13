# TutorMS – Room & Class Scheduling Tool

TutorMS is a scheduling and booking tool for managing **rooms, classes, instructors, and events** developed 
for the Gibraltar Digital Skills academy.

Built with:
- **Next.js** (React framework)
- **Prisma** (database ORM)
- **SQLite** (local development DB)
- **Auth0** (authentication and login)
- **Material UI** (UI components)
- **React Big Calendar** (calendar view)

---

## 📦 1. Prerequisites

Before starting, install the following software:

| Tool | Download Link | Notes |
|------|---------------|-------|
| **Node.js** (LTS) | https://nodejs.org/en/download | Choose the LTS version, includes `npm` |
| **Git** | https://git-scm.com/downloads | Used to download this project |
| **Visual Studio Code** | https://code.visualstudio.com/Download | Recommended editor |
| **SQLite** (optional) | https://www.sqlite.org/download.html | Prisma can manage it automatically |

To check if they're installed, write the following in the VS Code Terminal:
```bash
node -v    # should be >= 18.x
npm -v     # should be >= 9.x
git --version
```

---

## 📂 2. Download the Project

Open a terminal, change directory to a folder you want/like and run:
```bash
# Clone the repository
git clone https://github.com/GibraltarDigitalSkillsAcademy/tutorms.git

# Go into the project folder
cd tutorms
```

---

## 📥 3. Install Dependencies

This will install all required packages:
```bash
npm install
```

---

## 🔐 4. Set Up Environment Variables

Create a `.env.local` file in the **project root** and paste:

```env
# Prisma Database URL (SQLite for dev)
DATABASE_URL="file:./dev.db"

# Auth0 Credentials
AUTH0_SECRET="a_random_32_char_hex_or_base64_string"
AUTH0_BASE_URL="http://localhost:3000"
AUTH0_ISSUER_BASE_URL="https://YOUR_DOMAIN.eu.auth0.com"
AUTH0_CLIENT_ID="YOUR_CLIENT_ID"
AUTH0_CLIENT_SECRET="YOUR_CLIENT_SECRET"

# Optional (for API access / Organizations)
# AUTH0_AUDIENCE="https://your-api-id"
# AUTH0_SCOPE="openid profile email"
# AUTH0_ORGANIZATION="org_abc123"
```

---

## 🗄 5. Set Up the Database

Prisma will create the database and apply the schema.

```bash
# Generate Prisma client
npx prisma generate

# Apply database schema
npx prisma migrate dev --name init
```

You can inspect the database with:
```bash
npx prisma studio
```
Prisma Studio opens in the browser and lets you view/edit your data.

---

## ▶️ 6. Run the Development Server

```bash
npm run dev
```

Now open:  
👉 http://localhost:3000

---

## 🔑 7. Log In

- Click **Login** in the app (or go to `/auth/login`).
- You will be redirected to Auth0.
- Log in using your invited account (if using Organizations).

---

## 🛠 8. Tech Stack Overview

| Feature | Technology |
|---------|------------|
| Framework | Next.js 14+ |
| UI Components | Material UI |
| Database | SQLite (dev) / any SQL DB (prod) |
| ORM | Prisma |
| Auth | Auth0 |
| Calendar | React Big Calendar |

---

## 💡 9. Common Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Run dev server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npx prisma migrate dev --name change_name` | Update DB schema |
| `npx prisma studio` | GUI to view/edit DB |

---

## 🧹 10. Troubleshooting

- **Port in use**: Change the port with `npm run dev -- -p 4000`
- **Auth0 login loop**: Make sure `AUTH0_BASE_URL` matches your site URL exactly
- **Database errors**: Delete `dev.db` and run `npx prisma migrate dev` again

---

## 📜 License

MIT License. Free to use and modify.