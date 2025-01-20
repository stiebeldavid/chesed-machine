import { useState } from "react";
import { Button } from "@/components/ui/button";
import { IdeaCard } from "@/components/IdeaCard";
import { ShareModal } from "@/components/ShareModal";
import { IdeasCounter } from "@/components/IdeasCounter";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { IdeaComponents } from "@/hooks/useIdeaComponents";

interface IdeaGeneratorProps {
  ideaComponents: IdeaComponents;
}

export function IdeaGenerator({ ideaComponents }: IdeaGeneratorProps) {
  const [currentIdea, setCurrentIdea] = useState({
    action: "",
    recipient: "",
    time: "",
  });
  const [shareOpen, setShareOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(true);
  const [flippingStates, setFlippingStates] = useState({
    action: false,
    recipient: false,
    time: false
  });

  const queryClient = useQueryClient();

  const { data: counterData } = useQuery({
    queryKey: ['counter'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('Counter')
        .select('count')
        .maybeSingle();
      
      if (error) {
        console.error('Error fetching counter:', error);
        return { count: 0 };
      }
      return data || { count: 0 };
    }
  });

  const incrementCounter = async () => {
    const { error } = await supabase
      .from('Counter')
      .update({ 
        count: (counterData?.count || 0) + 1,
        last_updated: new Date().toISOString()
      })
      .eq('count', counterData?.count || 0);

    if (error) {
      console.error('Error incrementing counter:', error);
      return;
    }

    queryClient.invalidateQueries({ queryKey: ['counter'] });
  };

  const generateNewAction = () => {
    const actions = ideaComponents?.what || [];
    return actions.length > 0 ? actions[Math.floor(Math.random() * actions.length)] : "Loading...";
  };

  const generateNewRecipient = () => {
    const recipients = ideaComponents?.whom || [];
    return recipients.length > 0 ? recipients[Math.floor(Math.random() * recipients.length)] : "Loading...";
  };

  const generateNewTime = () => {
    const times = ideaComponents?.when_to || [];
    return times.length > 0 ? times[Math.floor(Math.random() * times.length)] : "Loading...";
  };

  const generateNewIdea = async () => {
    // First set the flipping states to trigger animations
    setFlippingStates({
      action: true,
      recipient: true,
      time: true
    });
    
    // Generate new values immediately but don't update state yet
    const newAction = generateNewAction();
    const newRecipient = generateNewRecipient();
    const newTime = generateNewTime();
    
    await incrementCounter();
    
    // The text will be updated mid-flip due to the useEffect in IdeaCard
    setCurrentIdea({
      action: newAction,
      recipient: newRecipient,
      time: newTime,
    });
    
    // Reset flipping states after animation completes
    setTimeout(() => {
      setFlippingStates({
        action: false,
        recipient: false,
        time: false
      });
      setIsAnimating(false);
    }, 800); // Full flip animation duration
  };

  const handleNewAction = async () => {
    setFlippingStates(prev => ({ ...prev, action: true }));
    const newAction = generateNewAction();
    await incrementCounter();
    setCurrentIdea(prev => ({
      ...prev,
      action: newAction,
    }));
    setTimeout(() => {
      setFlippingStates(prev => ({ ...prev, action: false }));
    }, 800);
  };

  const handleNewRecipient = async () => {
    setFlippingStates(prev => ({ ...prev, recipient: true }));
    const newRecipient = generateNewRecipient();
    await incrementCounter();
    setCurrentIdea(prev => ({
      ...prev,
      recipient: newRecipient,
    }));
    setTimeout(() => {
      setFlippingStates(prev => ({ ...prev, recipient: false }));
    }, 800);
  };

  const handleNewTime = async () => {
    setFlippingStates(prev => ({ ...prev, time: true }));
    const newTime = generateNewTime();
    await incrementCounter();
    setCurrentIdea(prev => ({
      ...prev,
      time: newTime,
    }));
    setTimeout(() => {
      setFlippingStates(prev => ({ ...prev, time: false }));
    }, 800);
  };

  const fullIdeaText = `${currentIdea.action} ${currentIdea.recipient} ${currentIdea.time}`;

  return (
    <div className="w-full max-w-2xl flex flex-col items-center gap-4">
      <Button 
        size="lg" 
        className="bg-gradient-to-r from-[#0EA5E9] to-[#1EAEDB] hover:from-[#0993D3] hover:to-[#1B9CC7] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 rounded-full px-8 py-4 font-fredoka text-xl mb-2"
        onClick={generateNewIdea}
      >
        Generate new idea! 🎉
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 w-full mb-2">
        <IdeaCard
          title="Do what:"
          content={currentIdea.action}
          onNewIdea={handleNewAction}
          isFlipping={flippingStates.action}
        />
        <IdeaCard
          title="For whom:"
          content={currentIdea.recipient}
          onNewIdea={handleNewRecipient}
          isFlipping={flippingStates.recipient}
        />
        <IdeaCard
          title="When:"
          content={currentIdea.time}
          onNewIdea={handleNewTime}
          isFlipping={flippingStates.time}
        />
      </div>

      <Button 
        size="lg"
        variant="outline" 
        className="bg-white/80 border-2 border-[#1EAEDB] text-[#1EAEDB] hover:bg-[#1EAEDB] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl rounded-full px-8 py-2 font-fredoka text-xl flex flex-col gap-0 leading-none"
        onClick={() => setShareOpen(true)}
      >
        <span>🎯 Yes! I'll Do This One! 🎯</span>
        <span className="text-sm font-bubblegum opacity-75">bli neder</span>
      </Button>

      <IdeasCounter count={counterData?.count || 0} />

      <ShareModal
        open={shareOpen}
        onOpenChange={setShareOpen}
        ideaText={fullIdeaText}
      />
    </div>
  );
}