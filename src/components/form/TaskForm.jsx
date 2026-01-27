import {
  AlertCircle,
  AlertTriangle,
  Calendar,
  Clock,
  User,
  Flag,
  Users,
  Plus,
  Trash2,
  Mail,
  RotateCcw,
  Check,
  Building2,
} from "lucide-react";

import AIButton from "../AIButton.jsx";
import Snackbar from "../common/Snackbar.jsx";

const TaskForm = ({
  // refs
  titleRef,
  // state
  formData,
  errors,
  raciAssignments,
  raciErrors,
  // flags
  isAssigneeOnly,
  isEdit,
  loading,
  snackbar,
  // helpers
  today,
  daysUntilDue,
  priorities,
  statusOptions,
  raciRoles,
  // handlers
  handleInputChange,
  handleClick,
  addRaciAssignment,
  removeRaciAssignment,
  handleRaciChange,
  getRaciRoleColor,
}) => {
  return (
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
          <AIButton
            loading={loading}
            onClick={handleClick}
            disabled={isAssigneeOnly}
          />
        </div>
        <textarea
          value={formData.description}
          onChange={(e) => handleInputChange("description", e.target.value)}
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
              onChange={(e) => handleInputChange("priority", e.target.value)}
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
              onChange={(e) => handleInputChange("dueDate", e.target.value)}
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
              onChange={(e) => handleInputChange("assignee", e.target.value)}
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
              onChange={(e) => handleInputChange("status", e.target.value)}
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
                        <span className="hidden sm:inline">Remove</span>
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
                          handleRaciChange(index, "email", e.target.value)
                        }
                        disabled={isAssigneeOnly}
                        placeholder="example@company.com"
                        className={`w-full px-4 py-2.5 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm ${
                          raciErrors[index]?.email
                            ? "border-red-300 bg-red-50"
                            : "border-gray-300 bg-white"
                        } ${
                          isAssigneeOnly ? "bg-gray-100 cursor-not-allowed" : ""
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
                          <span className="hidden sm:inline">Reset</span>
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
                          } ${isAssigneeOnly ? "pointer-events-none" : ""}`}
                        >
                          <input
                            type="radio"
                            name={`raciRole-${index}`}
                            value={role.value}
                            checked={assignment.raciRole === role.value}
                            onChange={() =>
                              handleRaciChange(
                                index,
                                "raciRole",
                                assignment.raciRole === role.value
                                  ? null
                                  : role.value,
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
                              assignment.raciRole,
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
          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Organization is automatically assigned based on your account
        </p>
      </div>

      <Snackbar 
        message={snackbar.message} 
        type={snackbar.type} 
        open={snackbar.open}
      />
    </div>
  );
};

export default TaskForm;
