"use client";

import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface IssueModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function IssueModal({ open, onOpenChange }: IssueModalProps) {
  const [issue, setIssue] = React.useState("");

  const handleSubmit = () => {
    // Just close the modal, don't actually submit anywhere
    setIssue("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogClose onClick={() => onOpenChange(false)} />
        
        <div className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl text-white">Report an Issue</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm text-white/60 mb-2 block">Describe your issue</label>
              <textarea
                value={issue}
                onChange={(e) => setIssue(e.target.value)}
                placeholder="Please describe the issue you encountered..."
                className="w-full h-32 bg-background border border-primary/30 rounded-lg p-3 text-white placeholder:text-white/40 focus:outline-none focus:border-primary/50 resize-none"
              />
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!issue.trim()}
              className="w-full"
              size="lg"
            >
              Submit Report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
