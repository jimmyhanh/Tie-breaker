import React, { useState, useEffect, useRef } from "react";
import { Decision, AnalysisType, ProConItem, ComparisonCriteria, CriteriaRating, SWOTItem, SWOTActionItem } from "./types";
import HistoryPanel from "./components/HistoryPanel";
import DecisionForm from "./components/DecisionForm";
import {
  Scale,
  BarChart2,
  Grid,
  TrendingUp,
  FileText,
  Trash2,
  Plus,
  Edit2,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  X,
  Sparkles,
  ChevronLeft,
  Printer,
  Undo2,
  HelpCircle,
  Award,
  ArrowRight,
  Check,
  Cloud
} from "lucide-react";

// Default initial state for a demo decision so the app is not totally blank
const INITIAL_DEMO_DECISIONS: Decision[] = [
  {
    id: "demo-pricing",
    title: "Should I offer my software for free with paid features, or charge a flat $20/month premium plan?",
    context: "I am evaluating the launch strategy for my software application. I want to balance rapid user growth with sustainable solo-founder profitability and minimal support overhead.",
    analysisType: "COMPARISON",
    options: ["Freemium (Free with paid features)", "Flat $20/month Premium Plan"],
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    comparison: {
      decisionId: "demo-pricing",
      title: "Should I offer my software for free with paid features, or charge a flat $20/month premium plan?",
      options: ["Freemium (Free with paid features)", "Flat $20/month Premium Plan"],
      context: "I am evaluating the launch strategy for my software application. I want to balance rapid user growth with sustainable solo-founder profitability and minimal support overhead.",
      criteriaList: [
        {
          id: "growth",
          name: "User Acquisition & Viral Reach",
          weight: 5,
          ratings: [
            { optionName: "Freemium (Free with paid features)", rating: 5, description: "Creates a massive top-of-funnel reach with frictionless onboarding, ideal for product-led growth.", pros: ["High viral coefficient", "Organic referral loops"], cons: ["High infrastructure cost for non-paying users"] },
            { optionName: "Flat $20/month Premium Plan", rating: 2, description: "Heavy friction at sign-up. Restricts usage to high-intent leads and requires dedicated marketing.", pros: ["Exclusively premium customer base"], cons: ["Slow early brand exposure", "Higher Customer Acquisition Cost (CAC)"] }
          ]
        },
        {
          id: "profitability",
          name: "Revenue Predictability & Cash Flow",
          weight: 5,
          ratings: [
            { optionName: "Freemium (Free with paid features)", rating: 3, description: "Conversion rate is historically low (typically 1-4%). Requires huge volume to match subscription value.", pros: ["Unlimited high-volume upside"], cons: ["Difficult to forecast early revenue"] },
            { optionName: "Flat $20/month Premium Plan", rating: 5, description: "Delivers solid, immediate monthly recurring revenue (MRR) from day one per customer.", pros: ["Immediate profitability", "High average revenue per user (ARPU)"], cons: ["Lower volume of customers"] }
          ]
        },
        {
          id: "support",
          name: "Customer Support & Operational Overhead",
          weight: 4,
          ratings: [
            { optionName: "Freemium (Free with paid features)", rating: 2, description: "Free users historically submit 80%+ of support tickets but generate 0% of direct revenue.", pros: ["Large beta-testing audience"], cons: ["Risk of early solo-founder burnout"] },
            { optionName: "Flat $20/month Premium Plan", rating: 5, description: "Highly streamlined customer base of paying clients. Support tickets are low volume and high value.", pros: ["Focused, quiet support queue", "Constructive, qualified feedback"], cons: ["Higher expectation of instant service"] }
          ]
        },
        {
          id: "complexity",
          name: "Gating Logic & Development Overhead",
          weight: 3,
          ratings: [
            { optionName: "Freemium (Free with paid features)", rating: 3, description: "Requires complex usage tracking, database paywalls, feature-gating, and multi-tier subscription states.", pros: ["Highly flexible upgrade upsells"], cons: ["Prone to free-tier exploit loops"] },
            { optionName: "Flat $20/month Premium Plan", rating: 5, description: "Super simple binary subscription block. Straightforward stripe integrations and zero free abuse monitoring.", pros: ["Extremely clean engineering", "Fastest path to launch"], cons: ["Inflexible for casual browsers"] }
          ]
        }
      ],
      verdict: "For a solo developer prioritizing low operational overhead and immediate validation, the Flat $20/month Premium plan is structurally superior. While Freemium maximizes reach, it demands significant engineering overhead to enforce gating and generates heavy support ticket volumes. Starting with a flat fee lets you prove value and build with paying users before complicating your pricing model.",
      winningOption: "Flat $20/month Premium Plan",
      summary: "Freemium drives early adoption but invites high operational noise. Flat Premium guarantees immediate revenue validation with low management effort."
    }
  },
  {
    id: "demo-berlin",
    title: "Should I accept the Senior UX Role in Berlin?",
    context: "I value career growth and international exposure, but I am nervous about German bureaucracy and finding an apartment. The new job offers a 25% salary bump and relocation support.",
    analysisType: "PROS_CONS",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    prosCons: {
      decisionId: "demo-berlin",
      title: "Should I accept the Senior UX Role in Berlin?",
      context: "I value career growth and international exposure, but I am nervous about German bureaucracy and finding an apartment. The new job offers a 25% salary bump and relocation support.",
      items: [
        { id: "p1", text: "Vibrant tech ecosystem and networking hub", isPro: true, impact: 4, category: "Career", explanation: "Berlin is a major startup hub in Europe, opening doors to future design roles." },
        { id: "p2", text: "Significant salary increase (25%) including relocation bonus", isPro: true, impact: 5, category: "Financial", explanation: "Extra income provides immediate financial safety and travel funding." },
        { id: "p3", text: "Central European travel access via train networks", isPro: true, impact: 3, category: "Personal", explanation: "Easy weekend trips to France, Prague, and other European destinations." },
        { id: "c1", text: "Notorious bureaucratic hurdles for registration", isPro: false, impact: 3, category: "Personal", explanation: "Getting an 'Anmeldung' and tax number can take months of stress." },
        { id: "c2", text: "Housing market is extremely competitive/overpriced", isPro: false, impact: 4, category: "Financial", explanation: "Expect high rent competition and temporary flat searches." },
        { id: "c3", text: "Distance from immediate family support system", isPro: false, impact: 4, category: "Emotional", explanation: "An 8-hour flight difference makes keeping in touch more difficult." }
      ],
      verdict: "Based on career trajectory and financial upside, this move is highly recommended. The cultural growth potential outweighs the temporary administrative friction.",
      confidence: 82,
      summary: "A high-upside career opportunity offset by immediate relocation hassles."
    }
  },
  {
    id: "demo-car",
    title: "Buying a Tesla Model 3 vs. Toyota Prius Prime",
    context: "Looking for an eco-friendly commuter car with low maintenance costs. Charging is available at my apartment.",
    analysisType: "COMPARISON",
    options: ["Tesla Model 3", "Prius Prime"],
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    comparison: {
      decisionId: "demo-car",
      title: "Buying a Tesla Model 3 vs. Toyota Prius Prime",
      options: ["Tesla Model 3", "Prius Prime"],
      context: "Looking for an eco-friendly commuter car with low maintenance costs. Charging is available at my apartment.",
      criteriaList: [
        {
          id: "cost",
          name: "Initial Purchase & Value",
          weight: 4,
          ratings: [
            { optionName: "Tesla Model 3", rating: 3, description: "Higher upfront cost, but has good resale value and EV tax incentives.", pros: ["Premium tech"], cons: ["Higher insurance rate"] },
            { optionName: "Prius Prime", rating: 5, description: "Extremely cost-effective purchase price, excellent reliable brand record.", pros: ["Cheaper maintenance", "Lower insurance"], cons: ["Lower status symbol"] }
          ]
        },
        {
          id: "range",
          name: "Fuel & Range Flexibility",
          weight: 5,
          ratings: [
            { optionName: "Tesla Model 3", rating: 4, description: "Pure electric range of ~270 miles. Supercharger network is unmatched.", pros: ["Zero gas needed"], cons: ["Requires charging stops on long road trips"] },
            { optionName: "Prius Prime", rating: 5, description: "PHEV hybrid flexibility. 44 miles pure electric + 600 miles gas range.", pros: ["Zero range anxiety", "Great fuel economy"], cons: ["Still requires oil changes"] }
          ]
        },
        {
          id: "driving",
          name: "Driving Tech & Comfort",
          weight: 3,
          ratings: [
            { optionName: "Tesla Model 3", rating: 5, description: "Exceptional modern software, instant torque, sleek minimalist interior.", pros: ["OTA updates", "Unmatched autopilot"], cons: ["All controls on center touch screen"] },
            { optionName: "Prius Prime", rating: 3, description: "Good modern dashboard but feels like a standard economy compact sedan.", pros: ["Physical knobs"], cons: ["Clunky software UI"] }
          ]
        }
      ],
      verdict: "The Prius Prime wins on pure financial prudence and fuel flexibility, but the Tesla Model 3 delivers a vastly superior technological experience. Since apartment charging is readily available, the Model 3 is recommended if budget allows; otherwise, the Prius Prime is the ultimate bulletproof financial bet.",
      winningOption: "Tesla Model 3",
      summary: "A choice between state-of-the-art pure EV innovation and highly practical hybrid cost efficiency."
    }
  }
];

