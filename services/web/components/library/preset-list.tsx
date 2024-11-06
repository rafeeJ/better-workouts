import { createClient } from "@/utils/supabase/server";
import { CreatePresetDialog } from "@/components/library/create-preset-dialog";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Pencil, Eye } from "lucide-react";

export const PresetList = async () => {
  const supabase = await createClient();
  const { data: presets } = await supabase.from("presets").select("*");

  if (!presets) {
    return <div>Loading...</div>;
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
    <div className="rounded-md border w-full">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr className="border-b">
            <th className="h-12 px-4 text-left align-middle font-medium">Name</th>
            <th className="h-12 px-4 text-left align-middle font-medium">Description</th>
            <th className="h-12 px-4 text-right align-middle font-medium">Edit</th>
          </tr>
        </thead>
        <tbody>
          {presets.map((preset) => (
            <tr key={preset.id} className="border-b">
              <td className="p-4">{preset.name}</td>
              <td className="p-4">{preset.description || "-"}</td>
              <td className="p-4 text-right">
                <div className="flex justify-end gap-2">
                  <Link href={`/library/edit/${preset.id}`}>
                    <Button variant="ghost" size="sm">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="p-4 border-t">
        <CreatePresetDialog />
      </div>
    </div>
  );
};
