import { useState, useEffect, useRef } from "react";
import {
  Calendar,
  User,
  Building2,
  AlertCircle,
  Check,
  X,
  Save,
  Plus,
  Clock,
  Flag,
  Trash2,
  Mail,
  Users,
  RotateCcw,
  ArrowLeft,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import AIButton from "./components/AIButton.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;

const TaskFormPage = ({ mode }) => {
  const titleRef = useRef(null);
  const navigate = useNavigate();
  const { taskId } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "MEDIUM",
    assignee: "",
    organization: "",
    status: "PENDING",
  });
  const [raciAssignments, setRaciAssignments] = useState([
    { email: "", raciRole: "" },
  ]);
  const [errors, setErrors] = useState({});
  const [raciErrors, setRaciErrors] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setSaveLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [originalTask, setOriginalTask] = useState(null);
  const [showRaciSnackbar, setShowRaciSnackbar] = useState(false);
  const token = localStorage.getItem("token");
  const isAssigneeOnly =
    originalTask &&
    currentUser &&
    originalTask.assignedToId === currentUser.id &&
    originalTask.createdById !== currentUser.id;

  useEffect(() => {
    if (mode === "edit" && taskId) {
      fetchTaskData();
      setIsEdit(true);
    }
  }, [mode, taskId]);

  useEffect(() => {
    if (!isAssigneeOnly && titleRef.current) {
      titleRef.current.focus();
    }
  }, [isAssigneeOnly]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) return;
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          cache: "no-store",
        });

        const result = await res.json();
        if (result.success) {
          setCurrentUser(result.data.user);
          setFormData((prev) => ({
            ...prev,
            organization:
              result.data.user.organization?.name || "Unknown Organization",
          }));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [token]);

  const priorities = [
    { value: "LOW", label: "Low", color: "green" },
    { value: "MEDIUM", label: "Medium", color: "yellow" },
    { value: "HIGH", label: "High", color: "red" },
  ];

  const raciRoles = [
    { value: "RESPONSIBLE", label: "Responsible" },
    { value: "ACCOUNTABLE", label: "Accountable" },
    { value: "CONSULTED", label: "Consulted" },
    { value: "INFORMED", label: "Informed" },
  ];

  const today = new Date().toISOString().split("T")[0];

  const statusOptions = [
    { value: "IN_PROGRESS", label: "In Progress", color: "blue" },
    { value: "COMPLETED", label: "Completed", color: "green" },
    { value: "PENDING", label: "Pending", color: "orange" },
    { value: "CANCELLED", label: "Cancelled", color: "red" },
  ];

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateRaciAssignments = () => {
    const newRaciErrors = raciAssignments.map((assignment, index) => {
      const errors = {};
      if (assignment.email && !validateEmail(assignment.email)) {
        errors.email = "Invalid email format";
      }
      if (assignment.email && !assignment.raciRole) {
        errors.raciRole = "RACI role is required when email is provided";
      }
      if (assignment.raciRole && !assignment.email) {
        errors.email = "Email is required when RACI role is selected";
      }
      return errors;
    });
    setRaciErrors(newRaciErrors);
    return newRaciErrors.every((err) => Object.keys(err).length === 0);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be 100 characters or less";
    }
    if (formData.dueDate && formData.dueDate < today)
      newErrors.dueDate = "Due date cannot be in the past";
    if (!formData.priority) newErrors.priority = "Priority is required";

    setErrors(newErrors);
    const isFormValid = Object.keys(newErrors).length === 0;
    const isRaciValid = validateRaciAssignments();
    return isFormValid && isRaciValid;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleClick = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3001/api/calls/execute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          endpoint: "/tasks/description/generate",
          action: "generate task description based on the title",
          title: formData.title,
        }),
      });

      const data = await res.json();

      if (data.generated_description) {
        setFormData((prev) => ({
          ...prev,
          description: data.generated_description,
        }));
      }

    } catch (error) {
      console.error("Error calling API:", error);

      setFormData((prev) => ({
        ...prev,
        description: "Error generating description",
      }));

    } finally {
      setLoading(false);
    }
  };

  const handleRaciChange = async (index, field, value) => {
    const newAssignments = [...raciAssignments];
    const assignment = newAssignments[index];
    newAssignments[index][field] = value;
    setRaciAssignments(newAssignments);
    setIsDirty(true);

    // Clear field errors if they exist
    if (raciErrors[index]?.[field]) {
      const newErrors = [...raciErrors];
      delete newErrors[index][field];
      setRaciErrors(newErrors);
    }

    if (isEdit && field === "raciRole" && assignment.id) {
      try {
        const res = await fetch(
          `${API_URL}/api/assignments/${assignment.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ raciRole: value }),
            cache: "no-store",
          }
        );

        if (!res.ok) {
          const err = await res.json();
          console.error("Failed to update RACI role:", err);
          throw new Error(err.message || "Update failed");
        }

        const result = await res.json();
        console.log("RACI role updated:", result);

        // Show success snackbar
        setShowRaciSnackbar(true);
        setTimeout(() => setShowRaciSnackbar(false), 3000);
      } catch (error) {
        console.error("Error updating RACI role:", error);
        alert("Failed to update RACI role. Please try again.");
      }
    }
  };

  const addRaciAssignment = () => {
    setRaciAssignments([...raciAssignments, { email: "", raciRole: "" }]);
    setRaciErrors([...raciErrors, {}]);
  };

  const removeRaciAssignment = async (index) => {
    const assignment = raciAssignments[index];

    // Confirm before deleting
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this RACI assignment?"
    );
    if (!confirmDelete) return;

    try {
      // If it's edit mode and assignment has an ID, call the DELETE API
      if (isEdit && assignment.id) {
        const res = await fetch(
          `${API_URL}/api/assignments/${assignment.id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            cache: "no-store",
          }
        );

        if (!res.ok) {
          const err = await res.json();
          console.error("Failed to delete assignment:", err);
          throw new Error(err.message || "Failed to delete RACI assignment");
        }

        console.log("RACI assignment deleted successfully");
      }

      // Remove from frontend state regardless (for instant UI feedback)
      const newAssignments = raciAssignments.filter((_, i) => i !== index);
      const newErrors = raciErrors.filter((_, i) => i !== index);
      setRaciAssignments(newAssignments);
      setRaciErrors(newErrors);
      setIsDirty(true);
    } catch (error) {
      console.error("Error deleting RACI assignment:", error);
      alert("Failed to delete assignment. Please try again.");
    }
  };

  const fetchTaskData = async () => {
    if (!taskId || !token) return;
    try {
      const res = await fetch(`${API_URL}/api/tasks/${taskId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
      });
      if (!res.ok) throw new Error("Failed to fetch task data");
      const data = await res.json();

      setFormData({
        title: data.task.title || "",
        description: data.task.description || "",
        dueDate: data.task.dueDate ? data.task.dueDate.split("T")[0] : "",
        priority: data.task.priority || "MEDIUM",
        assignee: data.task.assignedToId || "",
        organization:
          data.task.organization?.name ||
          currentUser?.organization?.name ||
          "Unknown Organization",
        status: data.task.status || "PENDING",
      });
      setOriginalTask(data.task);

      // Fetch RACI assignments
      try {
        const raciRes = await fetch(
          `${API_URL}/api/tasks/${taskId}/raci`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            cache: "no-store",
          }
        );

        if (raciRes.ok) {
          const raciData = await raciRes.json();

          if (raciData.success && raciData.data?.assignments) {
            // Flatten all assignments with their RACI role
            const assignments = Object.entries(
              raciData.data.assignments
            ).flatMap(([raciRole, users]) =>
              users.map((user) => ({
                id: user.id,
                email: user.email,
                name: user.user?.name,
                raciRole,
                status: user.status,
                assignedAt: user.assignedAt || user.invitedAt || null,
              }))
            );
            setRaciAssignments(assignments);
          }
        }
      } catch (err) {
        console.error("Error fetching RACI assignments:", err);
      }
    } catch (error) {
      console.error("Error fetching task data:", error);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaveLoading(true);

    try {
      let url = `${API_URL}/api/tasks`;
      let method = "POST";

      if (isEdit && taskId) {
        url = `${API_URL}/api/tasks/${taskId}`;
        method = "PUT";
      }

      let payload;

      if (isEdit && taskId && originalTask && currentUser) {
        const isCreator = originalTask.createdById === currentUser.id;
        const isAssignee = originalTask.assignedToId === currentUser.id;

        if (isAssignee && !isCreator) {
          payload = { status: formData.status || "PENDING" };
        } else {
          payload = {
            title: formData.title,
            description: formData.description || undefined,
            dueDate: formData.dueDate
              ? new Date(formData.dueDate).toISOString()
              : undefined,
            priority: formData.priority,
            status: formData.status || "PENDING",
            assignedToId: formData.assignee || undefined,
            organizationId: currentUser.organizationId,
            createdById: currentUser.id,
          };
        }
      } else {
        payload = {
          title: formData.title,
          description: formData.description || undefined,
          dueDate: formData.dueDate || undefined,
          priority: formData.priority,
          status: formData.status || "PENDING",
          assignedToId: formData.assignee || undefined,
          organizationId: currentUser.organizationId,
          createdById: currentUser.id,
          raciAssignments: raciAssignments?.length > 0 ? raciAssignments : [],
        };
      }

      // Clean undefined fields
      Object.keys(payload).forEach((key) => {
        if (payload[key] === undefined) delete payload[key];
      });

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Backend error:", err);
        throw new Error(err.message || "Failed to save task");
      }

      const result = await res.json();
      const savedTask = result.data;

      setShowSuccess(true);
      setIsDirty(false);
      setTimeout(() => navigate("/dashboard"), 1200);

      if (isEdit && taskId) {
        const newAssignments = raciAssignments.filter((a) => !a.id && a.email);

        if (newAssignments.length > 0) {
          try {
            const raciRes = await fetch(
              `${API_URL}/api/tasks/${taskId}/raci`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ assignments: newAssignments }),
              }
            );

            if (!raciRes.ok) {
              const raciErr = await raciRes.json();
              console.error("Failed to create RACI assignments:", raciErr);
            } else {
              const raciData = await raciRes.json();
              console.log("RACI assignments created:", raciData);
              await fetchTaskData();
            }
          } catch (err) {
            console.error("Error creating RACI assignments:", err);
          }
        }
      }

      if (savedTask.raciAssignments?.length) {
        setRaciAssignments(savedTask.raciAssignments);
      }

      if (!isEdit) resetForm();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaveLoading(false);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to cancel?"
      );
      if (!confirmed) return;
    }
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "",
      assignee: "",
      organization: currentUser?.organization?.name || "Unknown Organization",
      status: "PENDING",
    });
    setRaciAssignments([{ email: "", raciRole: "" }]);
    setErrors({});
    setRaciErrors([]);
    setIsDirty(false);
  };

  const getRaciRoleColor = (role) => {
    const colors = {
      RESPONSIBLE: "text-blue-700 bg-blue-50 border-blue-200",
      ACCOUNTABLE: "text-purple-700 bg-purple-50 border-purple-200",
      CONSULTED: "text-green-700 bg-green-50 border-green-200",
      INFORMED: "text-gray-700 bg-gray-50 border-gray-200",
    };
    return colors[role] || "text-gray-600 bg-gray-50 border-gray-200";
  };

  const calculateDaysUntilDue = () => {
    if (!formData.dueDate) return null;
    const due = new Date(formData.dueDate);
    const now = new Date();
    const diffTime = due - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const daysUntilDue = calculateDaysUntilDue();

  const completedFields = Object.entries(formData).filter(([key, value]) => {
    if (key === "organization") return false;
    if (Array.isArray(value)) return value.length > 0;
    return value && value.trim() !== "";
  }).length;

  const totalFields = Object.keys(formData).filter(
    (key) => key !== "organization"
  ).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg border border-gray-200">
              {/* Enhanced Header */}
              <div className="border-b rounded-xl border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600">
                <div className="flex items-center space-x-3">
                  {/* Back Button */}
                  <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-md cursor-pointer text-white hover:bg-white/10 transition"
                  >
                    <ArrowLeft className="w-6 h-6" />
                  </button>

                  {/* Title */}
                  <h1 className="text-2xl font-bold text-white">
                    {isEdit ? "Edit Task" : "Create New Task"}
                  </h1>

                  {/* Unsaved Indicator */}
                  {isDirty && (
                    <div
                      className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"
                      title="Unsaved changes"
                    />
                  )}
                </div>
              </div>

              {isAssigneeOnly && (
                <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center text-yellow-700">
                  <AlertCircle className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm">
                      You can only update the status of this task because you're
                      assigned to it.
                    </p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {showSuccess && (
                <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg animate-fade-in-up transition-all">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  <p className="text-green-700 text-sm">
                    Your task has been {isEdit ? "updated" : "created"} successfully.
                  </p>
                </div>
              )}

              {/* Form */}
              <div className="p-6 space-y-6">
                {/* Title Field */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Task Title <span className="text-red-600">*</span>
                  </label>

                  <input
                    ref={titleRef}
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    disabled={isAssigneeOnly}
                    className={`w-full px-4 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-all text-sm ${
                      errors.title
                        ? "border-red-300 focus:ring-red-600 focus:border-red-600 bg-white text-gray-900"
                        : isAssigneeOnly
                        ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                        : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50 focus:ring-blue-600 focus:border-blue-600"
                    }`}
                    placeholder="Enter a descriptive task title..."
                    maxLength={100}
                  />

                  {errors.title && (
                    <div className="flex items-center gap-1.5 text-red-600 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-medium">{errors.title}</span>
                    </div>
                  )}

                  {isAssigneeOnly && !errors.title && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      This field is read-only for your role
                    </p>
                  )}

                  {!isAssigneeOnly && (
                    <div className="text-xs text-gray-500 text-right">
                      {formData.title.length}/100 characters
                    </div>
                  )}
                </div>

                {/* Description Field */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Description
                    </label>
                    <AIButton loading={loading} onClick={handleClick} disabled={isAssigneeOnly}/>
                  </div>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    disabled={isAssigneeOnly}
                    className={`w-full px-4 py-2.5 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-all resize-y text-sm ${
                      errors.description
                        ? "border-red-300 focus:ring-red-600 focus:border-red-600 bg-white text-gray-900"
                        : isAssigneeOnly
                        ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed resize-none"
                        : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50 focus:ring-blue-600 focus:border-blue-600"
                    }`}
                    placeholder="Describe the task requirements, acceptance criteria, and any important details..."
                  />

                  {errors.description && (
                    <div className="flex items-center gap-1.5 text-red-600 text-xs">
                      <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span className="font-medium">{errors.description}</span>
                    </div>
                  )}

                  {isAssigneeOnly && !errors.description && (
                    <p className="text-xs text-gray-500 flex items-center gap-1.5">
                      <svg
                        className="w-3.5 h-3.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>
                      This field is read-only for your role
                    </p>
                  )}

                  {!isAssigneeOnly && formData.description && (
                    <div className="text-xs text-gray-500 text-right">
                      {formData.description.length} characters
                    </div>
                  )}
                </div>

                {/* Priority and Due Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Priority Field */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Priority <span className="text-red-600">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          handleInputChange("priority", e.target.value)
                        }
                        disabled={isAssigneeOnly}
                        className={`w-full px-4 py-2.5 pl-11 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-all appearance-none text-sm font-medium cursor-pointer ${
                          errors.priority
                            ? "border-red-300 focus:ring-red-600 focus:border-red-600 bg-white text-gray-900"
                            : isAssigneeOnly
                            ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50 focus:ring-blue-600 focus:border-blue-600"
                        }`}
                      >
                        {priorities.map((priority) => (
                          <option key={priority.value} value={priority.value}>
                            {priority.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Flag
                          className={`w-4 h-4 ${
                            errors.priority
                              ? "text-red-400"
                              : isAssigneeOnly
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        />
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          className={`w-4 h-4 ${
                            isAssigneeOnly ? "text-gray-300" : "text-gray-400"
                          }`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>

                    {errors.priority && (
                      <div className="flex items-center gap-1.5 text-red-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="font-medium">{errors.priority}</span>
                      </div>
                    )}

                    {isAssigneeOnly && !errors.priority && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        This field is read-only for your role
                      </p>
                    )}
                  </div>

                  {/* Due Date Field */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Due Date
                    </label>
                    <div className="relative">
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) =>
                          handleInputChange("dueDate", e.target.value)
                        }
                        min={today}
                        disabled={isAssigneeOnly}
                        className={`w-full px-4 py-2.5 pl-11 border rounded-md shadow-sm focus:outline-none focus:ring-1 transition-all text-sm ${
                          errors.dueDate
                            ? "border-red-300 focus:ring-red-600 focus:border-red-600"
                            : isAssigneeOnly
                            ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50 focus:ring-blue-600 focus:border-blue-600 cursor-pointer"
                        }`}
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Calendar
                          className={`w-4 h-4 ${
                            errors.dueDate
                              ? "text-red-400"
                              : isAssigneeOnly
                              ? "text-gray-400"
                              : "text-gray-500"
                          }`}
                        />
                      </div>
                    </div>

                    {daysUntilDue !== null && !errors.dueDate && (
                      <div
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium border ${
                          daysUntilDue < 0
                            ? "text-red-700 bg-red-50 border-red-200"
                            : daysUntilDue <= 3
                            ? "text-orange-700 bg-orange-50 border-orange-200"
                            : "text-gray-700 bg-gray-50 border-gray-200"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5" />
                        {daysUntilDue < 0
                          ? `${Math.abs(daysUntilDue)} days overdue`
                          : daysUntilDue === 0
                          ? "Due today"
                          : daysUntilDue === 1
                          ? "Due tomorrow"
                          : `Due in ${daysUntilDue} days`}
                      </div>
                    )}

                    {errors.dueDate && (
                      <div className="flex items-center gap-1.5 text-red-600 text-xs">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="font-medium">{errors.dueDate}</span>
                      </div>
                    )}

                    {isAssigneeOnly && !errors.dueDate && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        This field is read-only for your role
                      </p>
                    )}
                  </div>
                </div>

                {/* Assignee and Status Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Assignee
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.assignee}
                        onChange={(e) =>
                          handleInputChange("assignee", e.target.value)
                        }
                        disabled={isAssigneeOnly}
                        placeholder="Enter assignee ID"
                        className={`w-full px-4 py-2.5 pl-11 border rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all text-sm ${
                          isAssigneeOnly
                            ? "bg-gray-50 text-gray-500 border-gray-200 cursor-not-allowed"
                            : "bg-white text-gray-900 border-gray-300 hover:bg-gray-50"
                        }`}
                      />
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <User
                          className={`w-4 h-4 ${
                            isAssigneeOnly ? "text-gray-400" : "text-gray-500"
                          }`}
                        />
                      </div>
                    </div>
                    {isAssigneeOnly && (
                      <p className="text-xs text-gray-500 flex items-center gap-1.5">
                        <svg
                          className="w-3.5 h-3.5"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                            clipRule="evenodd"
                          />
                        </svg>
                        This field is read-only for your role
                      </p>
                    )}
                  </div>

                  {/* Status Field */}
                  <div className="space-y-3">
                    <label className="block text-sm font-medium text-gray-900 mb-1.5">
                      Task Status
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                        className="w-full px-4 py-2.5 pl-11 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-all appearance-none bg-white text-gray-900 text-sm font-medium cursor-pointer hover:bg-gray-50"
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Flag className="w-4 h-4 text-gray-500" />
                      </div>
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>

                {/* RACI Assignments Section */}
                <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Users className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          RACI Assignments
                        </h3>
                        <p className="hidden sm:block text-xs text-gray-500 mt-0.5">
                          Assign roles and responsibilities to team members
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={addRaciAssignment}
                      disabled={isAssigneeOnly}
                      className="flex items-center cursor-pointer justify-center gap-2 px-2 py-2 sm:px-4 sm:py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-medium rounded-lg transition-colors shadow-sm"
                    >
                      <Plus className="w-4 h-4" />
                      {/* Hide text on mobile */}
                      <span className="hidden sm:inline">Add Assignment</span>
                    </button>
                  </div>

                  {raciAssignments.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                      <Users className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                      <p className="text-gray-600 font-medium">
                        No RACI roles assigned yet
                      </p>
                      <p className="text-gray-500 text-sm mt-1">
                        Click "Add Assignment" to get started
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {raciAssignments.map((assignment, index) => (
                        <div
                          key={index}
                          className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                          <div className="p-4 sm:p-5">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                                  {index + 1}
                                </span>
                                <span className="text-sm font-medium text-gray-700">
                                  Assignment #{index + 1}
                                </span>
                              </div>

                              {(isEdit || raciAssignments.length > 1) && (
                                <button
                                  type="button"
                                  onClick={() => removeRaciAssignment(index)}
                                  disabled={isAssigneeOnly}
                                  title="Remove assignment"
                                  className="flex items-center justify-center cursor-pointer gap-1 px-2 py-1 sm:px-3 sm:py-1.5 text-xs text-red-600 hover:text-white hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed font-medium rounded-md border border-red-200 hover:border-red-600 transition-colors"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  {/* Hide text on mobile */}
                                  <span className="hidden sm:inline">
                                    Remove
                                  </span>
                                </button>
                              )}
                            </div>

                            {/* Email Section */}
                            <div className="mb-6">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email Address
                                <span className="text-red-500 ml-1">*</span>
                              </label>
                              <div className="relative">
                                <input
                                  type="email"
                                  value={assignment.email}
                                  onChange={(e) =>
                                    handleRaciChange(
                                      index,
                                      "email",
                                      e.target.value
                                    )
                                  }
                                  disabled={isAssigneeOnly}
                                  placeholder="example@company.com"
                                  className={`w-full px-4 py-2.5 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm ${
                                    raciErrors[index]?.email
                                      ? "border-red-300 bg-red-50"
                                      : "border-gray-300 bg-white"
                                  } ${
                                    isAssigneeOnly
                                      ? "bg-gray-100 cursor-not-allowed"
                                      : ""
                                  }`}
                                />
                                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                              </div>
                              {raciErrors[index]?.email && (
                                <div className="mt-2 flex items-center text-red-600 text-xs font-medium">
                                  <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                                  {raciErrors[index].email}
                                </div>
                              )}
                            </div>

                            {/* RACI Roles Section */}
                            <div>
                              <div className="flex items-center justify-between mb-3">
                                <label className="block text-sm font-medium text-gray-700">
                                  RACI Roles
                                  <span className="text-red-500 ml-1">*</span>
                                </label>

                                {!isEdit && assignment.raciRole && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      handleRaciChange(index, "raciRole", null);
                                      handleRaciChange(index, "email", "");
                                    }}
                                    className="text-xs text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1 transition-colors"
                                  >
                                    <RotateCcw className="w-3.5 h-3.5" />
                                    <span className="hidden sm:inline">
                                      Reset
                                    </span>
                                  </button>
                                )}
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                {raciRoles.map((role) => (
                                  <label
                                    key={role.value}
                                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition-all ${
                                      assignment.raciRole === role.value
                                        ? "border-blue-500 bg-blue-50 shadow-sm"
                                        : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                                    } ${
                                      isAssigneeOnly
                                        ? "pointer-events-none"
                                        : ""
                                    }`}
                                  >
                                    <input
                                      type="radio"
                                      name={`raciRole-${index}`}
                                      value={role.value}
                                      checked={
                                        assignment.raciRole === role.value
                                      }
                                      onChange={() =>
                                        handleRaciChange(
                                          index,
                                          "raciRole",
                                          assignment.raciRole === role.value
                                            ? null
                                            : role.value
                                        )
                                      }
                                      disabled={isAssigneeOnly}
                                    />
                                    <span className="text-sm font-medium text-gray-900">
                                      {role.label}
                                    </span>
                                  </label>
                                ))}
                              </div>

                              {raciErrors[index]?.raciRole && (
                                <div className="mt-2 flex items-center text-red-600 text-xs font-medium">
                                  <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                                  {raciErrors[index].raciRole}
                                </div>
                              )}

                              {assignment.raciRole && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                  <p className="text-xs font-medium text-gray-600 mb-2">
                                    Selected Role:
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    <div
                                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border shadow-sm ${getRaciRoleColor(
                                        assignment.raciRole
                                      )}`}
                                    >
                                      {assignment.raciRole}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {showRaciSnackbar && (
                    <div className="fixed bottom-6 left-6 z-50 flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg shadow-lg animate-fade-in-up transition-all">
                      <Check className="w-5 h-5 text-green-600" />
                      <p className="text-sm font-medium">
                        RACI Role updated successfully.
                      </p>
                    </div>
                  )}
                </div>

                {/* Organization Field (Readonly) */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-900 mb-1.5">
                    Organization
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.organization}
                      readOnly
                      className="w-full px-4 py-2.5 pl-11 border border-gray-200 rounded-md shadow-sm bg-gray-50 text-gray-500 cursor-not-allowed text-sm"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                      <Building2 className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1.5">
                    <svg
                      className="w-3.5 h-3.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Organization is automatically assigned based on your account
                  </p>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="border-t border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50 rounded-b-xl flex justify-between items-center">
                {/* Left side */}
                <div className="flex items-center text-sm text-gray-600">
                  {isDirty && (
                    <div className="flex items-center gap-2">
                      {/* Orange dot always visible */}
                      <span className="w-2 h-2 bg-orange-500 rounded-full" />

                      {/* Text hidden on mobile */}
                      <span className="hidden sm:inline text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 px-2.5 py-1 rounded">
                        Unsaved changes
                      </span>
                    </div>
                  )}
                </div>
                {/* Right side */}
                <div className="flex gap-2 sm:gap-3">
                  {/* Cancel Button — icon only on mobile */}
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-2 sm:px-5 py-2 cursor-pointer border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                  >
                    <X className="w-4 h-4" />
                    <span className="hidden sm:inline">Cancel</span>
                  </button>

                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    disabled={isLoading || !formData.title.trim()}
                    className="px-3 sm:px-5 py-2 cursor-pointer border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    <span className="">
                      {isLoading
                        ? "Saving..."
                        : isEdit
                        ? "Update Task"
                        : "Create Task"}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {" "}
                Quick Actions{" "}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={resetForm}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center cursor-pointer">
                    <Trash2 className="w-4 h-4 mr-3 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {" "}
                        Clear Form{" "}
                      </div>
                      <div className="text-sm text-gray-700">
                        {" "}
                        Reset all fields to default{" "}
                      </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Form Statistics */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {" "}
                Form Statistics{" "}
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">
                      {" "}
                      Fields completed{" "}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {" "}
                      {completedFields} / {totalFields}{" "}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(completedFields / totalFields) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Required fields: Title, Priority</div>
                  <div>• Optional: Description, Due Date, Assignee</div>
                  <div>• RACI assignments are optional</div>
                </div>
              </div>
            </div>

            {/* RACI Summary */}
            {raciAssignments.some((a) => a.email || a.raciRole) && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Users className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      RACI Summary
                    </h3>
                  </div>
                </div>
                <br></br>
                <div className="space-y-2">
                  {raciAssignments
                    .filter((a) => a.email && a.raciRole)
                    .map((assignment, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-sm"
                      >
                        <span className="text-gray-700 truncate flex-1">
                          {assignment.email}
                        </span>
                        <span
                          className={`ml-2 px-2 py-1 rounded text-xs font-medium ${getRaciRoleColor(
                            assignment.raciRole
                          )}`}
                        >
                          {assignment.raciRole}
                        </span>
                      </div>
                    ))}
                  {raciAssignments.filter((a) => a.email && a.raciRole)
                    .length === 0 && (
                    <p className="text-sm text-gray-500 italic">
                      No RACI assignments yet
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFormPage;
