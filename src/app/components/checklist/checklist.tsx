import { cn } from "@/lib/utils";
import { ChecklistProps } from "./types";
import { CheckCircle, XCircle, Circle } from "lucide-react";

export const Checklist = ({
  items,
  title = "Verification Checklist",
  description = "The following items need to be verified through video recording",
}: ChecklistProps) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "declined":
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-300" />;
    }
  };

  const getItemClassName = (status: string) => {
    return cn(
      "flex items-start gap-3 p-4 rounded-lg border",
      status === "verified" && "bg-green-950/30 border-green-800",
      status === "declined" && "bg-red-950/30 border-red-800",
      status === "unverified" && "bg-gray-800/30 border-gray-700"
    );
  };

  return (
    <div className="w-full">
      {(title || description) && (
        <div className="mb-6">
          {title && <h3 className="text-lg font-semibold">{title}</h3>}
          {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
        </div>
      )}
      
      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className={getItemClassName(item.status)}>
            <div className="mt-0.5">{getStatusIcon(item.status)}</div>
            <div className="flex-1">
              <h4 className="font-medium text-foreground">{item.title}</h4>
              {item.description && (
                <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
