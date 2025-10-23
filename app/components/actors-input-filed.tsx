
"use client";

import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormDescription, FormLabel } from "@/components/ui/form";

interface ActorsInputProps {
  form: UseFormReturn<any>;
}

export function ActorsInput({ form }: ActorsInputProps) {
  const [actorInput, setActorInput] = useState("");

  const addActor = () => {
    if (actorInput.trim() && !form.getValues("actors").includes(actorInput.trim())) {
      const currentActors = form.getValues("actors");
      form.setValue("actors", [...currentActors, actorInput.trim()]);
      setActorInput("");
    }
  };

  const removeActor = (actorToRemove: string) => {
    const currentActors = form.getValues("actors");
    form.setValue(
      "actors",
      currentActors.filter((actor: string) => actor !== actorToRemove)
    );
  };

  const actors = form.watch("actors");

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <FormLabel>Actors</FormLabel>
        <div className="flex gap-2">
          <Input
            placeholder="Add actor name"
            value={actorInput}
            onChange={(e) => setActorInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addActor();
              }
            }}
          />
          <Button type="button" onClick={addActor} variant="outline">
            Add
          </Button>
        </div>
        <FormDescription>
          Press Enter or click Add to include actors
        </FormDescription>
      </div>

      <div className="flex flex-wrap gap-2 min-h-[60px]">
        {actors.map((actor: string) => (
          <Badge key={actor} variant="secondary" className="px-3 py-1">
            {actor}
            <button
              type="button"
              onClick={() => removeActor(actor)}
              className="ml-2 hover:text-destructive"
            >
              ×
            </button>
          </Badge>
        ))}
      </div>
    </div>
  );
}