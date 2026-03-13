export function LoadingScreen() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-primary">
      <h1
        className="text-5xl md:text-6xl font-bold fire-text animate-pulse"
        style={{ animationDuration: "2s" }}
      >
        DragonMadeIt
      </h1>
      <div className="mt-8 w-64 h-1.5 rounded-full bg-bg-tertiary overflow-hidden">
        <div
          className="h-full rounded-full fire-gradient"
          style={{
            animation: "loading-bar 3s ease-out forwards",
          }}
        />
      </div>
      <style>{`
        @keyframes loading-bar {
          0% { width: 0%; }
          100% { width: 90%; }
        }
      `}</style>
    </div>
  );
}
