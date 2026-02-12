import { useState } from "react";
import { Plus, ChevronDown, ArrowRight, X } from "lucide-react";
import { AppLayout } from "@/components/AppLayout";
import { Button } from "@/components/ui/button";

const EMPTY_GRID_COUNT = 8;

const recentProducts = [
{ name: "Mockajacka", label: "Product" },
{ name: "Spotted ceramic mug", label: "Product" },
{ name: "Short Pile Jacket", label: "Product" }];


const CreatePage = () => {
  const [prompt, setPrompt] = useState("");

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-3.5rem)]">
        {/* Image Grid Area */}
        <div className="flex-1 overflow-y-auto p-6 pb-0">
          <h1 className="text-2xl font-bold mb-6">생성</h1>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Array.from({ length: EMPTY_GRID_COUNT }).map((_, i) =>
            <div
              key={i}
              className="aspect-[3/4] rounded-lg border-2 border-dashed border-border bg-card/50 flex items-center justify-center transition-colors hover:bg-card hover:border-muted-foreground/30">

                <Plus className="h-6 w-6 text-muted-foreground/40" />
              </div>
            )}
          </div>
        </div>

        {/* Bottom Input Bar — Fixed */}
        <div className="shrink-0 border-t border-border bg-background p-4 space-y-3">
          {/* Recent Product Chips */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recentProducts.map((product) => {}








            )}
          </div>

          {/* Text Input */}
          <div className="relative">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="이미지를 설명해주세요 (@ 입력으로 AI 모델 태그 가능)"
              className="w-full bg-card border border-border rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-all" />

            {prompt &&
            <button
              onClick={() => setPrompt("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">

                <X className="h-4 w-4" />
              </button>
            }
          </div>

          {/* Options Bar */}
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-2 flex-wrap">
              {/* IMAGE dropdown */}
              <OptionDropdown label="IMAGE" />
              {/* STUDIO dropdown */}
              <OptionDropdown label="STUDIO" />
              {/* Add button */}
              <button className="h-8 w-8 rounded-lg border border-border bg-card flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
                <Plus className="h-4 w-4" />
              </button>

              <div className="h-5 w-px bg-border mx-1" />

              {/* Ratio */}
              <OptionPill label="9:16" />
              {/* Version */}
              <OptionPill label="4v" />
              {/* Quality */}
              <OptionPill label="High" />
            </div>

            {/* Generate Button */}
            <Button variant="glow" className="rounded-[10px] px-5 gap-2">
              생성하기
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Credits */}
          <div className="text-xs text-muted-foreground text-center">
            Cost 16 credits ·{" "}
            <button className="text-primary hover:text-primary-hover underline underline-offset-2 transition-colors">
              더 많은 실행 횟수 얻기
            </button>
          </div>
        </div>
      </div>
    </AppLayout>);

};

function OptionDropdown({ label }: {label: string;}) {
  return (
    <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-border bg-card text-xs font-label text-foreground hover:bg-accent transition-colors">
      {label}
      <ChevronDown className="h-3 w-3 text-muted-foreground" />
    </button>);

}

function OptionPill({ label }: {label: string;}) {
  return (
    <button className="h-8 px-3 rounded-lg border border-border bg-card text-xs font-label text-muted-foreground hover:bg-accent hover:text-foreground transition-colors">
      {label}
    </button>);

}

export default CreatePage;