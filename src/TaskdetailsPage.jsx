import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  User,
  ArrowLeft,
  ChevronDown,
  LogOut,
  Mail,
} from "lucide-react";
import AttachmentsSection from "./components/AttachmentsSection";
import CommentsSection from "./components/CommentsSection";
import Loader from "./components/Loader";

const API_URL = import.meta.env.VITE_API_URL;

const TaskDetailScreen = () => {
  const { taskId } = useParams();
  const navigate = useNavigate();

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [comments, setComments] = useState([]);
  const [attachments, setAttachments] = useState([]);
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
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left side */}
              <div className="flex items-center">
                <button
                  onClick={() => navigate("/dashboard")}
                  className="p-2 rounded-md cursor-pointer text-gray-600 hover:bg-gray-100 mr-2"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <div className="flex items-center">
                  <Link
                    to="/dashboard"
                    className="flex items-center group cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:opacity-90 transition">
                      <span className="text-white font-bold text-sm">TC</span>
                    </div>
                    <span className="ml-2 text-xl font-semibold hidden md:inline text-gray-800 group-hover:text-gray-900">
                      TODOCHIMP
                    </span>
                  </Link>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-3">
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu((prev) => !prev)}
                    className="group cursor-pointer flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-gray-700 hover:bg-gray-100"
                  >
                    <div className="p-[2px] rounded-full bg-gradient-to-r from-purple-500 to-blue-500">
                      <div className="bg-white rounded-full p-1">
                        <User className="h-6 w-6 text-purple-500 group-hover:text-blue-500" />
                      </div>
                    </div>

                    {currentUser?.name && (
                      <div className="hidden sm:flex flex-col text-left">
                        <span className="text-xs text-gray-500">Welcome</span>
                        <span className="text-sm font-medium text-gray-800">
                          {currentUser.name}
                        </span>
                      </div>
                    )}

                    <ChevronDown className="h-4 w-4 ml-auto text-gray-500" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg py-2 z-50 border bg-white border-gray-200 text-gray-700">
                      <div className="px-4 py-3 border-b border-gray-100">
                        <div className="flex flex-col">
                          {currentUser?.name && (
                            <span className="font-medium text-gray-800 sm:hidden">
                              {currentUser.name}
                            </span>
                          )}
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <Mail className="h-4 w-4" />
                            <span>{currentUser?.email || "No email"}</span>
                          </div>
                        </div>
                      </div>

                      {/* <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Profile
                      </Link> */}

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          handleLogout();
                        }}
                        className="block w-full cursor-pointer text-left px-4 py-2 text-sm flex items-center text-red-600 hover:bg-red-50 hover:text-red-700"
                      >
                        <LogOut className="inline h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-1 overflow-auto p-4 sm:p-6">
          <div className="bg-white border border-gray-200 rounded-xl shadow-sm p-5 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
                  {task.title}
                </h1>
                <p className="text-gray-600 mt-1">{task.description}</p>
              </div>
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

            {/* Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 border-t border-gray-100 pt-4">
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
            </div>
          </div>

          {/* Comments & Attachments */}
          <div className="flex-1 space-y-4">
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
