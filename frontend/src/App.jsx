import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Layers,
  Code2,
  GraduationCap,
  FolderOpen,
  ArrowRight,
  LockKeyhole,
  Sparkles,
  Filter,
  Globe,
  Send,
  AlertCircle,
  LayoutGrid,
  LogOut,
  BarChart3,
  MessageSquare,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

const emptyForm = {
  title: "",
  studentName: "",
  description: "",
  tags: "",
  githubLink: "",
  livePreviewUrl: "",
};

const emptyStats = {
  total: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
};

function getProjectsArray(response) {
  const data = response?.data;

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.projects)) return data.projects;
  if (Array.isArray(data?.data)) return data.data;

  return [];
}

function isValidOptionalUrl(value) {
  if (!value || !value.trim()) return true;

  try {
    const url = new URL(value.trim());
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function App() {
  const [projects, setProjects] = useState([]);
  const [adminProjects, setAdminProjects] = useState([]);
  const [stats, setStats] = useState(emptyStats);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [adminLoading, setAdminLoading] = useState(false);
  const [moderatingId, setModeratingId] = useState("");

  const [activeTab, setActiveTab] = useState("gallery");
  const [adminFilter, setAdminFilter] = useState("pending");

  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState("All");

  const [form, setForm] = useState(emptyForm);
  const [rejectionReasons, setRejectionReasons] = useState({});

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [adminKey, setAdminKey] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Public gallery: only approved projects.
  const fetchProjects = async () => {
    try {
      const response = await axios.get(`${API_URL}/projects`);
      const data = getProjectsArray(response);

      setProjects(
        data.filter(
          (project) =>
            String(project.status || "").toLowerCase() === "approved"
        )
      );
    } catch (err) {
      console.error("Project loading error:", err);
      setError(
        "Unable to load projects. Please check whether the backend is running."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void Promise.resolve().then(fetchProjects);
  }, []);

  const allTags = useMemo(() => {
    const tags = projects.flatMap((project) =>
      Array.isArray(project.tags) ? project.tags : []
    );

    return ["All", ...new Set(tags)];
  }, [projects]);

  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      const query = search.toLowerCase().trim();

      const matchesSearch =
        (project.title || "").toLowerCase().includes(query) ||
        (project.studentName || "").toLowerCase().includes(query) ||
        (project.description || "").toLowerCase().includes(query);

      const projectTags = Array.isArray(project.tags) ? project.tags : [];

      const matchesTag =
        selectedTag === "All" || projectTags.includes(selectedTag);

      return matchesSearch && matchesTag;
    });
  }, [projects, search, selectedTag]);

  const visibleAdminProjects = useMemo(() => {
    if (adminFilter === "all") return adminProjects;

    return adminProjects.filter(
      (project) =>
        String(project.status || "").toLowerCase() === adminFilter
    );
  }, [adminProjects, adminFilter]);

  const updateForm = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // Submit a new project.
  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    if (
      !form.title.trim() ||
      !form.studentName.trim() ||
      !form.description.trim()
    ) {
      setError("Please fill in all required fields.");
      return;
    }

    const tags = form.tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (tags.length === 0) {
      setError("Please enter at least one technology or tag.");
      return;
    }

    if (!isValidOptionalUrl(form.githubLink)) {
      setError("Please enter a valid GitHub URL.");
      return;
    }

    if (
      form.githubLink.trim() &&
      !/^https?:\/\/(www\.)?github\.com\//i.test(form.githubLink.trim())
    ) {
      setError("GitHub Repository link must be a GitHub URL.");
      return;
    }

    if (!isValidOptionalUrl(form.livePreviewUrl)) {
      setError("Please enter a valid Live Preview URL.");
      return;
    }

    try {
      setSubmitting(true);

      const payload = {
        title: form.title.trim(),
        studentName: form.studentName.trim(),
        description: form.description.trim(),
        tags,
        githubLink: form.githubLink.trim(),
        livePreviewUrl: form.livePreviewUrl.trim(),
      };

      await axios.post(`${API_URL}/projects`, payload);

      setForm(emptyForm);
      setMessage(
        "Project submitted successfully! It will appear in the gallery after admin approval."
      );
      setActiveTab("gallery");
    } catch (err) {
      console.error("Submission error:", err);
      setError(
        err.response?.data?.message ||
          "Project submission failed. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  // Admin: fetch all submissions and dashboard statistics.
  const fetchAdminData = async (key = adminKey) => {
    if (!key.trim()) {
      setError("Please enter your admin key.");
      return;
    }

    try {
      setAdminLoading(true);
      setError("");

      const headers = { "x-admin-key": key };

      const [projectsResponse, statsResponse] = await Promise.all([
        axios.get(`${API_URL}/admin/projects/all`, { headers }),
        axios.get(`${API_URL}/admin/projects/stats`, { headers }),
      ]);

      setAdminProjects(getProjectsArray(projectsResponse));

      const statsData =
        statsResponse.data?.data || statsResponse.data || {};

      setStats({
        total: Number(statsData.total || 0),
        pending: Number(statsData.pending || 0),
        approved: Number(statsData.approved || 0),
        rejected: Number(statsData.rejected || 0),
      });

      setIsAdmin(true);
    } catch (err) {
      console.error("Admin loading error:", err);
      setIsAdmin(false);
      setError(
        err.response?.data?.message ||
          "Admin authentication failed or dashboard could not be loaded."
      );
    } finally {
      setAdminLoading(false);
    }
  };

  // Admin: approve or reject a project.
  const updateProjectStatus = async (projectId, status) => {
    setMessage("");
    setError("");

    const rejectionReason = (rejectionReasons[projectId] || "").trim();

    if (status === "rejected" && !rejectionReason) {
      setError("Please enter a rejection reason before rejecting the project.");
      return;
    }

    try {
      setModeratingId(projectId);

      const payload =
        status === "rejected"
          ? { status, rejectionReason }
          : { status };

      const response = await axios.patch(
        `${API_URL}/admin/projects/${projectId}/status`,
        payload,
        {
          headers: {
            "x-admin-key": adminKey,
          },
        }
      );

      const updatedProject = response.data?.data;

      setAdminProjects((previous) =>
        previous.map((project) =>
          project._id === projectId
            ? updatedProject || {
                ...project,
                status,
                rejectionReason:
                  status === "rejected" ? rejectionReason : "",
              }
            : project
        )
      );

      setRejectionReasons((previous) => ({
        ...previous,
        [projectId]: "",
      }));

      await fetchAdminData(adminKey);

      if (status === "approved") {
        await fetchProjects();
      }

      setMessage(
        response.data?.message || `Project ${status} successfully.`
      );
    } catch (err) {
      console.error("Status update error:", err);
      setError(
        err.response?.data?.message ||
          "Unable to update project status. Please try again."
      );
    } finally {
      setModeratingId("");
    }
  };

  const openTab = (tab) => {
    setActiveTab(tab);
    setMessage("");
    setError("");
  };

  const logoutAdmin = () => {
    setIsAdmin(false);
    setAdminKey("");
    setAdminProjects([]);
    setStats(emptyStats);
    setRejectionReasons({});
    setAdminFilter("pending");
    setMessage("You have been logged out from the admin portal.");
    setError("");
  };

  const formatDate = (date) => {
    if (!date) return "Date unavailable";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="app-shell">
      <header className="navbar">
        <a
          className="brand"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            openTab("gallery");
          }}
        >
          <span className="brand-icon">
            <GraduationCap size={23} />
          </span>
          <span>Projectora</span>
        </a>

        <nav className="nav-links">
          <button
            className={activeTab === "gallery" ? "nav-link active" : "nav-link"}
            onClick={() => openTab("gallery")}
          >
            Explore Projects
          </button>

          <button
            className={activeTab === "submit" ? "nav-link active" : "nav-link"}
            onClick={() => openTab("submit")}
          >
            Submit Project
          </button>

          <button
            className={activeTab === "admin" ? "nav-link active" : "nav-link"}
            onClick={() => openTab("admin")}
          >
            <LockKeyhole size={15} />
            Admin Portal
          </button>
        </nav>

        <button className="nav-submit" onClick={() => openTab("submit")}>
          Share Your Work <ArrowRight size={16} />
        </button>
      </header>

      <main>
        {message && (
          <div className="notice success-notice">
            <CheckCircle size={18} />
            <span>{message}</span>
            <button onClick={() => setMessage("")}>×</button>
          </div>
        )}

        {error && (
          <div className="notice error-notice">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button onClick={() => setError("")}>×</button>
          </div>
        )}

        {/* PUBLIC GALLERY */}
        {activeTab === "gallery" && (
          <>
            <section className="hero">
              <div className="hero-content">
                <div className="eyebrow">
                  <Sparkles size={15} />
                  STUDENT INNOVATION COMMUNITY
                </div>

                <h1>
                  Where Student Ideas
                  <br />
                  Become <span>Real Projects.</span>
                </h1>

                <p>
                  Discover innovative projects built by students, explore
                  creative ideas, and share your own work with the community.
                </p>

                <div className="hero-actions">
                  <button
                    className="primary-button"
                    onClick={() => openTab("submit")}
                  >
                    Submit Your Project <ArrowRight size={17} />
                  </button>

                  <button
                    className="secondary-button"
                    onClick={() =>
                      document
                        .getElementById("project-gallery")
                        ?.scrollIntoView({ behavior: "smooth" })
                    }
                  >
                    Explore Gallery
                  </button>
                </div>

                <div className="hero-stats">
                  <div>
                    <strong>{projects.length}</strong>
                    <span>Approved Projects</span>
                  </div>
                  <div>
                    <strong>{allTags.length - 1}</strong>
                    <span>Categories</span>
                  </div>
                  <div>
                    <strong>100%</strong>
                    <span>Student Driven</span>
                  </div>
                </div>
              </div>

              <div className="hero-visual">
                <div className="visual-card visual-card-main">
                  <div className="visual-card-top">
                    <span className="dot dot-purple"></span>
                    <span className="dot dot-blue"></span>
                    <span className="dot dot-green"></span>
                    <span>student-project.jsx</span>
                  </div>

                  <div className="code-lines">
                    <p>
                      <span>const</span> idea = "Something amazing";
                    </p>
                    <p>
                      <span>function</span> buildProject() {"{"}
                    </p>
                    <p className="indent">learn();</p>
                    <p className="indent">create();</p>
                    <p className="indent">share(idea);</p>
                    <p>{"}"}</p>
                  </div>

                  <div className="visual-card-footer">
                    <Sparkles size={16} />
                    Built with curiosity
                  </div>
                </div>

                <div className="floating-icon floating-one">
                  <Code2 />
                </div>
                <div className="floating-icon floating-two">
                  <Layers />
                </div>
              </div>
            </section>

            <section className="gallery-section" id="project-gallery">
              <div className="section-heading">
                <div>
                  <div className="eyebrow">DISCOVER & GET INSPIRED</div>
                  <h2>Explore Student Projects</h2>
                  <p>Ideas, experiments and innovations from students.</p>
                </div>

                <button
                  className="refresh-button"
                  onClick={fetchProjects}
                  title="Refresh projects"
                >
                  <RefreshCw size={17} />
                </button>
              </div>

              <div className="gallery-toolbar">
                <div className="search-box">
                  <Search size={18} />
                  <input
                    type="search"
                    placeholder="Search projects, students..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>

                <div className="filter-label">
                  <Filter size={16} />
                  Filter:
                </div>

                <div className="tag-filters">
                  {allTags.map((tag) => (
                    <button
                      key={tag}
                      className={
                        selectedTag === tag ? "tag active-tag" : "tag"
                      }
                      onClick={() => setSelectedTag(tag)}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              {loading ? (
                <div className="empty-state">
                  <RefreshCw className="spin" size={28} />
                  <h3>Loading projects...</h3>
                </div>
              ) : filteredProjects.length === 0 ? (
                <div className="empty-state">
                  <FolderOpen size={42} />
                  <h3>No approved projects found</h3>
                  <p>
                    Try another search or be the first to share a project.
                  </p>
                  <button
                    className="primary-button"
                    onClick={() => openTab("submit")}
                  >
                    Submit a Project <Plus size={17} />
                  </button>
                </div>
              ) : (
                <div className="project-grid">
                  {filteredProjects.map((project) => (
                    <article
                      className="project-card"
                      key={project._id || project.id}
                    >
                      <div className="project-card-top">
                        <div className="project-icon">
                          <Code2 size={23} />
                        </div>
                        <span className="approved-label">
                          <CheckCircle size={13} /> Approved
                        </span>
                      </div>

                      <h3>{project.title}</h3>
                      <p className="project-author">
                        By {project.studentName}
                      </p>
                      <p className="project-description">
                        {project.description}
                      </p>

                      <div className="project-tags">
                        {(Array.isArray(project.tags) ? project.tags : []).map(
                          (tag) => (
                            <span className="project-tag" key={tag}>
                              {tag}
                            </span>
                          )
                        )}
                      </div>

                      <div className="project-card-links">
                        {project.githubLink && (
                          <a
                            href={project.githubLink}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Code2 size={16} /> GitHub
                            <ExternalLink size={13} />
                          </a>
                        )}

                        {project.livePreviewUrl && (
                          <a
                            href={project.livePreviewUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <Globe size={16} /> Live Preview
                            <ExternalLink size={13} />
                          </a>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          </>
        )}

        {/* SUBMISSION FORM */}
        {activeTab === "submit" && (
          <section className="form-section">
            <div className="form-heading">
              <div className="eyebrow">
                <Sparkles size={15} /> SHARE YOUR CREATION
              </div>
              <h1>Submit Your Project</h1>
              <p>
                Showcase your hard work. Your project will appear publicly
                after admin approval.
              </p>
            </div>

            <form className="project-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label>
                  Project Title <span>*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  value={form.title}
                  onChange={updateForm}
                  placeholder="e.g. AI Resume Analyzer"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Student Name <span>*</span>
                </label>
                <input
                  type="text"
                  name="studentName"
                  value={form.studentName}
                  onChange={updateForm}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Project Description <span>*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={updateForm}
                  placeholder="Explain what your project does..."
                  rows="5"
                  required
                />
              </div>

              <div className="form-group">
                <label>
                  Technologies / Tags <span>*</span>
                </label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags}
                  onChange={updateForm}
                  placeholder="React, Python, AI, MongoDB"
                  required
                />
                <small>Separate tags using commas.</small>
              </div>

              <div className="form-group">
                <label>
                  GitHub Repository{" "}
                  <span className="optional">(Optional)</span>
                </label>
                <input
                  type="url"
                  name="githubLink"
                  value={form.githubLink}
                  onChange={updateForm}
                  placeholder="https://github.com/username/project"
                />
              </div>

              <div className="form-group">
                <label>
                  Live Preview URL{" "}
                  <span className="optional">(Optional)</span>
                </label>
                <input
                  type="url"
                  name="livePreviewUrl"
                  value={form.livePreviewUrl}
                  onChange={updateForm}
                  placeholder="https://your-project.vercel.app"
                />
              </div>

              <div className="form-note">
                <ShieldCheck size={18} />
                Your project will remain hidden from the public gallery until
                an administrator approves it.
              </div>

              <button
                className="primary-button submit-button"
                type="submit"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Project"}
                <Send size={17} />
              </button>
            </form>
          </section>
        )}

        {/* ADMIN PORTAL */}
        {activeTab === "admin" && (
          <section className="admin-section">
            <div className="form-heading">
              <div className="eyebrow">
                <ShieldCheck size={15} /> ADMINISTRATION
              </div>
              <h1>Admin Moderation Portal</h1>
              <p>
                Review student submissions, manage approvals and monitor
                project activity.
              </p>
            </div>

            {!isAdmin ? (
              <form
                className="admin-login-card"
                onSubmit={(event) => {
                  event.preventDefault();
                  fetchAdminData();
                }}
              >
                <div className="admin-lock-icon">
                  <LockKeyhole size={27} />
                </div>
                <h2>Administrator Login</h2>
                <p>Enter your configured admin key to continue.</p>
                <input
                  type="password"
                  value={adminKey}
                  onChange={(event) => setAdminKey(event.target.value)}
                  placeholder="Enter admin key"
                  required
                />
                <button
                  type="submit"
                  className="primary-button"
                  disabled={adminLoading}
                >
                  {adminLoading ? "Verifying..." : "Access Admin Portal"}
                  <ArrowRight size={17} />
                </button>
              </form>
            ) : (
              <div className="admin-dashboard">
                <div className="admin-dashboard-heading">
                  <div>
                    <h2>Dashboard Overview</h2>
                    <p>Monitor and moderate student project submissions.</p>
                  </div>

                  <div className="admin-heading-actions">
                    <button
                      className="refresh-button"
                      onClick={() => fetchAdminData()}
                      disabled={adminLoading}
                    >
                      <RefreshCw size={17} /> Refresh
                    </button>

                    <button
                      className="secondary-button admin-logout"
                      onClick={logoutAdmin}
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </div>
                </div>

                {/* Dashboard statistics */}
                <div className="admin-stats-grid">
                  <div className="admin-stat-card">
                    <div className="admin-stat-icon total-icon">
                      <BarChart3 size={21} />
                    </div>
                    <div>
                      <span>Total Projects</span>
                      <strong>{stats.total}</strong>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon pending-icon">
                      <Clock size={21} />
                    </div>
                    <div>
                      <span>Pending</span>
                      <strong>{stats.pending}</strong>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon approved-icon">
                      <CheckCircle size={21} />
                    </div>
                    <div>
                      <span>Approved</span>
                      <strong>{stats.approved}</strong>
                    </div>
                  </div>

                  <div className="admin-stat-card">
                    <div className="admin-stat-icon rejected-icon">
                      <XCircle size={21} />
                    </div>
                    <div>
                      <span>Rejected</span>
                      <strong>{stats.rejected}</strong>
                    </div>
                  </div>
                </div>

                {/* Admin project filters */}
                <div className="admin-project-panel">
                  <div className="admin-tabs">
                    {[
                      { id: "pending", label: "Pending", count: stats.pending },
                      {
                        id: "approved",
                        label: "Approved",
                        count: stats.approved,
                      },
                      {
                        id: "rejected",
                        label: "Rejected",
                        count: stats.rejected,
                      },
                      { id: "all", label: "All Projects", count: stats.total },
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        className={
                          adminFilter === tab.id
                            ? "admin-tab active-admin-tab"
                            : "admin-tab"
                        }
                        onClick={() => setAdminFilter(tab.id)}
                      >
                        {tab.label}
                        <span>{tab.count}</span>
                      </button>
                    ))}
                  </div>

                  <div className="admin-list-heading">
                    <div>
                      <h3>
                        {adminFilter === "all"
                          ? "All Projects"
                          : `${adminFilter.charAt(0).toUpperCase()}${adminFilter.slice(1)} Projects`}
                      </h3>
                      <p>
                        {visibleAdminProjects.length} project(s) in this
                        section.
                      </p>
                    </div>
                    <LayoutGrid size={21} />
                  </div>

                  {adminLoading ? (
                    <div className="empty-state">
                      <RefreshCw className="spin" size={28} />
                      <h3>Loading dashboard...</h3>
                    </div>
                  ) : visibleAdminProjects.length === 0 ? (
                    <div className="empty-state">
                      <FolderOpen size={40} />
                      <h3>No projects in this section</h3>
                      <p>Projects will appear here when available.</p>
                    </div>
                  ) : (
                    <div className="pending-list">
                      {visibleAdminProjects.map((project) => {
                        const status = String(
                          project.status || "pending"
                        ).toLowerCase();

                        return (
                          <article
                            className="pending-card admin-project-card"
                            key={project._id || project.id}
                          >
                            <div className="pending-card-heading">
                              <div>
                                <span className={`status-label status-${status}`}>
                                  {status === "approved" && (
                                    <CheckCircle size={13} />
                                  )}
                                  {status === "pending" && <Clock size={13} />}
                                  {status === "rejected" && (
                                    <XCircle size={13} />
                                  )}
                                  {status.charAt(0).toUpperCase() +
                                    status.slice(1)}
                                </span>

                                <h3>{project.title}</h3>
                                <p>Submitted by {project.studentName}</p>
                                <small className="submission-date">
                                  Submitted: {formatDate(project.createdAt)}
                                </small>
                              </div>
                            </div>

                            <p className="pending-description">
                              {project.description}
                            </p>

                            <div className="project-tags">
                              {(Array.isArray(project.tags)
                                ? project.tags
                                : []
                              ).map((tag) => (
                                <span className="project-tag" key={tag}>
                                  {tag}
                                </span>
                              ))}
                            </div>

                            <div className="pending-links">
                              {project.githubLink && (
                                <a
                                  href={project.githubLink}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Code2 size={15} /> GitHub
                                  <ExternalLink size={12} />
                                </a>
                              )}

                              {project.livePreviewUrl && (
                                <a
                                  href={project.livePreviewUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <Globe size={15} /> Live Preview
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>

                            {/* Rejection feedback/history */}
                            {status === "rejected" &&
                              project.rejectionReason && (
                                <div className="rejection-feedback">
                                  <div>
                                    <MessageSquare size={16} />
                                    <strong>Rejection Feedback</strong>
                                  </div>
                                  <p>{project.rejectionReason}</p>
                                </div>
                              )}

                            {Array.isArray(project.moderationHistory) &&
                              project.moderationHistory.length > 0 && (
                                <details className="moderation-history">
                                  <summary>View moderation history</summary>
                                  <div className="history-list">
                                    {project.moderationHistory.map(
                                      (item, index) => (
                                        <div
                                          className="history-item"
                                          key={`${item.reviewedAt || index}-${index}`}
                                        >
                                          <strong>
                                            {item.status
                                              ? item.status
                                                  .charAt(0)
                                                  .toUpperCase() +
                                                item.status.slice(1)
                                              : "Reviewed"}
                                          </strong>
                                          <span>
                                            {formatDate(item.reviewedAt)}
                                          </span>
                                          {item.reason && <p>{item.reason}</p>}
                                        </div>
                                      )
                                    )}
                                  </div>
                                </details>
                              )}

                            {/* Actions only for pending projects */}
                            {status === "pending" && (
                              <div className="admin-moderation-box">
                                <label htmlFor={`reason-${project._id}`}>
                                  Rejection Reason
                                </label>
                                <textarea
                                  id={`reason-${project._id}`}
                                  rows="2"
                                  value={rejectionReasons[project._id] || ""}
                                  onChange={(event) =>
                                    setRejectionReasons((previous) => ({
                                      ...previous,
                                      [project._id]: event.target.value,
                                    }))
                                  }
                                  placeholder="Explain why this project is being rejected..."
                                />

                                <div className="moderation-actions">
                                  <button
                                    className="approve-button"
                                    disabled={moderatingId === project._id}
                                    onClick={() =>
                                      updateProjectStatus(
                                        project._id || project.id,
                                        "approved"
                                      )
                                    }
                                  >
                                    <CheckCircle size={16} />
                                    {moderatingId === project._id
                                      ? "Updating..."
                                      : "Approve"}
                                  </button>

                                  <button
                                    className="reject-button"
                                    disabled={moderatingId === project._id}
                                    onClick={() =>
                                      updateProjectStatus(
                                        project._id || project.id,
                                        "rejected"
                                      )
                                    }
                                  >
                                    <XCircle size={16} />
                                    Reject Project
                                  </button>
                                </div>
                              </div>
                            )}
                          </article>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="footer">
        <div className="footer-brand">
          <GraduationCap size={21} />
          <strong>CodeNova</strong>
        </div>
        <p>Built for student creators. Powered by innovation.</p>
        <span>© {new Date().getFullYear()} CodeNova Student Showcase</span>
      </footer>
    </div>
  );
}

export default App;