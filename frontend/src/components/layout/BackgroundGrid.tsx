const BackgroundGrid = () => (
  <div className="fixed inset-0 pointer-events-none z-0 bg-black overflow-hidden">
    {/* Crisp minimal grid lines */}
    <div 
      className="absolute inset-0 opacity-[0.15]"
      style={{
        backgroundImage: `
          linear-gradient(to right, #ffffff 1px, transparent 1px),
          linear-gradient(to bottom, #ffffff 1px, transparent 1px)
        `,
        backgroundSize: '120px 120px'
      }}
    />
    
    {/* Dark squares on the grid */}
    <div className="absolute top-[120px] left-[240px] w-[120px] h-[120px] bg-[#1a1a1a]" />
    <div className="absolute top-[0px] left-[720px] w-[120px] h-[120px] bg-[#1a1a1a]" />
    <div className="absolute top-[240px] right-[240px] w-[120px] h-[120px] bg-[#1a1a1a]" />
    <div className="absolute bottom-[240px] left-[480px] w-[120px] h-[120px] bg-[#1a1a1a]" />
    <div className="absolute bottom-[0px] right-[600px] w-[120px] h-[120px] bg-[#1a1a1a]" />
    
    {/* Red plus/crosshair accent */}
    <div className="absolute top-[140px] left-[80px] text-red-500/50 font-light text-xl">+</div>
    
    {/* Soft overlay to blend into dark mode */}
    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#000000]/20 to-[#000000]/40 opacity-60" />
  </div>
);

export default BackgroundGrid;
