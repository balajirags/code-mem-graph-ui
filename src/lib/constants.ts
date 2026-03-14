// Color palette for node labels
const LABEL_COLORS: Record<string, string> = {
  Person: '#6366f1',
  Organization: '#8b5cf6',
  Company: '#a855f7',
  Project: '#ec4899',
  Repository: '#f43f5e',
  File: '#3b82f6',
  Folder: '#06b6d4',
  Function: '#10b981',
  Class: '#14b8a6',
  Method: '#22c55e',
  Module: '#84cc16',
  Package: '#eab308',
  Interface: '#f97316',
  Variable: '#ef4444',
  Event: '#f59e0b',
  Location: '#0ea5e9',
  Document: '#64748b',
  Tag: '#a3e635',
  Category: '#c084fc',
  User: '#fb923c',
  Issue: '#f87171',
  PullRequest: '#4ade80',
  Commit: '#22d3ee',
  Branch: '#818cf8',
};

// Fallback palette for unknown labels (cycled)
const PALETTE = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#3b82f6',
  '#06b6d4', '#10b981', '#14b8a6', '#22c55e', '#84cc16',
  '#eab308', '#f97316', '#ef4444', '#f59e0b', '#0ea5e9',
  '#a855f7', '#c084fc', '#fb923c', '#4ade80', '#22d3ee',
];

const assignedColors = new Map<string, string>();
let paletteIdx = 0;

export function getLabelColor(label: string): string {
  if (LABEL_COLORS[label]) return LABEL_COLORS[label];
  if (assignedColors.has(label)) return assignedColors.get(label)!;
  const color = PALETTE[paletteIdx % PALETTE.length];
  paletteIdx++;
  assignedColors.set(label, color);
  return color;
}

// Edge type colors — brighter values for visibility on dark backgrounds
const EDGE_COLORS: Record<string, string> = {
  CONTAINS: '#4ade80',
  DEFINES: '#22d3ee',
  IMPORTS: '#60a5fa',
  CALLS: '#a78bfa',
  EXTENDS: '#fb923c',
  IMPLEMENTS: '#f472b6',
  DEPENDS_ON: '#818cf8',
  KNOWS: '#34d399',
  FOLLOWS: '#38bdf8',
  CREATED: '#fbbf24',
  OWNS: '#f97316',
  MEMBER_OF: '#c084fc',
  RELATES_TO: '#94a3b8',
};

let edgePaletteIdx = 0;
const assignedEdgeColors = new Map<string, string>();

export function getEdgeColor(type: string): string {
  if (EDGE_COLORS[type]) return EDGE_COLORS[type];
  if (assignedEdgeColors.has(type)) return assignedEdgeColors.get(type)!;
  const color = PALETTE[edgePaletteIdx % PALETTE.length];
  edgePaletteIdx++;
  assignedEdgeColors.set(type, color);
  return color;
}
