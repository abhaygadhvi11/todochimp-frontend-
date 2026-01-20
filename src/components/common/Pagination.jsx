import { ChevronLeft, ChevronRight } from "lucide-react";

const Pagination = ({
  currentPage,
  totalPages,
  setCurrentPage,
  getPageNumbers,
  tasksPerPage,
  setTasksPerPage,
}) => {
  return (
    <div className="mt-4 px-4 py-1.5 rounded-lg bg-white border-gray-200 shadow-sm sm:px-6">
      <div className="flex items-center justify-between sm:justify-between">
        {/* Left: Rows per page */}
        <div className="flex items-center gap-2 text-sm text-gray-700">
            <span className="hidden sm:inline">Rows per page:</span>
          <select
            value={tasksPerPage}
            onChange={(e) => {
              setTasksPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border-2 border-blue-500 rounded px-2 py-1 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer bg-white"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>

        {/* Center / Right: Pagination */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Previous */}
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded hover:bg-gray-200 opacity-40 cursor-pointer"       
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {/* Mobile: Current page only */}
          <span className="sm:hidden w-8 h-8 flex items-center justify-center rounded border-2 border-blue-500 bg-gray-200 text-sm font-medium text-gray-500">
            {currentPage}
          </span>

          {/* Desktop: Page Numbers */}
          <div className="hidden sm:flex items-center gap-2">
            {getPageNumbers().map((item, index) => (
              <button
                key={index}
                onClick={() => item !== "..." && setCurrentPage(item)}
                disabled={item === "..."}
                className={`w-10 h-10 rounded text-sm font-medium
              ${
                item === currentPage ? "border-2 border-blue-500 bg-gray-100" : item === "..." ? "text-gray-500 cursor-default" : "hover:bg-gray-100 cursor-pointer"
              }`}
              >
                {item}
              </button>
            ))}
          </div>

          {/* Next */}
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            className="w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded hover:bg-gray-200 opacity-40 cursor-pointer"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
