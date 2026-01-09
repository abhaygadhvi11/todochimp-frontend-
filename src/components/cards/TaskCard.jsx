import { Eye, Edit, Trash2, User, Calendar } from "lucide-react";

const TaskCard = ({
  tasks,
  onView,
  onEdit,
  onDelete,
  getPriorityColor,
  getStatusColor,
}) => {
    return (
    <div className="space-y-4 xl:hidden max-h-[65vh] overflow-y-auto overflow-x-hidden pr-1.5 mt-6">
      {tasks.map((task) => (
        <div
          key={task.id}
          className="bg-white rounded-xl shadow-lg border border-gray-200 p-4"
        >
          {/* Title + Priority */}
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

          {/* Status + Actions */}
          <div className="flex justify-between items-center mt-3">
            <span
              className={`px-3 py-1 text-xs border rounded font-medium ${getStatusColor(
                task.status
              )}`}
            >
              {task.status}
            </span>

            <div className="flex space-x-2">
              {/* View */}
              <div className="relative group">
                <button
                  onClick={() => onView(task.id)}
                  className="p-1.5 rounded-full bg-blue-50 border text-blue-600 hover:bg-blue-100 transition-colors"
                >
                  <Eye className="h-4 w-4" />
                </button>
              </div>

              {/* Edit */}
              <div className="relative group">
                <button
                  onClick={() => onEdit(task.id)}
                  className="p-1.5 rounded-full bg-yellow-50 border text-yellow-600 hover:bg-yellow-100 transition-colors"
                >
                  <Edit className="h-4 w-4" />
                </button>
              </div>

              {/* Delete */}
              <div className="relative group">
                <button
                  onClick={() => onDelete(task.id)}
                  className="p-1.5 rounded-full bg-red-50 border text-red-600 hover:bg-red-100 transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskCard;