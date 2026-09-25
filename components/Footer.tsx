export default function Footer() {
  return (
    <footer className="w-full bg-[#08090c] border-t border-outline-variant/50 py-4 font-mono text-xs text-on-surface-variant">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>LifeOS Core Engine v2.5</span>
        </div>
        <div>© 2026 LifeOS. Execution Over Intention.</div>
        <div className="text-cyan-400">Pune Horizon Trajectory: 742 Days</div>
      </div>
    </footer>
  );
}
