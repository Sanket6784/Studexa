# Studexa 🚀

> Your student identity, beyond the resume.

Studexa is a full-stack student platform designed to help students build, showcase, and grow their professional identity.

Students can create professional profiles, showcase projects, write articles, connect with other students, and build an online presence beyond a traditional resume.

---

## 📌 About the Project

A traditional resume can only show a limited amount of a student's journey.

Students build projects, learn technologies, participate in activities, write about what they learn, and gain experiences throughout college.

Studexa brings these things together into one platform.

With Studexa, students can create a professional identity and showcase:

- 👤 Personal profile
- 🎓 Education
- 💻 Projects
- 🛠️ Skills
- 📝 Articles
- 🌐 Community activity
- 🔗 Public profile

### Main idea

**Learn. Build. Grow.**

---

# ✨ Features

## 👤 Student Profiles

Students can create a professional profile containing:

- Full name
- College
- Branch
- Graduation year
- Skills
- Bio

Each student has a public profile that can showcase their background and projects.

---

## 💻 Projects

Students can showcase the projects they have built.

Projects can contain:

- Project title
- Description
- Technologies used
- GitHub repository
- Live demo

This allows students to demonstrate practical skills instead of only listing technologies on a resume.

---

## 📝 Articles

Students can share their knowledge and experiences through articles.

Possible topics include:

- Programming
- Web development
- Artificial intelligence
- College experiences
- Projects
- Career preparation
- Technology
- Learning experiences

Articles help students demonstrate both technical knowledge and communication skills.

---

## 🌐 Community

Studexa provides a student-focused community where users can:

- Create posts
- Share ideas
- Read posts from other students
- Like posts
- Comment
- Interact with other students

The goal is to create a professional environment where students can learn from each other.

---

## 📊 Dashboard

The dashboard provides a central place for students to manage their Studexa profile.

It gives access to:

- Profile
- Projects
- Articles
- Community
- Public profile

---

## 🔐 Authentication

Studexa uses Supabase Authentication.

Users can:

- Create an account
- Log in
- Access protected pages
- Create their student profile
- Manage their data

Each authenticated user is connected to their corresponding profile through their Supabase user ID.

---

# 🛠️ Tech Stack

## Frontend

- Next.js
- React
- TypeScript
- Tailwind CSS

## Backend

- Supabase
- PostgreSQL
- Supabase Authentication

## Development Tools

- Node.js
- npm
- Git
- GitHub
- Visual Studio Code

---

# 📂 Project Structure

```text
studexa/
│
├── app/
│   ├── community/
│   ├── dashboard/
│   ├── login/
│   ├── profile/
│   │   └── setup/
│   ├── signup/
│   │
│   ├── page.tsx
│   └── ...
│
├── lib/
│   └── supabase.ts
│
├── public/
│
├── .gitignore
├── package.json
├── package-lock.json
├── next.config.ts
├── postcss.config.mjs
├── tsconfig.json
└── README.md