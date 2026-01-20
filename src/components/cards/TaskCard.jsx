import {
  SquareCheckBig,
  Edit,
  Trash2,
  User,
  Users,
  Calendar,
} from "lucide-react";

const TaskCard = ({
  tasks,
  onView,
  onEdit,
  currentUser,
  onDelete,
  onComplete,
  getPriorityColor,
  getStatusColor,
}) => {
  return (
    <div className="space-y-4 xl:hidden max-h-[65vh] overflow-y-auto overflow-x-hidden pr-1.5 mt-6">
      {tasks.map((task) => (
        <div
          key={task.id}
          onClick={() => onView(task.id)}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-4"
        >
          {/* Title + Priority + Status */}
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">
              {task.title}
            </h3>
            <div className="flex justify-between gap-2">
              <span
                className={`px-3 py-1 text-xs rounded border font-medium ${getPriorityColor(
                  task.priority,
                )}`}
              >
                {task.priority}
              </span>
              <span
                className={`px-3 py-1 text-xs border rounded font-medium ${getStatusColor(
                  task.status,
                )}`}
              >
                {task.status}
              </span>
            </div>
          </div>

          {/* Assigned + Due Date */}
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

          {/* RACI Roles + Actions */}
          <div className="flex justify-between items-center mt-3">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              {(() => {
                if (!currentUser?.id || !task.raciRoles?.length) return "N/A";

                const roles = task.raciRoles
                  .filter((r) => r.user?.id === currentUser.id)
                  .map((r) => r.raciRole);

                return roles.length ? roles.join(", ") : "N/A";
              })()}
            </div>

            <div className="flex space-x-2">
              {/* Edit */}
              <div className="relative group">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (task.status !== "COMPLETED") {
                      onEdit(task.id);
                    }
                  }}
                  className={`p-1.5 rounded-full border transition-colors bg-yellow-50 text-yellow-600 
                    ${
                      task.status === "COMPLETED"
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-yellow-100"
                    }
                  `}
                >
                  <Edit className="h-4 w-4" />
                </button>
                {task.status !== "COMPLETED" && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    Edit Task
                  </span>
                )}
              </div>

              {/* Delete */}
              <div className="relative group">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(task.id);
                  }}
                  className="p-1.5 rounded-full bg-red-50 border text-red-600 cursor-pointer hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  Delete Task
                </span>
              </div>

              {/* Mark Complete */}
              <div className="relative group">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (task.status !== "COMPLETED") {
                      onComplete(task.id);
                    }
                  }}
                  disabled={task.status === "COMPLETED"}
                  className={`p-2 rounded-full border transition-colors bg-green-50 text-green-600 
                    ${
                      task.status === "COMPLETED"
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer hover:bg-green-100"
                    }
                  `}
                >
                  <SquareCheckBig className="h-4 w-4" />
                </button>
                {task.status !== "COMPLETED" && (
                  <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-900 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                    Complete Task
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskCard;
