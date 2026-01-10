import { useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import abcjs from "abcjs";
import { useTranslation } from "react-i18next";
import VerovioService from "../services/VerovioService";

const ScoreCard = ({ score, user, onDelete }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const paperRef = useRef(null);

  useEffect(() => {
    if (paperRef.current && score.content) {
      const renderPreview = async () => {
        try {
          if (score.notationType === "verovio") {
            await VerovioService.init();
            const svg = VerovioService.render(score.content, {
              scale: 15,
              pageWidth: 1000,
              pageHeight: 1500,
              adjustPageHeight: true,
            });
            if (paperRef.current) {
              paperRef.current.innerHTML = svg;
            }
          } else {
            abcjs.renderAbc(paperRef.current, score.content, {
              responsive: "resize",
              scale: 1,
              paddingtop: 10,
              paddingbottom: 10,
              paddingright: 10,
              paddingleft: 10,
              staffwidth: 400,
              add_classes: true,
            });
          }
        } catch (err) {
          console.error("Failed to render notation preview", err);
        }
      };
      renderPreview();
    }
  }, [score.content, score.notationType]);


  const isOwnerOrAdmin =
    user &&
    (user.role === "admin" ||
      (score.owner &&
        ((typeof score.owner === "object" &&
          (score.owner._id === user.id || score.owner._id === user._id)) ||
          (typeof score.owner === "string" &&
            (score.owner === user.id || score.owner === user._id)))));

  const isAdmin = user && user.role === "admin";

  const handleCardClick = () => {
    navigate(`/score/${score._id}`);
  };

  return (
    <div
      onClick={handleCardClick}
      className="group  transition-all duration-300 flex flex-col overflow-hidden cursor-pointer active:scale-[0.98]"
    >
      {/* Music Notation Paper - Prominent Display */}
      <div className="relative bg-gradient-to-b from-gray-100 to-gray-50">
        <div className="bg-white rounded-sm shadow-lg border border-gray-300 h-55 overflow-hidden p-2">
          <div
            ref={paperRef}
            className="w-full min-h-[280px] p-4 pointer-events-none"
          ></div>
        </div>
      </div>

      {/* Content Below the Paper */}
      <div className="p-4 flex flex-col flex-1">
        <h2
          className="text-sm  mb-2 text-gray-900 truncate group-hover:text-blue-600 transition-colors"
          title={score.title}
        >
          {score.title}
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
          <span>{score.owner?.username || "Anonymous"}</span>
        </p>

        <div className="flex flex-wrap items-center justify-end gap-1 sm:gap-2">
          {/* Rating badge */}
          <span
            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded whitespace-nowrap"
            title={t("score.rating")}
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              className="w-3.5 h-3.5 mr-1 inline-block align-text-bottom text-amber-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.809c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {(() => {
              const arr = score.ratings || [];
              if (!arr.length) return "0.0";
              const avg =
                arr.reduce((s, r) => s + (r.value || 0), 0) / arr.length;
              return avg.toFixed(1);
            })()}
          </span>
          <span
            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded whitespace-nowrap"
            title={t("score.likes")}
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              className="w-3.5 h-3.5 mr-1 inline-block align-text-bottom text-red-500"
              fill="currentColor"
              viewBox="0 0 20 20"
              aria-hidden="true"
            >
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
            </svg>
            {score.likes?.length || 0}
          </span>
          <span
            className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded whitespace-nowrap"
            title={t("score.views")}
            onClick={(e) => e.stopPropagation()}
          >
            <svg
              className="w-3.5 h-3.5 mr-1 inline-block align-text-bottom text-blue-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
            {score.views || 0}
          </span>
          {isOwnerOrAdmin && (
            <Link
              to={`/edit/${score._id}`}
              onClick={(e) => e.stopPropagation()}
              className="p-2 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-100 transition-colors border border-amber-100 active:scale-95"
              title={t("common.edit")}
            >
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
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </Link>
          )}

          {isAdmin && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete(score._id);
              }}
              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors border border-red-100 active:scale-95"
              title={t("common.delete")}
            >
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
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          )}
        </div>

        {Array.isArray(score.tags) && score.tags.length > 0 && (
          <div
            className="flex flex-wrap gap-2 mt-3"
            onClick={(e) => e.stopPropagation()}
          >
            {score.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded"
              >
                #{tag}
              </span>
            ))}
            {score.tags.length > 3 && (
              <span className="px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded">
                +{score.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoreCard;
