import { useState } from "react";
import { Users, CircleCheckBig, Hourglass, Plus } from "lucide-react";
import RACIAssignmentDialog from "./RaciAssignmentDialog.jsx";

const RACI_LABELS = {
  RESPONSIBLE: {
    title: "Responsible",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  ACCOUNTABLE: {
    title: "Accountable",
    color: "bg-purple-50 text-purple-700 border-purple-200",
  },
  CONSULTED: {
    title: "Consulted",
    color: "bg-green-50 text-green-700 border-green-200",
  },
  INFORMED: {
    title: "Informed",
    color: "bg-gray-50 text-gray-700 border-gray-200",
  },
};

const RACISection = ({ raci, loading, onAddAssignments }) => {
  const [openRaciDialog, setOpenRaciDialog] = useState(false);
  if (loading) {
    return (
      <div className="bg-white border rounded-xl p-5">
        <p className="text-sm text-gray-500">Loading RACI…</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
      {/* Header */}
      <div className="flex items-center border-b border-gray-200 pb-2 gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-900" />
        <h1 className="text-lg font-semibold text-gray-900">
          RACI Assignments
        </h1>

        {/* Add RACI Assignment button to the right */}
        <div className="ml-auto">
          <button
            onClick={() => setOpenRaciDialog(true)}
            type="button"
            className="flex items-center cursor-pointer justify-center gap-2 px-2 py-2 sm:px-4 sm:py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 font-medium rounded-lg transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Add Assignment</span>
          </button>
        </div>
      </div>

      {/* RACI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(RACI_LABELS).map(([key, meta]) => {
          const users = raci.assignments?.[key] || [];

          return (
            <div
              key={key}
              className={`rounded-lg border p-3 ${meta.color}`}
            >
              <p className="text-sm font-semibold uppercase mb-2">
                {meta.title}
              </p>

              {users.length === 0 ? (
                <p className="text-xs text-gray-500">No {meta.title} users</p>
              ) : (
                <ul className="space-y-1">
                  {users.map((item) => (
                    <li
                      key={item.id}
                      className="text-sm font-medium text-gray-800 gap-2 flex items-center justify-between"
                    >
                      {item.user?.name}
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium
                          ${
                            item.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : "bg-orange-100 text-orange-600"
                          }
                        `}
                      >
                        {item.status === "ACTIVE" ? (
                          <CircleCheckBig className="w-4 h-4" />
                        ) : (
                          <Hourglass className="w-4 h-4" />
                        )}
                        {item.status}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="mt-4 pt-3 border-t border-gray-200 text-sm text-gray-600 flex gap-4">
        <span>Total: {raci.summary.totalAssignments}</span>
        <span>Active: {raci.summary.activeAssignments}</span>
        <span>Pending: {raci.summary.pendingInvitations}</span>
      </div>

      {/* RACI Dialog */}
      <RACIAssignmentDialog
        open={openRaciDialog}
        onClose={() => setOpenRaciDialog(false)}
        onSubmit={onAddAssignments}
      />
    </div>
  );
};

export default RACISection;
