import { useEffect, useState } from "react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<{ prompt: () => Promise<void> } | null>(null);
  const [dismissed, setDismissed] = useState(() => localStorage.getItem("khube_pwa_dismiss") === "1");
  const [isStandalone, setIsStandalone] = useState(false);

  useEffect(() => {
    setIsStandalone(window.matchMedia("(display-mode: standalone)").matches || (navigator as { standalone?: boolean }).standalone === true);

    function handleBeforeInstall(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as unknown as { prompt: () => Promise<void> });
    }
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  async function install() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      setDeferredPrompt(null);
    }
  }

  function dismiss() {
    localStorage.setItem("khube_pwa_dismiss", "1");
    setDismissed(true);
  }

  if (isStandalone || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[200] max-w-lg mx-auto">
      <div className="bg-[#1b3224] text-white rounded-2xl p-4 shadow-2xl flex items-start gap-3">
        <span className="text-2xl">📱</span>
        <div className="flex-1">
          <p className="text-sm font-semibold">Installer sur ton téléphone</p>
          <p className="text-xs text-[#cae0d4] mt-1">
            {deferredPrompt
              ? "Clique pour ajouter l'appli à ton écran d'accès — accessible sans ordinateur !"
              : "Safari : Partager → « Sur l'écran d'accueil » · Chrome : Menu → « Installer l'application »"}
          </p>
          <div className="flex gap-2 mt-3">
            {deferredPrompt && (
              <button onClick={install} className="px-4 py-2 rounded-xl bg-[#8da894] text-white text-xs font-bold">
                Installer
              </button>
            )}
            <button onClick={dismiss} className="px-4 py-2 rounded-xl bg-white/10 text-xs">
              Plus tard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
