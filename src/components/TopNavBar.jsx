import { useState, useEffect, useRef } from "react";
import { User, ChevronDown, LogOut, Menu, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const TopNavBar = ({
  handleLogout,
  showMobileSidebar,
  setShowMobileSidebar,
  user,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm z-50 relative">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Left side */}
          <div className="flex items-center">
            <button
              onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5 text-black" />
            </button>

            <div className="flex items-center">
              <Link
                to="/dashboard"
                className="flex items-center group cursor-pointer"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center group-hover:opacity-90 transition">
                  <span className="text-white font-bold text-sm">TC</span>
                </div>
                <span className="ml-2 text-xl font-semibold hidden md:inline text-gray-800 group-hover:text-gray-900">
                  TodoChimp
                </span>
              </Link>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-3">
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => {
                  if (showMobileSidebar) {
                    setShowMobileSidebar(false);
                    setTimeout(() => {
                      setShowUserMenu(true);
                    }, 50);
                  } else {
                    setShowUserMenu((prev) => !prev);
                  }
                }}
                className="group flex items-center gap-3 px-3 py-2 rounded-lg w-full transition-all duration-200 
                          text-gray-700 hover:bg-gray-100"
              >
                <div className="p-[2px] rounded-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-300 group-hover:from-blue-500 group-hover:to-purple-500">
                  <div className="bg-white rounded-full p-1">
                    <User className="h-6 w-6 text-purple-500 transition-colors duration-300 group-hover:text-blue-500" />
                  </div>
                </div>

                {user?.name && (
                  <div className="hidden sm:flex flex-col text-left">
                    <span className="text-xs text-gray-500">Welcome</span>
                    <span className="text-sm font-medium text-gray-800">
                      {user.name}
                    </span>
                  </div>
                )}

                <ChevronDown className="h-4 w-4 ml-auto text-gray-500" />
              </button>

              {/* Dropdown */}
              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 rounded-md shadow-lg py-2 z-50 border bg-white border-gray-200 text-gray-700">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <div className="flex flex-col">
                      {user?.name && (
                        <span className="font-medium text-gray-800 sm:hidden">
                          {user.name}
                        </span>
                      )}
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Mail className="h-4 w-4" />
                        <span>{user?.email || "No email"}</span>
                      </div>
                    </div>
                  </div>

                  {/* <Link
                    to="/profile"
                    className="block px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => setShowUserMenu(false)} // close on click
                  >
                    Profile
                  </Link> */}

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      handleLogout();
                    }}
                    className="block w-full text-left px-4 py-2 text-sm flex items-center text-red-600 hover:bg-red-50 hover:text-red-700"
                  >
                    <LogOut className="inline h-4 w-4 mr-2" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default TopNavBar;
