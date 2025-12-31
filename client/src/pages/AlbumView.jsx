import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const AlbumView = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const { t } = useTranslation();

  const [album, setAlbum] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlbum = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/albums/${id}`);
        setAlbum(data);
      } catch (err) {
        console.error("Failed to fetch album", err);
        alert(t("albums.loadFailed"));
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id, navigate, t]);

  if (loading) {
    return <div className="p-8 text-center">{t("common.loading")}</div>;
  }

  if (!album) return null;

  const ownerId =
    typeof album.owner === "object" && album.owner?._id
      ? album.owner._id
      : album.owner;
  const isOwnerOrAdmin =
    user &&
    (user.role === "admin" ||
      (ownerId && (ownerId === user.id || ownerId === user._id)));

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="w-full md:w-1/3">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {album.coverUrl ? (
              <img
                src={album.coverUrl}
                alt={album.title}
                className="w-full h-80 object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <div className="w-full h-80 flex items-center justify-center text-gray-400 text-sm bg-gray-50">
                {t("albums.noCover")}
              </div>
            )}
          </div>
        </div>

        <div className="w-full md:w-2/3">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <h1
                className="text-2xl font-bold text-gray-900 truncate"
                title={album.title}
              >
                {album.title}
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                {t("score.by")}: {album.owner?.username || "Anonymous"}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-2 py-1 text-xs rounded border ${
                  album.isPublic
                    ? "bg-blue-50 text-blue-600 border-blue-100"
                    : "bg-gray-100 text-gray-600 border-gray-200"
                }`}
              >
                {album.isPublic ? t("albums.public") : t("albums.private")}
              </span>
              {isOwnerOrAdmin && (
                <Link
                  to={`/albums/edit/${album._id}`}
                  className="px-3 py-2 rounded-lg text-sm font-medium bg-amber-50 text-amber-700 border border-amber-100 hover:bg-amber-100"
                >
                  {t("common.edit")}
                </Link>
              )}
            </div>
          </div>

          <div className="mt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              {t("albums.tracks")}
            </h2>

            {Array.isArray(album.scores) && album.scores.length > 0 ? (
              <div className="bg-white border rounded-lg overflow-hidden">
                <ul className="divide-y">
                  {album.scores.map((s) => (
                    <li
                      key={s._id}
                      className="p-4 flex items-center justify-between gap-4"
                    >
                      <div className="min-w-0">
                        <div
                          className="font-medium text-gray-900 truncate"
                          title={s.title}
                        >
                          {s.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {s.owner?.username || "Anonymous"}
                        </div>
                      </div>
                      <Link
                        to={`/score/${s._id}`}
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        {t("common.view")}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
                {t("albums.noTracks")}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AlbumView;
