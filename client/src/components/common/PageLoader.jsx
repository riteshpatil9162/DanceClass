export default function PageLoader() {
  return (
    <div className="min-h-screen bg-dark-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 border-4 border-dark-700 border-t-primary-500 rounded-full animate-spin" />
        <p className="text-dark-400 text-sm">Loading...</p>
      </div>
    </div>
  );
}
