import { useEffect, useState, useContext } from "react";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import Pagination from "../components/Pagination";
import ScoreCard from "../components/ScoreCard";
import AlbumCard from "../components/AlbumCard";
import HeroSection from "../components/HeroSection";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

const Home = ({ title, endpoint = "/scores" }) => {
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();
  const location = useLocation();
  const displayTitle = title ? t(title) : t("home.title");
  const showAlbums = endpoint === "/scores";
  const [scores, setScores] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState("date");
  const [order, setOrder] = useState("desc");
  const [tagsInput, setTagsInput] = useState("");
  const [tagsApplied, setTagsApplied] = useState("");

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
        // Add query parameters for search, tags and pagination
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        if (tagsApplied) params.append("tags", tagsApplied);
        params.append("page", page);
        params.append("limit", 12);
        params.append("sortBy", sortBy);
        params.append("order", order);

        const { data } = await api.get(`${endpoint}?${params.toString()}`);

        // Handle both old array response and new paginated object response
        if (Array.isArray(data)) {
          setScores(data);
          setTotalPages(1);
        } else {
          setScores(data.scores);
          setTotalPages(data.totalPages);
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
  }, [endpoint, search, tagsApplied, page, sortBy, order]);

  useEffect(() => {
    const fetchAlbums = async () => {
      if (!showAlbums) {
        setAlbums([]);
        setAlbumsLoading(false);
        return;
      }
      setAlbumsLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        params.append("page", 1);
        params.append("limit", 8);
        params.append("sortBy", "date");
        params.append("order", "desc");

        const { data } = await api.get(`/albums?${params.toString()}`);
        const nextAlbums = Array.isArray(data) ? data : data.albums;
        setAlbums(Array.isArray(nextAlbums) ? nextAlbums : []);
      } catch (err) {
        console.error("Failed to fetch albums", err);
      } finally {
        setAlbumsLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchAlbums();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, showAlbums]);

  useEffect(() => {
    if (!showAlbums) return;
    if (location.hash !== "#albums") return;
    const el = document.getElementById("albums");
    if (el) el.scrollIntoView();
  }, [location.hash, showAlbums]);

  // Reset page when search changes
  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  const handleTagsChange = (e) => {
    setTagsInput(e.target.value);
    setPage(1);
  };

  const applyTagsFilter = () => {
    setTagsApplied(tagsInput);
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
            <div className="relative w-full md:w-80">
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
                    d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                  />
                </svg>
              </div>
              <input
                type="text"
                placeholder={t("home.filter.tagsPlaceholder", {
                  defaultValue: "Filter by tags",
                })}
                value={tagsInput}
                onChange={handleTagsChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    applyTagsFilter();
                  }
                }}
                className="block w-full pl-10 pr-20 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
                title={t("home.filter.tags", { defaultValue: "Tags" })}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 gap-1">
                {tagsInput && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        setTagsInput("");
                        setTagsApplied("");
                        setPage(1);
                      }}
                      className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                      title={t("home.filter.clear", { defaultValue: "Clear" })}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                    <div className="h-4 w-px bg-gray-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={applyTagsFilter}
                      className="p-1 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-50"
                      title={t("home.filter.apply", { defaultValue: "Apply" })}
                    >
                      <svg
                        className="h-4 w-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
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
              <option value="rating">{t("home.sort.rating")}</option>
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

        {/* Albums (homepage only) */}
        {showAlbums && (
          <div id="albums" className="mb-10">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                {t("albums.sectionTitle")}
              </h2>
            </div>
            {albumsLoading ? (
              <div className="flex items-center justify-center min-h-30">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : albums.length === 0 ? (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center">
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  {t("albums.noAlbums")}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {t("albums.noAlbumsDesc")}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {albums.map((album) => (
                  <AlbumCard key={album._id} album={album} />
                ))}
              </div>
            )}
          </div>
        )}

        {loading && scores.length === 0 ? (
          <div className="flex items-center justify-center min-h-100">
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
