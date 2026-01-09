import { Plus, Menu } from "lucide-react";

const Sidebar = ({
  filters,
  selectedFilter,
  setSelectedFilter,
  onCreate,
  showMobileSidebar,
  setShowMobileSidebar,
}) => {
  return (
    <>
      <aside
        className={`${
          showMobileSidebar ? "translate-x-0" : "-translate-x-full"
        } fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-200 ease-in-out
        md:translate-x-0 md:static md:inset-0 bg-white border-r border-gray-200`}
      >
        <div className="flex flex-col h-full">
          {/* Mobile Header */}
          <div className="relative flex items-center justify-center p-4 border-b border-gray-200 md:hidden">
            <button
              onClick={() => setShowMobileSidebar(false)}
              className="absolute left-4 p-2 cursor-pointer rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5 text-black" />
            </button>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">TC</span>
              </div>
              <span className="text-lg font-semibold text-gray-800">
                TODOCHIMP
              </span>
            </div>
          </div>

          {/* Create Task */}
          <div className="p-4 border-b border-gray-200">
            <button
              onClick={() => {
                onCreate();
                setShowMobileSidebar(false);
              }}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700
              text-white px-4 py-2 rounded-md flex items-center cursor-pointer justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              <span>Create Task</span>
            </button>
          </div>

          {/* Filters */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-600">
              Filters
            </h3>

            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setSelectedFilter(filter);
                  setShowMobileSidebar(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm transition
                  ${
                    selectedFilter === filter
                      ? "bg-gradient-to-br from-indigo-100 to-blue-100 text-black font-medium"
                      : "text-gray-700 hover:bg-gray-100 cursor-pointer"
                  }`}
              >
                {filter}
              </button>
            ))}
          </nav>
        </div>
      </aside>

      {/* Overlay (Mobile) */}
      {showMobileSidebar && (
        <div
          className="fixed inset-0 bg-gray-600 bg-opacity-75 z-40 md:hidden"
          onClick={() => setShowMobileSidebar(false)}
        />
      )}
    </>
  );
};

export default Sidebar;
