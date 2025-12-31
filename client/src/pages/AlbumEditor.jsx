import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useTranslation } from "react-i18next";
import Pagination from "../components/Pagination";

const SCORE_PAGE_SIZE = 20;
const MAX_ALBUM_SCORES = 20;

const AlbumEditor = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);

  const [title, setTitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [isPublic, setIsPublic] = useState(false);

  const [availableScores, setAvailableScores] = useState([]);
  const [scoresPage, setScoresPage] = useState(1);
  const [scoresTotalPages, setScoresTotalPages] = useState(1);
  const [scoresSearch, setScoresSearch] = useState("");
  const [scoresLoading, setScoresLoading] = useState(false);
  const [maxScoresMessage, setMaxScoresMessage] = useState("");

  const [selectedScoreIds, setSelectedScoreIds] = useState([]);
  const [initialScoreIds, setInitialScoreIds] = useState([]);

  const initialSet = useMemo(
    () => new Set((initialScoreIds || []).map((x) => x.toString())),
    [initialScoreIds]
  );

  const selectedSet = useMemo(
    () => new Set((selectedScoreIds || []).map((x) => x.toString())),
    [selectedScoreIds]
  );

  useEffect(() => {
    const fetchScores = async () => {
      setScoresLoading(true);
      try {
        const params = new URLSearchParams();
        params.append("page", scoresPage);
        params.append("limit", SCORE_PAGE_SIZE);
        params.append("sortBy", "date");
        params.append("order", "desc");
        if (scoresSearch.trim()) params.append("search", scoresSearch.trim());

        const { data } = await api.get(`/scores?${params.toString()}`);
        const scores = Array.isArray(data) ? data : data.scores;
        setAvailableScores(Array.isArray(scores) ? scores : []);
        setScoresTotalPages(
          Math.max(1, parseInt(data?.totalPages || 1, 10) || 1)
        );
      } catch (err) {
        console.error("Failed to fetch scores", err);
        setAvailableScores([]);
        setScoresTotalPages(1);
      } finally {
        setScoresLoading(false);
      }
    };

    fetchScores();
  }, [scoresPage, scoresSearch]);

  useEffect(() => {
    if (!isEdit) return;

    const fetchAlbum = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/albums/${id}`);
        setTitle(data.title || "");
        setCoverUrl(data.coverUrl || "");
        setIsPublic(!!data.isPublic);
        const ids = Array.isArray(data.scores)
          ? data.scores
              .map((s) => (typeof s === "string" ? s : s._id))
              .filter(Boolean)
          : [];
        setInitialScoreIds(ids);
        setSelectedScoreIds(ids);
      } catch (err) {
        console.error("Failed to fetch album", err);
        alert(t("albums.loadFailed"));
        navigate("/");
      } finally {
        setLoading(false);
      }
    };

    fetchAlbum();
  }, [id, isEdit, navigate, t]);

  const toggleSelected = (scoreId) => {
    setSelectedScoreIds((prev) => {
      const sid = scoreId.toString();
      const next = new Set((prev || []).map((x) => x.toString()));
      if (next.has(sid)) next.delete(sid);
      else {
        if (next.size >= MAX_ALBUM_SCORES) {
          setMaxScoresMessage(t("albums.maxScoresReached", { count: 20 }));
          return Array.from(next);
        }
        next.add(sid);
      }
      return Array.from(next);
    });
  };

  const saveScoresMembership = async (albumId) => {
    const toAdd = Array.from(selectedSet).filter((sid) => !initialSet.has(sid));
    const toRemove = Array.from(initialSet).filter(
      (sid) => !selectedSet.has(sid)
    );

    for (const sid of toRemove) {
      await api.delete(`/albums/${albumId}/scores/${sid}`);
    }
    for (const sid of toAdd) {
      await api.put(`/albums/${albumId}/scores/${sid}`);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert(t("albums.titleRequired"));
      return;
    }

    if ((selectedScoreIds || []).length > MAX_ALBUM_SCORES) {
      alert(t("albums.maxScoresReached", { count: 20 }));
      return;
    }

    setSaving(true);
    try {
      let albumId = id;
      if (isEdit) {
        await api.put(`/albums/${id}`, {
          title,
          coverUrl,
          isPublic,
        });
      } else {
        const { data } = await api.post("/albums", {
          title,
          coverUrl,
          isPublic,
        });
        albumId = data?._id;
      }

      if (!albumId) {
        throw new Error("Missing album id");
      }

      await saveScoresMembership(albumId);
      navigate(`/album/${albumId}`);
    } catch (err) {
      console.error("Failed to save album", err);
      const message = err?.response?.data?.message || "";
      if (message.toLowerCase().includes("at most 20")) {
        alert(t("albums.maxScoresReached", { count: 20 }));
      } else {
        alert(t("albums.saveFailed"));
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center">{t("common.loading")}</div>;
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-4">
        {isEdit ? t("albums.edit") : t("albums.create")}
      </h1>

      <div className="bg-white border rounded-lg p-4">
        <div className="mb-4">
          <label className="block mb-1">{t("albums.title")}</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1">{t("albums.coverUrl")}</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={coverUrl}
            onChange={(e) => setCoverUrl(e.target.value)}
            placeholder={t("albums.coverUrlPlaceholder")}
          />
        </div>

        <div className="mb-4">
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
            />
            <span className="ml-2">
              {isPublic ? t("albums.public") : t("albums.private")}
            </span>
          </label>
        </div>

        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="font-semibold">{t("albums.scores")}</h2>
            <span className="text-sm text-gray-500">
              {(selectedScoreIds || []).length}
            </span>
          </div>

          <div className="mb-2">
            <input
              type="text"
              className="w-full border p-2 rounded"
              value={scoresSearch}
              onChange={(e) => {
                setScoresSearch(e.target.value);
                setScoresPage(1);
              }}
              placeholder={t("albums.scoreSearchPlaceholder")}
            />
          </div>

          {maxScoresMessage ? (
            <div className="mb-2 text-sm text-red-600">{maxScoresMessage}</div>
          ) : null}

          <div className="max-h-105 overflow-auto border rounded">
            {scoresLoading ? (
              <div className="p-4 text-sm text-gray-500">
                {t("common.loading")}
              </div>
            ) : availableScores.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                {t("albums.noScores")}
              </div>
            ) : (
              <ul className="divide-y">
                {availableScores.map((s) => {
                  const sid = s?._id ? s._id.toString() : "";
                  if (!sid) return null;

                  const checked = selectedSet.has(sid);
                  const selectedCount = (selectedScoreIds || []).length;
                  const disableAdd =
                    !checked && selectedCount >= MAX_ALBUM_SCORES;

                  return (
                    <li key={sid} className="p-3 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        disabled={disableAdd}
                        onChange={() => {
                          if (disableAdd) {
                            setMaxScoresMessage(
                              t("albums.maxScoresReached", { count: 20 })
                            );
                            return;
                          }
                          setMaxScoresMessage("");
                          toggleSelected(sid);
                        }}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {s.title}
                        </div>
                        <div className="text-xs text-gray-500">
                          {s.isPublic ? t("score.public") : t("score.private")}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <Pagination
            currentPage={scoresPage}
            totalPages={scoresTotalPages}
            onPageChange={(p) => setScoresPage(p)}
          />
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-60"
        >
          {saving
            ? t("common.processing")
            : isEdit
            ? t("common.update")
            : t("common.save")}
        </button>
      </div>
    </div>
  );
};

export default AlbumEditor;
