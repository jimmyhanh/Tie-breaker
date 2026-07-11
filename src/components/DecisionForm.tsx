import React, { useState, useEffect } from "react";
import { AnalysisType } from "../types";
import { Scale, BarChart2, Grid, Sparkles, HelpCircle, AlertCircle, Plus, X } from "lucide-react";

interface DecisionFormProps {
  onSubmit: (data: {
    title: string;
    context: string;
    analysisType: AnalysisType;
    options?: string[];
  }) => void;
  isLoading: boolean;
}

const ROTATING_TIPS = [
  "Formulating structured decision parameters...",
  "Weighing short-term rewards against long-term risks...",
  "Consulting the SWOT strategic advisor framework...",
  "Running objective criteria comparison matrix...",
  "Filtering emotional noise to reveal logical balance...",
  "Drafting strategic recommendations and action plans...",
];

export default function DecisionForm({ onSubmit, isLoading }: DecisionFormProps) {
  const [title, setTitle] = useState("");
  const [context, setContext] = useState("");
  const [analysisType, setAnalysisType] = useState<AnalysisType>("PROS_CONS");
  const [options, setOptions] = useState<string[]>(["Option A", "Option B"]);
  const [newOption, setNewOption] = useState("");
  const [tipIndex, setTipIndex] = useState(0);

  // Rotate tips during loading
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isLoading) {
      interval = setInterval(() => {
        setTipIndex((prev) => (prev + 1) % ROTATING_TIPS.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (analysisType === "COMPARISON") {
      const validOptions = options.map((o) => o.trim()).filter((o) => o !== "");
      if (validOptions.length < 2) {
        alert("Please provide at least two options to compare!");
        return;
      }
      onSubmit({ title, context, analysisType, options: validOptions });
    } else {
      onSubmit({ title, context, analysisType });
    }
  };

  const handleAddOption = () => {
    if (newOption.trim()) {
      setOptions([...options, newOption.trim()]);
      setNewOption("");
    }
  };

  const handleRemoveOption = (index: number) => {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, val: string) => {
    const updated = [...options];
    updated[index] = val;
    setOptions(updated);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[450px] p-8 text-center bg-white rounded-2xl border border-slate-150 shadow-xs max-w-2xl mx-auto my-8" id="loader-view">
        <div className="relative mb-6">
          <div className="h-16 w-16 rounded-full border-4 border-slate-100 border-t-slate-800 animate-spin"></div>
          <Sparkles className="h-6 w-6 text-indigo-500 absolute top-5 left-5 animate-pulse" />
        </div>
        <h3 className="font-display font-semibold text-slate-800 text-xl mb-2">Analyzing Decision</h3>
        <p className="text-slate-500 text-sm max-w-sm font-mono h-12 flex items-center justify-center animate-pulse">
          {ROTATING_TIPS[tipIndex]}
        </p>
        <p className="text-xs text-slate-400 mt-6 max-w-xs leading-relaxed">
          The Tiebreaker is querying Gemini to evaluate your scenario under structured game-theory frameworks.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8 my-6" id="decision-form-container">
      {/* Brand Header */}
      <div className="text-center mb-8">
        <div className="inline-flex p-3 bg-slate-50 border border-slate-100 rounded-2xl mb-3">
          <Scale className="h-8 w-8 text-slate-900" />
        </div>
        <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight">The Tiebreaker</h1>
        <p className="text-slate-500 text-sm mt-1 max-w-md mx-auto">
          Unbias your choices. Feed your dilemma to our AI strategist for rigorous, structured logical mapping.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800 flex items-center gap-1.5" htmlFor="decision-title">
            What decision are you trying to make?
            <HelpCircle className="h-3.5 w-3.5 text-slate-400" title="State your decision as a clear prompt or question." />
          </label>
          <input
            type="text"
            id="decision-title"
            required
            placeholder="e.g., Should I accept the remote job offer or stay in San Francisco?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all text-slate-800 placeholder:text-slate-400 text-base font-medium"
          />
        </div>

        {/* Context */}
        <div className="space-y-2">
          <label className="block text-sm font-semibold text-slate-800 flex items-center gap-1.5" htmlFor="decision-context">
            Additional Context & Values <span className="text-xs font-normal text-slate-400">(Optional)</span>
          </label>
          <textarea
            id="decision-context"
            placeholder="e.g., Remote job offers $10k more and flexible hours, but local job has fantastic mentorship and a fun office culture. I value growth over raw income right now."
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={3}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/30 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-800 transition-all text-slate-800 placeholder:text-slate-400 text-sm"
          />
        </div>

        {/* Analysis Type */}
        <div className="space-y-3">
          <label className="block text-sm font-semibold text-slate-800">Choose Analysis Framework</label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Pros/Cons Card */}
            <div
              onClick={() => setAnalysisType("PROS_CONS")}
              className={`cursor-pointer flex flex-col p-4 rounded-xl border text-left transition-all relative ${
                analysisType === "PROS_CONS"
                  ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                  : "border-slate-150 hover:border-slate-300"
              }`}
              id="framework-proscons"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-700">
                  <Scale className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm text-slate-800">Pros & Cons</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Map benefits against drawbacks. Weighs impact weights and computes a dynamic balance meter.
              </p>
            </div>

            {/* Comparison Table Card */}
            <div
              onClick={() => setAnalysisType("COMPARISON")}
              className={`cursor-pointer flex flex-col p-4 rounded-xl border text-left transition-all relative ${
                analysisType === "COMPARISON"
                  ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                  : "border-slate-150 hover:border-slate-300"
              }`}
              id="framework-comparison"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-blue-50 rounded-lg text-blue-700">
                  <BarChart2 className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm text-slate-800">Comparison</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Pitch Option A vs. Option B. Evaluates criteria scores and identifies a clear mathematical winner.
              </p>
            </div>

            {/* SWOT Card */}
            <div
              onClick={() => setAnalysisType("SWOT")}
              className={`cursor-pointer flex flex-col p-4 rounded-xl border text-left transition-all relative ${
                analysisType === "SWOT"
                  ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900"
                  : "border-slate-150 hover:border-slate-300"
              }`}
              id="framework-swot"
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="p-1.5 bg-violet-50 rounded-lg text-violet-700">
                  <Grid className="h-4 w-4" />
                </div>
                <span className="font-semibold text-sm text-slate-800">SWOT Analysis</span>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Deep dive into Strengths, Weaknesses, Opportunities, Threats. Generates action strategic steps.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Option Inputs (For COMPARISON) */}
        {analysisType === "COMPARISON" && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-150 space-y-3 animate-fadeIn" id="options-selector">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                Define Compared Options
              </label>
              <span className="text-[10px] bg-slate-200/60 text-slate-600 px-2 py-0.5 rounded-md font-medium">
                Min 2 options required
              </span>
            </div>

            <div className="space-y-2">
              {options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-400 w-5">
                    {idx + 1}.
                  </span>
                  <input
                    type="text"
                    required
                    value={opt}
                    onChange={(e) => handleOptionChange(idx, e.target.value)}
                    placeholder={`e.g., Option ${idx + 1}`}
                    className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                    id={`opt-input-${idx}`}
                  />
                  {options.length > 2 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveOption(idx)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Add Option Trigger */}
            <div className="flex items-center gap-2 pt-1.5">
              <input
                type="text"
                placeholder="Add another option..."
                value={newOption}
                onChange={(e) => setNewOption(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddOption();
                  }
                }}
                className="flex-1 px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
              <button
                type="button"
                onClick={handleAddOption}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
              >
                <Plus className="h-3.5 w-3.5" />
                Add
              </button>
            </div>
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 bg-slate-950 text-white py-3.5 px-6 rounded-xl font-semibold hover:bg-slate-800 active:scale-[0.99] transition-all cursor-pointer shadow-md shadow-slate-900/10"
          id="btn-analyze-submit"
        >
          <Sparkles className="h-5 w-5 text-indigo-400" />
          Resolve Dilemma with AI
        </button>
      </form>
    </div>
  );
}
