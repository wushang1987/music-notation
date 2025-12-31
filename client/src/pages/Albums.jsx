import { useEffect, useState } from "react";
import api from "../api";
import AlbumCard from "../components/AlbumCard";
import Pagination from "../components/Pagination";
import { useTranslation } from "react-i18next";

const Albums = () => {
  const { t } = useTranslation();

  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchAlbums = async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (search) params.append("search", search);
        params.append("page", page);
        params.append("limit", 12);
        params.append("sortBy", "date");
        params.append("order", "desc");

        const { data } = await api.get(`/albums?${params.toString()}`);
        if (Array.isArray(data)) {
          setAlbums(data);
          setTotalPages(1);
        } else {
          setAlbums(data.albums || []);
          setTotalPages(data.totalPages || 1);
          setPage(data.page || 1);
        }
      } catch (err) {
        console.error("Failed to fetch albums", err);
      } finally {
        setLoading(false);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchAlbums();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [search, page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {t("albums.sectionTitle")}
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
              placeholder={t("albums.searchPlaceholder")}
              value={search}
              onChange={handleSearchChange}
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-100">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : albums.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t("albums.noAlbums")}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t("albums.noAlbumsDesc")}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
            {albums.map((album) => (
              <AlbumCard key={album._id} album={album} />
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
  );
};

export default Albums;
