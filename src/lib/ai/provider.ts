import type { Department, ProjectBrief, Service, StaffRole } from "@/lib/types";
import type { Hit } from "./retrieval";
import type { Lang } from "./lang";
import type { BriefSuggestion, RouteSuggestion } from "./tools";

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  staff: StaffRole;
  departments: Department[];
  services: Service[];
  history: ChatTurn[]; // last item is the (redacted) visitor message
  hits: Hit[];
  lang: Lang;
  sharedBrief: Partial<ProjectBrief> | null;
  injectionReasons: string[];
  sensitive: string[];
}

export type ProviderEvent =
  | { type: "text"; text: string }
  | { type: "brief"; suggestion: BriefSuggestion }
  | { type: "route"; suggestion: RouteSuggestion }
  | { type: "refusal" }
  | { type: "done"; stopReason: string; usage?: { input: number; output: number } };

export interface ChatProvider {
  id: "anthropic" | "demo";
  model: string;
  stream(req: ChatRequest, signal: AbortSignal): AsyncGenerator<ProviderEvent>;
}

export class ProviderError extends Error {
  constructor(
    public code: "provider_busy" | "provider_auth" | "provider_unavailable" | "provider_timeout" | "provider_error",
    message: string,
  ) {
    super(message);
  }
}
