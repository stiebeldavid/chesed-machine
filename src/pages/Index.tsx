
import { Header } from "@/components/Header";
import { IdeaGenerator } from "@/components/IdeaGenerator";
import { useIdeaComponents } from "@/hooks/useIdeaComponents";
import { WelcomeModal } from "@/components/WelcomeModal";

const Index = () => {
  const ideaComponents = useIdeaComponents();

  return (
    <div className="min-h-screen flex flex-col items-center px-4 py-4 gap-4 bg-gradient-to-b from-[#D3E4FD] to-[#F0F7FF]">
      <WelcomeModal showOnFirstVisit={true} />
      <Header />
      <IdeaGenerator ideaComponents={ideaComponents} />
    </div>
  );
};

export default Index;
