import { createClient } from "@/utils/supabase/server";
import { CreatePresetDialog } from "@/components/library/create-preset-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export const PresetList = async () => {
  const supabase = await createClient();
  const { data: presets } = await supabase.from("presets").select("*");

  if (!presets) {
    return (
      <div className="h-24 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (presets.length === 0) {
    return (
      <div className="text-center py-6">
        <p className="text-muted-foreground mb-4">No presets found.</p>
        <CreatePresetDialog />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="hidden md:table-cell">Description</TableHead>
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {presets.map((preset) => (
              <TableRow key={preset.id} className="group">
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{preset.name}</span>
                    {/* Show description on mobile as subtitle */}
                    <span className="text-sm text-muted-foreground md:hidden line-clamp-1">
                      {preset.description || "-"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="hidden md:table-cell">
                  {preset.description || "-"}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Link href={`/library/view/${preset.id}`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hidden sm:inline-flex hover:bg-accent"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/library/edit/${preset.id}`}>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        className="hover:bg-accent"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end">
        <CreatePresetDialog />
      </div>
    </div>
  );
};
