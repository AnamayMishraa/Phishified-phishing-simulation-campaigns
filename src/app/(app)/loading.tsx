export default function AppLoading() {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center gap-3">
        <div className="size-6 rounded-full border-2 border-accent-blue border-t-transparent animate-spin" />
        <span className="text-xs text-text-muted">Loading...</span>
      </div>
    </div>
  );
}
