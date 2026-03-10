const sizeClasses = {
  sm: "h-4 w-4 border-2",
  md: "h-6 w-6 border-2",
  lg: "h-10 w-10 border-[3px]",
  xl: "h-14 w-14 border-4",
};

const Loading = ({ size = "md", className = "" }) => {
  const isNumericSize = typeof size === "number";
  const spinnerClass = !isNumericSize
    ? sizeClasses[size] || sizeClasses.md
    : "border-2";
  const spinnerStyle = isNumericSize
    ? { width: `${size}px`, height: `${size}px` }
    : undefined;

  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <span
        role="status"
        aria-label="Loading"
        className={`animate-spin rounded-full border-slate-300 border-t-slate-800 ${spinnerClass}`}
        style={spinnerStyle}
      />
    </div>
  );
};

export default Loading;
