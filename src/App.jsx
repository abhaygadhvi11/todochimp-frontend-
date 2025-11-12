import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import LoginPage from "./Loginpage";
import SignupPage from "./SignupPage";
import ForgotPasswordPage from "./ForgotPasswordPage";
import ResetPasswordPage from "./ResetPasswordPage";
import DashboardPage from "./DashboardPage";
import TaskDetailScreen from "./TaskdetailsPage";
import TaskFormPage from "./TaskFormPage";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<LoginPage />} />

        <Route path="/signup" element={<SignupPage />} />

        <Route path="/forgotPassword" element={<ForgotPasswordPage />} />

        <Route path="/resetPassword" element={<ResetPasswordPage />} />

        <Route path="/dashboard" element={<DashboardPage />} />

        <Route path="/tasks/:taskId" element={<TaskDetailScreen />} />

        <Route path="/tasks/create" element={<TaskFormPage mode="create" />} />
        
        <Route path="/tasks/:taskId/edit" element={<TaskFormPage mode="edit" />} />
      </Routes>
    </Router>
  );
}
