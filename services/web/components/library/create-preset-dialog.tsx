"use client";
import { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export const CreatePresetDialog = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);
    
    try {
      const supabase = createClient();
      
      // Get the current user's ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      const { data, error } = await supabase
        .from("presets")
        .insert([{ 
          name,
          user_id: user.id,
          description
        }])
        .select()
        .single();

      if (error) throw error;

      router.push(`/library/edit/${data.id}`);
    } catch (error) {
      console.error("Error creating preset:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>Create New Preset</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Create New Preset</DialogTitle>
        <DialogDescription>
          Enter the details for your new preset.
        </DialogDescription>
        <form onSubmit={handleSubmit} id="create-preset-form" className="space-y-4">
          <div>
            <label htmlFor="name" className="text-sm font-medium">Name</label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="description" className="text-sm font-medium">Description</label>
            <Input
              id="description"
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional description"
            />
          </div>
        </form>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="submit" form="create-preset-form">Submit</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
