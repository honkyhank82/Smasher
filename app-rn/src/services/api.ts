import axios, { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError, 
  InternalAxiosRequestConfig,
  AxiosRequestHeaders 
} from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';
import { API_TIMEOUT, BACKEND_SERVICES } from '../config/constants';
import { getAppVersion, getDeviceInfo } from '../utils/deviceInfo';

// Types
type BackendService = {
  name: string;
  apiUrl: string;
  healthCheckUrl?: string;
  isActive?: boolean;
  lastChecked?: number;
};

interface RetryConfig extends AxiosRequestConfig {
  _retry?: boolean;
  _retryCount?: number;
}

// Constants
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Service health tracking
let serviceHealth: Record<string, { isHealthy: boolean; lastChecked: number }> = {};

class ApiService {
  private currentServiceIndex: number = 0;
  private axiosInstance: AxiosInstance;
  private retryCount: number = 0;
  private maxRetries: number = MAX_RETRIES;
  private healthCheckInterval: NodeJS.Timeout | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private services: BackendService[] = [...BACKEND_SERVICES];
  
  // Track request timing for performance monitoring
  private requestTimings: Record<string, number> = {};

  constructor() {
    this.axiosInstance = this.createAxiosInstance(this.getActiveService());
    this.initializeHealthMonitoring();
    this.setupInterceptors();
    this.initializeServiceHealth();
    
    if (__DEV__) {
      console.log('🔗 API Service initialized with failover support');
      console.log(`🌐 Active service: ${this.getActiveService().name} (${this.getActiveService().apiUrl})`);
    }
  }

  private createAxiosInstance(service: BackendService): AxiosInstance {
    const instance = axios.create({
      baseURL: service.apiUrl,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': getAppVersion(),
        'X-Platform': Platform.OS,
        'X-Device-Id': getDeviceInfo().uniqueId,
      },
    });

    if (__DEV__) {
      console.log(`🔗 Created axios instance for ${service.name} (${service.apiUrl})`);
    }

    return instance;
  }

  private async getAuthToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem('authToken');
    } catch (error) {
      console.error('Failed to get auth token:', error);
      return null;
    }
  }

  private async refreshToken(): Promise<string | null> {
    if (this.isRefreshing) {
      return new Promise((resolve) => {
        this.refreshSubscribers.push((token: string) => {
          resolve(token);
        });
      });
    }

    this.isRefreshing = true;
    try {
      const refreshToken = await AsyncStorage.getItem('refreshToken');
      if (!refreshToken) throw new Error('No refresh token available');

      const response = await axios.post(
        `${this.getActiveService().apiUrl}/auth/refresh-token`,
        { refreshToken }
      );

      const { accessToken, refreshToken: newRefreshToken } = response.data;
      await AsyncStorage.multiSet([
        ['authToken', accessToken],
        ['refreshToken', newRefreshToken]
      ]);

      this.isRefreshing = false;
      this.onRefreshed(accessToken);
      return accessToken;
    } catch (error) {
      this.isRefreshing = false;
      this.onRefreshFailed();
      throw error;
    }
  }

  private onRefreshed(token: string) {
    this.refreshSubscribers.forEach(callback => callback(token));
    this.refreshSubscribers = [];
  }

  private onRefreshFailed() {
    this.refreshSubscribers = [];
    // Optionally log out the user or take other actions
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Track request start time
        this.requestTimings[config.url || 'unknown'] = Date.now();
        
        // Add auth token if available
        const token = await this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        if (__DEV__) {
          console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`, {
            data: config.data,
            params: config.params,
          });
        }
        
        return config;
      },
      (error: AxiosError) => {
        console.error('❌ Request error:', error.message);
        this.logErrorToSentry(error, 'request');
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calculate request duration
        const url = response.config.url || 'unknown';
        const startTime = this.requestTimings[url];
        const duration = startTime ? Date.now() - startTime : 0;
        delete this.requestTimings[url];

        // Log successful response
        if (__DEV__) {
          console.log(
            `✅ ${response.status} ${response.config.method?.toUpperCase()} ${url} (${duration}ms)`,
            response.data
          );
        }
        
        // Track API performance
        this.trackApiPerformance({
          url,
          method: response.config.method || 'GET',
          status: response.status,
          duration,
        });

        return response;
      },
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
