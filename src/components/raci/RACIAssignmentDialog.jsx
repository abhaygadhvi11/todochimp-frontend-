import { useState } from "react";
import { Mail, X, Users, RotateCcw, Trash2 } from "lucide-react";

const RACIAssignmentDialog = ({ open, onClose, onSubmit }) => {
  const [raciAssignments, setRaciAssignments] = useState([
    { email: "", raciRole: "" },
  ]);

  const RACI_ROLES = [
    { value: "RESPONSIBLE", label: "Responsible" },
    { value: "ACCOUNTABLE", label: "Accountable" },
    { value: "CONSULTED", label: "Consulted" },
    { value: "INFORMED", label: "Informed" },
  ];

  const handleRaciChange = (index, field, value) => {
    setRaciAssignments((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  // const removeAssignment = (index) => {
  //   setRaciAssignments((prev) =>
  //     prev.length === 1 ? prev : prev.filter((_, i) => i !== index),
  //   );
  // };

  const resetAssignment = (index) => {
    handleRaciChange(index, "email", "");
    handleRaciChange(index, "raciRole", "");
  };

  const handleSubmit = async () => {
  // frontend validation
    if (raciAssignments.some(a => !a.email || !a.raciRole)) {
      alert("Please fill all assignments");
      return;
    }

    try {
      await onSubmit(raciAssignments);
      onClose();

      setRaciAssignments([{ email: "", raciRole: "" }]);
    } catch (err) {
      alert(err.message);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-2 sm:px-4">
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-3xl lg:max-w-4xl max-h-[95vh] flex flex-col animate-fadeIn">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 rounded-t-xl">
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
            onClick={onClose}
            className="p-2 rounded-md hover:bg-red-50 transition focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
          >
            <X className="w-5 h-5 text-red-600" />
          </button>
        </div>

        {/* Body */}
        {raciAssignments.map((assignment, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 mx-5 mb-4 flex flex-col gap-6 cursor-pointer"
          >
            {/* Header */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-gray-700">
                  Assignment
                </span>
              </div>

              {/* {raciAssignments.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeAssignment(index)}
                  disabled={raciAssignments.length === 1}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-red-600 hover:bg-red-600 hover:text-white rounded-md border border-red-200 transition cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Remove</span>
                </button>
              )} */}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address<span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={assignment.email}
                  onChange={(e) =>
                    handleRaciChange(index, "email", e.target.value)
                  }
                  autoFocus
                  placeholder="example@company.com"
                  className="w-full px-4 py-2.5 pl-10 border rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm border-gray-300 bg-white"
                />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* RACI Role */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  RACI Role<span className="text-red-500 ml-1">*</span>
                </label>

                <button
                  type="button"
                  onClick={() => resetAssignment(index)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {RACI_ROLES.map((role) => (
                  <label
                    key={role.value}
                    className={`flex items-center gap-2 p-3 border rounded-lg cursor-pointer transition ${assignment.raciRole === role ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:bg-gray-50"}`}
                  >
                    <input
                      type="radio"
                      name={`raciRole-${index}`}
                      value={role.value}
                      checked={assignment.raciRole === role.value}
                      onChange={() => handleRaciChange(index, "raciRole", role.value)}
                    />
                    <span className="text-sm font-medium">{role.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="flex justify-end gap-3 px-5 py-4 border-t border-gray-200 ">
          <button
            onClick={onClose}
            className="text-md text-red-600 p-2 rounded-md hover:bg-red-50 transition focus:outline-none focus:ring-2 focus:ring-gray-300 cursor-pointer"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 text-sm rounded-lg text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium transition-shadow shadow-sm cursor-pointer"
          >
            Add Assignment
          </button>
        </div>
      </div>
    </div>
  );
};

export default RACIAssignmentDialog;
