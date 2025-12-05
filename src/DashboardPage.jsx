//Dashboard
import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  User,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Check,
  Menu,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopNavBar from "./components/TopNavBar";
import Loader from "./components/Loader";

const API_URL = import.meta.env.VITE_API_URL;

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [geminiData, setGeminiData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  console.log("loading", loading);
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);

        const params = new URLSearchParams({
          page: currentPage,
          limit: tasksPerPage,
          search: searchTerm || "",
          sortBy,
          sortOrder,
        });

        // status filter from selectedFilter
        if (selectedFilter === "Assigned to Me") {
          params.append("assignedToId", currentUser?.id);
        } else if (selectedFilter === "Created by Me") {
          params.append("createdById", currentUser?.id);
        } else if (selectedFilter !== "All" && selectedFilter.trim() !== "") {
          params.append("status", selectedFilter.toUpperCase());
        }

        const res = await fetch(`${API_URL}/api/tasks?${params.toString()}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        if (!res.ok) throw new Error("Failed to fetch tasks");

        const data = await res.json();

        console.log("Fetched:", data);
        setTasks(data.data || []);
        setTotalPages(data.pagination?.pages || 1);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setTimeout(() => {
          setLoading(false);
        }, 500);
      }
    };
    fetchTasks();
  }, [
    token,
    currentUser,
    currentPage,
    searchTerm,
    sortBy,
    sortOrder,
    selectedFilter,
  ]);

  const handleDelete = async (taskId) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;

    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Failed to delete task");
      setTasks((prevTasks) => prevTasks.filter((task) => task.id !== taskId));
      setShowSnackbar(true);
      setTimeout(() => setShowSnackbar(false), 2500);
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message);
    }
  };

  useEffect(() => {
    setFilteredTasks(tasks);
  }, [tasks]);

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

  const handleClick = async () => {
    setLoading(true);
    setResponse(null);

    try {
      const res = await fetch("http://localhost:3001/api/calls/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-gemini-key": "AIzaSyAkqc4sqRMZ6B_tPGWP-d34Pbttf052BwA",
        },
        body: JSON.stringify({
          endpoint: "/tasks/123",
          action: "fetch_info",
        }),
      });

      const data = await res.json();
      setGeminiData(data); // 👈 Save response
      setOpenDialog(true); // 👈 Open dialog
    } catch (error) {
      console.error("Error calling API:", error);
      setGeminiData({ error: error.message });
      setOpenDialog(true); // Still open dialog to show error
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setCurrentUser(null);
    navigate("/login");
  };

  const handleDetail = (taskId) => {
    navigate(`/tasks/${taskId}`);
  };

  const handleCreate = () => navigate("/tasks/create");
  const handleEdit = (taskId) => navigate(`/tasks/${taskId}/edit`);

  const currentTasks = filteredTasks;

  const filters = ["All", "Assigned to Me", "Created by Me", "Completed"];

  // const Loader = () => (
  //   <div className="min-h-[60vh] flex items-center justify-center">
  //     <div className="text-center">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
  //       <p className="text-gray-600 text-sm font-medium">Loading tasks...</p>
  //     </div>
  //   </div>
  // );

  const getPageNumbers = () => {
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, "...", totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, "...", totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(
          1,
          "...",
          currentPage - 1,
          currentPage,
          currentPage + 1,
          "...",
          totalPages
        );
      }
    }
    return pages;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
      <div className="flex flex-col h-screen">
        {/* Top Navigation */}
        <TopNavBar
          handleLogout={handleLogout}
          showMobileSidebar={showMobileSidebar}
          setShowMobileSidebar={setShowMobileSidebar}
          user={currentUser}
        />

        {/* Sidebar + Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`${
              showMobileSidebar ? "translate-x-0" : "-translate-x-full"
            } fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-0 bg-white border-r border-gray-200`}
          >
            <div className="flex flex-col h-full">
              <div className="relative flex items-center justify-center p-4 border-b border-gray-200 md:hidden">
                {/* Menu Button (Left Side) */}
                <button
                  onClick={() => setShowMobileSidebar(false)}
                  className="absolute left-4 p-2 rounded-md text-gray-600 hover:bg-gray-100"
                >
                  <Menu className="h-5 w-5 text-black" />
                </button>

                {/* App Logo + Name (Centered) */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TC</span>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">
                    TODOCHIMP
                  </span>
                </div>
              </div>

              {/* Create Task Button */}
              <div className="p-4 border-b border-gray-200">
                <button
                  onClick={() => {
                    handleCreate();
                    setShowMobileSidebar(false);
                  }}
                  className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create Task</span>
                </button>
              </div>

              {/* Filter Menu */}
              <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-600">
                  Filters
                </h3>
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => {
                      setSelectedFilter(filter);
                      setShowMobileSidebar(false);
                    }}
                    className={`w-full cursor-pointer text-left px-3 py-2 rounded-md text-sm ${
                      selectedFilter === filter
                        ? "bg-gradient-to-br from-indigo-100 to-blue-100 text-black font-medium"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </nav>
            </div>
          </aside>

          {showMobileSidebar && (
            <div
              className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
              onClick={() => setShowMobileSidebar(false)}
            ></div>
          )}

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            {/* Toolbar */}
            <div className="rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border bg-white border-gray-200 shadow-sm">
              {/* Search bar */}
              <div className="relative w-full sm:w-1/3">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Tasks..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white border-gray-300"
                />
              </div>

              {/* Sort options */}
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Sort by:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="border rounded-md cursor-pointer px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
                >
                  <option value="title">Title</option>
                  <option value="status">Status</option>
                  <option value="priority">Priority</option>
                  <option value="dueDate">Due Date</option>
                  <option value="assignee">Assignee</option>
                </select>

                <button
                  onClick={() =>
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
                  }
                  className="px-3 py-2 border cursor-pointer rounded-md text-sm bg-white border-gray-300 hover:bg-gray-50"
                >
                  {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                </button>

                <div>
                  <button
                    onClick={handleClick}
                    class="relative px-6 py-2 font-semibold text-white rounded-full transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-pink-600shadow-[0_0_15px_rgba(99,102,241,0.7)]hover:shadow-[0_0_25px_rgba(168,85,247,0.9)]cursor-pointer flex items-center justify-center space-x-2disabled:opacity-50 cursor-pointer disabled:cursor-not-allowedoverflow-hidden"
                    disabled={loading}
                  >
                    <span class="relative z-10 flex items-center space-x-2">
                      <svg
                        class="w-5 h-5 animate-pulse"
                        fill="white"
                        stroke="currentColor"
                        stroke-width="1.8"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                        />
                      </svg>

                      <span>{loading ? "Thinking..." : "Ask Gemini"}</span>
                    </span>

                    <span
                      class="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30blur-xl opacity-50 animate-pulse"
                    ></span>
                  </button>
                </div>

                {openDialog && (
                  <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Dim + Blur Background */}
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>

                    {/* Dialog Box */}
                    <div
                      className="relative w-[800px] max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-[0_0_25px_rgba(99,102,241,0.25)] border border-purple-300/40 animate-fadeIn p-8 backdrop-blur-xl"
                    >
                      {/* Title */}
                      <h2 className="text-2xl font-bold mb-5 text-center bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Gemini Response
                      </h2>

                      {/* Error */}
                      {geminiData?.error ? (
                        <p className="text-red-600 font-medium text-center">
                          {geminiData.error}
                        </p>
                      ) : (
                        <>
                          {/* Prompt */}
                          <div className="mb-4">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold text-gray-900">
                                Prompt:
                              </span>{" "}
                              {geminiData.predefined_prompt}
                            </p>
                          </div>

                          {/* AI Response Box */}
                          <p className="text-sm font-semibold text-gray-900">
                            AI Response:
                          </p>
                          <div
                            className="mt-2 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl text-sm text-gray-800 leading-relaxed border border-purple-300/30 shadow-inner whitespace-pre-line max-h-60 overflow-y-auto"
                          >
                            {geminiData.ai_response}
                          </div>
                        </>
                      )}

                      {/* Close Button */}
                      <button
                        onClick={() => setOpenDialog(false)}
                        className="mt-6 w-full py-3 rounded-xl text-white font-medium bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-[0_0_20px_rgba(99,102,241,0.45)] cursor-pointer transition-all duration-300"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="flex min-h-[60vh] items-center justify-center">
                <Loader />
              </div>
            ) : currentTasks.length === 0 ? (
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">No Task found.</p>
                </div>
              </div>
            ) : (
              <>
                {/* Table (Desktop) - Shows at 1280px and above */}
                <div className="hidden xl:block overflow-x-auto mt-6">
                  <div className="shadow-lg rounded-xl border overflow-hidden bg-white border-gray-200">
                    <table className="min-w-full border-collapse">
                      <thead className="bg-gradient-to-r from-blue-700 to-purple-600 text-white sticky top-0 z-10">
                        <tr>
                          <th className="py-3 px-6 text-center text-sm font-semibold">
                            TITLE
                          </th>
                          <th className="py-3 px-6 text-center text-sm font-semibold">
                            ASSIGNED TO
                          </th>
                          <th className="py-3 px-6 text-center text-sm font-semibold">
                            PRIORITY
                          </th>
                          <th className="py-3 px-6 text-center text-sm font-semibold">
                            STATUS
                          </th>
                          <th className="py-3 px-6 text-center text-sm font-semibold">
                            DUE DATE
                          </th>
                          <th className="py-3 px-6 text-center text-sm font-semibold">
                            ACTIONS
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentTasks.map((task, index) => (
                          <tr
                            key={task.id}
                            className={`transition-all duration-200 ${
                              index % 2 === 0 ? "bg-gray-50" : "bg-white"
                            } hover:bg-indigo-50`}
                          >
                            <td className="px-6 py-3 text-center text-sm font-medium">
                              {task.title}
                            </td>
                            <td className="px-6 py-3 text-center text-sm font-medium">
                              {task.assignedTo?.name || "Unassigned"}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span
                                className={`px-3 py-1 text-xs rounded border font-medium ${getPriorityColor(
                                  task.priority
                                )}`}
                              >
                                {task.priority}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-center">
                              <span
                                className={`px-3 py-1 text-xs rounded border font-medium ${getStatusColor(
                                  task.status
                                )}`}
                              >
                                {task.status}
                              </span>
                            </td>
                            <td className="px-6 py-3 text-center text-sm">
                              {task.dueDate
                                ? new Date(task.dueDate).toLocaleDateString()
                                : "DD/MM/YYYY"}
                            </td>
                            <td className="px-6 py-3 text-center">
                              <div className="inline-flex justify-center space-x-2">
                                <div className="relative group">
                                  <button
                                    onClick={() => handleDetail(task.id)}
                                    className="p-2 rounded-full bg-blue-50 cursor-pointer border text-blue-600 hover:bg-blue-100 transition-colors"
                                  >
                                    <Eye className="h-4 w-4" />
                                  </button>
                                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
                                    View Details
                                  </span>
                                </div>

                                <div className="relative group">
                                  <button
                                    onClick={() => handleEdit(task.id)}
                                    className="p-2 rounded-full bg-yellow-50 cursor-pointer border text-yellow-600 hover:bg-yellow-100 transition-colors"
                                  >
                                    <Edit className="h-4 w-4" />
                                  </button>
                                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
                                    Edit Task
                                  </span>
                                </div>

                                <div className="relative group">
                                  <button
                                    onClick={() => handleDelete(task.id)}
                                    className="p-2 rounded-full bg-red-50 cursor-pointer border text-red-600 hover:bg-red-100 transition-colors"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </button>
                                  <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
                                    Delete Task
                                  </span>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Mobile Card View - Shows below 1280px */}
                <div className="space-y-4 xl:hidden max-h-[65vh] overflow-y-auto overflow-x-hidden pr-1.5 scrollbar-none mt-6">
                  {currentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-xl shadow-lg border border-gray-200 p-4"
                    >
                      <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
                          {task.title}
                        </h3>
                        <span
                          className={`px-3 py-1 text-xs rounded border font-medium ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm font-medium text-gray-600 space-y-2">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-500" />
                          <span>{task.assignedTo?.name || "Unassigned"}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-black-500" />
                          <span>
                            {task.dueDate
                              ? new Date(task.dueDate).toLocaleDateString()
                              : "DD/MM/YYYY"}
                          </span>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <span
                          className={`px-3 py-1 text-xs border rounded font-medium ${getStatusColor(
                            task.status
                          )}`}
                        >
                          {task.status}
                        </span>
                        <div className="flex space-x-2">
                          <div className="relative group">
                            <button
                              onClick={() => handleDetail(task.id)}
                              className="p-1.5 rounded-full bg-blue-50 border text-blue-600 hover:bg-blue-100 transition-colors"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
                              View Details
                            </span>
                          </div>

                          <div className="relative group">
                            <button
                              onClick={() => handleEdit(task.id)}
                              className="p-1.5 rounded-full bg-yellow-50 border text-yellow-600 hover:bg-yellow-100 transition-colors"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
                              Edit Task
                            </span>
                          </div>

                          <div className="relative group">
                            <button
                              onClick={() => handleDelete(task.id)}
                              className="p-1.5 rounded-full bg-red-50 border text-red-600 hover:bg-red-100 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-20">
                              Delete Task
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex justify-center items-center mt-8 space-x-1 sm:space-x-2">
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded text-xs sm:text-sm hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4 text-black" />
                  </button>

                  {/* Page Numbers */}
                  {getPageNumbers().map((item, index) => (
                    <button
                      key={index}
                      onClick={() => item !== "..." && setCurrentPage(item)}
                      disabled={item === "..."}
                      className={`flex items-center justify-center rounded transition-all w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-medium
                        ${
                          item === currentPage
                            ? "border-2 border-blue-500 bg-grey-200 text-black shadow-md"
                            : item === "..."
                            ? "cursor-default text-gray-500"
                            : "hover:bg-gray-200 cursor-pointer"
                        }
                      `}
                    >
                      {item}
                    </button>
                  ))}

                  {/* Next Button */}
                  <button
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                    }
                    disabled={currentPage === totalPages}
                    className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded text-xs sm:text-sm hover:bg-gray-200 disabled:opacity-50 cursor-pointer"
                  >
                    <ChevronRight className="h-4 w-4 text-black" />
                  </button>
                </div>
              </>
            )}
          </main>

          {/* Snackbar for successful deletion */}
          {showSnackbar && (
            <div className="fixed bottom-6 left-6 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-md transition-all animate-fade-in-up z-50">
              <Check className="w-5 h-5 text-green-600" />
              <p className="text-sm font-medium">Task deleted successfully!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
