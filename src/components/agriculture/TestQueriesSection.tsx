import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FlaskConical, PlayCircle } from "lucide-react";
import { QueryResponse } from "@/pages/Index";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TestQuery {
  id: string;
  query: string;
  crop?: string;
  season?: string;
  region?: string;
  category: string;
  expectedAgent: string;
}

const TEST_QUERIES: TestQuery[] = [
  {
    id: "1",
    query: "What is the best NPK ratio for rice cultivation in monsoon season?",
    crop: "Rice",
    season: "Monsoon",
    region: "Pan-India",
    category: "Crop Guidance",
    expectedAgent: "Crop Advisor",
  },
  {
    id: "2",
    query: "How do I identify nitrogen deficiency in wheat plants?",
    crop: "Wheat",
    category: "Soil Health",
    expectedAgent: "Soil Expert",
  },
  {
    id: "3",
    query: "What is the PM-KISAN scheme and how can I enroll?",
    category: "Government Schemes",
    expectedAgent: "Scheme Finder",
  },
  {
    id: "4",
    query: "Explain the benefits of drip irrigation for cotton farming",
    crop: "Cotton",
    category: "Productivity",
    expectedAgent: "Productivity Advisor",
  },
  {
    id: "5",
    query: "What are the symptoms of phosphorus deficiency in soil?",
    category: "Soil Health",
    expectedAgent: "Soil Expert",
  },
  {
    id: "6",
    query: "When should I plant tomatoes and what temperature do they need?",
    crop: "Tomato",
    season: "Winter",
    category: "Crop Guidance",
    expectedAgent: "Crop Advisor",
  },
  {
    id: "7",
    query: "How can I improve soil organic matter content?",
    category: "Soil Health",
    expectedAgent: "Soil Expert",
  },
  {
    id: "8",
    query: "What is the Soil Health Card scheme?",
    category: "Government Schemes",
    expectedAgent: "Scheme Finder",
  },
  {
    id: "9",
    query: "What are the principles of crop rotation for sustainable farming?",
    category: "Productivity",
    expectedAgent: "Productivity Advisor",
  },
  {
    id: "10",
    query: "How do I control bollworm pests in cotton using IPM?",
    crop: "Cotton",
    category: "Productivity",
    expectedAgent: "Productivity Advisor",
  },
];

interface TestQueriesSectionProps {
  onQuerySubmit: (response: QueryResponse) => void;
  setIsLoading: (loading: boolean) => void;
}

export const TestQueriesSection = ({ onQuerySubmit, setIsLoading }: TestQueriesSectionProps) => {
  const runTestQuery = async (testQuery: TestQuery) => {
    setIsLoading(true);
    const startTime = Date.now();

    try {
      const { data, error } = await supabase.functions.invoke("agriculture-advisor", {
        body: {
          query: testQuery.query,
          crop: testQuery.crop,
          season: testQuery.season,
          region: testQuery.region,
        },
      });

      if (error) throw error;

      const processingTime = Date.now() - startTime;
      const response: QueryResponse = {
        query: testQuery.query,
        crop: testQuery.crop,
        season: testQuery.season,
        region: testQuery.region,
        agent: data.agent,
        response: data.response,
        confidence: data.confidence,
        processingTime,
      };

      onQuerySubmit(response);
      toast.success(`Test query completed! Agent: ${data.agent}`);
    } catch (error: any) {
      console.error("Test query error:", error);
      toast.error(error.message || "Failed to process test query");
    } finally {
      setIsLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      "Crop Guidance": "bg-agri-green/10 text-agri-green border-agri-green/20",
      "Soil Health": "bg-agri-soil/10 text-agri-soil border-agri-soil/20",
      "Government Schemes": "bg-agri-earth/10 text-agri-earth border-agri-earth/20",
      "Productivity": "bg-agri-green-light/30 text-foreground border-agri-green/20",
    };
    return colors[category] || "bg-muted text-foreground";
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FlaskConical className="w-5 h-5 text-agri-green" />
          Test Queries
        </CardTitle>
        <CardDescription>
          Pre-defined test cases to demonstrate system capabilities and agent routing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Info Banner */}
        <div className="p-4 bg-agri-green/5 border border-agri-green/20 rounded-lg">
          <h4 className="font-semibold text-sm mb-2">Testing Instructions:</h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
            <li>Click "Run Test" on any query to see the AI response</li>
            <li>Each query demonstrates specific agent routing</li>
            <li>Responses include confidence scores and processing times</li>
            <li>Results appear in the "AI Advisor" tab</li>
          </ul>
        </div>

        {/* Test Queries Grid */}
        <div className="grid gap-4">
          {TEST_QUERIES.map((testQuery) => (
            <Card key={testQuery.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Badge className={getCategoryColor(testQuery.category)} variant="outline">
                        {testQuery.category}
                      </Badge>
                      <p className="text-sm font-medium mt-2">{testQuery.query}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {testQuery.crop && (
                      <Badge variant="secondary" className="text-xs">
                        {testQuery.crop}
                      </Badge>
                    )}
                    {testQuery.season && (
                      <Badge variant="secondary" className="text-xs">
                        {testQuery.season}
                      </Badge>
                    )}
                    {testQuery.region && (
                      <Badge variant="secondary" className="text-xs">
                        {testQuery.region}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-xs">
                      Expected: {testQuery.expectedAgent}
                    </Badge>
                  </div>

                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => runTestQuery(testQuery)}
                    className="w-full"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Run Test Query
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Performance Metrics Info */}
        <div className="p-4 bg-muted/50 rounded-lg mt-6">
          <h4 className="font-semibold text-sm mb-2">Expected Performance Metrics:</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-3">
            <div>
              <p className="text-xs text-muted-foreground">Response Time</p>
              <p className="text-sm font-semibold">1-3 seconds</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Confidence Score</p>
              <p className="text-sm font-semibold">80-95%</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Retrieval Docs</p>
              <p className="text-sm font-semibold">3-5 docs</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Agent Accuracy</p>
              <p className="text-sm font-semibold">95%+</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
