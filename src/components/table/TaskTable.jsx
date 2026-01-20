import { SquareCheckBig, Edit, Trash2 } from "lucide-react";

const TaskTable = ({
  tasks,
  onView,
  onEdit,
  onDelete,
  onComplete,
  currentUser,
  getPriorityColor,
  getStatusColor,
}) => {

  return (
    <div className="hidden xl:block overflow-x-auto mt-6">
      <div className="shadow-lg rounded-xl border overflow-hidden bg-white border-gray-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-gradient-to-r from-blue-700 to-purple-600 text-white sticky top-0 z-10">
            <tr>
              <th className="py-3 px-6 text-center text-sm font-semibold">
                TITLE
              </th>
              <th className="py-3 px-6 text-center text-sm font-semibold">
                STATUS
              </th>
              <th className="py-3 px-6 text-center text-sm font-semibold">
                PRIORITY
              </th>
              <th className="py-3 px-6 text-center text-sm font-semibold">
                DUE DATE
              </th>
              <th className="py-3 px-6 text-center text-sm font-semibold">
                ASSIGNED TO
              </th>
              <th className="py-3 px-6 text-center text-sm font-semibold">
                RACI ROLES
              </th>
              <th className="py-3 px-6 text-center text-sm font-semibold">
                ACTIONS
              </th>
            </tr>
          </thead>

          <tbody>
            {tasks.map((task, index) => (
              <tr
                key={task.id}
                onClick={() => onView(task.id)}
                className={`transition-all duration-200 ${
                  index % 2 === 0 ? "bg-gray-50" : "bg-white"
                } hover:bg-indigo-50 cursor-pointer`}
              >
                <td className="px-6 py-3 text-center text-sm font-medium">
                  {task.title}
                </td>

                <td className="px-6 py-3 text-center text-sm font-medium">
                  <span
                    className={`px-3 py-1 text-xs rounded border font-medium ${getStatusColor(
                      task.status
                    )}`}
                  >
                    {task.status}
                  </span>
                </td>

                <td className="px-6 py-3 text-center">
                  <span
                    className={`px-3 py-1 text-xs rounded border font-medium ${getPriorityColor(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                </td>

                <td className="px-6 py-3 text-center text-sm">
                  {task.dueDate
                    ? new Date(task.dueDate).toLocaleDateString()
                    : "DD/MM/YYYY"}
                </td>

                <td className="px-6 py-3 text-center ">
                  {task.assignedTo?.name || "Unassigned"}
                </td>

                <td className="px-6 py-3 text-center text-sm">
                  {(() => {
                    if (!currentUser?.id || !task.raciRoles?.length) return "N/A";

                    const roles = task.raciRoles
                      .filter((r) => r.user?.id === currentUser.id)
                      .map((r) => r.raciRole);

                    return roles.length ? roles.join(", ") : "N/A";
                  })()}
                </td>

                <td className="px-6 py-3 text-center">
                  <div className="inline-flex justify-center space-x-2">
                    {/* Edit */}
                    <div className="relative group">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (task.status !== "COMPLETED") {
                            onEdit(task.id);
                          }
                        }}
                        className={`p-2 rounded-full border transition-colors bg-yellow-50 text-yellow-600 
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
                        className="p-2 rounded-full cursor-pointer bg-red-50 border text-red-600 hover:bg-red-100 transition-colors"
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
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TaskTable;
