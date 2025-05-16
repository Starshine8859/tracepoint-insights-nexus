
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type DashboardCardProps = {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  footer?: ReactNode;
  fullHeight?: boolean;
};

const DashboardCard = ({
  title,
  description,
  children,
  className,
  footer,
  fullHeight = false
}: DashboardCardProps) => (
  <Card className={cn("shadow-sm transition-colors", fullHeight && "h-full", className)}>
    <CardHeader className="pb-2">
      <CardTitle className="text-lg font-medium">{title}</CardTitle>
      {description && <CardDescription>{description}</CardDescription>}
    </CardHeader>
    <CardContent>{children}</CardContent>
    {footer && <CardFooter className="pt-0">{footer}</CardFooter>}
  </Card>
);

export default DashboardCard;
