import { useState, useEffect, useRef } from "react";
import { AlertCircle, Check, X, Save, Trash2, Users, ArrowLeft } from "lucide-react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import TaskForm from "./components/form/TaskForm.jsx";
import Snackbar from "./components/common/Snackbar.jsx";

const API_URL = import.meta.env.VITE_API_URL;
const apiKey = import.meta.env.VITE_API_KEY;
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoading, setSaveLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [originalTask, setOriginalTask] = useState(null);
  const [snackbar, setSnackbar] = useState({ 
    open: false,
    message: "",
    type: "success"
  });
  const token = localStorage.getItem("token");
  const isAssigneeOnly =
    originalTask &&
    currentUser &&
    originalTask.assignedToId === currentUser.id &&
    originalTask.createdById !== currentUser.id;

  const showSnackbarMessage = (message, type = "success", duration = 2500) => {
    setSnackbar({ open: true, message, type });
    setTimeout(() => {
      setSnackbar(prev => ({ ...prev, open: false }));
    }, duration);
  };

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
      const res = await fetch(`${API_BASE_URL}/api/calls/execute`, {
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

      if (res.status === 429) {
        showSnackbarMessage("API-Key limit exceeded. Upgrade your plan.", "error");
      }

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
        showSnackbarMessage("RACI role updated successfully!", "success");
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
            priority: formData.priority || "MEDIUM",
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
          priority: formData.priority || "MEDIUM",
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

      showSnackbarMessage(`Task ${isEdit ? "Updated" : "Created"} successfully!`, "success");
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
      const confirmed = window.confirm("You have unsaved changes. Are you sure you want to cancel?");
      if (!confirmed) return;
    }
    resetForm();
    navigate("/dashboard");
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      dueDate: "",
      priority: "MEDIUM",
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

              {/* Form */}
              <TaskForm
                titleRef={titleRef}
                formData={formData}
                errors={errors}
                raciAssignments={raciAssignments}
                raciErrors={raciErrors}
                isAssigneeOnly={isAssigneeOnly}
                isEdit={isEdit}
                loading={loading}
                snackbar={snackbar}
                today={today}
                daysUntilDue={daysUntilDue}
                priorities={priorities}
                statusOptions={statusOptions}
                raciRoles={raciRoles}
                handleInputChange={handleInputChange}
                handleClick={handleClick}
                addRaciAssignment={addRaciAssignment}
                removeRaciAssignment={removeRaciAssignment}
                handleRaciChange={handleRaciChange}
                getRaciRoleColor={getRaciRoleColor}
              />

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
