import { useState } from "react";
import { QuerySection } from "@/components/agriculture/QuerySection";
import { ResponseSection } from "@/components/agriculture/ResponseSection";
import { KnowledgeSection } from "@/components/agriculture/KnowledgeSection";
import { ArchitectureSection } from "@/components/agriculture/ArchitectureSection";
import { TestQueriesSection } from "@/components/agriculture/TestQueriesSection";
import { Leaf, Brain, Database, Sprout } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export interface QueryResponse {
  query: string;
  crop?: string;
  season?: string;
  region?: string;
  agent: string;
  response: string;
  confidence: number;
  processingTime: number;
}

const Index = () => {
  const [currentResponse, setCurrentResponse] = useState<QueryResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-earth">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-agri rounded-lg">
              <Sprout className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">AI Agriculture Advisor</h1>
              <p className="text-sm text-muted-foreground">RAG-Powered Farming Intelligence System</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground mt-4">
            <div className="flex items-center gap-2">
              <Brain className="w-4 h-4 text-agri-green" />
              <span>Multi-Agent System</span>
            </div>
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-agri-earth" />
              <span>RAG Pipeline</span>
            </div>
            <div className="flex items-center gap-2">
              <Leaf className="w-4 h-4 text-agri-soil" />
              <span>LangChain Workflow</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="advisor" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:inline-grid">
            <TabsTrigger value="advisor">AI Advisor</TabsTrigger>
            <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
            <TabsTrigger value="architecture">Architecture</TabsTrigger>
            <TabsTrigger value="testing">Test Queries</TabsTrigger>
          </TabsList>

          <TabsContent value="advisor" className="space-y-6">
            <div className="grid lg:grid-cols-2 gap-6">
              <QuerySection
                onQuerySubmit={setCurrentResponse}
                isLoading={isLoading}
                setIsLoading={setIsLoading}
              />
              <ResponseSection response={currentResponse} isLoading={isLoading} />
            </div>
          </TabsContent>

          <TabsContent value="knowledge">
            <KnowledgeSection />
          </TabsContent>

          <TabsContent value="architecture">
            <ArchitectureSection />
          </TabsContent>

          <TabsContent value="testing">
            <TestQueriesSection onQuerySubmit={setCurrentResponse} setIsLoading={setIsLoading} />
          </TabsContent>
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 backdrop-blur-sm mt-12">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-sm text-muted-foreground">
            <p className="font-semibold mb-2">🎓 AI Agriculture Advisor - Capstone Project</p>
            <p>Powered by RAG + LLM | LangChain Workflow | Multi-Agent Architecture</p>
            <p className="mt-2 text-xs">
              Tech Stack: React + TypeScript + Lovable Cloud + Lovable AI (Gemini 2.5 Flash)
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
