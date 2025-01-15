import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface IdeaCardProps {
  title: string;
  content: string;
  onNewIdea: () => void;
  isFlipping?: boolean;
}

export function IdeaCard({ title, content, onNewIdea, isFlipping = false }: IdeaCardProps) {
  return (
    <Card className={cn(
      "w-full bg-gradient-to-br from-[#FFE5D9] to-[#FFF9E6] border-4 border-[#FFB088] shadow-lg relative",
      "transform transition-all duration-500 hover:scale-105",
      "perspective-1000 rounded-2xl",
      isFlipping && "animate-flip"
    )}>
      <Button 
        variant="ghost" 
        size="icon"
        className="absolute top-3 right-3 w-10 h-10 p-0 bg-white/70 border-2 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white transition-colors duration-300 rounded-full shadow-md hover:shadow-lg transform hover:rotate-180 transition-all"
        onClick={(e) => {
          e.stopPropagation();
          onNewIdea();
        }}
      >
        <RefreshCw className="h-5 w-5" />
      </Button>
      <CardHeader className="py-4 px-5">
        <CardTitle className="text-xl font-fredoka text-[#8B5CF6] animate-bounce-slight">{title}</CardTitle>
      </CardHeader>
      <CardContent className="py-3 px-5">
        <p className="text-2xl font-bubblegum text-[#4B5563] min-h-[60px] leading-relaxed">{content}</p>
      </CardContent>
    </Card>
  );
}