import { useEffect, useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import Pagination from "../components/Pagination";
import ScoreCard from "../components/ScoreCard";
import HeroSection from "../components/HeroSection";
import { useTranslation } from "react-i18next";

const Home = ({ title, endpoint = "/scores" }) => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const displayTitle = title ? t(title) : t("home.title");
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");

  const handleDelete = async (id) => {
    if (!window.confirm(t("score.deleteConfirm"))) return;
    try {
      await api.delete(`/scores/${id}`);
      setScores(scores.filter((s) => s._id !== id));
    } catch (err) {
      console.error("Failed to delete score", err);
      alert("Error deleting score");
    }
  };

  useEffect(() => {
    const fetchScores = async () => {
      setLoading(true);
      try {
        // Add query parameters for search and pagination
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        params.append("page", page);
        params.append("limit", 12);
        params.append("sortBy", sortBy);
        params.append("order", order);

        const { data } = await api.get(`${endpoint}?${params.toString()}`);

        // Handle both old array response and new paginated object response
        if (Array.isArray(data)) {
          setScores(data);
          setTotalPages(1);
          setTotal(data.length);
        } else {
          setScores(data.scores);
          setTotalPages(data.totalPages);
          setTotal(data.total);
          setPage(data.page);
        }
      } catch (err) {
        console.error("Failed to fetch scores", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchScores();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [endpoint, search, page, sortBy, order]);

  // Reset page when search changes
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  if (loading && page === 1 && !search)
    return (
      <div className="p-8 text-center text-gray-500">{t("common.loading")}</div>
    );

  return (
    <div className={user ? "" : "bg-gray-50"}>
      {/* Hero section for non-logged-in users */}
      {!user && <HeroSection />}

      <div id="trending-section" className="p-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {displayTitle}
          </h1>

          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t("common.search")}
                value={search}
                onChange={handleSearchChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
              />
            </div>
            <label className="sr-only">{t("home.sortBy")}</label>
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
              title={t("home.sortBy")}
            >
              <option value="date">{t("home.sort.date")}</option>
              <option value="likes">{t("home.sort.likes")}</option>
              <option value="views">{t("home.sort.views")}</option>
            </select>
            <label className="sr-only">{t("home.order")}</label>
            <select
              value={order}
              onChange={(e) => {
                setOrder(e.target.value);
                setPage(1);
              }}
              className="pl-3 pr-8 py-2 border border-gray-300 rounded-lg leading-5 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
              title={t("home.order")}
            >
              <option value="desc">{t("home.orderLabels.desc")}</option>
              <option value="asc">{t("home.orderLabels.asc")}</option>
            </select>
          </div>
        </div>

        {loading && scores.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : scores.length === 0 ? (
          <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1"
                d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {t("common.noScores")}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {t("common.noScoresDesc")}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
              {scores.map((score) => (
                <ScoreCard
                  key={score._id}
                  score={score}
                  user={user}
                  onDelete={handleDelete}
                />
              ))}
            </div>

            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Home;
