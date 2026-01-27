//Dashboard
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import TopNavBar from "./components/TopNavBar";
import Loader from "./components/Loader";
import Sidebar from "./components/Sidebar"
import Toolbar from "./components/Toolbar"
import TaskTable from "./components/table/TaskTable"
import TaskCard from "./components/cards/TaskCard"
import Pagination from "./components/common/Pagination";
import Snackbar from "./components/common/Snackbar";

const API_URL = import.meta.env.VITE_API_URL;

const DashboardPage = () => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("title");
  const [sortOrder, setSortOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [tasksPerPage, setTasksPerPage] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    type: "success",
    message: "",
  });
  const [currentUser, setCurrentUser] = useState(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  const location = useLocation();

  const showSnackbarMessage = (message, type = "success", duration = 2500) => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => {
      setSnackbar((prev) => ({ ...prev, open: false }));
    }, duration);
  };

  useEffect(() => {
    if (location.state?.deleted) {
      showSnackbarMessage("Task deleted successfully!", "success");
      navigate(location.pathname, { replace: true });
    }
  }, [location.state, navigate, location.pathname]);
  
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

        console.log(currentUser);
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
    tasksPerPage,
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
      showSnackbarMessage("Task deleted successfully!", "success");
    } catch (error) {
      console.error("Delete error:", error);
      alert(error.message);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({ status: "COMPLETED" }),
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to complete task");

      setTasks((prevTasks) =>
        prevTasks.map((task) => task.id === taskId ? { ...task, status: "COMPLETED" } : task)
      );

      showSnackbarMessage("Status Updated successfully!", "success");
      console.log("Task completed:", data);
    } catch (error) {
      console.error("Complete error:", error);
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
          <Sidebar
            filters={filters}
            selectedFilter={selectedFilter}
            setSelectedFilter={setSelectedFilter}
            onCreate={handleCreate}
            showMobileSidebar={showMobileSidebar}
            setShowMobileSidebar={setShowMobileSidebar}
          />

          {/* Main Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6">
            {/* Toolbar */}
            <Toolbar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              sortBy={sortBy}
              setSortBy={setSortBy}
              sortOrder={sortOrder}
              setSortOrder={setSortOrder}
            />

            {loading ? (
              <div className="flex min-h-[60vh] items-center justify-center">
                <Loader />
              </div>
            ) : currentTasks.length === 0 ? (
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500 text-lg">No Task found.</p>
                  <span
                    className="text-blue-600 mt-4 cursor-pointer"
                    onClick={handleCreate}
                  >
                    Create your first task
                  </span>
                </div>
              </div>
            ) : (
              <>
                {/* Table (Desktop) - Shows at 1280px and above */}
                <TaskTable
                  tasks={currentTasks}
                  onView={handleDetail}
                  onEdit={handleEdit}
                  currentUser={currentUser}
                  onDelete={handleDelete}
                  onComplete={handleComplete}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                />

                {/* Mobile Card View - Shows below 1280px */}
                <TaskCard
                  tasks={currentTasks}
                  onView={handleDetail}
                  onEdit={handleEdit}
                  currentUser={currentUser}
                  onComplete={handleComplete}
                  onDelete={handleDelete}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                />

                {/* Pagination */}
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  setCurrentPage={setCurrentPage}
                  getPageNumbers={getPageNumbers}
                  tasksPerPage={tasksPerPage}
                  setTasksPerPage={setTasksPerPage}
                />
              </>
            )}
          </main>

          {/* Snackbar for success*/}
          <Snackbar
            open={snackbar.open}
            type={snackbar.type}
            message={snackbar.message}
          />
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
