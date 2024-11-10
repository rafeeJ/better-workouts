'use client';

import { useState } from "react";
import { getExercises } from "@/queries/get-exercises";
import { createClient } from "@/utils/supabase/client";
import { ExerciseTypeFilter } from "../library/available-exercises-filter";
import { useRouter } from "next/navigation";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

export const Exercises = () => {
  const router = useRouter();
  const [exercises, setExercises] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleFilter = async (type: string) => {
    setIsLoading(true);
    const supabase = createClient();
    const { data } = await getExercises(supabase, type);
    setExercises(data || []);
    setIsLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <ExerciseTypeFilter onFilter={handleFilter} />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Type</TableHead>
              <TableHead className="hidden lg:table-cell">Description</TableHead>
              <TableHead className="w-[100px]">Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24">
                  Loading...
                </TableCell>
              </TableRow>
            ) : exercises.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                  Select a type to view exercises
                </TableCell>
              </TableRow>
            ) : (
              exercises.map((exercise) => (
                <TableRow 
                  key={exercise.id}
                  className="group cursor-pointer"
                  onClick={() => router.push(`/exercises/${exercise.id}`)}
                >
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{exercise.name}</span>
                      {/* Show type on mobile as subtitle */}
                      <span className="text-sm text-muted-foreground md:hidden">
                        {exercise.type}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell capitalize">
                    {exercise.type}
                  </TableCell>
                  <TableCell className="hidden lg:table-cell">
                    {exercise.description || "-"}
                  </TableCell>
                  <TableCell>
                    <button
                      className={cn(
                        "px-3 py-1 text-sm rounded-md w-full",
                        "bg-primary text-primary-foreground",
                        "group-hover:bg-primary/90 transition-colors"
                      )}
                    >
                      View
                    </button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}; 