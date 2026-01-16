import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  User,
  Building2,
} from "lucide-react";
import AttachmentsSection from "./components/AttachmentsSection";
import CommentsSection from "./components/CommentsSection";
import Loader from "./components/Loader";
import TopNavBar from "./components/TopNavBar";
import RACISection from "./components/RACISection";

const API_URL = import.meta.env.VITE_API_URL;

const TaskDetailScreen = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [raci, setRaci] = useState(null);
  const [raciLoading, setRaciLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const token = localStorage.getItem("token");

  const userMenuRef = useRef(null); 

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close dropdown on ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") setShowUserMenu(false);
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, []);

  const fetchRACI = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/tasks/${taskId}/raci`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch RACI data");
      const data = await res.json();
      console.log("RACI data:", data);
      setRaci(data.data);
    } catch (err) {
      console.error("Error fetching RACI data:", err);
    } finally {
      setRaciLoading(false);
    }
  }

  const handleAttachmentUpload = async (file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(
        `${API_URL}/api/tasks/${taskId}/attachments`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: formData,
          cache: "no-store",
        }
      );

      if (!res.ok) throw new Error("Upload failed");
      await fetchAttachments();
    } catch (err) {
      console.error("Error uploading attachment:", err);
      alert("Failed to upload attachment.");
    }
  };

  const fetchAttachments = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/tasks/${taskId}/attachments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch attachments");
      const data = await res.json();
      console.log("Attachments data:", data);
      setAttachments(data.attachments);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (commentText) => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(
        `${API_URL}/api/tasks/${taskId}/comments`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ content: commentText }),
        }
      );
      if (!res.ok) throw new Error("Failed to post comment");
      await fetchComments();
    } catch (err) {
      console.error("Error posting comment:", err);
      alert("Failed to post comment.");
    }
  };

  const fetchComments = async () => {
    try {
      const res = await fetch(
        `${API_URL}/api/tasks/${taskId}/comments`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        }
      );
      if (!res.ok) throw new Error("Failed to fetch comments");
      const data = await res.json();
      console.log("Comments data:", data);
      setComments(data.comment);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch task");
        const data = await res.json();
        console.log("Task data:", data);
        setTask(data.task);
      } catch (err) {
        console.error(err);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 800);
      }
    };

    if (taskId) {
      fetchTaskDetails();
      fetchComments();
      fetchAttachments();
      fetchRACI();
    }
  }, [taskId, token]);

  const getStatusColor = (status) => {
    switch (status) {
      case "COMPLETED":
        return "text-green-600 bg-green-100";
      case "IN_PROGRESS":
        return "text-blue-600 bg-blue-100";
      case "OVERDUE":
        return "text-red-600 bg-red-100";
      case "PENDING":
        return "text-orange-600 bg-orange-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "LOW":
        return "text-green-600 bg-green-100";
      case "HIGH":
        return "text-red-600 bg-red-100";
      case "MEDIUM":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
      <div className="flex flex-col h-screen">
        {/* Navbar */}
        <TopNavBar
          user={currentUser}
          handleLogout={handleLogout}
          showBack
          backTo="/dashboard"
        />

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
            <div className="mb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {task.title}
                </h1>
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                  <span
                    className={`px-2.5 py-1 text-xs font-medium rounded-md border ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </div>
              </div>

              {/* Task Description with Show More / Show Less */}
              {task.description && (
                <p className="text-gray-700 mt-2">
                  {expanded
                    ? task.description
                    : task.description.length > 120
                    ? task.description.slice(0, 120) + "..."
                    : task.description}

                  {task.description.length > 120 && (
                    <button
                      onClick={() => setExpanded((prev) => !prev)}
                      className="ml-2 text-blue-600 hover:underline text-sm font-medium cursor-pointer"
                    >
                      {expanded ? "Show Less" : "Read More"}
                    </button>
                  )}
                </p>
              )}
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 border-t border-gray-100 pt-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">DUE DATE</p>
                  <p className="text-sm font-medium text-gray-800">
                    {task.dueDate
                      ? new Date(task.dueDate).toLocaleDateString()
                      : "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">ASSIGNED TO</p>
                  <p className="text-sm font-medium text-gray-800">
                    {task.assignedTo?.name || "Unassigned"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">CREATED BY</p>
                  <p className="text-sm font-medium text-gray-800">
                    {task.createdBy?.name || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">CREATED AT</p>
                  <p className="text-sm font-medium text-gray-800">
                    {new Date(task.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Building2 className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-xs text-gray-500">ORGANIZATION</p>
                  <p className="text-sm font-medium text-gray-800">
                    {task.organization?.name || "—"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Comments & Attachments */}
          <div className="flex-1 space-y-4">
            <RACISection raci={raci} loading={raciLoading} />
            <CommentsSection
              comments={comments}
              onAddComment={handleAddComment}
            />
            <AttachmentsSection
              attachments={attachments}
              onUpload={handleAttachmentUpload}
              onRemove={(id) =>
                setAttachments((prev) => prev.filter((a) => a.id !== id))
              }
              taskId={taskId}
            />
          </div>
        </main>
      </div>
    </div>
  );
};

export default TaskDetailScreen;
