
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Facebook, Copy, Twitter } from "lucide-react";
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
    };
    
    if (platform in urls) {
      window.open(urls[platform as keyof typeof urls], "_blank");
    }
  };

  const saveCommitment = async (includeReminder: boolean) => {
    setIsSubmitting(true);
    console.log("Starting to save commitment...");
    console.log("Data to save:", {
      action,
      recipient,
      time,
      full_text: ideaText,
      name: includeReminder ? name : null,
      email: includeReminder ? email : null
    });

    try {
      const { data, error } = await supabase
        .from('chesed_commitments')
        .insert([
          {
            action,
            recipient,
            time,
            full_text: ideaText,
            name: includeReminder ? name : null,
            email: includeReminder ? email : null
          }
        ])
        .select();

      console.log("Supabase response:", { data, error });

      if (error) {
        console.error("Supabase error:", error);
        throw error;
      }

      toast({
        title: "Awesome!",
        description: includeReminder 
          ? "Your commitment has been saved and we'll send you a reminder!" 
          : "Your commitment has been saved!",
      });

      if (includeReminder) {
        setShowReminderForm(false);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Error in saveCommitment:", error);
      toast({
        title: "Error saving commitment",
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
          <DialogTitle>I want to do this one!</DialogTitle>
          <DialogDescription>
            That's wonderful! This chesed idea has been saved.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          <p className="text-lg">{ideaText}</p>
          
          {!showReminderForm ? (
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" onClick={copyToClipboard}>
                  <Copy className="mr-2 h-4 w-4" />
                  Copy
                </Button>
                <Button variant="outline" onClick={() => shareToSocial("facebook")}>
                  <Facebook className="mr-2 h-4 w-4" />
                  Share
                </Button>
                <Button variant="outline" onClick={() => shareToSocial("twitter")}>
                  <Twitter className="mr-2 h-4 w-4" />
                  Tweet
                </Button>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  variant="default" 
                  className="bg-[#0EA5E9] hover:bg-[#0993D3]"
                  onClick={() => setShowReminderForm(true)}
                >
                  ⏰ Send me a reminder
                </Button>
                <Button 
                  variant="ghost"
                  onClick={() => saveCommitment(false)}
                  disabled={isSubmitting}
                >
                  No reminder needed
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
                onClick={() => saveCommitment(true)}
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
