import { supabase } from "@/lib/supabase";

export interface LitterOption {
  id: string;
  name: string;
}

export async function getLitters(): Promise<LitterOption[]> {
  const { data, error } = await supabase.from("litters").select("id, name").order("name");
  if (error) throw error;
  return data ?? [];
}
