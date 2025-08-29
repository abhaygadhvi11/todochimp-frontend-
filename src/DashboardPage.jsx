//Dashboard
import React, { useState, useEffect } from "react";
import {
  Search,
  Bell,
  User,
  LogOut,
  Plus,
  BarChart3,
  ChevronDown,
  Edit,
  Trash2,
  Eye,
  Filter,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
} from "lucide-react";
import { Link } from "react-router-dom";

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage] = useState(10);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/tasks", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          cache: "no-store"
        });

        if (!res.ok) {
          throw new Error("Failed to fetch tasks");
        }

        const data = await res.json();
        console.log("Data", data);
        console.log("Current User:", currentUser);

        setTasks(Array.isArray(data) ? data : data.data || []);
      } catch (err) {
        console.error("Error fetching tasks:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  useEffect(() => {
    let filtered = [...tasks];

    if (currentUser && selectedFilter !== "All") {
      if (selectedFilter === "Assigned to Me") {
        filtered = filtered.filter(
          (task) => task.assignedToId === currentUser.id
        );
      } else if (selectedFilter === "Created by Me") {
        filtered = filtered.filter(
          (task) => task.createdById === currentUser.id
        );
      } else {
        filtered = filtered.filter((task) => task.status === selectedFilter);
      }
    }

    if (searchTerm) {
      filtered = filtered.filter((task) =>
        task.title.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "dueDate") {
        aValue = aValue ? new Date(aValue) : null;
        bValue = bValue ? new Date(bValue) : null;
      }

      if (aValue == null) return 1;
      if (bValue == null) return -1;

      if (sortOrder === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    setFilteredTasks(filtered);
  }, [tasks, selectedFilter, searchTerm, sortBy, sortOrder, currentUser]);

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

  const indexOfLastTask = currentPage * tasksPerPage;
  const indexOfFirstTask = indexOfLastTask - tasksPerPage;
  const currentTasks = filteredTasks.slice(indexOfFirstTask, indexOfLastTask);
  const totalPages = Math.ceil(filteredTasks.length / tasksPerPage);

  const filters = [
    "All",
    "Assigned to Me",
    "Created by Me",
    "Overdue",
    "Completed",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 text-gray-900">
      <div className="flex flex-col h-screen">
        {/* Top Navigation */}
        <nav className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              {/* Left side */}
              <div className="flex items-center">
                <button
                  onClick={() => setShowMobileSidebar(!showMobileSidebar)}
                  className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
                >
                  <Filter className="h-5 w-5" />
                </button>
                <div className="flex items-center ml-2 md:ml-0">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">TC</span>
                  </div>
                  <span className="ml-2 text-xl font-semibold hidden md:inline">
                    TodoChimp
                  </span>
                </div>
              </div>

              {/* Right side */}
              <div className="flex items-center space-x-3">
                <button className="relative p-2 rounded-md text-gray-600 hover:bg-gray-100">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 p-2 rounded-md text-gray-600 hover:bg-gray-100"
                  >
                    <User className="h-5 w-5" />
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 z-10 border bg-white border-gray-200 text-gray-700">
                      <Link
                        to="/profile"
                        className="block px-4 py-2 text-sm hover:bg-gray-100"
                      >
                        Profile
                      </Link>

                      <Link
                        to="/login"
                        className="block px-4 py-2 text-sm flex items-center hover:bg-gray-100"
                      >
                        <LogOut className="inline h-4 w-4 mr-2" />
                        Logout
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Sidebar + Main Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <aside
            className={`${
              showMobileSidebar ? "translate-x-0" : "-translate-x-full"
            } fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out md:translate-x-0 md:static md:inset-0 bg-white border-r border-gray-200`}
          >
            <div className="flex flex-col h-full pt-16 md:pt-0">
              <div className="p-4 border-b border-gray-200">
                <button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 py-2 rounded-md flex items-center justify-center space-x-2">
                  <Plus className="h-4 w-4" />
                  <span>Create Task</span>
                </button>
              </div>

              <nav className="flex-1 p-4 space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500">
                  Filters
                </h3>
                {filters.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setSelectedFilter(filter)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm ${
                      selectedFilter === filter
                        ? "bg-gradient-to-br from-indigo-100 to-blue-100 text-black"
                        : "text-gray-800 hover:bg-gray-100"
                    }`}
                  >
                    {filter}
                  </button>
                ))}

                <div className="pt-4 border-t border-gray-200">
                  <button className="w-full text-left px-3 py-2 rounded-md text-sm flex items-center space-x-2 text-gray-800 hover:bg-gray-100">
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics</span>
                  </button>
                </div>
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
                  placeholder="Search tasks..."
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
                  className="border rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 bg-white border-gray-300"
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
                  className="px-3 py-2 border rounded-md text-sm bg-white border-gray-300 hover:bg-gray-50"
                >
                  {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
                </button>
              </div>
            </div>

            {/* Table (Desktop) */}
            <div className="hidden md:block overflow-x-auto mt-6">
              <div className="shadow-lg rounded-xl border overflow-hidden bg-white border-gray-200">
                <table className="min-w-full border-collapse">
                  <thead className="bg-gradient-to-r from-blue-700 to-purple-600 text-white sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-6 text-center text-sm font-semibold">
                        Title
                      </th>
                      <th className="py-3 px-6 text-center text-sm font-semibold">
                        Assignee
                      </th>
                      <th className="py-3 px-6 text-center text-sm font-semibold">
                        Priority
                      </th>
                      <th className="py-3 px-6 text-center text-sm font-semibold">
                        Status
                      </th>
                      <th className="py-3 px-6 text-center text-sm font-semibold">
                        Due Date
                      </th>
                      <th className="py-3 px-6 text-center text-sm font-semibold">
                        Actions
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
                          {task.dueDate}
                        </td>
                        <td className="px-6 py-3 text-center flex justify-center space-x-2">
                          <button className="p-2 rounded-full bg-blue-50 border text-blue-600 hover:bg-blue-100">
                            <Eye className="h-4 w-4" />
                          </button>
                          <button className="p-2 rounded-full bg-yellow-50 border text-yellow-600 hover:bg-yellow-100">
                            <Edit className="h-4 w-4" />
                          </button>
                          <button className="p-2 rounded-full bg-red-50 border text-red-600 hover:bg-red-100">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile Card View */}
            <div className="space-y-4 md:hidden mt-6">
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
                    <p>👤 {task.assignedTo?.name || "Unassigned"}</p>
                    <p>📅 {task.dueDate}</p>
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
                      <button className="p-1.5 rounded-full bg-blue-50 border text-blue-600 hover:bg-blue-100">
                        <Eye className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-full bg-yellow-50 border text-yellow-600 hover:bg-yellow-100">
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="p-1.5 rounded-full bg-red-50 border text-red-600 hover:bg-red-100">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Pagination */}
            <div className="flex justify-center items-center mt-8 space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="w-10 h-10 flex items-center justify-center rounded-full text-sm bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {[...Array(totalPages)].map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-10 h-10 flex items-center justify-center rounded-full text-sm font-medium transition-all
                  ${
                    currentPage === i + 1
                      ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
                      : "bg-gray-600 text-gray-200 hover:bg-gray-700"
                  }`}
                >
                  {i + 1}
                </button>
              ))}

              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="w-10 h-10 flex items-center justify-center rounded-full text-sm bg-gray-800 text-white hover:bg-gray-700 disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
