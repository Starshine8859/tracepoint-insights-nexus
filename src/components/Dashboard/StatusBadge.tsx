
import { cn } from "@/lib/utils";

type StatusType = "online" | "offline" | "warning" | "error";

type StatusBadgeProps = {
  status: StatusType;
  className?: string;
};

const statusConfig: Record<
  StatusType,
  { label: string; classes: string }
> = {
  online: {
    label: "Online",
    classes: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400",
  },
  offline: {
    label: "Offline",
    classes: "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400",
  },
  warning: {
    label: "Warning",
    classes: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400",
  },
  error: {
    label: "Error",
    classes: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400",
  },
};

const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        config.classes,
        className
      )}
    >
      <span
        className={cn(
          "mr-1 h-1.5 w-1.5 rounded-full",
          status === "online" && "bg-green-500",
          status === "offline" && "bg-gray-500",
          status === "warning" && "bg-yellow-500",
          status === "error" && "bg-red-500"
        )}
      />
      {config.label}
    </span>
  );
};

export default StatusBadge;
