# Projectora – Student Project Showcase

A full-stack student project showcase platform where students can submit their projects and share their work with the community. The platform includes a public project gallery, search and tag-based filtering, and an admin dashboard for reviewing and moderating submissions.

## 🚀 Features

### 👨‍🎓 Student Features
- Submit projects using a public submission form.
- Add project title, student name, description, and tags.
- Optionally provide GitHub and Live Preview links.
- Receive submission status updates.
- Projects remain hidden from the public gallery until approved by an admin.

### 🌐 Public Project Gallery
- Display only admin-approved projects.
- Search projects by title, student name, or description.
- Filter projects using tags.
- View project descriptions and available links.
- Responsive and user-friendly interface.

### 🔐 Admin Dashboard
- Secure admin access.
- View project submissions.
- Approve or reject submitted projects.
- Provide feedback when rejecting a project.
- Track total, pending, approved, and rejected projects.
- Review moderation history.

## 🛠️ Tech Stack

**Frontend**
- React.js
- JavaScript
- HTML5
- CSS3
- Axios
- Lucide React

**Backend**
- Node.js
- Express.js
- REST API

**Database**
- MongoDB
- Mongoose

**Tools**
- Visual Studio Code
- Git
- GitHub
- Postman

## 📁 Project Structure

```text
CodeNova_StudentProjectShowcase/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
│
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── projectController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   └── adminAuth.js
│   ├── models/
│   │   └── Project.js
│   ├── routes/
│   │   ├── projectRoutes.js
│   │   └── adminRoutes.js
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── README.md
```

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/CodeNova_StudentProjectShowcase.git
```

```bash
cd CodeNova_StudentProjectShowcase
```

### 2. Setup Backend

```bash
cd backend
npm install
```

Create a `.env` file inside the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
ADMIN_KEY=your_secure_admin_key
```

Start the backend server:

```bash
npm run dev
```

The backend API will run at:

`http://localhost:5000`

### 3. Setup Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed in the terminal to access the application.

## 🔗 API Endpoints

### Public Project APIs

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/projects` | Submit a new project |
| GET | `/api/projects` | Get approved projects |

### Admin APIs

Admin endpoints require the configured admin key in the `x-admin-key` request header.

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/admin/projects/stats` | Get dashboard statistics |
| GET | `/api/admin/projects/all` | Get all projects |
| GET | `/api/admin/projects/pending` | Get pending submissions |
| GET | `/api/admin/projects/approved` | Get approved projects |
| GET | `/api/admin/projects/rejected` | Get rejected projects |
| PATCH | `/api/admin/projects/:id/status` | Approve or reject a project |

## 🔄 Project Moderation Workflow

1. A student submits a project through the submission form.
2. The project is stored in MongoDB with `pending` status.
3. Pending projects are visible in the admin dashboard.
4. The admin reviews the submission.
5. The admin approves or rejects the project.
6. Rejected submissions require an admin feedback reason.
7. Only approved projects appear in the public gallery.

## 🔒 Security

- Admin routes are protected using admin-key authentication.
- Database credentials and admin keys are stored in environment variables.
- Environment files should not be committed to GitHub.
- Public users cannot directly approve their own submissions.

## 🎯 Project Objective

The objective of Projectora is to create a centralized platform where students can showcase their academic and personal projects, explore the work of other students, and receive feedback through an admin-moderated submission process.

## 👨‍💻 Author

**Suresh Chavan**

GitHub: [sureshchavn](https://github.com/sureshchavn)

LinkedIn: [linkedin.com/in/sureshchavan](https://www.linkedin.com/in/suresh-chavan/)

---

⭐ If you find this project useful, consider giving it a star