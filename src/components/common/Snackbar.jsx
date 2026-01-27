import { Check, XCircle } from "lucide-react";

const Snackbar = ({
  open,
  message,
  type = "success",
}) => {
  if (!open) return null;

  const isSuccess = type === "success";

  return (
    <div
      className={`fixed bottom-6 left-6 flex items-center gap-2 px-4 py-3 rounded-lg shadow-md transition-all animate-fade-in-up z-50
        ${
          isSuccess
            ? "bg-green-50 border border-green-200 text-green-700"
            : "bg-red-50 border border-red-200 text-red-700"
        }
      `}
    >
      {isSuccess ? (
        <Check className="w-5 h-5 text-green-600" />
      ) : (
        <XCircle className="w-5 h-5 text-red-600" />
      )}

      <p className="text-sm font-medium">{message}</p>
    </div>
  );
};

export default Snackbar;