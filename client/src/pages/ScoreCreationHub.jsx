import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Music, FileText, Zap, Shield, ChevronRight } from "lucide-react";

const ScoreCreationHub = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const tools = [
    {
      id: "abcjs",
      name: "ABCJS",
      description: t("editor.abcjs.description", "Easy-to-use ABC notation. Perfect for lead sheets and simple folk tunes."),
      icon: <Music className="w-8 h-8 text-blue-500" />,
      features: [
        t("editor.abcjs.feature1", "Lightweight & Fast"),
        t("editor.abcjs.feature2", "Real-time ABC Rendering"),
        t("editor.abcjs.feature3", "Built-in Piano Input")
      ],
      color: "blue",
      path: "/create/abcjs"
    },
    {
      id: "verovio",
      name: "Verovio Toolkit",
      description: t("editor.verovio.description", "Professional MEI/MusicXML engine. Advanced engraving for complex classical scores."),
      icon: <FileText className="w-8 h-8 text-purple-500" />,
      features: [
        t("editor.verovio.feature1", "WASM Performance"),
        t("editor.verovio.feature2", "MEI & MusicXML Support"),
        t("editor.verovio.feature3", "High-quality Engraving")
      ],
      color: "purple",
      path: "/create/verovio"
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 mb-4 tracking-tight">
            {t("editor.selection.title", "How would you like to create?")}
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            {t("editor.selection.subtitle", "Choose the engine that best fits your musical project. Both support real-time preview and export.")}
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {tools.map((tool) => (
            <div
              key={tool.id}
              onClick={() => navigate(tool.path)}
              className="group relative bg-white rounded-3xl border border-slate-200 p-8 shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer overflow-hidden active:scale-[0.98]"
            >
              {/* Background Accent */}
              <div className={`absolute top-0 right-0 w-32 h-32 -mr-16 -mt-16 bg-${tool.color}-50 rounded-full transition-transform group-hover:scale-150 duration-500`}></div>

              <div className="relative z-10">
                <div className={`w-16 h-16 bg-${tool.color}-100 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  {tool.icon}
                </div>

                <h2 className="text-2xl font-bold text-slate-900 mb-3">{tool.name}</h2>
                <p className="text-slate-600 mb-8 leading-relaxed">
                  {tool.description}
                </p>

                <ul className="space-y-3 mb-8">
                  {tool.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center text-sm text-slate-500 font-medium">
                      <Zap className={`w-4 h-4 mr-2 text-${tool.color}-400`} />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button className={`w-full py-4 rounded-2xl bg-${tool.color === 'blue' ? 'blue-600' : 'purple-600'} text-white font-bold flex items-center justify-center gap-2 group-hover:gap-3 transition-all`}>
                  {t("editor.selection.start", "Start Creating")}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-slate-400 text-sm">
          <p className="flex items-center justify-center gap-2">
            <Shield className="w-4 h-4" />
            {t("editor.selection.footer", "You can always export your scores to other formats later.")}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScoreCreationHub;
