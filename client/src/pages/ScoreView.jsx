import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import abcjs from "abcjs";
import "abcjs/abcjs-audio.css";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";
import {
  ensureMidiProgram,
  getInstrumentOption,
  generateMultiPartAbc,
} from "../utils/abcMidi";

const ScoreView = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [score, setScore] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { user } = useContext(AuthContext);
  const [hoverRating, setHoverRating] = useState(0);
  const [myRating, setMyRating] = useState(0);

  const [myAlbums, setMyAlbums] = useState([]);
  const [albumsLoading, setAlbumsLoading] = useState(false);
  const [selectedAlbumId, setSelectedAlbumId] = useState("");
  const [albumActionStatus, setAlbumActionStatus] = useState({
    type: "",
    message: "",
  });

  useEffect(() => {
    const fetchScoreAndComments = async () => {
      try {
        const scoreRes = await api.get(`/scores/${id}`);
        setScore(scoreRes.data);
        // initialize myRating from server data if available
        const me = user;
        if (me && scoreRes.data?.ratings?.length) {
          const r = scoreRes.data.ratings.find(
            (x) =>
              x.user === me.id ||
              x.user === me._id ||
              x.user?._id === me.id ||
              x.user?._id === me._id
          );
          setMyRating(r ? r.value : 0);
        } else {
          setMyRating(0);
        }
        const commentsRes = await api.get(`/comments/${id}`);
        setComments(commentsRes.data);
      } catch (err) {
        console.error("Failed to load score data", err);
      }
    };
    fetchScoreAndComments();
  }, [id, user]);

  useEffect(() => {
    if (!user) {
      setMyAlbums([]);
      setSelectedAlbumId("");
      setAlbumActionStatus({ type: "", message: "" });
      return;
    }

    const fetchMyAlbums = async () => {
      setAlbumsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", 1);
        params.append("limit", 200);
        params.append("sortBy", "date");
        params.append("order", "desc");

        const { data } = await api.get(`/albums?${params.toString()}`);
        const albums = Array.isArray(data) ? data : data?.albums;

        const myId = user?.id || user?._id;
        const owned = (Array.isArray(albums) ? albums : []).filter((a) => {
          const ownerId =
            typeof a?.owner === "object" && a?.owner
              ? a.owner._id || a.owner.id
              : a?.owner;
          return myId && ownerId && ownerId.toString() === myId.toString();
        });

        setMyAlbums(owned);
        if (owned.length > 0 && !selectedAlbumId) {
          setSelectedAlbumId(owned[0]._id);
        }
      } catch (err) {
        console.error("Failed to load albums", err);
        setMyAlbums([]);
      } finally {
        setAlbumsLoading(false);
      }
    };

    fetchMyAlbums();
  }, [user]);

  const handleAddToAlbum = async () => {
    if (!user) {
      setAlbumActionStatus({
        type: "error",
        message: t("albums.addToAlbumLoginRequired"),
      });
      return;
    }
    if (!selectedAlbumId) return;

    const album = (myAlbums || []).find((a) => a?._id === selectedAlbumId);
    const scoreId = id;
    const ids = Array.isArray(album?.scores) ? album.scores : [];
    const alreadyInAlbum = ids.some((x) => x?.toString?.() === scoreId);
    const isFull = !alreadyInAlbum && ids.length >= 20;

    if (isFull) {
      setAlbumActionStatus({
        type: "error",
        message: t("albums.maxScoresReached", { count: 20 }),
      });
      return;
    }

    try {
      setAlbumActionStatus({ type: "", message: "" });
      await api.put(`/albums/${selectedAlbumId}/scores/${scoreId}`);
      setAlbumActionStatus({
        type: "success",
        message: t("albums.addToAlbumSuccess"),
      });

      // Refresh albums so counts/full state stay accurate
      const params = new URLSearchParams();
      params.append("page", 1);
      params.append("limit", 200);
      params.append("sortBy", "date");
      params.append("order", "desc");
      const { data } = await api.get(`/albums?${params.toString()}`);
      const albums = Array.isArray(data) ? data : data?.albums;
      const myId = user?.id || user?._id;
      const owned = (Array.isArray(albums) ? albums : []).filter((a) => {
        const ownerId =
          typeof a?.owner === "object" && a?.owner
            ? a.owner._id || a.owner.id
            : a?.owner;
        return myId && ownerId && ownerId.toString() === myId.toString();
      });
      setMyAlbums(owned);
    } catch (err) {
      const message = err?.response?.data?.message || "";
      if (message.toLowerCase().includes("at most 20")) {
        setAlbumActionStatus({
          type: "error",
          message: t("albums.maxScoresReached", { count: 20 }),
        });
      } else {
        setAlbumActionStatus({
          type: "error",
          message: t("albums.addToAlbumFailed"),
        });
      }
    }
  };

  const [activeTab, setActiveTab] = useState("notation");

  useEffect(() => {
    if (score && activeTab === "notation") {
      let effectiveAbc;
      if (score.parts && score.parts.length > 0) {
        effectiveAbc = generateMultiPartAbc(score.parts);
      } else {
        effectiveAbc = ensureMidiProgram(
          score.content,
          typeof score.instrumentProgram === "number"
            ? score.instrumentProgram
            : 0
        );
      }

      const visualObj = abcjs.renderAbc("paper", effectiveAbc, {
        responsive: "resize",
        oneSvgPerLine: true,
        paddingtop: 20,
        paddingbottom: 20,
        paddingright: 20,
        paddingleft: 20,
        add_classes: true,
      })[0];

      if (abcjs.synth.supportsAudio()) {
        const synthControl = new abcjs.synth.SynthController();

        const cursorControl = {
          onStart: () => {
            console.log("onStart");
            const els = document.querySelectorAll(".highlight");
            els.forEach((el) => el.classList.remove("highlight"));
          },
          onEvent: (ev) => {
            const els = document.querySelectorAll(".highlight");
            els.forEach((el) => el.classList.remove("highlight"));

            if (ev && ev.elements) {
              ev.elements.forEach((item) => {
                if (Array.isArray(item) || item instanceof NodeList) {
                  Array.from(item).forEach((subEl) => {
                    if (subEl && subEl.classList) {
                      subEl.classList.add("highlight");
                    }
                  });
                } else if (item && item.classList) {
                  item.classList.add("highlight");
                }
              });
            }
          },
          onFinished: () => {
            console.log("onFinished");
            const els = document.querySelectorAll(".highlight");
            els.forEach((el) => el.classList.remove("highlight"));
          },
        };

        synthControl.load("#audio", cursorControl, {
          displayLoop: true,
          displayRestart: true,
          displayPlay: true,
          displayProgress: true,
          displayWarp: true,
        });

        const createSynth = new abcjs.synth.CreateSynth();
        createSynth
          .init({ visualObj: visualObj })
          .then(() => {
            synthControl.setTune(visualObj, false);
          })
          .catch((error) => {
            console.warn("Audio problem:", error);
          });
      } else {
        const audioEl = document.querySelector("#audio");
        if (audioEl)
          audioEl.innerHTML = `<div class='text-red-500'>${t(
            "score.notSupported"
          )}</div>`;
      }
    }
  }, [score, activeTab, t]);

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const { data } = await api.post("/comments", {
        content: newComment,
        scoreId: id,
      });
      setComments([data, ...comments]);
      setNewComment("");
    } catch (err) {
      alert(t("score.postCommentFailed") || "Failed to post comment");
    }
  };

  const handleLike = async () => {
    if (!user) {
      alert("Please login to like this score.");
      return;
    }

    try {
      const { data } = await api.put(`/scores/${id}/like`);
      setScore((prev) => ({ ...prev, likes: data }));
    } catch (err) {
      console.error("Failed to toggle like", err);
      alert("Failed to update like status");
    }
  };

  const hasLiked =
    user && score?.likes?.some((uid) => uid === user.id || uid === user._id);

  const avgRating = (() => {
    const arr = score?.ratings || [];
    if (!arr.length) return 0;
    return arr.reduce((sum, r) => sum + (r.value || 0), 0) / arr.length;
  })();

  const handleRate = async (value) => {
    if (!user) {
      alert(t("score.loginToRate") || "Please login to rate this score.");
      return;
    }
    try {
      const { data } = await api.put(`/scores/${id}/rate`, { value });
      setScore((prev) => ({ ...prev, ratings: data }));
      setMyRating(value);
    } catch (err) {
      console.error("Failed to rate score", err);
      alert(t("score.rateFailed") || "Failed to submit rating");
    }
  };

  if (!score)
    return (
      <div className="p-10 text-center font-bold">{t("common.loading")}</div>
    );

  const instrumentOption = getInstrumentOption(score.instrumentProgram);

  return (
    <div className="container mx-auto p-4 flex flex-col gap-6">
      <div className="w-full">
        <div className="bg-white  overflow-hidden mb-6">
          <div className="p-4 sm:p-6 border-b border-gray-100 no-print">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 leading-tight">
                  {score.title}
                </h1>
                <p className="text-gray-500 flex items-center">
                  <svg
                    className="w-4 h-4 mr-1"
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
                  {t("score.by")}{" "}
                  <span className="font-medium text-gray-800 ml-1">
                    {score.owner?.username || "Music Notation"}
                  </span>
                </p>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-auto sm:items-end">
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  {/* Rating control (non-button style container) */}
                  <div
                    className="flex items-center gap-2 text-gray-600"
                    title={t("score.rating")}
                  >
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((n) =>
                        (() => {
                          const isOn = (hoverRating || myRating) >= n;
                          return (
                            <button
                              key={n}
                              type="button"
                              className="p-0.5"
                              onMouseEnter={() => setHoverRating(n)}
                              onMouseLeave={() => setHoverRating(0)}
                              onClick={() => handleRate(n)}
                            >
                              <svg
                                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                                  isOn ? "text-amber-500" : "text-gray-300"
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                aria-hidden="true"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.809c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            </button>
                          );
                        })()
                      )}
                    </div>
                    <span className="text-sm font-semibold text-gray-700">
                      {avgRating ? avgRating.toFixed(1) : "0.0"}
                    </span>
                  </div>

                  <div
                    className="flex items-center gap-1.5 text-gray-600"
                    title={t("score.views")}
                  >
                    <svg
                      className="w-4 h-4 text-blue-500"
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
                    <span className="font-semibold">{score.views || 0}</span>
                  </div>

                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 transition-colors ${
                      hasLiked
                        ? "text-red-500"
                        : "text-gray-600 hover:text-red-500"
                    }`}
                    title={hasLiked ? "Unlike" : "Like"}
                  >
                    {hasLiked ? (
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                        aria-hidden="true"
                      >
                        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    )}
                    <span className="font-semibold">
                      {score.likes?.length || 0}
                    </span>
                  </button>

                  {user &&
                    (user.role === "admin" ||
                      (score.owner &&
                        ((typeof score.owner === "object" &&
                          (score.owner._id === user.id ||
                            score.owner._id === user._id)) ||
                          (typeof score.owner === "string" &&
                            (score.owner === user.id ||
                              score.owner === user._id))))) && (
                      <Link
                        to={`/edit/${id}`}
                        className="flex items-center gap-1.5 text-amber-600 hover:text-amber-700 transition-colors"
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
                        <span className="text-sm font-semibold">
                          {t("common.edit")}
                        </span>
                      </Link>
                    )}
                </div>

                <div className="w-full sm:w-auto">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-md border bg-white border-gray-200 text-gray-600 hover:bg-gray-50 shadow-sm transition-all duration-200"
                    title={t("common.print") || "Print"}
                  >
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                      />
                    </svg>
                    <span className="font-semibold text-sm">
                      {t("common.print") || "Print"}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Audio Player - Moved to top */}
            <div
              id="audio"
              className="mt-6 mb-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm no-print"
            ></div>

            <div className="-mt-2 mb-4 text-sm text-gray-600 no-print">
              <span className="font-semibold text-gray-700">
                {t("score.instrument")}:
              </span>
              <span>{t(instrumentOption.i18nKey)}</span>
            </div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-100 -mb-6 mt-4 no-print">
              <button
                onClick={() => setActiveTab("notation")}
                className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
                  activeTab === "notation"
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("score.musicalNotation")}
                {activeTab === "notation" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
                )}
              </button>
              <button
                onClick={() => setActiveTab("abc")}
                className={`px-6 py-3 text-sm font-semibold transition-colors relative ${
                  activeTab === "abc"
                    ? "text-blue-600"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t("score.abcSource")}
                {activeTab === "abc" && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600 rounded-t-full"></div>
                )}
              </button>
            </div>
          </div>

          <div className="p-0 md:p-6">
            {/* Notation Tab Content - always render but hide when not active */}
            <div
              className={activeTab === "notation" ? "animate-fadeIn" : "hidden"}
            >
              <div
                id="paper"
                className="w-full overflow-x-auto min-h-100 md:rounded-md md:shadow-sm md:border md:border-gray-100"
              ></div>
            </div>

            {/* ABC Tab Content */}
            {activeTab === "abc" && (
              <div className="animate-fadeIn">
                <div className="relative">
                  <div className="absolute top-2 right-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-50">
                    ABC Notation
                  </div>
                  <pre className="bg-gray-900 text-gray-100 p-6 rounded-lg overflow-x-auto font-mono text-sm leading-relaxed shadow-inner">
                    {score.content}
                  </pre>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Details (shown under score, above comments) */}
        <div className="w-full no-print">
          <div className="bg-white p-4 shadow rounded">
            <h3 className="font-bold mb-2">{t("score.details")}</h3>
            <p>
              {t("score.created")}:{" "}
              {new Date(score.createdAt).toLocaleDateString()}
            </p>
            <p>
              {t("score.visibility")}:{" "}
              {score.isPublic ? t("score.public") : t("score.private")}
            </p>
            <p>
              {t("score.views")}: {score.views || 0}
            </p>
            {Array.isArray(score.tags) && score.tags.length > 0 && (
              <div className="mt-2">
                <p className="mb-2">{t("score.tags")}</p>
                <div className="flex flex-wrap gap-2">
                  {score.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 text-xs bg-blue-50 text-blue-600 border border-blue-100 rounded"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user ? (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="font-semibold mb-2">
                  {t("albums.addToAlbum")}
                </div>

                {albumsLoading ? (
                  <div className="text-sm text-gray-500">
                    {t("common.loading")}
                  </div>
                ) : myAlbums.length === 0 ? (
                  <div className="text-sm text-gray-600">
                    <div className="mb-2">{t("albums.noMyAlbums")}</div>
                    <Link
                      to="/albums/create"
                      className="text-blue-600 hover:underline"
                    >
                      {t("nav.newAlbum")}
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <select
                      className="w-full border p-2 rounded"
                      value={selectedAlbumId}
                      onChange={(e) => {
                        setSelectedAlbumId(e.target.value);
                        setAlbumActionStatus({ type: "", message: "" });
                      }}
                    >
                      {myAlbums.map((a) => {
                        const ids = Array.isArray(a?.scores) ? a.scores : [];
                        const already = ids.some((x) => x?.toString?.() === id);
                        const full = !already && ids.length >= 20;
                        const suffix = full
                          ? ` (${t("albums.albumFull", { count: 20 })})`
                          : "";
                        return (
                          <option key={a._id} value={a._id} disabled={full}>
                            {a.title} ({ids.length}/20){suffix}
                          </option>
                        );
                      })}
                    </select>

                    <button
                      type="button"
                      onClick={handleAddToAlbum}
                      disabled={!selectedAlbumId || albumsLoading}
                      className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
                    >
                      {t("albums.add")}
                    </button>

                    {albumActionStatus.message ? (
                      <div
                        className={
                          albumActionStatus.type === "success"
                            ? "text-sm text-green-600"
                            : "text-sm text-red-600"
                        }
                      >
                        {albumActionStatus.message}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded no-print">
          <h3 className="text-xl font-bold mb-4">{t("score.comments")}</h3>
          {user ? (
            <form onSubmit={handleCommentSubmit} className="mb-6">
              <textarea
                className="w-full p-2 border rounded mb-2"
                rows="3"
                placeholder={t("score.addComment")}
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
              ></textarea>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                {t("score.postComment")}
              </button>
            </form>
          ) : (
            <p className="mb-4 text-gray-600">{t("score.loginToComment")}</p>
          )}

          <div className="space-y-4">
            {comments.map((comment) => (
              <div key={comment._id} className="bg-white p-3 rounded shadow-sm">
                <p className="font-bold text-sm mb-1">
                  {comment.user.username}{" "}
                  <span className="text-gray-400 font-normal text-xs">
                    {new Date(comment.createdAt).toLocaleDateString()}
                  </span>
                </p>
                <p>{comment.content}</p>
              </div>
            ))}
            {comments.length === 0 && (
              <p className="text-gray-500 italic">{t("score.noComments")}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScoreView;
