import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BACKEND_SERVICES, checkServiceHealth, updateServiceUrls, API_TIMEOUT } from '../config/api';

class ApiService {
  private currentServiceIndex: number = 0;
  private axiosInstance: AxiosInstance;
  private failoverAttempts: number = 0;
  private maxFailoverAttempts: number = 3;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.axiosInstance = this.createAxiosInstance(BACKEND_SERVICES[0]);
    this.initializeHealthMonitoring();
    this.setupInterceptors();
    console.log('🔗 API Service initialized with failover support');
  }

  private createAxiosInstance(service: typeof BACKEND_SERVICES[0]): AxiosInstance {
    console.log(`🔗 Creating axios instance for ${service.name}`);
    return axios.create({
      baseURL: service.apiUrl,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.axiosInstance.interceptors.request.use(
      async (config) => {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`);
        return config;
      },
      (error) => {
        console.error('❌ Request interceptor error:', error.message);
        return Promise.reject(error);
      },
    );

    // Response interceptor for error handling
    this.axiosInstance.interceptors.response.use(
      (response) => {
        console.log(`✅ Response: ${response.status} from ${response.config.url}`);
        return response;
      },
      async (error) => {
        console.error('❌ API Error Details:', {
          url: error.config?.url,
          method: error.config?.method,
          status: error.response?.status,
          statusText: error.response?.statusText,
          message: error.message,
          code: error.code,
        });

        // Handle server errors with automatic failover
        if (
          error.response?.status === 502 ||
          error.response?.status === 503 ||
          error.response?.status === 504 ||
          error.code === 'ECONNABORTED' ||
          error.code === 'ERR_NETWORK'
        ) {
          console.warn('⚠️ Server error detected, attempting failover...');
          const failedOver = await this.performFailover();
          
          if (failedOver && error.config) {
            console.log('🔄 Retrying request with backup server...');
            return this.axiosInstance.request(error.config);
          }
        }

        if (error.response?.status === 401) {
          await AsyncStorage.removeItem('authToken');
          await AsyncStorage.removeItem('user');
        }
        
        return Promise.reject(error);
      },
    );
  }

  private initializeHealthMonitoring() {
    // Check health every 60 seconds
    this.healthCheckInterval = setInterval(async () => {
      await this.checkAndFailover();
    }, 60000);
  }

  private async checkAndFailover() {
    const currentService = BACKEND_SERVICES[this.currentServiceIndex];
    const isHealthy = await checkServiceHealth(currentService);

    if (!isHealthy && this.failoverAttempts < this.maxFailoverAttempts) {
      console.warn(`⚠️ Current service ${currentService.name} is unhealthy, attempting failover...`);
      await this.performFailover();
    } else if (isHealthy) {
      this.failoverAttempts = 0;
    }
  }

  private async performFailover(): Promise<boolean> {
    this.failoverAttempts++;
    
    // Try next service in the list
    for (let i = 0; i < BACKEND_SERVICES.length; i++) {
      const nextIndex = (this.currentServiceIndex + 1 + i) % BACKEND_SERVICES.length;
      const nextService = BACKEND_SERVICES[nextIndex];
      
      const isHealthy = await checkServiceHealth(nextService);
      
      if (isHealthy) {
        console.log(`✅ Failing over to ${nextService.name}`);
        this.currentServiceIndex = nextIndex;
        this.axiosInstance = this.createAxiosInstance(nextService);
        this.setupInterceptors(); // Re-setup interceptors for new instance
        updateServiceUrls(nextService);
        this.failoverAttempts = 0;
        return true;
      }
    }

    console.error('❌ All backend services are unavailable');
    return false;
  }

  // Axios-compatible methods
  public get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  public getCurrentService() {
    return BACKEND_SERVICES[this.currentServiceIndex];
  }

  public cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
  }
}

// Export singleton instance
const api = new ApiService();
export default api;
