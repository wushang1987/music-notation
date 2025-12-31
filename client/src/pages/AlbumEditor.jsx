import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useTranslation } from "react-i18next";

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

  const [myScores, setMyScores] = useState([]);
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
    const fetchMyScores = async () => {
      try {
        const params = new URLSearchParams();
        params.append("page", 1);
        params.append("limit", 200);
        params.append("sortBy", "date");
        params.append("order", "desc");

        const { data } = await api.get(`/scores/my?${params.toString()}`);
        const scores = Array.isArray(data) ? data : data.scores;
        setMyScores(Array.isArray(scores) ? scores : []);
      } catch (err) {
        console.error("Failed to fetch my scores", err);
      }
    };

    fetchMyScores();
  }, []);

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
      else next.add(sid);
      return Array.from(next);
    });
  };

  const saveScoresMembership = async (albumId) => {
    const toAdd = Array.from(selectedSet).filter((sid) => !initialSet.has(sid));
    const toRemove = Array.from(initialSet).filter(
      (sid) => !selectedSet.has(sid)
    );

    for (const sid of toAdd) {
      await api.put(`/albums/${albumId}/scores/${sid}`);
    }
    for (const sid of toRemove) {
      await api.delete(`/albums/${albumId}/scores/${sid}`);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      alert(t("albums.titleRequired"));
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
      alert(t("albums.saveFailed"));
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

          <div className="max-h-[420px] overflow-auto border rounded">
            {myScores.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">
                {t("albums.noMyScores")}
              </div>
            ) : (
              <ul className="divide-y">
                {myScores.map((s) => {
                  const sid = s._id;
                  const checked = selectedSet.has(sid);
                  return (
                    <li key={sid} className="p-3 flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => toggleSelected(sid)}
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
