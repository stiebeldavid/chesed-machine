import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IdeaCard } from "@/components/IdeaCard";
import { ShareModal } from "@/components/ShareModal";
import { IdeasCounter } from "@/components/IdeasCounter";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";

const actions = [
  "Deliver hot chocolate to",
  "Write a thank you note to",
  "Buy coffee for",
  "Give a compliment to",
  "Share your lunch with",
];

const recipients = [
  "someone you feel impatient with",
  "a neighbor",
  "someone who seems lonely",
  "a friend you haven't spoken to in a while",
  "someone who helped you recently",
];

const times = [
  "during lunch",
  "this weekend",
  "today",
  "this afternoon",
  "when you have a free moment",
];

const Index = () => {
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

  // Fetch the current count
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

    // Invalidate the counter query to trigger a refetch
    queryClient.invalidateQueries({ queryKey: ['counter'] });
  };

  const generateNewAction = () => {
    return actions[Math.floor(Math.random() * actions.length)];
  };

  const generateNewRecipient = () => {
    return recipients[Math.floor(Math.random() * recipients.length)];
  };

  const generateNewTime = () => {
    return times[Math.floor(Math.random() * times.length)];
  };

  const generateNewIdea = async () => {
    setFlippingStates({
      action: true,
      recipient: true,
      time: true
    });
    
    await incrementCounter();
    
    setTimeout(() => {
      setCurrentIdea({
        action: generateNewAction(),
        recipient: generateNewRecipient(),
        time: generateNewTime(),
      });
      setIsAnimating(true);
      
      setFlippingStates({
        action: false,
        recipient: false,
        time: false
      });
    }, 400);
    
    setTimeout(() => setIsAnimating(false), 1000);
  };

  const handleNewAction = async () => {
    setFlippingStates(prev => ({ ...prev, action: true }));
    await incrementCounter();
    setTimeout(() => {
      setCurrentIdea(prev => ({
        ...prev,
        action: generateNewAction(),
      }));
      setFlippingStates(prev => ({ ...prev, action: false }));
    }, 400);
  };

  const handleNewRecipient = async () => {
    setFlippingStates(prev => ({ ...prev, recipient: true }));
    await incrementCounter();
    setTimeout(() => {
      setCurrentIdea(prev => ({
        ...prev,
        recipient: generateNewRecipient(),
      }));
      setFlippingStates(prev => ({ ...prev, recipient: false }));
    }, 400);
  };

  const handleNewTime = async () => {
    setFlippingStates(prev => ({ ...prev, time: true }));
    await incrementCounter();
    setTimeout(() => {
      setCurrentIdea(prev => ({
        ...prev,
        time: generateNewTime(),
      }));
      setFlippingStates(prev => ({ ...prev, time: false }));
    }, 400);
  };

  useEffect(() => {
    generateNewIdea();
  }, []);

  const fullIdeaText = `${currentIdea.action} ${currentIdea.recipient} ${currentIdea.time}`;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-8 gap-8 bg-gradient-to-b from-[#F2FCE2] to-[#F1F0FB]">
      <div className="w-full max-w-2xl flex flex-col items-center gap-8">
        <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#8B5CF6] text-center font-serif hover:scale-105 transition-transform duration-300 cursor-default">
          The Chesed Machine
        </h1>
        
        <p className="text-center text-lg text-[#4B5563]">
          Tap the button below to generate a unique chesed idea just for you!
        </p>

        <Button 
          size="lg" 
          className={`bg-[#8B5CF6] hover:bg-[#7C3AED] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 rounded-full px-8 py-6 font-semibold text-lg ${isAnimating ? 'animate-bounce' : ''}`}
          onClick={generateNewIdea}
        >
          Generate new idea!
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
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
          className="bg-white border-2 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl rounded-full px-8 py-6 font-semibold text-lg flex flex-col leading-none"
          onClick={() => setShareOpen(true)}
        >
          <span>🎯 Yes! I'll Do This One! 🎯</span>
          <span className="text-sm font-normal opacity-75 -mt-1">(bli neder)</span>
        </Button>

        <IdeasCounter count={counterData?.count || 0} />

        <ShareModal
          open={shareOpen}
          onOpenChange={setShareOpen}
          ideaText={fullIdeaText}
        />
      </div>
    </div>
  );
};

export default Index;