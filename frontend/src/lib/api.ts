import type { Message, Room } from "../types";

export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public response?: any;

  constructor(
    message: string,
    status: number,
    statusText: string,
    response?: any
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.statusText = statusText;
    this.response = response;
  }
}

interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

interface RequestOptions extends RequestInit {
  timeout?: number;
}

class ApiClient {
  private config: ApiConfig;

  constructor(config?: Partial<ApiConfig>) {
    this.config = {
      baseUrl: import.meta.env.VITE_API_BASE_URL || "http://localhost:3000",
      timeout: 10000,
      ...config,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.config.baseUrl}${endpoint}`;

    const requestOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    const timeout = options.timeout || this.config.timeout;

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...requestOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message ||
            `HTTP ${response.status}: ${response.statusText}`,
          response.status,
          response.statusText,
          errorData
        );
      }

      const data: ApiResponse<T> = await response.json();
      return data;
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError("Request timeout", 408, "Request Timeout");
      }
      throw new ApiError(
        error instanceof Error ? error.message : "Unknown error occurred",
        0,
        "Network Error"
      );
    }
  }

  private getAuthHeaders(userId: string): Record<string, string> {
    return {
      Authorization: `Bearer ${userId}`,
      "Content-Type": "application/json",
    };
  }

  public async getRooms(userId: string): Promise<Room[]> {
    const response = await this.request<Room[]>("/rooms", {
      headers: this.getAuthHeaders(userId),
    });
    return response.data;
  }

  public async createRoom(
    userId: string,
    roomData: { name: string }
  ): Promise<Room> {
    const response = await this.request<Room>("/rooms", {
      method: "POST",
      headers: this.getAuthHeaders(userId),
      body: JSON.stringify(roomData),
    });
    return response.data;
  }

  public async getMessages(userId: string, roomId: string): Promise<Message[]> {
    const response = await this.request<Message[]>("/messages/" + roomId, {
      headers: this.getAuthHeaders(userId),
    });
    return response.data;
  }

  public async createMessage(
    userId: string,
    messageData: { content: string; roomId: string }
  ): Promise<Message> {
    const response = await this.request<Message>("/messages", {
      method: "POST",
      headers: this.getAuthHeaders(userId),
      body: JSON.stringify(messageData),
    });

    return response.data;
  }
}

export const apiClient = new ApiClient();

export { ApiClient };
