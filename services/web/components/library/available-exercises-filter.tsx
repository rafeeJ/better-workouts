// Client component for filter
'use client';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ExerciseTypeFilterProps {
  onFilter: (type: string) => void;
}

export const ExerciseTypeFilter = ({ onFilter }: ExerciseTypeFilterProps) => {
  const exerciseTypes = [
    "biceps",
    "triceps",
    "chest",
    "back",
    "legs",
    "shoulders",
  ] as const;

  return (
    <Select onValueChange={onFilter}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Select type" />
      </SelectTrigger>
      <SelectContent>
        {exerciseTypes.map((type) => (
          <SelectItem key={type} value={type} className="capitalize">
            {type}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};
