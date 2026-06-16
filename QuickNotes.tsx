import { useEffect, useState } from "react";

const STORAGE = "khube_quick_notes_v1";

export default function QuickNotes() {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState(() => {
    try {
      return localStorage.getItem(STORAGE) ?? "";
    } catch {
      return "";
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE, text);
  }, [text]);

  return (
    <>
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[200] w-14 h-14 rounded-full bg-[#1b3224] text-white text-2xl shadow-2xl hover:bg-[#2d4a38] hover:scale-105 transition-all flex items-center justify-center"
        title="Notes rapides"
      >
        📝
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-[200] w-[min(360px,calc(100vw-2rem))] bg-white rounded-3xl border border-[#cae0d4] shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 bg-[#f3f7f5] border-b border-[#e3eee8]">
            <div>
              <h3 className="font-semibold text-[#1b3224] text-sm">Notes rapides</h3>
              <p className="text-[10px] text-slate-500">Brouillon — sauvegarde auto</p>
            </div>
            <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-white border border-[#cae0d4] text-slate-500 hover:text-[#1b3224]">
              ✕
            </button>
          </div>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            placeholder="Note une idée, une info urgente pendant un cours…"
            className="w-full p-4 text-sm text-[#1b3224] outline-none resize-none bg-[#fffef9]"
          />
          <div className="px-4 py-2 border-t border-[#e3eee8] flex justify-between items-center">
            <span className="text-[10px] text-slate-400">{text.length} caractères</span>
            <button
              onClick={() => {
                if (confirm("Effacer le brouillon ?")) setText("");
              }}
              className="text-[11px] text-red-500 hover:text-red-700 font-semibold"
            >
              Effacer
            </button>
          </div>
        </div>
      )}
    </>
  );
}
