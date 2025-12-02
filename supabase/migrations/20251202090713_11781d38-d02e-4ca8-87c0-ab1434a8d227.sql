
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Knowledge Base Table: Stores agriculture knowledge documents
CREATE TABLE public.knowledge_base (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('crop', 'soil', 'scheme', 'productivity', 'general')),
  crop_name TEXT,
  season TEXT,
  region TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Queries History Table: Stores user queries and AI responses
CREATE TABLE public.queries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  query_text TEXT NOT NULL,
  crop_name TEXT,
  season TEXT,
  region TEXT,
  agent_type TEXT CHECK (agent_type IN ('crop_advisor', 'soil_expert', 'scheme_finder', 'general')),
  response TEXT NOT NULL,
  confidence_score NUMERIC(3, 2),
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_knowledge_base_category ON public.knowledge_base(category);
CREATE INDEX idx_knowledge_base_crop ON public.knowledge_base(crop_name);
CREATE INDEX idx_knowledge_base_tags ON public.knowledge_base USING GIN(tags);
CREATE INDEX idx_queries_created ON public.queries(created_at DESC);
CREATE INDEX idx_queries_crop ON public.queries(crop_name);

-- Enable Row Level Security
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.queries ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Allow public read access for knowledge base (educational purposes)
CREATE POLICY "Knowledge base is publicly readable"
  ON public.knowledge_base
  FOR SELECT
  USING (true);

-- RLS Policies: Allow public insert for queries (no auth required for demo)
CREATE POLICY "Anyone can insert queries"
  ON public.queries
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can read queries"
  ON public.queries
  FOR SELECT
  USING (true);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for knowledge_base updates
CREATE TRIGGER update_knowledge_base_updated_at
  BEFORE UPDATE ON public.knowledge_base
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert Sample Knowledge Base Data

-- Crop Information
INSERT INTO public.knowledge_base (title, content, category, crop_name, season, region, tags) VALUES
('Rice Cultivation Guide', 'Rice (Oryza sativa) is best grown in monsoon season (June-October) in regions with high rainfall. Requires flooded fields, temperature 20-35°C. NPK ratio 120:60:40 kg/ha recommended. Transplanting after 25-30 days. Harvest at 80% grain maturity. Common varieties: Basmati, IR64, Swarna.', 'crop', 'Rice', 'Monsoon', 'Pan-India', ARRAY['paddy', 'kharif', 'water-intensive']),

('Wheat Growing Practices', 'Wheat (Triticum aestivum) thrives in Rabi season (Nov-March) in northern regions. Optimal temperature 15-20°C. Requires well-drained loamy soil, pH 6.0-7.5. NPK: 120:60:40 kg/ha. Sowing depth: 5-6 cm. Irrigation at crown root, tillering, jointing, flowering stages. Harvest at physiological maturity (110-120 days).', 'crop', 'Wheat', 'Rabi', 'North India', ARRAY['rabi', 'winter-crop', 'food-grain']),

('Cotton Farming Essentials', 'Cotton (Gossypium) cultivation ideal in Kharif season (April-June sowing). Temperature 21-30°C. Deep black soil preferred. NPK: 100:50:50 kg/ha. Spacing: 60x30 cm. Major pests: Bollworm, aphids - use IPM. Picking at 50% boll opening. Varieties: Bt cotton hybrids.', 'crop', 'Cotton', 'Kharif', 'Central & South India', ARRAY['cash-crop', 'fiber', 'kharif']),

('Tomato Cultivation Guide', 'Tomato (Solanum lycopersicum) suitable for year-round cultivation with controlled environment. Best in winter/spring. Temperature 18-27°C. Well-drained soil, pH 6.0-7.0. NPK: 150:100:100 kg/ha. Transplanting after 4-5 weeks. Staking required. Harvest at red-ripe stage. Varieties: Pusa Ruby, Arka Vikas.', 'crop', 'Tomato', 'Winter', 'Pan-India', ARRAY['vegetable', 'commercial', 'year-round']);

-- Soil Information
INSERT INTO public.knowledge_base (title, content, category, tags) VALUES
('Understanding Soil pH', 'Soil pH measures acidity/alkalinity on 0-14 scale. pH 7 is neutral, <7 acidic, >7 alkaline. Most crops prefer pH 6.0-7.5. Acidic soils: add lime/dolomite. Alkaline soils: add gypsum/sulphur. Test using pH meter or litmus. pH affects nutrient availability - Iron available in acidic, Phosphorus in neutral pH.', 'soil', ARRAY['pH', 'acidity', 'alkalinity', 'lime']),

('Nitrogen Deficiency Symptoms', 'Nitrogen (N) deficiency shows as: yellowing of older leaves (chlorosis), stunted growth, reduced tillering, pale green plants. Causes: leaching in sandy soils, poor organic matter, continuous cropping. Solution: Apply urea (46% N), CAN, or organic manure. Dose: 120-150 kg N/ha for cereals. Split application recommended.', 'soil', ARRAY['nitrogen', 'NPK', 'deficiency', 'fertilizer']),

('Phosphorus in Soil', 'Phosphorus (P) essential for root development, flowering, seed formation. Deficiency: dark green/purple leaves, poor root growth, delayed maturity. Available forms: H2PO4- in acidic, HPO42- in alkaline soils. Sources: DAP, SSP, rock phosphate. Application: 60-80 kg P2O5/ha at sowing. Fixes in soil, so place near roots.', 'soil', ARRAY['phosphorus', 'NPK', 'DAP', 'root-development']),

