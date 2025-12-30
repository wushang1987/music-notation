import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import abcjs from "abcjs";
import "abcjs/abcjs-audio.css";
import api from "../api";
import { useTranslation } from "react-i18next";

const ScoreEditor = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const isEdit = !!id;
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(
    "X: 1\nT: Title\nM: 4/4\nL: 1/4\nK: C\nC D E F | G A B c |"
  );
  const [isPublic, setIsPublic] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const navigate = useNavigate();

  useEffect(() => {
    if (isEdit) {
      const fetchScore = async () => {
        try {
          const { data } = await api.get(`/scores/${id}`, {
            params: { noCount: 1 },
          });
          setTitle(data.title);
          setContent(data.content);
          setIsPublic(data.isPublic);
        } catch (err) {
          console.error("Failed to fetch score", err);
          alert("Failed to load score for editing");
          navigate("/");
        } finally {
          setLoading(false);
        }
      };
      fetchScore();
    }
  }, [id, isEdit, navigate]);

  useEffect(() => {
    if (!loading) {
      const visualObj = abcjs.renderAbc("paper", content, {
        responsive: "resize",
        add_classes: true,
      })[0];

      if (abcjs.synth.supportsAudio()) {
        const synthControl = new abcjs.synth.SynthController();

        const cursorControl = {
          onStart: () => {
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
        if (audioEl) audioEl.innerHTML = t("score.notSupported");
      }
    }
  }, [content, loading, t]);

  const handleSave = async () => {
    try {
      if (isEdit) {
        await api.put(`/scores/${id}`, { title, content, isPublic });
      } else {
        await api.post("/scores", { title, content, isPublic });
      }
      navigate(isEdit ? `/score/${id}` : "/");
    } catch (err) {
      alert(t("score.saveFailed") || "Failed to save score");
    }
  };

  if (loading)
    return <div className="p-8 text-center">{t("common.loading")}</div>;

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row gap-6">
      <div className="w-full md:w-1/2">
        <h1 className="text-2xl font-bold mb-4">
          {isEdit ? t("common.edit") : t("common.create")}
        </h1>
        <div className="mb-4">
          <label className="block mb-1">{t("score.scoreTitle")}</label>
          <input
            type="text"
            className="w-full border p-2 rounded"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="mb-4">
          <label className="block mb-1">{t("score.abcNotation")}</label>
          <textarea
            className="w-full border p-2 rounded h-64 font-mono"
            value={content}
            onChange={(e) => setContent(e.target.value)}
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
            <span className="ml-2">{t("score.public")}</span>
          </label>
        </div>
        <button
          onClick={handleSave}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          {isEdit ? t("common.update") : t("common.save")}
        </button>
      </div>
      <div className="w-full md:w-1/2">
        <h2 className="text-xl font-bold mb-4">{t("score.preview")}</h2>
        <div
          id="audio"
          className="w-full mb-4 bg-gray-50 p-2 rounded-lg border border-gray-100"
        ></div>
        <div id="paper" className="border p-4 bg-white min-h-[300px]"></div>
      </div>
    </div>
  );
};

export default ScoreEditor;
