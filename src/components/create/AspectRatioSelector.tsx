import { cn } from "@/lib/utils";

const RATIOS = ["1:1", "9:16", "16:9", "3:4", "4:3"] as const;

interface AspectRatioSelectorProps {
  value: string;
  onChange: (ratio: string) => void;
}

export function AspectRatioSelector({ value, onChange }: AspectRatioSelectorProps) {
  return (
    <div className="flex items-center gap-1.5 pt-2">
      <span className="text-xs text-muted-foreground mr-1">비율</span>
      {RATIOS.map((ratio) => (
        <button
          key={ratio}
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(ratio);
          }}
          className={cn(
            "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
            value === ratio
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-accent"
          )}
        >
          {ratio}
        </button>
      ))}
    </div>
  );
}
