import { Users } from "lucide-react";

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

const RACISection = ({ raci, loading }) => {
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
      <div className="flex items-center gap-2 mb-4">
        <Users className="w-5 h-5 text-gray-900" />
        <h1 className="text-lg font-semibold text-gray-900">
          RACI Assignments
        </h1>
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
                      className="text-sm font-medium text-gray-800"
                    >
                      {item.user?.name}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RACISection;
