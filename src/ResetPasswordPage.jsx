import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Link, useNavigate } from "react-router-dom"; 
import { Eye, EyeOff, Lock, Shield } from "lucide-react";

const API_URL = import.meta.env.VITE_API_URL;

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const passwordPattern =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!formData.newPassword) {
      newErrors.newPassword = "Password is required";
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    } else if (!passwordPattern.test(formData.newPassword)) {
      newErrors.newPassword =
        "Password must include uppercase, lowercase, number, and special character";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setMessage("");
    setErrors({});

    try {
      const response = await fetch(
        `${API_URL}/api/auth/resetPassword?token=${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            newPassword: formData.newPassword,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        setMessage(
          "Password reset successful! You can now sign in with your new password."
        );
        setFormData({ newPassword: "", confirmPassword: "" });
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        setMessage(data.error || data.message || "Failed to reset password");
      }
    } catch (error) {
      console.log(error);
      setMessage("Cannot connect to server. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const EyeIcon = ({ isVisible, onClick }) => (
    <button
      type="button"
      onClick={onClick}
      className="absolute right-3 cursor-pointer top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none transition-colors"
    >
      {isVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
    </button>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {/* Reset Password Card */}
      <div className="w-full max-w-md bg-white/80 backdrop-blur-lg rounded-2xl shadow-xl border border-white/30 p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl mx-auto mb-4 flex items-center justify-center">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Reset Password
          </h2>
          <p className="text-gray-600">Enter your new password</p>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`border px-4 py-3 rounded-lg mb-6 ${
              message.includes("successful")
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {message}
          </div>
        )}

        {/* Form */}
        <div className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="newPassword"
                type={showNewPassword ? "text" : "password"}
                value={formData.newPassword}
                onChange={handleChange}
                autoFocus
                className={`w-full pl-12 pr-12 py-3 bg-white/60 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                  errors.newPassword ? "border-red-300" : "border-gray-200"
                }`}
                placeholder="Enter your new password"
              />
              <EyeIcon
                isVisible={showNewPassword}
                onClick={() => setShowNewPassword(!showNewPassword)}
              />
            </div>
            {errors.newPassword && (
              <p className="text-sm text-red-600 mt-1">{errors.newPassword}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Confirm New Password
            </label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-12 pr-12 py-3 bg-white/60 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${
                  errors.confirmPassword ? "border-red-300" : "border-gray-200"
                }`}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSubmit();
                }}
                placeholder="Confirm your new password"
              />
              <EyeIcon
                isVisible={showConfirmPassword}
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-sm text-red-600 mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 cursor-pointer to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 hover:scale-[1.02] disabled:cursor-not-allowed shadow-lg"
          >
            {isLoading ? "Resetting..." : "Reset Password"}
          </button>

          {/* Back to Login */}
          <div className="text-center mt-4">
            <Link
              to="/login"
              className="text-blue-600 hover:text-blue-700 font-medium text-sm"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
