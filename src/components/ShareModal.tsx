
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Copy, Twitter } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ShareModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  ideaText: string;
  action: string;
  recipient: string;
  time: string;
}

export function ShareModal({ open, onOpenChange, ideaText, action, recipient, time }: ShareModalProps) {
  const { toast } = useToast();
  const [showReminderForm, setShowReminderForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [savedCommitmentId, setSavedCommitmentId] = useState<number | null>(null);

  // Save the commitment as soon as the modal opens
  useEffect(() => {
    if (open) {
      saveInitialCommitment();
    }
  }, [open]);

  const saveInitialCommitment = async () => {
    console.log("Saving initial commitment...");
    try {
      const { data, error } = await supabase
        .from('chesed_commitments')
        .insert([
          {
            what: action,
            whom: recipient,
            when_to: time,
          }
        ])
        .select();

      console.log("Initial save response:", { data, error });

      if (error) {
        console.error("Initial save error:", error);
        throw error;
      }

      if (data && data[0]) {
        setSavedCommitmentId(data[0].id);
      }

      toast({
        title: "Commitment saved!",
        description: "Would you like us to send you a reminder?",
      });
    } catch (error) {
      console.error("Error in initial save:", error);
      toast({
        title: "Error saving commitment",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(ideaText);
      toast({
        title: "Copied to clipboard",
        description: "You can now paste the idea anywhere!",
      });
    } catch (err) {
      toast({
        title: "Failed to copy",
        description: "Please try again",
        variant: "destructive",
      });
    }
  };

  const shareToSocial = (platform: string) => {
    const text = encodeURIComponent(ideaText);
    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${text}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}&quote=${text}`,
      whatsapp: `https://wa.me/?text=${text}`,
    };
    
    if (platform in urls) {
      window.open(urls[platform as keyof typeof urls], "_blank");
    }
  };

  const updateCommitmentWithReminder = async () => {
    if (!savedCommitmentId) return;
    
    setIsSubmitting(true);
    console.log("Updating commitment with reminder details...");

    try {
      const { data, error } = await supabase
        .from('chesed_commitments')
        .update({
          user_name: name,
          user_email: email
        })
        .eq('id', savedCommitmentId)
        .select();

      console.log("Update response:", { data, error });

      if (error) {
        console.error("Update error:", error);
        throw error;
      }

      toast({
        title: "Reminder set!",
        description: "We'll send you a reminder for your commitment.",
      });

      setShowReminderForm(false);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating commitment:", error);
      toast({
        title: "Error setting reminder",
        description: "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>That's great! Tizku L'Mitzvos!</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-lg">{ideaText}</p>
          
          {!showReminderForm ? (
            <div className="flex flex-col gap-4">
              <Button 
                variant="default" 
                className="bg-[#0EA5E9] hover:bg-[#0993D3]"
                onClick={() => setShowReminderForm(true)}
              >
                ⏰ Send me a reminder
              </Button>
              
              <div className="flex justify-center gap-4">
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={copyToClipboard}
                  className="hover:bg-gray-100"
                >
                  <Copy className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => shareToSocial("facebook")}
                  className="hover:bg-[#1877F2]/10"
                >
                  <div className="h-5 w-5 bg-[#1877F2] rounded flex items-center justify-center">
                    <span className="text-white font-bold text-lg">f</span>
                  </div>
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => shareToSocial("twitter")}
                  className="hover:bg-[#1DA1F2]/10"
                >
                  <Twitter className="h-5 w-5 text-[#1DA1F2]" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={() => shareToSocial("whatsapp")}
                  className="hover:bg-[#25D366]/10"
                >
                  <div className="h-5 w-5 bg-[#25D366] rounded-full flex items-center justify-center">
                    <svg 
                      viewBox="0 0 24 24" 
                      className="h-3 w-3 text-white"
                      fill="currentColor"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                  </div>
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.email@example.com"
                />
              </div>
              <Button 
                variant="default"
                className="bg-[#0EA5E9] hover:bg-[#0993D3]"
                onClick={updateCommitmentWithReminder}
                disabled={isSubmitting || !name || !email}
              >
                Save and remind me later
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowReminderForm(false)}
                disabled={isSubmitting}
              >
                Back
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
