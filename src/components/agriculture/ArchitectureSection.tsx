import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Network, ArrowRight } from "lucide-react";

export const ArchitectureSection = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="w-5 h-5 text-agri-green" />
            System Architecture
          </CardTitle>
          <CardDescription>Complete RAG + Multi-Agent Architecture Diagram</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Architecture Diagram */}
          <div className="bg-muted/30 p-6 rounded-lg font-mono text-xs space-y-4 overflow-x-auto">
            <pre className="text-foreground">
{`┌─────────────────────────────────────────────────────────────────────────┐
│                            FRONTEND LAYER                               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │   React UI (TypeScript)                                          │  │
│  │   - Query Input Interface                                        │  │
│  │   - Crop/Season/Region Selectors                                 │  │
│  │   - Response Display                                             │  │
│  │   - Knowledge Base Browser                                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │ HTTP Request
                                ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          BACKEND LAYER (Lovable Cloud)                  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │   Edge Function: agriculture-advisor                            │  │
│  │   ┌──────────────────────────────────────────────────────────┐  │  │
│  │   │  1. Query Router (Agent Selection)                       │  │  │
│  │   │     - Analyze query type                                 │  │  │
│  │   │     - Select appropriate agent                           │  │  │
│  │   └──────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                │                                         │
│                                ▼                                         │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │   Multi-Agent System                                             │  │
│  │   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────┐ │  │
│  │   │   Crop     │  │   Soil     │  │  Scheme    │  │ General  │ │  │
│  │   │  Advisor   │  │  Expert    │  │  Finder    │  │  Agent   │ │  │
│  │   └─────┬──────┘  └─────┬──────┘  └─────┬──────┘  └────┬─────┘ │  │
│  │         └────────────────┴────────────────┴──────────────┘       │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
│                                     ▼                                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │   RAG Pipeline                                                   │  │
│  │   ┌──────────────────────────────────────────────────────────┐  │  │
│  │   │  2. Document Retriever                                   │  │  │
│  │   │     - Full-text search (PostgreSQL)                      │  │  │
│  │   │     - Category filtering                                 │  │  │
│  │   │     - Semantic matching                                  │  │  │
│  │   │     - Top-K selection (K=3-5)                            │  │  │
│  │   └──────────────────────────────────────────────────────────┘  │  │
│  │                             │                                     │  │
│  │                             ▼                                     │  │
│  │   ┌──────────────────────────────────────────────────────────┐  │  │
│  │   │  3. Context Builder                                      │  │  │
│  │   │     - Aggregate retrieved documents                      │  │  │
│  │   │     - Add metadata (crop, season, region)                │  │  │
│  │   │     - Format context for LLM                             │  │  │
│  │   └──────────────────────────────────────────────────────────┘  │  │
│  │                             │                                     │  │
│  │                             ▼                                     │  │
│  │   ┌──────────────────────────────────────────────────────────┐  │  │
│  │   │  4. LLM Generator (Lovable AI)                           │  │  │
│  │   │     - Model: google/gemini-2.5-flash                     │  │  │
│  │   │     - Context-aware prompting                            │  │  │
│  │   │     - Agent-specific instructions                        │  │  │
│  │   │     - Generate response                                  │  │  │
│  │   └──────────────────────────────────────────────────────────┘  │  │
│  └──────────────────────────────────┬───────────────────────────────┘  │
└───────────────────────────────────┬─┴─────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          DATABASE LAYER (PostgreSQL)                    │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │   Tables:                                                        │  │
│  │   1. knowledge_base (16+ documents)                             │  │
│  │      - Crop guides, Soil info, Schemes, Productivity tips       │  │
│  │      - Full-text search index                                   │  │
│  │      - Category & tag indexing                                  │  │
│  │                                                                  │  │
│  │   2. queries (History & Analytics)                              │  │
│  │      - Query logs                                               │  │
│  │      - Response tracking                                        │  │
│  │      - Performance metrics                                      │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘`}
            </pre>
          </div>

          {/* Workflow Steps */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Request Flow</h3>
            {[
              {
                step: 1,
                title: "Query Input",
                desc: "User submits query with optional crop/season/region filters",
              },
              {
                step: 2,
                title: "Agent Selection",
                desc: "Router analyzes query and selects appropriate agent (Crop/Soil/Scheme/General)",
              },
              {
                step: 3,
                title: "Document Retrieval",
                desc: "RAG pipeline searches knowledge base using full-text search + filtering",
              },
              {
                step: 4,
                title: "Context Building",
                desc: "Retrieved documents formatted with metadata into LLM context",
              },
              {
                step: 5,
                title: "LLM Generation",
                desc: "Gemini 2.5 Flash generates response using retrieved context",
              },
              {
                step: 6,
                title: "Response Logging",
                desc: "Query and response stored in database for analytics",
              },
            ].map((item) => (
              <div key={item.step} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                <Badge className="bg-agri-green text-primary-foreground">{item.step}</Badge>
                <div className="flex-1">
                  <p className="font-semibold text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-1">{item.desc}</p>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground mt-1" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Tech Stack */}
      <Card>
        <CardHeader>
          <CardTitle>Technology Stack</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Frontend</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">React 18</Badge>
                <Badge variant="outline">TypeScript</Badge>
                <Badge variant="outline">Tailwind CSS</Badge>
                <Badge variant="outline">shadcn/ui</Badge>
                <Badge variant="outline">Vite</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Backend</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Lovable Cloud</Badge>
                <Badge variant="outline">Edge Functions (Deno)</Badge>
                <Badge variant="outline">PostgreSQL</Badge>
                <Badge variant="outline">Full-text Search</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">AI/ML</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Lovable AI</Badge>
                <Badge variant="outline">Google Gemini 2.5 Flash</Badge>
                <Badge variant="outline">RAG Pipeline</Badge>
                <Badge variant="outline">Multi-Agent System</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">Features</h4>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Real-time Queries</Badge>
                <Badge variant="outline">Document Retrieval</Badge>
                <Badge variant="outline">Context-Aware Responses</Badge>
                <Badge variant="outline">Query History</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