('Potassium Management', 'Potassium (K) regulates water balance, enzyme activation, disease resistance. Deficiency: marginal yellowing, weak stems, lodging, poor grain fill. Sources: MOP (Muriate of Potash), SOP. Application: 40-60 kg K2O/ha. Critical in rice, sugarcane. Luxury consumption crop - apply based on soil test.', 'soil', ARRAY['potassium', 'NPK', 'MOP', 'disease-resistance']),

('Organic Matter in Soil', 'Organic matter improves soil structure, water retention, microbial activity, nutrient supply. Sources: FYM, compost, green manure, crop residues. Benefits: reduces bulk density, increases CEC, slow-release nutrients. Application: 10-15 tonnes FYM/ha or grow legumes as green manure (Dhaincha, Sesbania). Decomposes releasing NPK.', 'soil', ARRAY['organic', 'FYM', 'compost', 'green-manure']);

-- Government Schemes
INSERT INTO public.knowledge_base (title, content, category, tags) VALUES
('PM-KISAN Scheme', 'Pradhan Mantri Kisan Samman Nidhi (PM-KISAN): Income support to farmers. Benefits: ₹6,000/year in 3 installments of ₹2,000 each. Eligibility: All landholding farmers (no land size limit). Registration: Through CSC, state portals, or PM-KISAN portal. Documents: Aadhaar, bank account, land records. Direct Benefit Transfer to bank account.', 'scheme', ARRAY['PM-KISAN', 'income-support', 'DBT', 'subsidy']),

('Soil Health Card Scheme', 'Soil Health Card (SHC): Provides soil nutrient status. Benefits: Free soil testing, customized fertilizer recommendations, reduce input costs. Coverage: Every 2 years for irrigated, 3 years for rainfed areas. Process: Collect soil samples → Test at labs → SHC issued with recommendations. Available at Krishi Vigyan Kendras (KVKs).', 'scheme', ARRAY['SHC', 'soil-testing', 'fertilizer-recommendation', 'KVK']),

('PM Fasal Bima Yojana', 'Pradhan Mantri Fasal Bima Yojana (PMFBY): Crop insurance against natural calamities. Coverage: All crops, all risks. Premium: 2% for Kharif, 1.5% for Rabi, 5% for commercial/horticultural. Government subsidizes rest. Claims: Yield loss assessed at village level. Enrolment: Through banks, CSCs during sowing. Mandatory for loanee farmers.', 'scheme', ARRAY['PMFBY', 'crop-insurance', 'premium', 'yield-loss']),

('Kisan Credit Card Scheme', 'Kisan Credit Card (KCC): Credit facility for agricultural needs. Benefits: Interest subvention @7% (effective 4% with prompt repayment), no collateral up to ₹1.6 lakh. Coverage: Seeds, fertilizers, pesticides, farm equipment. Limit: Based on cropping pattern and land size. Validity: 5 years. Available from cooperative banks, RRBs, commercial banks.', 'scheme', ARRAY['KCC', 'credit', 'loan', 'interest-subvention']);

-- Productivity Tips
INSERT INTO public.knowledge_base (title, content, category, tags) VALUES
('Integrated Pest Management', 'Integrated Pest Management (IPM): Eco-friendly pest control. Components: 1) Cultural - crop rotation, sanitation, 2) Mechanical - traps, handpicking, 3) Biological - Trichogramma, NPV, 4) Chemical - last resort. Economic Threshold Level (ETL) based spraying. Reduces pesticide use, cost-effective, safer for environment and consumers.', 'productivity', ARRAY['IPM', 'pest-control', 'organic', 'ETL']),

('Drip Irrigation Benefits', 'Drip irrigation: Water-efficient technology. Advantages: 40-70% water saving, 20-30% yield increase, fertilizer efficiency through fertigation, weed reduction, suitable for undulating lands. Cost: ₹50,000-1,25,000/ha. Subsidy: 55% under PMKSY. Ideal for: vegetables, orchards, cotton, sugarcane. Maintenance: Filter cleaning, lateral flushing, chlorination.', 'productivity', ARRAY['drip-irrigation', 'water-saving', 'fertigation', 'PMKSY']),

('Crop Rotation Principles', 'Crop Rotation: Growing different crops sequentially on same land. Benefits: Breaks pest/disease cycle, improves soil fertility (legumes fix nitrogen), reduces weed pressure, better resource utilization. Example: Rice-Wheat-Mung, Cotton-Wheat, Maize-Potato. Include legumes (green manure), vary root depths, avoid same family crops consecutively.', 'productivity', ARRAY['rotation', 'soil-health', 'legumes', 'sustainability']),

('Precision Agriculture', 'Precision Agriculture: Technology-driven farming. Tools: GPS, drones, sensors, IoT. Applications: Variable rate application (VRA) of inputs, yield mapping, soil mapping, crop health monitoring. Benefits: Optimized input use, increased productivity, reduced environmental impact. Cost: High initial investment. Suitable for large-scale commercial farms. Growing adoption with falling technology costs.', 'productivity', ARRAY['precision-ag', 'drones', 'GPS', 'IoT']);

-- Add full-text search capability
CREATE INDEX idx_knowledge_base_content_search ON public.knowledge_base USING gin(to_tsvector('english', title || ' ' || content));
