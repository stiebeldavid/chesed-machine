
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Info, Mail, Sparkles, ThumbsUp, Recycle, ArrowRight } from "lucide-react";

interface WelcomeModalProps {
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  showOnFirstVisit?: boolean;
}

export function WelcomeModal({ 
  isOpen: externalIsOpen, 
  onOpenChange: externalOnOpenChange,
  showOnFirstVisit = true
}: WelcomeModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Determine if we're using internal or external state
  const isControlled = externalIsOpen !== undefined;
  const isOpen = isControlled ? externalIsOpen : internalIsOpen;
  const setIsOpen = isControlled 
    ? externalOnOpenChange 
    : setInternalIsOpen;

  useEffect(() => {
    // Check if this is the first visit and we should show automatically
    if (showOnFirstVisit) {
      const hasVisited = localStorage.getItem("hasVisitedChessedMachine");
      if (!hasVisited) {
        setInternalIsOpen(true);
        // Set the flag so the modal doesn't show again
        localStorage.setItem("hasVisitedChessedMachine", "true");
      }
    }
  }, [showOnFirstVisit]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-gradient-to-b from-[#EAF2FD] to-[#F8FBFF] border-[#0EA5E9] border-2">
        <DialogHeader>
          <DialogTitle className="text-3xl font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-[#0EA5E9] via-[#1EAEDB] to-[#0EA5E9] flex items-center justify-center gap-2">
            <Sparkles className="h-6 w-6 text-[#0EA5E9]" />
            Welcome to the Chesed Machine!
            <Sparkles className="h-6 w-6 text-[#0EA5E9]" />
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 text-[#403E43] font-bubblegum">
          <p className="text-center italic">
            As the mishna in Avos states (1:2), chesed is one of the pillars upon which the world stands. ✨
          </p>
          
          <p>
            We'd all like to help and support those around us as much as possible, but planning something big can be intimidating, and even thinking of something small to do can escape our grasp.
          </p>
          
          <div className="bg-[#D3E4FD] p-4 rounded-lg shadow-inner">
            <p className="font-semibold text-center text-[#0A77B0] flex items-center justify-center gap-2">
              <Info className="h-5 w-5" />
              Enter the Chesed Machine!
              <Info className="h-5 w-5" />
            </p>
            <p className="mt-2">
              The machine will quickly generate an idea for a chesed you can do to help those that are both directly and/or indirectly part of your regular surroundings.
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="font-bold">Here's how it works:</p>
            <ol className="list-decimal list-inside space-y-2 pl-2">
              <li className="flex items-start">
                Click the blue "Click here" button <ArrowRight className="inline h-5 w-5 mx-1 text-[#0EA5E9] animate-pulse" /> at the top of the page to get started generating your newest idea for a chesed project.
              </li>
              <li>
                The suggestions for "what", "who", and "when" will appear as prompts in their respective boxes. You can:
                <ul className="list-disc list-inside pl-4 mt-1">
                  <li>Accept the suggestion as given</li>
                  <li>Generate an entirely new idea by pressing the button again</li>
                  <li>Change one box at a time using the <Recycle className="inline h-4 w-4 mx-1 text-[#0EA5E9]" /> button found in each box</li>
                </ul>
              </li>
              <li className="flex items-start">
                When you settle on your randomly chosen chesed idea, click the <Check className="inline h-4 w-4 mx-1 text-green-500" /> button to have your chesed logged and share to your various social media pages.
              </li>
              <li className="text-[#E12A27] font-bold">
                Make sure to press that button as your chesed will not be officially logged without it!
              </li>
            </ol>
          </div>
          
          <p>
            Sometimes the machine may generate a crazy idea; we definitely want to hear about those! Please send them to us at the email address below.
          </p>
          
          <div className="bg-[#E6F4FF] p-4 rounded-lg border border-[#0EA5E9]">
            <p className="text-center">
              And that's all there is to it! Please email us with your comments, questions, or suggestions. We want to hear from you!
            </p>
            <p className="flex justify-center items-center gap-2 text-[#0EA5E9] font-semibold mt-2">
              <Mail className="h-5 w-5" />
              chessedmachine@gmail.com
            </p>
          </div>
          
          <p className="text-center font-bold flex items-center justify-center gap-2">
            <ThumbsUp className="h-5 w-5 text-[#0EA5E9]" />
            Congratulations to you for your renewed focus on chesed. Best of luck!
            <ThumbsUp className="h-5 w-5 text-[#0EA5E9]" />
          </p>
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => setIsOpen(false)} 
            className="w-full bg-gradient-to-r from-[#0EA5E9] to-[#38BDF8] hover:from-[#0890D7] hover:to-[#30B0E6] font-fredoka text-lg"
          >
            Let's Get Started!
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