export default function App() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [selectedDecision, setSelectedDecision] = useState<Decision | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Custom addition states for interactive updates
  const [newProConText, setNewProConText] = useState("");
  const [newProConIsPro, setNewProConIsPro] = useState(true);
  const [newProConImpact, setNewProConImpact] = useState<number>(3);
  const [newProConCategory, setNewProConCategory] = useState("Personal");

  const [newSwotText, setNewSwotText] = useState("");
  const [newSwotQuadrant, setNewSwotQuadrant] = useState<"strengths" | "weaknesses" | "opportunities" | "threats">("strengths");
  const [newSwotPriority, setNewSwotPriority] = useState<"High" | "Medium" | "Low">("Medium");

  const [newCriteriaName, setNewCriteriaName] = useState("");
  const [newCriteriaWeight, setNewCriteriaWeight] = useState<number>(3);
  const [newCriteriaRatings, setNewCriteriaRatings] = useState<{ [option: string]: { rating: number; desc: string } }>({});

  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const isInitialized = useRef(false);

  // Initialize decisions from localStorage or defaults
  useEffect(() => {
    const saved = localStorage.getItem("TIEBREAKER_DECISIONS");
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Decision[];
        const hasSpecialDemo = parsed.some(d => d.id === "demo-pricing");
        let updated = parsed;
        if (!hasSpecialDemo) {
          const specialDemo = INITIAL_DEMO_DECISIONS.find(d => d.id === "demo-pricing");
          if (specialDemo) {
            updated = [specialDemo, ...parsed];
            localStorage.setItem("TIEBREAKER_DECISIONS", JSON.stringify(updated));
          }
        }
        setDecisions(updated);
        const pricingDec = updated.find(d => d.id === "demo-pricing");
        setSelectedDecision(pricingDec || updated[0]);
      } catch (e) {
        setDecisions(INITIAL_DEMO_DECISIONS);
        setSelectedDecision(INITIAL_DEMO_DECISIONS[0]);
      }
    } else {
      setDecisions(INITIAL_DEMO_DECISIONS);
      setSelectedDecision(INITIAL_DEMO_DECISIONS[0]);
      localStorage.setItem("TIEBREAKER_DECISIONS", JSON.stringify(INITIAL_DEMO_DECISIONS));
    }
    // Set initialization ref to true with a small delay so initial state commitments don't trigger saving status
    setTimeout(() => {
      isInitialized.current = true;
    }, 150);
  }, []);

  // Debounced auto-save to localStorage
  useEffect(() => {
    if (!isInitialized.current) return;

    setSaveStatus("saving");
    const handler = setTimeout(() => {
      try {
        localStorage.setItem("TIEBREAKER_DECISIONS", JSON.stringify(decisions));
        setSaveStatus("saved");
      } catch (e) {
        console.error("Failed to auto-save to localStorage:", e);
        setSaveStatus("idle");
      }
    }, 1000); // 1000ms debounce window

    return () => {
      clearTimeout(handler);
    };
  }, [decisions]);

  // Clean transition from saved status back to idle
  useEffect(() => {
    if (saveStatus === "saved") {
      const timer = setTimeout(() => {
        setSaveStatus("idle");
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [saveStatus]);

  // Update decisions state; saving is handled automatically by the debounced effect
  const saveDecisions = (updatedDecisions: Decision[]) => {
    setDecisions(updatedDecisions);
  };

  const handleCreateDecision = async (formData: {
    title: string;
    context: string;
    analysisType: AnalysisType;
    options?: string[];
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`API analysis failed with status ${response.status}`);
      }

      const analysisResult = await response.json();

      const newDecision: Decision = {
        id: `dec-${Date.now()}`,
        title: formData.title,
        context: formData.context,
        analysisType: formData.analysisType,
        options: formData.options,
        createdAt: new Date().toISOString(),
      };

      // Map dynamic payloads based on chosen format
      if (formData.analysisType === "PROS_CONS") {
        newDecision.prosCons = {
          decisionId: newDecision.id,
          title: newDecision.title,
          context: newDecision.context,
          items: analysisResult.items || [],
          verdict: analysisResult.verdict || "No advisor verdict generated.",
          confidence: analysisResult.confidence || 75,
          summary: analysisResult.summary || "",
        };
      } else if (formData.analysisType === "COMPARISON") {
        newDecision.comparison = {
          decisionId: newDecision.id,
          title: newDecision.title,
          options: formData.options || ["Option A", "Option B"],
          context: newDecision.context,
          criteriaList: analysisResult.criteriaList || [],
          verdict: analysisResult.verdict || "No advisor comparison generated.",
          winningOption: analysisResult.winningOption || formData.options?.[0] || "Option A",
          summary: analysisResult.summary || "",
        };
      } else if (formData.analysisType === "SWOT") {
        newDecision.swot = {
          decisionId: newDecision.id,
          title: newDecision.title,
          context: newDecision.context,
          strengths: analysisResult.strengths || [],
          weaknesses: analysisResult.weaknesses || [],
          opportunities: analysisResult.opportunities || [],
          threats: analysisResult.threats || [],
          strategies: analysisResult.strategies || [],
          verdict: analysisResult.verdict || "No SWOT strategic alignment generated.",
          summary: analysisResult.summary || "",
        };
      }

      const updated = [newDecision, ...decisions];
      saveDecisions(updated);
      setSelectedDecision(newDecision);

      // Pre-populate comparison ratings state
      if (formData.options) {
        const initialRatings: { [option: string]: { rating: number; desc: string } } = {};
        formData.options.forEach((opt) => {
          initialRatings[opt] = { rating: 3, desc: "" };
        });
        setNewCriteriaRatings(initialRatings);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "An unexpected network error occurred while querying the advisor.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDecision = (id: string) => {
    const updated = decisions.filter((d) => d.id !== id);
    saveDecisions(updated);
    if (selectedDecision?.id === id) {
      setSelectedDecision(updated.length > 0 ? updated[0] : null);
    }
  };

  const handleNewDecisionTrigger = () => {
    setSelectedDecision(null);
    setError(null);
  };

  // -------------------------------------------------------------
  // Interactive Custom Editing Functions (Local Persistence)
  // -------------------------------------------------------------

  // Pros & Cons Modifiers
  const handleAddProConItem = () => {
    if (!selectedDecision || !selectedDecision.prosCons || !newProConText.trim()) return;

    const newItem: ProConItem = {
      id: `item-${Date.now()}`,
      text: newProConText.trim(),
      isPro: newProConIsPro,
      impact: newProConImpact,
      category: newProConCategory,
      explanation: "Manually added factor."
    };

    const updatedDecision = { ...selectedDecision };
    if (updatedDecision.prosCons) {
      updatedDecision.prosCons.items = [...updatedDecision.prosCons.items, newItem];
    }

    // Replace in decision state & save
    const updatedDecisions = decisions.map((d) => d.id === selectedDecision.id ? updatedDecision : d);
    saveDecisions(updatedDecisions);
    setSelectedDecision(updatedDecision);
    setNewProConText("");
  };

  const handleDeleteProConItem = (itemId: string) => {
    if (!selectedDecision || !selectedDecision.prosCons) return;

    const updatedDecision = { ...selectedDecision };
    if (updatedDecision.prosCons) {
      updatedDecision.prosCons.items = updatedDecision.prosCons.items.filter((item) => item.id !== itemId);
    }

    const updatedDecisions = decisions.map((d) => d.id === selectedDecision.id ? updatedDecision : d);
    saveDecisions(updatedDecisions);
    setSelectedDecision(updatedDecision);
  };

  const handleUpdateProConImpact = (itemId: string, newImpact: number) => {
    if (!selectedDecision || !selectedDecision.prosCons) return;

    const updatedDecision = { ...selectedDecision };
    if (updatedDecision.prosCons) {
      updatedDecision.prosCons.items = updatedDecision.prosCons.items.map((item) =>
        item.id === itemId ? { ...item, impact: Math.max(1, Math.min(5, newImpact)) } : item
      );
    }

    const updatedDecisions = decisions.map((d) => d.id === selectedDecision.id ? updatedDecision : d);
    saveDecisions(updatedDecisions);
    setSelectedDecision(updatedDecision);
  };

  // Comparison Modifiers
  const handleAddCriteria = () => {
    if (!selectedDecision || !selectedDecision.comparison || !newCriteriaName.trim()) return;

    const optionsList = selectedDecision.comparison.options;
    const ratingsArray: CriteriaRating[] = optionsList.map((opt) => ({
      optionName: opt,
      rating: newCriteriaRatings[opt]?.rating || 3,
      description: newCriteriaRatings[opt]?.desc || "Manually calibrated weight",
      pros: [],
      cons: []
    }));

    const newCriteria: ComparisonCriteria = {
      id: `crit-${Date.now()}`,
      name: newCriteriaName.trim(),
      weight: newCriteriaWeight,
      ratings: ratingsArray
    };

    const updatedDecision = { ...selectedDecision };
    if (updatedDecision.comparison) {
      updatedDecision.comparison.criteriaList = [...updatedDecision.comparison.criteriaList, newCriteria];
    }

    const updatedDecisions = decisions.map((d) => d.id === selectedDecision.id ? updatedDecision : d);
    saveDecisions(updatedDecisions);
    setSelectedDecision(updatedDecision);
    setNewCriteriaName("");
    // reset rating draft inputs
    const resetRatings: { [opt: string]: { rating: number; desc: string } } = {};
    optionsList.forEach((opt) => {
      resetRatings[opt] = { rating: 3, desc: "" };
    });
    setNewCriteriaRatings(resetRatings);
  };

  const handleDeleteCriteria = (criteriaId: string) => {
    if (!selectedDecision || !selectedDecision.comparison) return;

    const updatedDecision = { ...selectedDecision };
    if (updatedDecision.comparison) {
      updatedDecision.comparison.criteriaList = updatedDecision.comparison.criteriaList.filter((c) => c.id !== criteriaId);
    }

    const updatedDecisions = decisions.map((d) => d.id === selectedDecision.id ? updatedDecision : d);
    saveDecisions(updatedDecisions);
    setSelectedDecision(updatedDecision);
  };

  const handleUpdateCriteriaRatingValue = (criteriaId: string, optionName: string, newRate: number) => {
    if (!selectedDecision || !selectedDecision.comparison) return;

    const updatedDecision = { ...selectedDecision };
    if (updatedDecision.comparison) {
      updatedDecision.comparison.criteriaList = updatedDecision.comparison.criteriaList.map((c) => {
        if (c.id === criteriaId) {
          const updatedRatings = c.ratings.map((r) =>
            r.optionName === optionName ? { ...r, rating: Math.max(1, Math.min(5, newRate)) } : r
          );
          return { ...c, ratings: updatedRatings };
        }
        return c;
      });
    }

    const updatedDecisions = decisions.map((d) => d.id === selectedDecision.id ? updatedDecision : d);
    saveDecisions(updatedDecisions);
    setSelectedDecision(updatedDecision);
  };

  // SWOT Modifiers
  const handleAddSwotItem = () => {
    if (!selectedDecision || !selectedDecision.swot || !newSwotText.trim()) return;

    const newItem: SWOTItem = {
      id: `swot-${Date.now()}`,
      text: newSwotText.trim(),
      explanation: "Added manually to context profile.",
      priority: newSwotPriority
    };

    const updatedDecision = { ...selectedDecision };
    if (updatedDecision.swot) {
      const quadrantKey = newSwotQuadrant;
      updatedDecision.swot[quadrantKey] = [...updatedDecision.swot[quadrantKey], newItem];
    }

    const updatedDecisions = decisions.map((d) => d.id === selectedDecision.id ? updatedDecision : d);
    saveDecisions(updatedDecisions);
    setSelectedDecision(updatedDecision);
    setNewSwotText("");
  };

  const handleDeleteSwotItem = (quadrant: "strengths" | "weaknesses" | "opportunities" | "threats", itemId: string) => {
    if (!selectedDecision || !selectedDecision.swot) return;

    const updatedDecision = { ...selectedDecision };
    if (updatedDecision.swot) {
      updatedDecision.swot[quadrant] = updatedDecision.swot[quadrant].filter((item) => item.id !== itemId);
    }

    const updatedDecisions = decisions.map((d) => d.id === selectedDecision.id ? updatedDecision : d);
    saveDecisions(updatedDecisions);
    setSelectedDecision(updatedDecision);
  };

  // -------------------------------------------------------------
  // Derived Scoring Computations for Live Visual Meters
  // -------------------------------------------------------------

  const calculateProsConsScoring = (items: ProConItem[]) => {
    const pros = items.filter((item) => item.isPro);
    const cons = items.filter((item) => !item.isPro);

    const prosScore = pros.reduce((sum, item) => sum + item.impact, 0);
    const consScore = cons.reduce((sum, item) => sum + item.impact, 0);
    const totalScore = prosScore + consScore;

    // Percent representation for the balance meter slider
    const prosPercentage = totalScore > 0 ? Math.round((prosScore / totalScore) * 100) : 50;
    const consPercentage = totalScore > 0 ? Math.round((consScore / totalScore) * 100) : 50;

    return {
      prosScore,
      consScore,
      prosPercentage,
      consPercentage,
      totalCount: items.length
    };
  };

  const calculateComparisonScoring = (criteriaList: ComparisonCriteria[], options: string[]) => {
    const scores: { [option: string]: number } = {};
    const maxPossibleScores: { [option: string]: number } = {};

    options.forEach((opt) => {
      scores[opt] = 0;
      maxPossibleScores[opt] = 0;
    });

    criteriaList.forEach((criteria) => {
      criteria.ratings.forEach((rating) => {
        // Option score is rating multiplied by criteria importance weight
        scores[rating.optionName] = (scores[rating.optionName] || 0) + (rating.rating * criteria.weight);
        maxPossibleScores[rating.optionName] = (maxPossibleScores[rating.optionName] || 0) + (5 * criteria.weight);
      });
    });

    // Find the winning option name based on highest calculated points
    let currentWinner = options[0] || "None";
    let highestScore = -1;
    options.forEach((opt) => {
      if (scores[opt] > highestScore) {
        highestScore = scores[opt];
        currentWinner = opt;
      }
    });

    return {
      scores,
      maxPossibleScores,
      winner: currentWinner,
      highestScore
    };
  };

  // Quick helper to download/print decision report
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 font-sans overflow-hidden" id="app-root">
      {/* Mobile Sidebar Toggle Header (Sticky Top for Mobile) */}
      <div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-slate-200 w-full z-40 fixed top-0 left-0 h-16">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-950 rounded flex items-center justify-center">
            <div className="w-1 h-5 bg-white rotate-45"></div>
          </div>
          <span className="font-display font-bold text-lg tracking-tight text-slate-900">The Tiebreaker</span>
        </div>
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="p-2 rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 focus:outline-none transition-colors"
          id="btn-sidebar-toggle"
        >
          {isSidebarOpen ? <X className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5 rotate-180" />}
        </button>
      </div>

      {/* Main Body Grid */}
      <div className="flex flex-1 w-full h-full pt-16 md:pt-0 overflow-hidden relative">
        {/* Sidebar Panel - Past Decisions */}
        <aside
          className={`absolute md:static top-0 left-0 z-30 w-72 h-full bg-white border-r border-slate-200 transition-transform duration-300 transform md:transform-none ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Title Block in Desktop Sidebar */}
            <div className="p-6 border-b border-slate-100 bg-white flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-950 rounded flex items-center justify-center">
                <div className="w-1 h-5 bg-white rotate-45"></div>
              </div>
              <h1 className="font-display font-bold text-xl tracking-tight text-slate-900">The Tiebreaker</h1>
            </div>

            <div className="flex-1 overflow-hidden">
              <HistoryPanel
                decisions={decisions}
                onSelectDecision={(d) => {
                  setSelectedDecision(d);
                  setError(null);
                  // Close sidebar on mobile select
                  if (window.innerWidth < 768) {
                    setIsSidebarOpen(false);
                  }
                }}
                onDeleteDecision={handleDeleteDecision}
                onNewDecision={handleNewDecisionTrigger}
                currentDecisionId={selectedDecision?.id}
              />
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center text-[11px] text-slate-400">
              <span className="font-mono">Engine: Gemini-3.5</span>
              <span>v1.2.0</span>
            </div>
          </div>
        </aside>

        {/* Main Work Area */}
        <main className="flex-1 flex flex-col h-full overflow-y-auto min-w-0" id="main-scroll-view">
          {error && (
            <div className="m-6 p-4 bg-red-50 border border-red-150 rounded-xl flex items-start gap-3" id="error-alert">
              <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-red-800">Advisor Query Failed</h4>
                <p className="text-xs text-red-700 mt-1">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="text-xs font-semibold text-red-600 hover:text-red-800 underline mt-2"
                >
                  Dismiss error and try again
                </button>
              </div>
            </div>
          )}

          {/* If no selected decision, render the analysis setup form */}
          {!selectedDecision ? (
            <div className="p-4 md:p-8 flex-1 flex flex-col justify-center">
              <DecisionForm onSubmit={handleCreateDecision} isLoading={isLoading} />
            </div>
          ) : (
            /* Selected Decision Report Card Dashboard */
            <div className="flex-1 flex flex-col h-full print:bg-white" id="report-view-container">
              {/* Header block following "Clean Minimalism" style */}
              <header className="p-6 md:p-8 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs print:relative print:border-none">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-3">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-widest bg-slate-100 px-2.5 py-1 rounded-md">
                        {selectedDecision.analysisType === "PROS_CONS" && "Pros & Cons Analysis"}
                        {selectedDecision.analysisType === "COMPARISON" && "Comparison Matrix"}
                        {selectedDecision.analysisType === "SWOT" && "SWOT Matrix Analysis"}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono italic">
                        Ref: {selectedDecision.id.substring(0, 10).toUpperCase()}
                      </span>
                    </div>
                    <h2 className="text-2xl md:text-3xl font-light text-slate-800 tracking-tight leading-snug">
                      Should I <span className="font-semibold text-slate-900">{selectedDecision.title}</span>?
                    </h2>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2 print:hidden">
                    {/* Auto-save status indicator */}
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 bg-slate-50 border border-slate-100 rounded-lg mr-1 font-mono select-none" id="save-status-indicator">
                      {saveStatus === "saving" && (
                        <>
                          <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                          </span>
                          <span className="text-amber-700">Saving...</span>
                        </>
                      )}
                      {saveStatus === "saved" && (
                        <>
                          <Check className="h-3.5 w-3.5 text-emerald-500" />
                          <span className="text-emerald-700 font-semibold">Changes saved</span>
                        </>
                      )}
                      {saveStatus === "idle" && (
                        <>
                          <Cloud className="h-3.5 w-3.5 text-slate-400" />
                          <span>Autosaved</span>
                        </>
                      )}
                    </div>

                    <button
                      onClick={handleNewDecisionTrigger}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                      id="btn-back-to-new"
                    >
                      <Undo2 className="h-3.5 w-3.5" />
                      New Analysis
                    </button>
                    <button
                      onClick={handlePrint}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-slate-950 rounded-lg hover:bg-slate-800 transition-colors"
                      id="btn-print-report"
                    >
                      <Printer className="h-3.5 w-3.5" />
                      Print / PDF
                    </button>
                  </div>
                </div>

                {selectedDecision.context && (
                  <p className="text-xs text-slate-500 leading-relaxed border-l-2 border-slate-300 pl-3 max-w-4xl italic">
                    &ldquo;{selectedDecision.context}&rdquo;
                  </p>
                )}
              </header>

              {/* Dynamic Analysis Views based on Framework */}
              <div className="flex-1 p-4 md:p-8 space-y-8" id="report-details-scroller">
                
                {/* -------------------------------------------------------------
                    PROS_CONS FRAMEWORK VIEW
                    ------------------------------------------------------------- */}
                {selectedDecision.analysisType === "PROS_CONS" && selectedDecision.prosCons && (
                  <div className="space-y-6" id="pros-cons-framework-view">
                    
                    {/* Interactive Live Score Meter / Balance Bar */}
                    {(() => {
                      const stats = calculateProsConsScoring(selectedDecision.prosCons.items);
                      return (
                        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
                          <div className="flex justify-between items-center mb-3">
                            <div>
                              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Advantage Balance Meter</h3>
                              <p className="text-sm font-medium text-slate-700 mt-0.5">
                                {stats.prosScore > stats.consScore 
                                  ? `Pros lead by ${stats.prosScore - stats.consScore} pts` 
                                  : stats.consScore > stats.prosScore 
                                  ? `Cons lead by ${stats.consScore - stats.prosScore} pts` 
                                  : "Perfect logical balance"}
                              </p>
                            </div>
                            <div className="text-right font-mono text-sm font-bold text-slate-600">
                              <span className="text-emerald-600">+{stats.prosScore}</span>
                              <span className="mx-1">/</span>
                              <span className="text-rose-500">-{stats.consScore}</span>
                            </div>
                          </div>

                          {/* Dual progress bar */}
                          <div className="h-3.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            <div 
                              className="h-full bg-emerald-500 transition-all duration-500 relative"
                              style={{ width: `${stats.prosPercentage}%` }}
                              title={`Pros: ${stats.prosPercentage}%`}
                            />
                            <div 
                              className="h-full bg-rose-400 transition-all duration-500 relative"
                              style={{ width: `${stats.consPercentage}%` }}
                              title={`Cons: ${stats.consPercentage}%`}
                            />
                          </div>

                          <div className="flex justify-between items-center text-[10px] text-slate-400 font-medium mt-2">
                            <span>Pros Advantage ({stats.prosPercentage}%)</span>
                            <span>Cons Weight ({stats.consPercentage}%)</span>
                          </div>
                        </div>
                      );
                    })()}

                    {/* Binary Split Table Panels */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      
                      {/* PROS COLUMN */}
                      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-emerald-50/20 flex justify-between items-center">
                          <h3 className="text-sm font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                            PROS (Advantages)
                          </h3>
                          <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                            {selectedDecision.prosCons.items.filter((i) => i.isPro).length} Items
                          </span>
                        </div>

                        {/* List Items */}
                        <div className="divide-y divide-slate-100 p-4 space-y-2">
                          {selectedDecision.prosCons.items.filter((i) => i.isPro).length === 0 ? (
                            <p className="text-xs text-slate-400 italic p-4 text-center">No advantages logged yet. Use the add form below to create one!</p>
                          ) : (
                            selectedDecision.prosCons.items
                              .filter((item) => item.isPro)
                              .map((item) => (
                                <div key={item.id} className="p-3 hover:bg-slate-50/50 rounded-lg transition-colors group relative">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-50 border border-emerald-100 px-1.5 py-0.5 rounded">
                                          {item.category}
                                        </span>
                                        {/* Core Impact Stars */}
                                        <div className="flex gap-0.5" title={`Impact: ${item.impact}/5`}>
                                          {[...Array(5)].map((_, i) => (
                                            <span 
                                              key={i} 
                                              onClick={() => handleUpdateProConImpact(item.id, i + 1)}
                                              className={`h-2.5 w-2.5 rounded-full cursor-pointer transition-all ${
                                                i < item.impact ? "bg-emerald-500" : "bg-slate-200 hover:bg-emerald-200"
                                              }`}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <h4 className="text-sm font-semibold text-slate-800 leading-snug">{item.text}</h4>
                                      {item.explanation && (
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.explanation}</p>
                                      )}
                                    </div>

                                    <button
                                      onClick={() => handleDeleteProConItem(item.id)}
                                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity self-start"
                                      title="Delete item"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </section>

                      {/* CONS COLUMN */}
                      <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-rose-50/20 flex justify-between items-center">
                          <h3 className="text-sm font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-rose-400"></span>
                            CONS (Drawbacks)
                          </h3>
                          <span className="text-xs font-mono font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded">
                            {selectedDecision.prosCons.items.filter((i) => !i.isPro).length} Items
                          </span>
                        </div>

                        {/* List Items */}
                        <div className="divide-y divide-slate-100 p-4 space-y-2">
                          {selectedDecision.prosCons.items.filter((i) => !i.isPro).length === 0 ? (
                            <p className="text-xs text-slate-400 italic p-4 text-center">No drawbacks logged yet. Use the add form below to create one!</p>
                          ) : (
                            selectedDecision.prosCons.items
                              .filter((item) => !item.isPro)
                              .map((item) => (
                                <div key={item.id} className="p-3 hover:bg-slate-50/50 rounded-lg transition-colors group relative">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold uppercase tracking-widest text-rose-600 bg-rose-50 border border-rose-100 px-1.5 py-0.5 rounded">
                                          {item.category}
                                        </span>
                                        {/* Core Impact Stars */}
                                        <div className="flex gap-0.5" title={`Impact: ${item.impact}/5`}>
                                          {[...Array(5)].map((_, i) => (
                                            <span 
                                              key={i} 
                                              onClick={() => handleUpdateProConImpact(item.id, i + 1)}
                                              className={`h-2.5 w-2.5 rounded-full cursor-pointer transition-all ${
                                                i < item.impact ? "bg-rose-400" : "bg-slate-200 hover:bg-rose-200"
                                              }`}
                                            />
                                          ))}
                                        </div>
                                      </div>
                                      <h4 className="text-sm font-semibold text-slate-800 leading-snug">{item.text}</h4>
                                      {item.explanation && (
                                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.explanation}</p>
                                      )}
                                    </div>

                                    <button
                                      onClick={() => handleDeleteProConItem(item.id)}
                                      className="text-slate-300 hover:text-red-500 hover:bg-red-50 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity self-start"
                                      title="Delete item"
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              ))
                          )}
                        </div>
                      </section>
                    </div>

                    {/* Interactive Pro/Con Addition form */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs print:hidden">
                      <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
                        <Plus className="h-4 w-4" />
                        Calibrate Decision (Add custom factor)
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            placeholder="Type new Pro or Con description..."
                            value={newProConText}
                            onChange={(e) => setNewProConText(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        <div>
                          <select
                            value={newProConIsPro ? "pro" : "con"}
                            onChange={(e) => setNewProConIsPro(e.target.value === "pro")}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="pro">Pro (Advantage)</option>
                            <option value="con">Con (Drawback)</option>
                          </select>
                        </div>

                        <div>
                          <select
                            value={newProConCategory}
                            onChange={(e) => setNewProConCategory(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="Personal">Personal</option>
                            <option value="Financial">Financial</option>
                            <option value="Career">Career</option>
                            <option value="Emotional">Emotional</option>
                            <option value="Time">Time Management</option>
                            <option value="Health">Health</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-4 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3">
                          <span className="text-xs font-semibold text-slate-600">Impact Score:</span>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((val) => (
                              <button
                                key={val}
                                type="button"
                                onClick={() => setNewProConImpact(val)}
                                className={`h-7 w-7 rounded-lg text-xs font-semibold border transition-all ${
                                  newProConImpact === val
                                    ? "bg-slate-900 text-white border-slate-900"
                                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
                                }`}
                              >
                                {val}
                              </button>
                            ))}
                          </div>
                          <span className="text-[10px] text-slate-400 italic">
                            ({newProConImpact === 5 ? "Critical dealbreaker" : newProConImpact === 1 ? "Minor detail" : "Standard factor"})
                          </span>
                        </div>

                        <button
                          onClick={handleAddProConItem}
                          disabled={!newProConText.trim()}
                          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1 self-end sm:self-auto"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Factor
                        </button>
                      </div>
                    </div>

                    {/* AI Advisor Verdict Card */}
                    <section className="bg-slate-950 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center gap-6 shadow-md shadow-slate-950/20">
                      <div className="w-16 h-16 rounded-full border-2 border-indigo-400 bg-slate-900 flex flex-col items-center justify-center shrink-0">
                        <span className="text-xl font-bold font-display text-indigo-200">
                          {selectedDecision.prosCons.confidence}%
                        </span>
                        <span className="text-[8px] text-slate-400 uppercase tracking-widest font-mono">Confidence</span>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-xs font-bold text-indigo-300 mb-1.5 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                          Advisor Verdict Profile
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed font-sans font-light">
                          {selectedDecision.prosCons.verdict}
                        </p>
                        {selectedDecision.prosCons.summary && (
                          <p className="text-xs text-indigo-200 mt-2 italic font-mono">
                            &ldquo;{selectedDecision.prosCons.summary}&rdquo;
                          </p>
                        )}
                      </div>
                    </section>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    COMPARISON FRAMEWORK VIEW
                    ------------------------------------------------------------- */}
                {selectedDecision.analysisType === "COMPARISON" && selectedDecision.comparison && (
                  <div className="space-y-6" id="comparison-framework-view">
                    
                    {/* Scores Comparison Overview Meter */}
                    {(() => {
                      const analysis = selectedDecision.comparison;
                      const scoring = calculateComparisonScoring(analysis.criteriaList, analysis.options);
                      return (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4" id="comparison-meters">
                          
                          {/* Crown Winner Card */}
                          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center gap-4">
                            <div className="p-3 bg-amber-50 rounded-xl text-amber-600 border border-amber-100">
                              <Award className="h-6 w-6" />
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Calculated Winner</span>
                              <h4 className="font-display font-bold text-lg text-slate-800 mt-0.5">{scoring.winner}</h4>
                              <p className="text-xs text-slate-500">Highest weighted dimension points</p>
                            </div>
                          </div>

                          {/* Dynamic Progress Columns for Options */}
                          {analysis.options.map((opt) => {
                            const rawScore = scoring.scores[opt] || 0;
                            const maxScore = scoring.maxPossibleScores[opt] || 5;
                            const pct = Math.round((rawScore / maxScore) * 100) || 0;
                            const isWinner = opt === scoring.winner;

                            return (
                              <div 
                                key={opt} 
                                className={`bg-white rounded-xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                                  isWinner ? "border-slate-900 ring-1 ring-slate-900" : "border-slate-200"
                                }`}
                              >
                                <div className="flex justify-between items-center mb-2">
                                  <span className="font-semibold text-sm text-slate-800 truncate">{opt}</span>
                                  {isWinner && (
                                    <span className="text-[9px] font-bold text-slate-800 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">
                                      Leader
                                    </span>
                                  )}
                                </div>

                                <div className="space-y-1">
                                  <div className="flex justify-between items-end text-xs">
                                    <span className="text-slate-500">Weight Score</span>
                                    <span className="font-mono font-semibold text-slate-700">{rawScore} / {maxScore} pts</span>
                                  </div>
                                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div 
                                      className={`h-full transition-all duration-500 ${isWinner ? "bg-slate-900" : "bg-slate-400"}`} 
                                      style={{ width: `${pct}%` }} 
                                    />
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    {/* Comparison Criteria Table */}
                    <section className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Evaluation Dimension Matrix</h3>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/20">
                              <th className="p-4 text-xs font-bold text-slate-500 uppercase tracking-wider w-1/3">Criteria & Weight</th>
                              {selectedDecision.comparison.options.map((opt) => (
                                <th key={opt} className="p-4 text-xs font-bold text-slate-800 uppercase tracking-wider">
                                  {opt} Rating
                                </th>
                              ))}
                              <th className="p-4 w-12 print:hidden"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                            {selectedDecision.comparison.criteriaList.map((crit) => (
                              <tr key={crit.id} className="hover:bg-slate-50/30 group transition-colors">
                                <td className="p-4 align-top">
                                  <div className="font-semibold text-slate-800">{crit.name}</div>
                                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1">
                                    <span>Importance:</span>
                                    <div className="flex gap-0.5">
                                      {[...Array(5)].map((_, idx) => (
                                        <span 
                                          key={idx} 
                                          className={`h-1.5 w-1.5 rounded-full ${idx < crit.weight ? "bg-slate-500" : "bg-slate-200"}`} 
                                        />
                                      ))}
                                    </div>
                                    <span className="font-mono text-slate-500">({crit.weight}x)</span>
                                  </div>
                                </td>

                                {selectedDecision.comparison.options.map((opt) => {
                                  const rating = crit.ratings.find((r) => r.optionName === opt);
                                  return (
                                    <td key={opt} className="p-4 align-top">
                                      <div className="flex items-center gap-1.5 mb-1.5">
                                        <div className="flex gap-0.5">
                                          {[...Array(5)].map((_, idx) => (
                                            <span
                                              key={idx}
                                              onClick={() => handleUpdateCriteriaRatingValue(crit.id, opt, idx + 1)}
                                              className={`h-3 w-3 rounded-full cursor-pointer transition-colors ${
                                                idx < (rating?.rating || 3) ? "bg-slate-800" : "bg-slate-200 hover:bg-slate-300"
                                              }`}
                                            />
                                          ))}
                                        </div>
                                        <span className="text-xs font-mono font-bold text-slate-600">({rating?.rating || 3}/5)</span>
                                      </div>

                                      {rating?.description && (
                                        <p className="text-xs text-slate-500 leading-normal max-w-md">{rating.description}</p>
                                      )}

                                      {/* Core pros and cons highlights */}
                                      <div className="mt-2 space-y-1">
                                        {rating?.pros && rating.pros.map((p, idx) => (
                                          <div key={idx} className="flex gap-1 text-[11px] text-emerald-700">
                                            <span>✓</span>
                                            <span>{p}</span>
                                          </div>
                                        ))}
                                        {rating?.cons && rating.cons.map((c, idx) => (
                                          <div key={idx} className="flex gap-1 text-[11px] text-rose-600">
                                            <span>✗</span>
                                            <span>{c}</span>
                                          </div>
                                        ))}
                                      </div>
                                    </td>
                                  );
                                })}

                                <td className="p-4 align-middle print:hidden">
                                  <button
                                    onClick={() => handleDeleteCriteria(crit.id)}
                                    className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Delete criterion"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* Interactive Add Criteria Form */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs print:hidden">
                      <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
                        <Plus className="h-4 w-4" />
                        Add Custom Criteria
                      </h4>

                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="md:col-span-2">
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Criterion Name</label>
                            <input
                              type="text"
                              placeholder="e.g., Relocation Support, Commute Time, Cultural fit..."
                              value={newCriteriaName}
                              onChange={(e) => setNewCriteriaName(e.target.value)}
                              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Importance Weight</label>
                            <select
                              value={newCriteriaWeight}
                              onChange={(e) => setNewCriteriaWeight(Number(e.target.value))}
                              className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
                            >
                              <option value="1">1 (Lowest Importance)</option>
                              <option value="2">2 (Minor Factor)</option>
                              <option value="3">3 (Average Importance)</option>
                              <option value="4">4 (High Priority)</option>
                              <option value="5">5 (Critical Factor)</option>
                            </select>
                          </div>
                        </div>

                        {/* Interactive sliders/inputs for each compared option */}
                        <div className="bg-slate-50/50 p-4 rounded-xl border border-slate-100 space-y-3">
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Calibrate Ratings for Options</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {selectedDecision.comparison.options.map((opt) => {
                              const draft = newCriteriaRatings[opt] || { rating: 3, desc: "" };
                              return (
                                <div key={opt} className="space-y-2 bg-white p-3 rounded-lg border border-slate-150">
                                  <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-700">{opt}</span>
                                    <div className="flex gap-1">
                                      {[1, 2, 3, 4, 5].map((val) => (
                                        <button
                                          key={val}
                                          type="button"
                                          onClick={() => setNewCriteriaRatings({
                                            ...newCriteriaRatings,
                                            [opt]: { ...draft, rating: val }
                                          })}
                                          className={`h-6 w-6 rounded text-xs font-semibold border ${
                                            draft.rating === val
                                              ? "bg-slate-900 text-white border-slate-900"
                                              : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                          }`}
                                        >
                                          {val}
                                        </button>
                                      ))}
                                    </div>
                                  </div>
                                  <input
                                    type="text"
                                    placeholder={`Rating notes for ${opt}`}
                                    value={draft.desc}
                                    onChange={(e) => setNewCriteriaRatings({
                                      ...newCriteriaRatings,
                                      [opt]: { ...draft, desc: e.target.value }
                                    })}
                                    className="w-full px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none"
                                  />
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div className="flex justify-end pt-2">
                          <button
                            type="button"
                            onClick={handleAddCriteria}
                            disabled={!newCriteriaName.trim()}
                            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                          >
                            <Plus className="h-3.5 w-3.5" />
                            Add Criterion
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* AI Advisor Comparative Verdict */}
                    <section className="bg-slate-950 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center gap-6 shadow-md shadow-slate-950/20">
                      <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-indigo-400 flex flex-col items-center justify-center shrink-0">
                        <Award className="h-7 w-7 text-indigo-400" />
                        <span className="text-[7px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">Tiebreaker</span>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-xs font-bold text-indigo-300 mb-1.5 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                          Advisor Strategy Verdict
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed font-sans font-light">
                          {selectedDecision.comparison.verdict}
                        </p>
                        {selectedDecision.comparison.summary && (
                          <p className="text-xs text-indigo-200 mt-2 italic font-mono">
                            &ldquo;{selectedDecision.comparison.summary}&rdquo;
                          </p>
                        )}
                      </div>
                    </section>
                  </div>
                )}

                {/* -------------------------------------------------------------
                    SWOT FRAMEWORK VIEW
                    ------------------------------------------------------------- */}
                {selectedDecision.analysisType === "SWOT" && selectedDecision.swot && (
                  <div className="space-y-6" id="swot-framework-view">
                    
                    {/* SWOT 2x2 Quadrant Grid following theme layout */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="swot-grid">
                      
                      {/* STRENGTHS */}
                      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-emerald-100 bg-emerald-50/25 flex justify-between items-center">
                          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-widest flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                            S • Strengths (Internal Assets)
                          </h4>
                        </div>
                        <div className="p-6 flex-1 space-y-3">
                          {selectedDecision.swot.strengths.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No strengths logged yet.</p>
                          ) : (
                            selectedDecision.swot.strengths.map((item) => (
                              <div key={item.id} className="p-3 bg-emerald-50/50 text-emerald-900 rounded-lg border border-emerald-100/50 flex justify-between items-start group">
                                <div className="flex-1 min-w-0 pr-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-xs text-emerald-800">{item.text}</span>
                                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                                      item.priority === "High" ? "bg-emerald-200 text-emerald-900" : "bg-emerald-100 text-emerald-800"
                                    }`}>
                                      {item.priority} Impact
                                    </span>
                                  </div>
                                  {item.explanation && <p className="text-[11px] text-emerald-700/80 leading-relaxed">{item.explanation}</p>}
                                </div>
                                <button
                                  onClick={() => handleDeleteSwotItem("strengths", item.id)}
                                  className="text-emerald-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </section>

                      {/* WEAKNESSES */}
                      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-orange-100 bg-orange-50/25 flex justify-between items-center">
                          <h4 className="text-xs font-bold text-orange-800 uppercase tracking-widest flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-orange-400" />
                            W • Weaknesses (Internal Constraints)
                          </h4>
                        </div>
                        <div className="p-6 flex-1 space-y-3">
                          {selectedDecision.swot.weaknesses.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No weaknesses logged yet.</p>
                          ) : (
                            selectedDecision.swot.weaknesses.map((item) => (
                              <div key={item.id} className="p-3 bg-orange-50/50 text-orange-900 rounded-lg border border-orange-100/50 flex justify-between items-start group">
                                <div className="flex-1 min-w-0 pr-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-xs text-orange-800">{item.text}</span>
                                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                                      item.priority === "High" ? "bg-orange-200 text-orange-900" : "bg-orange-100 text-orange-800"
                                    }`}>
                                      {item.priority} Danger
                                    </span>
                                  </div>
                                  {item.explanation && <p className="text-[11px] text-orange-700/80 leading-relaxed">{item.explanation}</p>}
                                </div>
                                <button
                                  onClick={() => handleDeleteSwotItem("weaknesses", item.id)}
                                  className="text-orange-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </section>

                      {/* OPPORTUNITIES */}
                      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-blue-100 bg-blue-50/25 flex justify-between items-center">
                          <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                            O • Opportunities (External Prospects)
                          </h4>
                        </div>
                        <div className="p-6 flex-1 space-y-3">
                          {selectedDecision.swot.opportunities.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No opportunities logged yet.</p>
                          ) : (
                            selectedDecision.swot.opportunities.map((item) => (
                              <div key={item.id} className="p-3 bg-blue-50/50 text-blue-900 rounded-lg border border-blue-100/50 flex justify-between items-start group">
                                <div className="flex-1 min-w-0 pr-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-xs text-blue-800">{item.text}</span>
                                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                                      item.priority === "High" ? "bg-blue-200 text-blue-900" : "bg-blue-100 text-blue-800"
                                    }`}>
                                      {item.priority} Impact
                                    </span>
                                  </div>
                                  {item.explanation && <p className="text-[11px] text-blue-700/80 leading-relaxed">{item.explanation}</p>}
                                </div>
                                <button
                                  onClick={() => handleDeleteSwotItem("opportunities", item.id)}
                                  className="text-blue-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </section>

                      {/* THREATS */}
                      <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                        <div className="px-6 py-4 border-b border-rose-100 bg-rose-50/25 flex justify-between items-center">
                          <h4 className="text-xs font-bold text-rose-800 uppercase tracking-widest flex items-center gap-2">
                            <span className="h-2.5 w-2.5 rounded-full bg-rose-500" />
                            T • Threats (External Risks)
                          </h4>
                        </div>
                        <div className="p-6 flex-1 space-y-3">
                          {selectedDecision.swot.threats.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No threats logged yet.</p>
                          ) : (
                            selectedDecision.swot.threats.map((item) => (
                              <div key={item.id} className="p-3 bg-rose-50/50 text-rose-900 rounded-lg border border-rose-100/50 flex justify-between items-start group">
                                <div className="flex-1 min-w-0 pr-2">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-xs text-rose-800">{item.text}</span>
                                    <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded ${
                                      item.priority === "High" ? "bg-rose-200 text-rose-900" : "bg-rose-100 text-rose-800"
                                    }`}>
                                      {item.priority} Danger
                                    </span>
                                  </div>
                                  {item.explanation && <p className="text-[11px] text-rose-700/80 leading-relaxed">{item.explanation}</p>}
                                </div>
                                <button
                                  onClick={() => handleDeleteSwotItem("threats", item.id)}
                                  className="text-rose-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-0.5"
                                >
                                  <X className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))
                          )}
                        </div>
                      </section>

                    </div>

                    {/* Interactive Add SWOT Item Form */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs print:hidden">
                      <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-1.5">
                        <Plus className="h-4 w-4" />
                        Add SWOT Factor
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        <div className="md:col-span-2">
                          <input
                            type="text"
                            placeholder="Type new custom SWOT observation..."
                            value={newSwotText}
                            onChange={(e) => setNewSwotText(e.target.value)}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-400"
                          />
                        </div>

                        <div>
                          <select
                            value={newSwotQuadrant}
                            onChange={(e) => setNewSwotQuadrant(e.target.value as any)}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="strengths">Strengths (Internal)</option>
                            <option value="weaknesses">Weaknesses (Internal)</option>
                            <option value="opportunities">Opportunities (External)</option>
                            <option value="threats">Threats (External)</option>
                          </select>
                        </div>

                        <div>
                          <select
                            value={newSwotPriority}
                            onChange={(e) => setNewSwotPriority(e.target.value as any)}
                            className="w-full px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white"
                          >
                            <option value="High">High Impact</option>
                            <option value="Medium">Medium Impact</option>
                            <option value="Low">Low Impact</option>
                          </select>
                        </div>
                      </div>

                      <div className="flex justify-end pt-3 mt-3 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={handleAddSwotItem}
                          disabled={!newSwotText.trim()}
                          className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Plus className="h-3.5 w-3.5" />
                          Add Quadrant Item
                        </button>
                      </div>
                    </div>

                    {/* Strategic Action Recommendations */}
                    {selectedDecision.swot.strategies && selectedDecision.swot.strategies.length > 0 && (
                      <section className="space-y-3" id="swot-strategies-recommendations">
                        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Cross-Quadrant Strategy Initiatives</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {selectedDecision.swot.strategies.map((strat) => (
                            <div key={strat.id} className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-start gap-4">
                              <div className="p-2 bg-slate-100 text-slate-800 rounded-lg text-xs font-bold font-mono">
                                {strat.quadrant.substring(0, 3).toUpperCase()}
                              </div>
                              <div>
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-sm text-slate-800">{strat.title}</h4>
                                  <span className="text-[9px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-mono">
                                    {strat.strategyType}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-500 leading-relaxed">{strat.description}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </section>
                    )}

                    {/* AI Advisor SWOT Verdict Card */}
                    <section className="bg-slate-950 rounded-2xl p-6 text-white flex flex-col md:flex-row items-center gap-6 shadow-md shadow-slate-950/20">
                      <div className="w-16 h-16 rounded-full bg-slate-900 border-2 border-indigo-400 flex flex-col items-center justify-center shrink-0">
                        <Grid className="h-6 w-6 text-indigo-400" />
                        <span className="text-[7px] text-slate-400 uppercase tracking-widest font-mono mt-0.5">Matrix</span>
                      </div>
                      <div className="flex-1 text-center md:text-left">
                        <h4 className="text-xs font-bold text-indigo-300 mb-1.5 uppercase tracking-widest flex items-center justify-center md:justify-start gap-1">
                          <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
                          Advisor SWOT Verdict
                        </h4>
                        <p className="text-sm text-slate-300 leading-relaxed font-sans font-light">
                          {selectedDecision.swot.verdict}
                        </p>
                        {selectedDecision.swot.summary && (
                          <p className="text-xs text-indigo-200 mt-2 italic font-mono">
                            &ldquo;{selectedDecision.swot.summary}&rdquo;
                          </p>
                        )}
                      </div>
                    </section>
                  </div>
                )}

              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
