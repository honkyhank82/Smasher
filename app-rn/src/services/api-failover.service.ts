import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import {
  BACKEND_SERVICES_LIST,
  checkServiceHealth,
  updateServiceUrls,
  API_TIMEOUT,
  BackendServiceConfig,
} from "../config/api";

class ApiFailoverService {
  private currentServiceIndex: number = 0;
  private axiosInstance: AxiosInstance;
  private failoverAttempts: number = 0;
  private maxFailoverAttempts: number = 3;
  private services = BACKEND_SERVICES_LIST;

  constructor() {
    this.axiosInstance = this.createAxiosInstance(this.services[0]);
    this.initializeHealthMonitoring();
  }

  private createAxiosInstance(service: BackendServiceConfig): AxiosInstance {
    return axios.create({
      baseURL: service.apiUrl,
      timeout: API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  private async initializeHealthMonitoring() {
    // Check health every 60 seconds
    setInterval(async () => {
      await this.checkAndFailover();
    }, 60000);
  }

  private async checkAndFailover() {
    const currentService = this.services[this.currentServiceIndex];
    const isHealthy = await checkServiceHealth(currentService);

    if (!isHealthy && this.failoverAttempts < this.maxFailoverAttempts) {
      console.warn(
        `Current service ${currentService.name} is unhealthy, attempting failover...`,
      );
      await this.performFailover();
    } else if (isHealthy) {
      // Reset failover attempts if service is healthy
      this.failoverAttempts = 0;
    }
  }

  private async performFailover() {
    this.failoverAttempts++;

    // Try next service in the list
    for (let i = 0; i < this.services.length; i++) {
      const nextIndex =
        (this.currentServiceIndex + 1 + i) % this.services.length;
      const nextService = this.services[nextIndex];

      const isHealthy = await checkServiceHealth(nextService);

      if (isHealthy) {
        console.log(`Failing over to ${nextService.name}`);
        this.currentServiceIndex = nextIndex;
        this.axiosInstance = this.createAxiosInstance(nextService);
        updateServiceUrls(nextService);
        this.failoverAttempts = 0;
        return true;
      }
    }

    console.error("All backend services are unavailable");
    return false;
  }

  public async request<T = any>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.axiosInstance.request<T>(config);
      return response.data;
    } catch (error) {
      // If request fails, try failover
      if (
        axios.isAxiosError(error) &&
        (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK")
      ) {
        console.warn("Request failed, attempting failover...");
        const failedOver = await this.performFailover();

        if (failedOver) {
          // Retry request with new service
          const response = await this.axiosInstance.request<T>(config);
          return response.data;
        }
      }
      throw error;
    }
  }

  public async get<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>({ ...config, method: "GET", url });
  }

  public async post<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>({ ...config, method: "POST", url, data });
  }

  public async put<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PUT", url, data });
  }

  public async delete<T = any>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>({ ...config, method: "DELETE", url });
  }

  public async patch<T = any>(
    url: string,
    data?: any,
    config?: AxiosRequestConfig,
  ): Promise<T> {
    return this.request<T>({ ...config, method: "PATCH", url, data });
  }

  public setAuthToken(token: string) {
    this.axiosInstance.defaults.headers.common.Authorization = `Bearer ${token}`;
  }

  public removeAuthToken() {
    delete this.axiosInstance.defaults.headers.common.Authorization;
  }

  public getCurrentService() {
    return this.services[this.currentServiceIndex];
  }
}

// Export singleton instance
export const apiFailoverService = new ApiFailoverService();
export default apiFailoverService;
