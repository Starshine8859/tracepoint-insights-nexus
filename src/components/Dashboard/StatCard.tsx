
import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type StatCardProps = {
  title: string;
  value: string | number;
  icon: ReactNode;
  delta?: number;
  deltaLabel?: string;
  className?: string;
  color?: "default" | "blue" | "green" | "amber" | "red";
};

const StatCard = ({
  title,
  value,
  icon,
  delta,
  deltaLabel,
  className,
  color = "default"
}: StatCardProps) => {
  const colorClasses = {
    default: "",
    blue: "bg-blue-50 dark:bg-blue-900/20",
    green: "bg-green-50 dark:bg-green-900/20",
    amber: "bg-amber-50 dark:bg-amber-900/20",
    red: "bg-red-50 dark:bg-red-900/20",
  };
  
  const iconColorClasses = {
    default: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200",
    blue: "bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100",
    green: "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100",
    amber: "bg-amber-100 text-amber-800 dark:bg-amber-800 dark:text-amber-100",
    red: "bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100",
  };

  let deltaColor = "text-gray-500 dark:text-gray-400";
  let deltaIcon = null;
  
  if (delta !== undefined) {
    if (delta > 0) {
      deltaColor = "text-green-600 dark:text-green-400";
      deltaIcon = (
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 10l7-7m0 0l7 7m-7-7v18"
          />
        </svg>
      );
    } else if (delta < 0) {
      deltaColor = "text-red-600 dark:text-red-400";
      deltaIcon = (
        <svg
          className="h-3 w-3"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 14l-7 7m0 0l-7-7m7 7V3"
          />
        </svg>
      );
    }
  }

  return (
    <Card className={cn("overflow-hidden", colorClasses[color], className)}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
              {title}
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight">{value}</h2>
            {delta !== undefined && (
              <div className={cn("flex items-center mt-2 text-sm", deltaColor)}>
                {deltaIcon}
                <span className="ml-1">
                  {Math.abs(delta)}% {deltaLabel || "change"}
                </span>
              </div>
            )}
          </div>
          <div className={cn("p-3 rounded-full", iconColorClasses[color])}>
            {icon}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatCard;
