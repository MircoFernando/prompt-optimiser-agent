import axios from 'axios';

// Define the base URL pointing to your local FastAPI server
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1/optimize';

// TypeScript Interfaces to enforce type safety across your frontend
export interface OptimizationRequest {
  initial_prompt: string;
  session_id: string;
  max_iterations?: number;
}

export interface OptimizationResponse {
  optimized_draft: string;
  latency_seconds: number;
  framework_used: string;
  input_tokens: number;
    output_tokens: number;
}

// 
export const promptServiceADK = {
  /**
   * Sends a prompt and session ID to the Google ADK reflection loop endpoint.
   */
  optimize: async (payload: OptimizationRequest): Promise<OptimizationResponse> => {
    try {
      const response = await axios.post<OptimizationResponse>(
        `${API_BASE_URL}/adk`, 
        {
          initial_prompt: payload.initial_prompt,
          session_id: payload.session_id,
          max_iterations: payload.max_iterations ?? 3
        }
      );
      return response.data;
    } catch (error: unknown) {
      // Re-throw a cleaner error string or response status back to the component
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const detail = axios.isAxiosError(error) ? error.response?.data?.detail : undefined;
      
      if (status === 503) {
        throw new Error('The AI model is experiencing heavy demand. Please try again in a moment.', { cause: error });
      }
      throw new Error(detail || 'Failed to connect to the prompt optimization backend.', { cause: error });
    }
  }
};


// 
export const promptServiceLangGraph = {
  /**
   * Sends a prompt and session ID to the LangGraph reflection loop endpoint.
   */
  optimize: async (payload: OptimizationRequest): Promise<OptimizationResponse> => {
    try {
      const response = await axios.post<OptimizationResponse>(
        `${API_BASE_URL}/langgraph`, 
        {
          initial_prompt: payload.initial_prompt,
          session_id: payload.session_id,
          max_iterations: payload.max_iterations ?? 3
        }
      );
      return response.data;
    } catch (error: unknown) {
      // Re-throw a cleaner error string or response status back to the component
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      const detail = axios.isAxiosError(error) ? error.response?.data?.detail : undefined;
      
      if (status === 503) {
        throw new Error('The AI model is experiencing heavy demand. Please try again in a moment.', { cause: error });
      }
      throw new Error(detail || 'Failed to connect to the prompt optimization backend.', { cause: error });
    }
  }
};