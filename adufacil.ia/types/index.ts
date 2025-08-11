// Database types
export interface User {
  id: string;
  email: string;
  created_at: string;
  subscription_status: 'free' | 'premium' | 'enterprise';
}

export interface Document {
  id: string;
  user_id: string;
  original_name: string;
  processed_data: any;
  status: 'pending' | 'processing' | 'completed' | 'error';
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: 'COP';
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payment_method: 'payu' | 'stripe';
  reference: string;
  created_at: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface AuthForm {
  email: string;
  password: string;
}

export interface DocumentUploadForm {
  files: File[];
  document_type: 'invoice' | 'receipt' | 'customs' | 'other';
}

// Integration types
export interface VisionApiResult {
  text: string;
  confidence: number;
  blocks: any[];
}

export interface PayUPayment {
  reference: string;
  amount: number;
  currency: string;
  description: string;
  buyer: {
    email: string;
    fullName: string;
  };
}

export interface DIANValidation {
  valid: boolean;
  errors: string[];
  warnings: string[];
  processed_data: any;
}