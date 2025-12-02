import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Database, Search, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface KnowledgeItem {
  id: string;
  title: string;
  content: string;
  category: string;
  crop_name?: string;
  season?: string;
  region?: string;
  tags: string[];
}

export const KnowledgeSection = () => {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([]);
  const [filteredKnowledge, setFilteredKnowledge] = useState<KnowledgeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchKnowledge();
  }, []);

  useEffect(() => {
    filterKnowledge();
  }, [searchTerm, categoryFilter, knowledge]);

  const fetchKnowledge = async () => {
    try {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .order("category", { ascending: true });

      if (error) throw error;
      setKnowledge(data || []);
    } catch (error: any) {
      console.error("Error fetching knowledge:", error);
      toast.error("Failed to load knowledge base");
    } finally {
      setLoading(false);
    }
  };

  const filterKnowledge = () => {
    let filtered = knowledge;

    if (categoryFilter !== "all") {
      filtered = filtered.filter((item) => item.category === categoryFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.title.toLowerCase().includes(term) ||
          item.content.toLowerCase().includes(term) ||
          item.tags.some((tag) => tag.toLowerCase().includes(term))
      );
    }

    setFilteredKnowledge(filtered);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      crop: "bg-agri-green/10 text-agri-green border-agri-green/20",
      soil: "bg-agri-soil/10 text-agri-soil border-agri-soil/20",
      scheme: "bg-agri-earth/10 text-agri-earth border-agri-earth/20",
      productivity: "bg-agri-green-light/30 text-foreground border-agri-green/20",
    };
    return colors[category] || "bg-muted text-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="w-5 h-5 text-agri-green" />
          Knowledge Base
        </CardTitle>
        <CardDescription>
          Browse the agriculture knowledge corpus used by the RAG system
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search knowledge base..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="crop">Crop Info</SelectItem>
              <SelectItem value="soil">Soil Info</SelectItem>
              <SelectItem value="scheme">Govt Schemes</SelectItem>
              <SelectItem value="productivity">Productivity</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-agri-green/5 rounded-lg border border-agri-green/20">
            <p className="text-2xl font-bold text-agri-green">{knowledge.filter((k) => k.category === "crop").length}</p>
            <p className="text-xs text-muted-foreground">Crop Guides</p>
          </div>
          <div className="p-3 bg-agri-soil/5 rounded-lg border border-agri-soil/20">
            <p className="text-2xl font-bold text-agri-soil">{knowledge.filter((k) => k.category === "soil").length}</p>
            <p className="text-xs text-muted-foreground">Soil Info</p>
          </div>
          <div className="p-3 bg-agri-earth/5 rounded-lg border border-agri-earth/20">
            <p className="text-2xl font-bold text-agri-earth">{knowledge.filter((k) => k.category === "scheme").length}</p>
            <p className="text-xs text-muted-foreground">Schemes</p>
          </div>
          <div className="p-3 bg-agri-green-light/30 rounded-lg border border-agri-green/20">
            <p className="text-2xl font-bold text-foreground">
              {knowledge.filter((k) => k.category === "productivity").length}
            </p>
            <p className="text-xs text-muted-foreground">Tips</p>
          </div>
        </div>

        {/* Knowledge Items */}
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading knowledge base...</p>
          ) : filteredKnowledge.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No results found</p>
          ) : (
            filteredKnowledge.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <Badge className={getCategoryColor(item.category)} variant="outline">
                      {item.category}
                    </Badge>
                  </div>
                  {(item.crop_name || item.season || item.region) && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {item.crop_name && (
                        <Badge variant="secondary" className="text-xs">
                          {item.crop_name}
                        </Badge>
                      )}
                      {item.season && (
                        <Badge variant="secondary" className="text-xs">
                          {item.season}
                        </Badge>
                      )}
                      {item.region && (
                        <Badge variant="secondary" className="text-xs">
                          {item.region}
                        </Badge>
                      )}
                    </div>
                  )}
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground line-clamp-3">{item.content}</p>
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {item.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          #{tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};
