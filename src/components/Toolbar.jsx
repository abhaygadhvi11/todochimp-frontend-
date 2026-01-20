import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Toolbar = ({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
}) => {
  const navigate = useNavigate();
  
  const handleNavigate = () => {
    navigate("/generate");
  }
  return (
    <div className="rounded-lg p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border bg-white border-gray-200 shadow-sm">
      {/* Search */}
      <div className="relative w-full sm:w-1/3">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search Tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm bg-white border-gray-300"
        />
      </div>

      {/* Sort */}
      <div className="flex items-center space-x-2">
        <label className="text-sm font-medium">Sort by:</label>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border rounded-md cursor-pointer px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white border-gray-300"
        >
          <option value="title">Title</option>
          <option value="status">Status</option>
          <option value="priority">Priority</option>
          <option value="dueDate">Due Date</option>
          <option value="assignee">Assignee</option>
        </select>

        <button
          onClick={() =>
            setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
          }
          className="px-3 py-2 border rounded-md text-sm bg-white border-gray-300 hover:bg-gray-50 cursor-pointer"
        >
          {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
        </button>

        <button
          onClick={handleNavigate}
          className="flex items-center space-x-1 cursor-pointer bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm"
        >
          <span>Generate</span>
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
