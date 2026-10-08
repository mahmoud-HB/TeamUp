/**
 * Design System: Reusable gaming-aesthetic components
 */

import React from "react";
import { cn } from "@/lib/utils";

export function GradientBackground({
  children,
  className,
  from = "from-slate-900",
  via = "via-slate-800",
  to = "to-slate-900",
}: {
  children: React.ReactNode;
  className?: string;
  from?: string;
  via?: string;
  to?: string;
}) {
  return (
    <div className={cn(`min-h-screen bg-gradient-to-br ${from} ${via} ${to}`, className)}>
      {children}
    </div>
  );
}

export function GradientCard({
  children,
  className,
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "subtle" | "highlight" | "success" | "danger" | "warning";
}) {
  const variants = {
    default: "bg-slate-800/50 border-slate-700/50",
    subtle: "bg-slate-900/30 border-slate-800/30",
    highlight: "bg-gradient-to-br from-blue-600/20 to-purple-600/20 border-blue-500/30",
    success: "bg-gradient-to-br from-green-600/20 to-emerald-600/20 border-green-500/30",
    danger: "bg-gradient-to-br from-red-600/20 to-rose-600/20 border-red-500/30",
    warning: "bg-gradient-to-br from-amber-600/20 to-orange-600/20 border-amber-500/30",
  };

  return (
    <div
      className={cn(
        "rounded-lg border backdrop-blur-sm transition hover:border-slate-500/50",
        variants[variant],
        className
      )}
    >
      {children}
    </div>
  );
}

export function StatBadge({
  value,
  label,
  icon,
  color = "blue",
}: {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "purple" | "orange" | "red";
}) {
  const colors = {
    blue: "from-blue-500 to-blue-600",
    green: "from-green-500 to-green-600",
    purple: "from-purple-500 to-purple-600",
    orange: "from-orange-500 to-orange-600",
    red: "from-red-500 to-red-600",
  };

  return (
    <div className="flex flex-col items-center gap-2 p-4">
      {icon && (
        <div className={`inline-block p-3 bg-gradient-to-br ${colors[color]} rounded-lg`}>
          <div className="text-white">{icon}</div>
        </div>
      )}
      <div className="text-3xl font-bold text-white">{value}</div>
      <div className="text-sm text-slate-400">{label}</div>
    </div>
  );
}

export function AnimatedLoadingSpinner({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-600 border-t-blue-500 rounded-full" />
    </div>
  );
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Icon className="w-12 h-12 text-slate-400 mb-4 opacity-50" />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-slate-400 mb-6 max-w-md">{description}</p>
      {action}
    </div>
  );
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  color = "from-blue-500 to-purple-500",
}: {
  value: number;
  max?: number;
  showLabel?: boolean;
  color?: string;
}) {
  const percentage = (value / max) * 100;
  return (
    <div className="space-y-1">
      <div className="w-full h-2 bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${color} transition-all duration-500`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {showLabel && <span className="text-sm font-semibold text-slate-300">{Math.round(percentage)}%</span>}
    </div>
  );
}

export function TabGroup({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: { id: string; label: string; badge?: number }[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <div className="flex gap-2 border-b border-slate-700/50">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "px-4 py-3 font-semibold transition relative",
            activeTab === tab.id
              ? "text-white border-b-2 border-blue-500"
              : "text-slate-400 hover:text-slate-300"
          )}
        >
          {tab.label}
          {tab.badge !== undefined && tab.badge > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {tab.badge}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
