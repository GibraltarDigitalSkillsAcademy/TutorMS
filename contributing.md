# Contributing Guide

Thank you for your interest in contributing! 🎉  
This project is used as a **room booking and class scheduling tool** for an academy. We welcome contributions from **school and college students** who want to practice real-world development.

---

## 🧑‍💻 Who can contribute?
- Beginners learning **web development** (React, Next.js, TypeScript, Node.js).
- Students interested in **databases** (Prisma + SQLite/Postgres).
- Anyone curious about **open-source collaboration**.

No prior professional experience is needed!

---

## ⚙️ Getting Started

1. **Fork the repo** → make your own copy on GitHub.
2. **Clone your fork**:
   ```bash
   git clone https://github.com/YOUR-USERNAME/tutorms.git
   cd tutorms
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Setup the database**:
   ```bash
   npx prisma migrate dev
   ```
   This will create a local database and apply migrations.

5. **Run the app**:
   ```bash
   npm run dev
   ```
   Open http://localhost:3000 in your browser.

---

## 📝 How to Contribute

1. **Pick an Issue**
   - Look at the [Issues](../../issues) tab.
   - Good first tasks are labelled **`good first issue`**.
   - If you’re unsure, ask in the issue comments.

2. **Create a Branch**
   ```bash
   git checkout -b fix/short-description
   ```

3. **Make Changes**
   - Follow the code style (use Prettier + ESLint).
   - Test locally (`npm run dev`).

4. **Commit Your Work**
   ```bash
   git add .
   git commit -m "Fix: describe your change"
   ```

5. **Push and Create a PR**
   ```bash
   git push origin fix/short-description
   ```
   Then open a Pull Request (PR) on GitHub.

---

## 🧩 Types of Contributions
- **Bug fixes** (fix broken buttons, typos, logic errors).
- **Small features** (add new fields, filters, or UI elements).
- **UI improvements** (better layout for mobile, accessibility fixes).
- **Code cleanup** (remove unused variables, improve readability).

---

## ✅ Tips for Beginners
- Don’t worry about making mistakes — we’ll review and help.
- Ask questions in the Pull Request if you’re unsure.
- Start small! Even fixing a typo helps you learn the workflow.

---

## 🌟 Code of Conduct
- Be respectful and constructive.
- This project is for learning, so kindness is required.
- No contribution is “too small.”

---

## 📚 Resources to Learn
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev/learn)
- [Prisma Docs](https://www.prisma.io/docs/)
- [MDN Web Docs](https://developer.mozilla.org/)

---

💡 **Pro tip:** If you get stuck, open an Issue describing your problem. Someone else might be able to guide you!

