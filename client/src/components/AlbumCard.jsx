import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const AlbumCard = ({ album }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const handleClick = () => {
    navigate(`/album/${album._id}`);
  };

  return (
    <div
      onClick={handleClick}
      className="group transition-all duration-300 flex flex-col overflow-hidden cursor-pointer active:scale-[0.98]"
    >
      <div className="relative bg-gradient-to-b from-gray-100 to-gray-50">
        <div className="bg-white rounded-sm shadow-lg border border-gray-300 h-55 overflow-hidden">
          {album.coverUrl ? (
            <img
              src={album.coverUrl}
              alt={album.title}
              className="w-full h-[280px] object-cover"
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <div className="w-full h-[280px] flex items-center justify-center text-gray-400 text-sm">
              {t("albums.noCover")}
            </div>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <span
            className={`px-2 py-1 text-xs rounded border ${
              album.isPublic
                ? "bg-blue-50 text-blue-600 border-blue-100"
                : "bg-gray-100 text-gray-600 border-gray-200"
            }`}
          >
            {album.isPublic ? t("albums.public") : t("albums.private")}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h2
          className="text-sm mb-2 text-gray-900 truncate group-hover:text-blue-600 transition-colors"
          title={album.title}
        >
          {album.title}
        </h2>

        <p className="text-gray-500 mb-4 text-sm flex items-center gap-1.5 font-medium">
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <span>{album.owner?.username || "Anonymous"}</span>
        </p>

        <div className="flex items-center justify-end gap-2">
          <span
            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
            title={t("albums.trackCount")}
            onClick={(e) => e.stopPropagation()}
          >
            {album.scores?.length || 0}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AlbumCard;
