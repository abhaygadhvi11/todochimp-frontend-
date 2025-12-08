import React from "react";

const AIButton = ({ loading, onClick, disabled }) => {
  return (
    <div className="flex justify-end mb-2">
      <button
        onClick={!disabled ? onClick : undefined}
        disabled={disabled || loading}
        className={`relative px-3 py-2 font-semibold text-white text-sm rounded-md transition-all duration-300 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-pink-600 flex items-center justify-center space-x-2 overflow-hidden ${disabled ? "cursor-not-allowed" : "cursor-pointer"}`}
      >
        <span class="relative z-10 flex items-center space-x-2">
          <svg
            class="w-5 h-5 animate-pulse"
            fill="white"
            stroke="currentColor"
            stroke-width="1.8"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
            />
          </svg>

          <span>{loading ? "Thinking..." : "Ask Generate"}</span>
        </span>

        <span class="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30blur-xl opacity-50 animate-pulse"></span>
      </button>
    </div>
  );
};

export default AIButton;
