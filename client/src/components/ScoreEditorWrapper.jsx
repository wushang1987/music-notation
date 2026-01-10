import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api";
import ScoreEditor from "../pages/ScoreEditor";
import VerovioEditor from "../pages/VerovioEditor";

const ScoreEditorWrapper = () => {
  const { id } = useParams();
  const [notationType, setNotationType] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchType = async () => {
      try {
        const { data } = await api.get(`/scores/${id}?noCount=true`);
        setNotationType(data.notationType || "abcjs");
      } catch (err) {
        console.error("Failed to fetch score type", err);
      } finally {
        setLoading(false);
      }
    };
    fetchType();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  if (notationType === "verovio") {
    return <VerovioEditor />;
  }

  return <ScoreEditor />;
};

export default ScoreEditorWrapper;
