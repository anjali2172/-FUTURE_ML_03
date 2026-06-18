export interface IndianContext {
  degrees: string[];
  universities: string[];
  cgpaPercentage: string;
  phone: string;
  email: string;
  location: string;
}

export interface Candidate {
  id: string;
  name: string;
  fileName: string;
  rawText: string;
  cleanedText: string;
  contact: IndianContext;
  skills: string[];
  matchScore?: number;
  status?: "Highly Recommended" | "Shortlisted" | "Under Review" | "Not Suitable";
  isMock?: boolean;
}

export interface JobRole {
  id: string;
  title: string;
  description: string;
  skills: string[];
}
