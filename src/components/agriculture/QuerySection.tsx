import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { QueryResponse } from "@/pages/Index";

interface QuerySectionProps {
  onQuerySubmit: (response: QueryResponse) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const CROPS = ["Rice", "Wheat", "Cotton", "Tomato", "Sugarcane", "Maize", "Potato", "Other"];
const SEASONS = ["Kharif", "Rabi", "Zaid", "Year-round"];
const REGIONS = ["North India", "South India", "East India", "West India", "Central India", "Pan-India"];

export const QuerySection = ({ onQuerySubmit, isLoading, setIsLoading }: QuerySectionProps) => {
  const [query, setQuery] = useState("");
  const [crop, setCrop] = useState("");
  const [season, setSeason] = useState("");
  const [region, setRegion] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast.error("Please enter a query");
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke("agriculture-advisor", {
        body: {
          query: query.trim(),
          crop: crop || undefined,
          season: season || undefined,
          region: region || undefined,
        },
      });

      if (error) throw error;

      const processingTime = Date.now() - startTime;
      const response: QueryResponse = {
        query: query.trim(),
        crop: crop || undefined,
        season: season || undefined,
        region: region || undefined,
        agent: data.agent,
        response: data.response,
        confidence: data.confidence,
        processingTime,
      };

      onQuerySubmit(response);
      toast.success("Response generated successfully!");
    } catch (error: any) {
      console.error("Query error:", error);
      toast.error(error.message || "Failed to process query");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="h-fit">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Send className="w-5 h-5 text-agri-green" />
          Query Input
        </CardTitle>
        <CardDescription>Ask questions about crops, soil, schemes, or productivity</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="query">Your Question</Label>
            <Textarea
              id="query"
              placeholder="E.g., What is the best NPK ratio for wheat in Rabi season?"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              rows={4}
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="crop">Crop (Optional)</Label>
              <Select value={crop} onValueChange={setCrop} disabled={isLoading}>
                <SelectTrigger id="crop">
                  <SelectValue placeholder="Select crop" />
                </SelectTrigger>
                <SelectContent>
                  {CROPS.map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="season">Season (Optional)</Label>
              <Select value={season} onValueChange={setSeason} disabled={isLoading}>
                <SelectTrigger id="season">
                  <SelectValue placeholder="Select season" />
                </SelectTrigger>
                <SelectContent>
                  {SEASONS.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="region">Region (Optional)</Label>
              <Select value={region} onValueChange={setRegion} disabled={isLoading}>
                <SelectTrigger id="region">
                  <SelectValue placeholder="Select region" />
                </SelectTrigger>
                <SelectContent>
                  {REGIONS.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Processing Query...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Submit Query
              </>
            )}
          </Button>

          {query && (
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                setQuery("");
                setCrop("");
                setSeason("");
                setRegion("");
              }}
              disabled={isLoading}
            >
              Clear Form
            </Button>
          )}
        </form>
      </CardContent>
    </Card>
  );
};
