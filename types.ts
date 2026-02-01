
export enum Role {
  TDR = "TDR",
  MDR = "MDR",
  BA_LT = "BA-LT",
  Admin = "Admin",
}

export enum Region {
  CENTRAL = "Central",
}

export enum Cluster {
  NORTH_WEST = "North West",
  NORTHERN_CAPE = "Northern Cape",
  FREE_STATE = "Free State",
}

export interface TeamMember {
  msisdn: string;
  fullName: string;
  role: Role;
  region: Region;
  cluster: Cluster;
  momoNumber: string;
}

export interface RGMSubmission {
  id: string;
  teamMemberMsisdn: string;
  teamMemberName: string;
  agentName: string;
  agentMsisdn: string;
  transactionId: string;
  submissionDate: string; // ISO string date
  region: Region;
  category?: string; // "Agent" or "Customer Sub-Wallets"
}

export interface MAUSubmission {
  id: string;
  teamMemberMsisdn: string;
  teamMemberName: string;
  agentName: string;
  agentMsisdn: string;
  transactionId: string;
  submissionDate: string; // ISO string date
  region: Region;
}

export type OnboardType = "Criminal Check" | "New Upload" | "Re-Upload";

export interface OnboardEntry {
  id?: string;
  type: OnboardType;
  channel?: string; // Hidden field in UI, used for database tracking
  submitterMsisdn?: string; // Used to track ownership
  name: string;
  msisdn: string;
  contactNo: string;
  idNumber: string;
  physicalAddress: string;
  cluster: string; // Using string to match specific prompt requirements ("Ofs", etc)
  areaMentorRtl: string;
  leaderName: string;
  leaderMsisdn: string;
  onboardedDate: string;
  amlScore: number;
  mainplace: string;
  submissionDate?: string;
  originalSheet?: 'CC' | 'Regular'; // For tracking edits
}

export interface AgentStatus {
  totalAgents: number;
  hotAgents: number;
  warmAgents: number;
  coldAgents: number;
}