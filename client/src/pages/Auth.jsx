import { useState, useContext, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import BrandLogo from "../components/BrandLogo";

const Auth = () => {
  const { login, register, user } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  // Determine initial mode from path or default to login
  const [isLogin, setIsLogin] = useState(location.pathname !== "/register");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        await login(email, password);
        navigate("/");
      } else {
        const response = await register(username, email, password);
        setIsLogin(true); // Switch to login after successful registration
        setError(response.message || t("auth.regSuccess"));
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          (isLogin ? "Login failed" : "Registration failed")
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
            <BrandLogo className="w-10 h-10 text-blue-600 drop-shadow-sm" />
            <h1 className="text-4xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent italic tracking-tight">
              {t("brand.name")}
            </h1>
          </div>
          <p className="text-gray-500 font-medium">
            {isLogin ? t("auth.welcomeBack") : t("auth.startJourney")}
          </p>
        </div>

        {error && (
          <div
            className={`mb-6 p-4 rounded-lg text-sm font-medium ${
              error.includes("successful")
                ? "bg-green-50 text-green-600"
                : "bg-red-50 text-red-600"
            }`}
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2 px-1">
                {t("common.username")}
              </label>
              <input
                type="text"
                placeholder="maestro_johann"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-5 py-4 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900"
                required={!isLogin}
              />
            </div>
          )}
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
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 px-1">
              {t("common.password")}
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-4 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all font-medium text-gray-900"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-blue-200 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading
              ? t("common.processing")
              : isLogin
              ? t("auth.signIn")
              : t("auth.createAccount")}
          </button>
        </form>

        <div className="mt-10 text-center">
          <p className="text-gray-600 font-medium">
            {isLogin ? t("auth.noAccount") : t("auth.hasAccount")}
          </p>
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="mt-2 text-blue-600 font-bold hover:text-indigo-700 transition-colors underline decoration-2 underline-offset-4"
          >
            {isLogin ? t("auth.createOne") : t("auth.signInToAcc")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
