import { useState, useEffect } from "react";
import { Calendar, User, Building2, AlertCircle, Check, X, Save, Plus, Edit3, Clock, Flag, Trash2 } from "lucide-react";
import { useParams } from "react-router-dom";

const TaskFormPage = ({ mode }) => {
  const { taskId } = useParams();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    dueDate: "",
    priority: "",
    assignee: "",
    organization: "",
    status: "PENDING",
  });
  const [errors, setErrors] = useState({});
  const [isEdit, setIsEdit] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setSaveLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [originalTask, setOriginalTask] = useState(null);
  const token = localStorage.getItem("token");
  const isAssigneeOnly = originalTask && currentUser && originalTask.assignedToId === currentUser.id && originalTask.createdById !== currentUser.id;

  useEffect(() => {
    if (mode === "edit" && taskId) {
      fetchTaskData();
      setIsEdit(true);
    }
  }, [mode, taskId]);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!token) return;
        const res = await fetch("http://localhost:3000/api/auth/me", {
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
            organization: result.data.user.organization?.name || "Unknown Organization",
          }));
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUser();
  }, [token]);

  const priorities = [
    { value: "", label: "Select Priority", color: "gray" },
    { value: "LOW", label: "Low", color: "green" },
    { value: "MEDIUM", label: "Medium", color: "yellow" },
    { value: "HIGH", label: "High", color: "red" },
  ];

  const assignees = [];
  const today = new Date().toISOString().split("T")[0];

  const statusOptions = [
    { value: "IN_PROGRESS", label: "In Progress", color: "blue" },
    { value: "COMPLETED", label: "Completed", color: "green" },
    { value: "PENDING", label: "Pending", color: "orange" },
    { value: "CANCELLED", label: "Cancelled", color: "red" },
  ];

  const validateForm = () => {
    const newErrors = {};
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    } else if (formData.title.length < 3) {
      newErrors.title = "Title must be at least 3 characters";
    } else if (formData.title.length > 100) {
      newErrors.title = "Title must be 100 characters or less";
    }
    if (formData.dueDate && formData.dueDate < today) newErrors.dueDate = "Due date cannot be in the past";
    if (!formData.priority) newErrors.priority = "Priority is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsDirty(true);
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const fetchTaskData = async () => {
    if (!taskId || !token) return;
    try {
      const res = await fetch(`http://localhost:3000/api/tasks/${taskId}`, {
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
        priority: data.task.priority || "",
        assignee: data.task.assignedToId || "",
        organization: data.task.organization?.name || currentUser?.organization?.name || "Unknown Organization",
        status: data.task.status || "PENDING",
      });
      setOriginalTask(data.task);
    } catch (error) {
      console.error("Error fetching task data:", error);
    }
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    setSaveLoading(true);

    try {
      let url = `http://localhost:3000/api/tasks`;
      let method = "POST";

      if (isEdit && taskId) {
        url = `http://localhost:3000/api/tasks/${taskId}`;
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
            dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
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
        };
      }

      Object.keys(payload).forEach((key) => { if (payload[key] === undefined) delete payload[key] });
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        cache: "no-store",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("Backend error:", err);
        throw new Error(err.message || "Failed to save task");
      }
      const result = await res.json();
      console.log("Task saved:", result);
      setShowSuccess(true);
      setIsDirty(false);
      if (!isEdit) resetForm();
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setSaveLoading(false);
      setTimeout(() => setShowSuccess(false), 4000);
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      const confirmed = window.confirm( "You have unsaved changes. Are you sure you want to cancel?" );
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
    setErrors({});
    setIsDirty(false);
  };

  const getPriorityColor = (priority) => {
    const priorityItem = priorities.find((p) => p.value === priority);
    if (!priorityItem) return "text-gray-600 bg-gray-50 border-gray-200";
    const colors = {
      green: "text-green-700 bg-green-50 border-green-200",
      yellow: "text-yellow-700 bg-yellow-50 border-yellow-200",
      orange: "text-orange-700 bg-orange-50 border-orange-200",
      red: "text-red-700 bg-red-50 border-red-200",
      gray: "text-gray-600 bg-gray-50 border-gray-200",
    };
    return colors[priorityItem.color] || colors.gray;
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
              <div className="border-b rounded-xl border-gray-200 px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 to-indigo-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {isEdit ? (
                      <Edit3 className="w-6 h-6 text-white" />
                    ) : (
                      <Plus className="w-6 h-6 text-white" />
                    )}
                    <h1 className="text-2xl font-bold text-white">
                      {isEdit ? "Edit Task" : "Create New Task"}
                    </h1>
                    {isDirty && (
                      <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse"
                        title="Unsaved changes"
                      />
                    )}
                  </div>

                  <div className="flex items-center space-x-2"></div>
                </div>
              </div>

              {isAssigneeOnly && (
                <div className="mx-6 mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg flex items-center text-yellow-700">
                  <AlertCircle className="w-5 h-5 mr-3" />
                  <div>
                    <p className="text-sm">You can only update the status of this task because you're assigned to it.</p>
                  </div>
                </div>
              )}

              {/* Success Message */}
              {showSuccess && (
                <div className="mx-6 mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center animate-fade-in">
                  <Check className="w-5 h-5 text-green-600 mr-3" />
                  <div>
                    <span className="text-green-800 font-medium">
                      Task saved successfully!
                    </span>
                    <p className="text-green-700 text-sm mt-1">
                      Your task has been {isEdit ? "updated" : "created"} and is
                      ready for assignment.
                    </p>
                  </div>
                </div>
              )}

              {/* Form */}
              <div className="p-6 space-y-6">
                {/* Title Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Task Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => handleInputChange("title", e.target.value)}
                    disabled={isAssigneeOnly}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.title ? "border-red-300 focus:ring-red-500" : "border-gray-300"
                    } ${isAssigneeOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Enter a descriptive task title..."
                    maxLength={100}
                  />

                  {errors.title && (
                    <div className="mt-2 flex items-center text-red-600 text-sm">
                      <AlertCircle className="w-4 h-4 mr-1 flex-shrink-0" />
                      {errors.title}
                    </div>
                  )}
                </div>

                {/* Description Field */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) =>
                      handleInputChange("description", e.target.value)
                    }
                    rows={4}
                    disabled={isAssigneeOnly}
                    className={`w-full px-4 py-3 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                      errors.title ? "border-red-300 focus:ring-red-500" : "border-gray-300"
                    } ${isAssigneeOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    placeholder="Describe the task requirements, acceptance criteria, and any important details..."
                  />
                </div>

                {/* Priority and Due Date Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Priority Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <select
                        value={formData.priority}
                        onChange={(e) =>
                          handleInputChange("priority", e.target.value)
                        }
                        disabled={isAssigneeOnly}
                        className={`w-full px-4 py-3 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none ${
                          errors.priority ? "border-red-300 focus:ring-red-500" : "border-gray-300"
                        } ${isAssigneeOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      >
                        {priorities.map((priority) => (
                          <option key={priority.value} value={priority.value}> {priority.label} </option>
                        ))}
                      </select>
                      <Flag className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                    {formData.priority && (
                      <div
                        className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getPriorityColor(
                          formData.priority
                        )}`} >
                        <Flag className="w-3 h-3 mr-1" />
                        { priorities.find((p) => p.value === formData.priority) ?.label }{" "} Priority
                      </div>
                    )}
                    {errors.priority && (
                      <div className="mt-2 flex items-center text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.priority}
                      </div>
                    )}
                  </div>

                  {/* Due Date Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
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
                        className={`w-full px-4 py-3 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                          errors.dueDate ? "border-red-300 focus:ring-red-500" : "border-gray-300"
                        } ${isAssigneeOnly ? "bg-gray-100 cursor-not-allowed" : ""}`}
                      />
                      <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                    {daysUntilDue !== null && (
                      <div
                        className={`mt-2 text-xs flex items-center ${
                          daysUntilDue < 0
                            ? "text-red-600"
                            : daysUntilDue <= 3
                            ? "text-orange-600"
                            : "text-gray-600"
                        }`}
                      >
                        <Clock className="w-3 h-3 mr-1" />
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
                      <div className="mt-2 flex items-center text-red-600 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.dueDate}
                      </div>
                    )}
                  </div>
                </div>

                {/* Assignee Field */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Assignee
                    </label>
                    <div className="relative">
                      <div>
                      <div className="relative">
                        <input
                          type="text"
                          value={formData.assignee}
                          onChange={(e) =>
                            handleInputChange("assignee", e.target.value)
                          }
                          disabled={isAssigneeOnly}
                          placeholder="Enter assignee ID"
                          className={`w-full px-4 py-3 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all ${
                            isAssigneeOnly ? "bg-gray-100 cursor-not-allowed" : "border-gray-300"
                          }`}
                        />
                        <User className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                      </div>
                    </div>
                    </div>
                  </div>

                  {/* Status Field */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <div className="relative">
                      <select
                        value={formData.status}
                        onChange={(e) =>
                          handleInputChange("status", e.target.value)
                        }
                        className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none"
                      >
                        {statusOptions.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                      <Flag className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                    </div>
                    {formData.status && (
                      <div
                        className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${
                          formData.status === "IN_PROGRESS"
                            ? "text-blue-700 bg-blue-50 border-blue-200"
                            : formData.status === "COMPLETED"
                            ? "text-green-700 bg-green-50 border-green-200"
                            : "text-red-700 bg-red-50 border-red-200"
                        }`}
                      >
                        <Clock className="w-3 h-3 mr-1" />
                        {
                          statusOptions.find((s) => s.value === formData.status)
                            ?.label
                        }
                      </div>
                    )}
                  </div>
                </div>

                {/* Organization Field (Readonly) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Organization
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.organization}
                      readOnly
                      className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-lg shadow-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                    />
                    <Building2 className="w-5 h-5 text-gray-400 absolute left-3 top-3.5" />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Organization is automatically assigned based on your account
                  </div>
                </div>
              </div>

              {/* Enhanced Action Buttons */}
              <div className="border-t border-gray-200 px-6 py-4 bg-gray-50 rounded-b-xl flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-600">
                  {isDirty && (
                    <div className="flex items-center">
                      <div className="w-2 h-2 bg-orange-400 rounded-full mr-2" />
                      Unsaved changes
                    </div>
                  )}
                </div>

                <div className="flex space-x-3">
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-6 py-2.5 border border-gray-300 rounded-lg shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isLoading || !formData.title.trim()}
                    className="px-6 py-2.5 border border-transparent rounded-lg shadow-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-all"
                  >
                    {isLoading ? (
                      <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    { isLoading ? "Saving..." : isEdit ? "Update Task" : "Create Task" }
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4"> Quick Actions </h3>
              <div className="space-y-3">
                <button
                  onClick={resetForm}
                  className="w-full text-left px-4 py-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="flex items-center">
                    <Trash2 className="w-4 h-4 mr-3 text-gray-600" />
                    <div>
                      <div className="font-medium text-gray-900"> Clear Form </div>
                      <div className="text-sm text-gray-700"> Reset all fields to default </div>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* Form Statistics */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4"> Form Statistics </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600"> Fields completed </span>
                    <span className="text-sm font-medium text-gray-900"> {completedFields} / {totalFields} </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${(completedFields / totalFields) * 100}%`,
                      }} />
                  </div>
                </div>

                <div className="text-xs text-gray-500 space-y-1">
                  <div>• Required fields: Title, Priority</div>
                  <div>• Optional: Description, Due Date, Assignee</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskFormPage;
