"use client";
import { cn } from "@/lib/utils";
import React from "react";

export const GlowingCard = ({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  return (
    <div className={cn("relative group", containerClassName)}>
      <div
        className={cn(
          "absolute -inset-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200",
          className
        )}
      />
      <div className={cn("relative bg-card rounded-lg", className)}>
        {children}
      </div>
    </div>
  );
};

export const CardSpotlight = ({
  children,
  className,
  containerClassName,
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
}) => {
  return (
    <div className={cn("relative group", containerClassName)}>
      <div
        className={cn(
          "absolute inset-0 rounded-lg bg-gradient-to-r from-transparent via-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500",
          "before:absolute before:inset-0 before:rounded-lg before:bg-gradient-to-r before:from-blue-500/20 before:via-purple-500/20 before:to-pink-500/20 before:blur-xl",
          className
        )}
      />
      <div className={cn("relative bg-card/50 backdrop-blur-sm rounded-lg border", className)}>
        {children}
      </div>
    </div>
  );
};

// Keep the old component for backward compatibility
export const BackgroundGradient = GlowingCard;
