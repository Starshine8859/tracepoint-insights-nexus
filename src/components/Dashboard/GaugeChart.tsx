
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { cn } from "@/lib/utils";

type GaugeChartProps = {
  value: number;
  size?: number;
  label?: string;
  threshold?: { warning: number; critical: number };
  className?: string;
};

const GaugeChart = ({
  value,
  size = 120,
  label,
  threshold = { warning: 70, critical: 90 },
  className,
}: GaugeChartProps) => {
  const formattedValue = Math.min(100, Math.max(0, value));
  const isEmpty = formattedValue === 0;
  
  let color = "#10B981"; // Green - Success
  if (formattedValue >= threshold.critical) {
    color = "#EF4444"; // Red - Critical
  } else if (formattedValue >= threshold.warning) {
    color = "#F59E0B"; // Yellow - Warning
  }

  const data = [
    { name: "Value", value: formattedValue },
    { name: "Empty", value: 100 - formattedValue },
  ];

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div style={{ width: size, height: size / 2, position: "relative" }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="100%"
              startAngle={180}
              endAngle={0}
              innerRadius={size / 3}
              outerRadius={size / 2}
              paddingAngle={0}
              dataKey="value"
              stroke="none"
            >
              <Cell
                key={`cell-0`}
                fill={isEmpty ? "#E5E7EB" : color}
              />
              <Cell key={`cell-1`} fill="#E5E7EB" />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div
          className="absolute text-center font-bold text-lg"
          style={{
            top: "50%",
            left: "50%",
            transform: "translate(-50%, 0%)",
          }}
        >
          {formattedValue}%
        </div>
      </div>
      {label && (
        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 text-center">
          {label}
        </div>
      )}
    </div>
  );
};

export default GaugeChart;
