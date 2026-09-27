import React from "react";

export interface MainContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "full";
}

export const MainContainer: React.FC<MainContainerProps> = ({
  children,
  size = "lg",
  className = "",
  ...props
}) => {
  const sizeStyles = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 animate-fadeIn ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
