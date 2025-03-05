
import { useState } from "react";
import { WelcomeModal } from "./WelcomeModal";
import { Button } from "./ui/button";
import { Info } from "lucide-react";

export function Header() {
  const [isWelcomeModalOpen, setIsWelcomeModalOpen] = useState(false);
  
  return (
    <>
      <div className="w-full flex justify-end mb-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsWelcomeModalOpen(true)}
          className="text-[#0EA5E9] hover:bg-[#D3E4FD] hover:text-[#0890D7]"
          aria-label="Show welcome information"
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>
      
      <h1 className="text-5xl font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] via-[#1EAEDB] to-[#0EA5E9] text-center hover:scale-105 transition-transform duration-300 cursor-default animate-bounce-slight">The Chesed Machine</h1>
      
      <p className="text-center text-xl font-bubblegum text-[#403E43] mb-2">
        Tap the button below to generate a unique chesed idea just for you! ✨
      </p>
      
      <WelcomeModal 
        isOpen={isWelcomeModalOpen} 
        onOpenChange={setIsWelcomeModalOpen}
        showOnFirstVisit={false}
      />
    </>
  );
}
