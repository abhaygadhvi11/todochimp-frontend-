//Dashboard
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopNavBar from "./components/TopNavBar";
import Loader from "./components/Loader";
import Sidebar from "./components/Sidebar"
import Toolbar from "./components/Toolbar"
import TaskTable from "./components/table/TaskTable"
import TaskCard from "./components/cards/TaskCard"

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
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                />

                {/* Mobile Card View - Shows below 1280px */}
                <TaskCard
                  tasks={currentTasks}
                  onView={handleDetail}
                  onEdit={handleEdit}
                  currentUser={currentUser}
                  onDelete={handleDelete}
                  getPriorityColor={getPriorityColor}
                  getStatusColor={getStatusColor}
                />

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
