import { useEffect, useState, useContext } from "react";
import { useParams, Link } from "react-router-dom";
import abcjs from "abcjs";
import "abcjs/abcjs-audio.css";
import api from "../api";
import { AuthContext } from "../context/AuthContext";
import { useTranslation } from "react-i18next";

const ScoreView = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const [score, setScore] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const { user } = useContext(AuthContext);
  const [hoverRating, setHoverRating] = useState(0);
  const [myRating, setMyRating] = useState(0);

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

  const [activeTab, setActiveTab] = useState("notation");

  useEffect(() => {
    if (score && activeTab === "notation") {
      const visualObj = abcjs.renderAbc("paper", score.content, {
        responsive: "resize",
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

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-2/3">
        <div className="bg-white  overflow-hidden mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-1">
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
              <div className="flex items-center gap-2">
                {/* Rating control */}
                <div
                  className="flex items-center gap-2 px-4 py-2 rounded-md border bg-white border-gray-200 text-gray-600 shadow-sm"
                  title={t("score.rating")}
                >
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className="text-lg"
                        onMouseEnter={() => setHoverRating(n)}
                        onMouseLeave={() => setHoverRating(0)}
                        onClick={() => handleRate(n)}
                      >
                        {(hoverRating || myRating) >= n ? "⭐" : "☆"}
                      </button>
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-gray-700">
                    {avgRating ? avgRating.toFixed(1) : "0.0"}
                  </span>
                </div>
                <span
                  className="flex items-center gap-2 px-4 py-2 rounded-md border bg-white border-gray-200 text-gray-600 shadow-sm"
                  title={t("score.views")}
                >
                  <span className="text-base">👁</span>
                  <span className="font-bold">{score.views || 0}</span>
                </span>
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
                      className="flex items-center gap-2 px-4 py-2 rounded-md border border-amber-200 bg-amber-50 text-amber-600 hover:bg-amber-100 transition-all duration-200 shadow-sm"
                      title={t("common.edit")}
                    >
                      <svg
                        className="w-5 h-5"
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
                      <span className="font-semibold text-sm">
                        {t("common.edit")}
                      </span>
                    </Link>
                  )}
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-2 px-4 py-2 rounded-md border transition-all duration-200 ${
                    hasLiked
                      ? "bg-red-50 border-red-200 text-red-500 shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
                  }`}
                  title={hasLiked ? "Unlike" : "Like"}
                >
                  <span className="text-lg">{hasLiked ? "❤️" : "🤍"}</span>
                  <span className="font-bold">{score.likes?.length || 0}</span>
                </button>
              </div>
            </div>

            {/* Audio Player - Moved to top */}
            <div
              id="audio"
              className="mt-6 mb-4 bg-white p-5 rounded-lg border border-gray-200 shadow-sm"
            ></div>

            {/* Tabs Navigation */}
            <div className="flex border-b border-gray-100 -mb-6 mt-4">
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

        <div className="bg-gray-50 p-4 rounded">
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

      <div className="w-full md:w-1/3">
        {/* Sidebar for additional info or actions could go here */}
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
        </div>
      </div>
    </div>
  );
};

export default ScoreView;
