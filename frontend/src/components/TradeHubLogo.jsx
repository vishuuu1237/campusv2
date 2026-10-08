const RecampusLogo = ({ className = "h-8 w-auto", showText = true, textColor = "#1e1b4b" }) => {
  return (
    <div className={`flex items-center gap-2 select-none ${className}`}>
      <svg
        viewBox="0 0 40 40"
        className="h-full w-auto aspect-square shrink-0"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="36" height="36" x="2" y="2" rx="10" fill="#4338ca" />
        <path
          d="M14 20L20 14M20 14L26 20M20 14V26M15 24H25"
          stroke="#ffffff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="25" cy="15" r="2.5" fill="#fea619" />
      </svg>
      {showText && (
        <span
          className="font-display-md text-2xl font-extrabold tracking-tight"
          style={{ color: textColor }}
        >
          Recampus<span className="text-primary-container">new</span>
        </span>
      )}
    </div>
  );
};

export default RecampusLogo;
