import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import BrandLogo from "../components/BrandLogo";

const ForgotPassword = () => {
  const { forgotPassword } = useContext(AuthContext);
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);
    try {
      const response = await forgotPassword(email);
      setMessage(response.message || "Reset link sent to your email.");
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to send reset link. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-2xl p-10 transform transition-all duration-500">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-2">
            <BrandLogo className="w-10 h-10 text-blue-600" />
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic tracking-tight">
              {t("brand.name")}
            </h1>
          </div>
          <p className="text-gray-500 font-medium">
            Reset your password
          </p>
        </div>

        {error && (
          <div className="mb-6 p-4 rounded-lg text-sm font-medium bg-red-50 text-red-600">
            {error}
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 rounded-lg text-sm font-medium bg-green-50 text-green-600">
            {message}
          </div>
        )}

        {!message ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1">
                {t("common.email")}
              </label>
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t("common.processing") : "Send Reset Link"}
            </button>
          </form>
        ) : (
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Please check your email for the password reset link.
            </p>
          </div>
        )}

        <div className="mt-10 text-center border-t pt-6">
          <Link
            to="/auth"
            className="text-blue-600 font-bold hover:text-indigo-700 transition-colors underline decoration-2 underline-offset-4"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
