import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { IdeaCard } from "@/components/IdeaCard";
import { ShareModal } from "@/components/ShareModal";
import { IdeasCounter } from "@/components/IdeasCounter";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vR4UjqO1VWlv1XBOTY7zCE9kc6IR_uShi5jvd-9vQDfEFPsnGjHizqvCHUt6c42E3Z9M287w3WKrxUv/pub?output=csv";

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
  const [ideaComponents, setIdeaComponents] = useState<{
    what: string[];
    whom: string[];
    when_to: string[];
  }>({
    what: [],
    whom: [],
    when_to: []
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

  useEffect(() => {
    const fetchSheetData = async () => {
      try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        
        // Parse CSV
        const rows = csvText.split('\n').map(row => row.split(','));
        
        // Skip header row and filter out empty rows
        const dataRows = rows.slice(1).filter(row => row.length === 3);
        
        // Separate columns into arrays
        const components = {
          what: dataRows.map(row => row[0].trim()).filter(Boolean),
          whom: dataRows.map(row => row[1].trim()).filter(Boolean),
          when_to: dataRows.map(row => row[2].trim()).filter(Boolean)
        };
        
        setIdeaComponents(components);
        
        // Generate first idea after loading data
        generateNewIdea();
      } catch (error) {
        console.error('Error fetching sheet data:', error);
        toast.error('Failed to load ideas');
      }
    };

    fetchSheetData();
  }, []);

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

  const generateNewAction = (components = ideaComponents) => {
    const actions = components?.what || [];
    return actions.length > 0 ? actions[Math.floor(Math.random() * actions.length)] : "Loading...";
  };

  const generateNewRecipient = (components = ideaComponents) => {
    const recipients = components?.whom || [];
    return recipients.length > 0 ? recipients[Math.floor(Math.random() * recipients.length)] : "Loading...";
  };

  const generateNewTime = (components = ideaComponents) => {
    const times = components?.when_to || [];
    return times.length > 0 ? times[Math.floor(Math.random() * times.length)] : "Loading...";
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

  const fullIdeaText = `${currentIdea.action} ${currentIdea.recipient} ${currentIdea.time}`;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-4 gap-4 bg-gradient-to-b from-[#FFE5F9] to-[#F0F7FF]">
      <div className="w-full max-w-2xl flex flex-col items-center gap-4">
        <h1 className="text-5xl font-fredoka text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#D946EF] to-[#8B5CF6] text-center hover:scale-105 transition-transform duration-300 cursor-default animate-bounce-slight">
          The Chesed Machine
        </h1>
        
        <p className="text-center text-xl font-bubblegum text-[#4B5563] mb-2">
          Tap the button below to generate a unique chesed idea just for you! ✨
        </p>

        <Button 
          size="lg" 
          className="bg-gradient-to-r from-[#8B5CF6] to-[#D946EF] hover:from-[#7C3AED] hover:to-[#C026D3] transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-110 active:scale-95 rounded-full px-8 py-4 font-fredoka text-xl mb-2"
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
          className="bg-white/80 border-2 border-[#8B5CF6] text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl rounded-full px-8 py-2 font-fredoka text-xl flex flex-col gap-0 leading-none"
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
    </div>
  );
};

export default Index;