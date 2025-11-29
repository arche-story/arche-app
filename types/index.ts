export interface IPAsset {
  id: string;
  title?: string; // Asset Title (e.g. "Cyber Samurai")
  prompt: string;
  imageUri: string;
  createdAt: string;
  status?: 'DRAFT' | 'REGISTERED';
  type?: 'GENESIS' | 'REMIX';
  txHash?: string;
  owner?: string; // Add owner property
}

export interface GraphNode extends IPAsset {
  x?: number;
  y?: number;
  [key: string]: any; // Allow for d3-force internal properties
}

export interface GraphLink {
  source: string | GraphNode;
  target: string | GraphNode;
}

export interface GraphData {
  nodes: GraphNode[];
  links: GraphLink[];
}

export interface Version {
  id: string;
  label: string;
  timestamp: string;
  type: "GENESIS" | "DRAFT" | "REMIX";
  status?: string;
}
