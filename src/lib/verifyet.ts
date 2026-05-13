import { prisma } from "@/lib/prisma";

export interface VerifyetConfig {
  enabled: boolean;
  apiKey: string;
  environment: "production" | "development";
  baseUrl: string;
}

export interface VerifyRequestPayload {
  reference: string;
  suffix?: string;
  phoneNumber?: string;
  webhookUrl?: string;
}

export interface VerificationResult {
  bank: string;
  status: "success" | "failed" | "not_found";
  verified: boolean;
  amount?: number;
  currency?: string;
  senderName?: string;
  receiverName?: string;
  referenceNumber?: string;
  accountSuffix?: string;
  timestamp?: string;
}

export interface VerifyResponse {
  success: boolean;
  message: string;
  requestId: string;
  verification?: {
    requestId: string;
    processingStatus: "queued" | "running" | "completed" | "failed";
    status: "pending" | "success" | "failed" | "not_found";
    verified: boolean;
    result?: VerificationResult;
  };
  data?: any;
}

export interface VerifyStatusResponse {
  success: boolean;
  message: string;
  data: {
    requestId: string;
    processingStatus: "queued" | "running" | "completed" | "failed";
    status: "pending" | "success" | "failed" | "not_found";
    verified: boolean;
    result?: VerificationResult;
    queuedAt?: string;
    startedAt?: string;
    completedAt?: string;
  };
}

export class VerifyetAPIError extends Error {
  public status: number;
  public details?: any;

  constructor(message: string, status: number, details?: any) {
    super(message);
    this.name = "VerifyetAPIError";
    this.status = status;
    this.details = details;
  }
}

/**
 * Get Verifyet configuration from the database
 */
export async function getVerifyetConfig(): Promise<VerifyetConfig> {
  const keys = await prisma.siteConfig.findMany({
    where: { key: { in: ["verifyet_enabled", "verifyet_api_key", "verifyet_environment"] } },
  });

  const configMap: Record<string, string> = {};
  keys.forEach((k) => {
    configMap[k.key] = k.value;
  });

  const environment = (configMap.verifyet_environment || "production") as "production" | "development";
  const baseUrl = environment === "production" ? "https://verify.et" : "http://localhost:3000";

  return {
    enabled: configMap.verifyet_enabled === "true",
    apiKey: configMap.verifyet_api_key || "",
    environment,
    baseUrl,
  };
}

/**
 * Internal helper to make API requests
 */
async function fetchVerifyet<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const config = await getVerifyetConfig();

  if (!config.enabled) {
    throw new Error("Verifyet API is disabled in settings.");
  }
  if (!config.apiKey) {
    throw new Error("Verifyet API key is missing. Please configure it in settings.");
  }

  const url = `${config.baseUrl}${endpoint}`;
  
  const headers = new Headers(options.headers);
  headers.set("x-api-key", config.apiKey);
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(url, { ...options, headers });
  
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = await response.text();
    }
    throw new VerifyetAPIError(
      errorData?.message || `Verifyet API error: ${response.statusText}`,
      response.status,
      errorData
    );
  }

  return response.json() as Promise<T>;
}

/**
 * Submit a verification request to Verifyet
 */
export async function submitVerification(payload: VerifyRequestPayload, idempotencyKey?: string): Promise<VerifyResponse> {
  const headers: Record<string, string> = {};
  if (idempotencyKey) {
    headers["Idempotency-Key"] = idempotencyKey;
  }

  return fetchVerifyet<VerifyResponse>("/api/verify", {
    method: "POST",
    headers,
    body: JSON.stringify(payload),
  });
}

/**
 * Get the status of an existing verification request
 */
export async function getVerificationStatus(requestId: string): Promise<VerifyStatusResponse> {
  return fetchVerifyet<VerifyStatusResponse>(`/api/verify/${requestId}`);
}
