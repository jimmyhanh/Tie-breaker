import React, { useState } from "react";
import { Decision, AnalysisType } from "../types";
import { Trash2, Search, Calendar, Scale, BarChart2, Grid, ChevronRight, PlusCircle } from "lucide-react";

interface HistoryPanelProps {
  decisions: Decision[];
  onSelectDecision: (decision: Decision) => void;
  onDeleteDecision: (id: string) => void;
  onNewDecision: () => void;
  currentDecisionId?: string;
}

export default function HistoryPanel({
  decisions,
  onSelectDecision,
  onDeleteDecision,
  onNewDecision,
  currentDecisionId,
}: HistoryPanelProps) {
  const [search, setSearch] = useState("");

  const filtered = decisions.filter((d) =>
    d.title.toLowerCase().includes(search.toLowerCase()) ||
    (d.context && d.context.toLowerCase().includes(search.toLowerCase()))
  );

  const getIcon = (type: AnalysisType) => {
    switch (type) {
      case "PROS_CONS":
        return <Scale className="h-4 w-4 text-emerald-600" />;
      case "COMPARISON":
        return <BarChart2 className="h-4 w-4 text-blue-600" />;
      case "SWOT":
        return <Grid className="h-4 w-4 text-violet-600" />;
    }
  };

  const getBadgeStyle = (type: AnalysisType) => {
    switch (type) {
      case "PROS_CONS":
        return "bg-emerald-50 text-emerald-700 border-emerald-100";
      case "COMPARISON":
        return "bg-blue-50 text-blue-700 border-blue-100";
      case "SWOT":
        return "bg-violet-50 text-violet-700 border-violet-100";
    }
  };

  const getTypeLabel = (type: AnalysisType) => {
    switch (type) {
      case "PROS_CONS":
        return "Pros & Cons";
      case "COMPARISON":
        return "Comparison";
      case "SWOT":
        return "SWOT Analysis";
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50 border-r border-slate-200 w-full" id="history-panel">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-semibold text-slate-800 text-lg">My Decisions</h2>
          <button
            onClick={onNewDecision}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors"
            id="btn-new-decision"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search past decisions..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 transition-all text-slate-700"
            id="history-search-input"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-center px-4">
            <Scale className="h-8 w-8 stroke-[1.5] mb-2 text-slate-300" />
            <p className="text-sm font-medium">No decisions saved yet</p>
            <p className="text-xs text-slate-400 mt-1">Start by typing a decision in the form!</p>
          </div>
        ) : (
          filtered.map((decision) => {
            const isActive = decision.id === currentDecisionId;
            return (
              <div
                key={decision.id}
                className={`group flex items-center justify-between p-3 rounded-xl border transition-all duration-200 ${
                  isActive
                    ? "bg-white border-slate-900 shadow-sm ring-1 ring-slate-900"
                    : "bg-white border-slate-100 hover:border-slate-300 hover:shadow-xs"
                }`}
                id={`decision-card-${decision.id}`}
              >
                <div
                  onClick={() => onSelectDecision(decision)}
                  className="flex-1 min-w-0 cursor-pointer pr-2"
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${getBadgeStyle(decision.analysisType)}`}>
                      <span className="flex items-center gap-1">
                        {getIcon(decision.analysisType)}
                        {getTypeLabel(decision.analysisType)}
                      </span>
                    </span>
                    <span className="flex items-center gap-1 text-[10px] text-slate-400">
                      <Calendar className="h-3 w-3" />
                      {formatTime(decision.createdAt)}
                    </span>
                  </div>
                  <h3 className="font-sans font-medium text-slate-800 text-sm truncate leading-snug">
                    {decision.title}
                  </h3>
                  {decision.context && (
                    <p className="text-xs text-slate-500 truncate mt-0.5">
                      {decision.context}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteDecision(decision.id);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete decision"
                    id={`delete-decision-${decision.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => onSelectDecision(decision)}
                    className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                    id={`select-decision-${decision.id}`}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
