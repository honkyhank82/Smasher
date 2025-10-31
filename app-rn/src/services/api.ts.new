import { 
  AxiosInstance, 
  AxiosRequestConfig, 
  AxiosResponse, 
  AxiosError, 
  InternalAxiosRequestConfig
} from 'axios';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as Application from 'expo-application';
import * as Device from 'expo-device';

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
const API_TIMEOUT = 30000; // 30 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const HEALTH_CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

// Backend Services Configuration
const BACKEND_SERVICES: BackendService[] = [
  {
    name: 'production',
    apiUrl: 'https://api.smasher.app',
    healthCheckUrl: 'https://api.smasher.app/health',
  },
  {
    name: 'staging',
    apiUrl: 'https://staging.api.smasher.app',
    healthCheckUrl: 'https://staging.api.smasher.app/health',
  },
  {
    name: 'development',
    apiUrl: 'http://localhost:3000',
    healthCheckUrl: 'http://localhost:3000/health',
  },
];

// Device Info Utilities
const getDeviceInfo = () => ({
  uniqueId: Application.getAndroidId?.() || 'unknown',
  deviceName: Device.deviceName || 'unknown',
  osName: Device.osName || 'unknown',
  osVersion: Device.osVersion || 'unknown',
  platform: Platform.OS,
});

const getAppVersion = (): string => {
  return Application.nativeApplicationVersion || '1.0.0';
};

class ApiService {
  private currentServiceIndex: number = 0;
  private axiosInstance: AxiosInstance;
  private retryCount: number = 0;
  private maxRetries: number = MAX_RETRIES;
  private healthCheckInterval: ReturnType<typeof setInterval> | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];
  private services: BackendService[] = [...BACKEND_SERVICES];
  private requestTimings: Record<string, number> = {};
  private serviceHealth: Record<string, { isHealthy: boolean; lastChecked: number }> = {};

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

  private getActiveService(): BackendService {
    return this.services[this.currentServiceIndex];
  }

  private createAxiosInstance(service: BackendService): AxiosInstance {
    const deviceInfo = getDeviceInfo();
    
    const instance = axios.create({
      baseURL: service.apiUrl,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
        'X-Client-Version': getAppVersion(),
        'X-Platform': deviceInfo.platform,
        'X-Device-Id': deviceInfo.uniqueId,
        'X-Device-Name': deviceInfo.deviceName,
        'X-OS': `${deviceInfo.osName} ${deviceInfo.osVersion}`,
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
        { refreshToken },
        { timeout: API_TIMEOUT }
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
    console.warn('Token refresh failed. User may need to log in again.');
  }

  private initializeServiceHealth() {
    this.services.forEach(service => {
      this.serviceHealth[service.name] = {
        isHealthy: true,
        lastChecked: 0
      };
    });
  }

  private async checkServiceHealth(service: BackendService): Promise<boolean> {
    if (!service.healthCheckUrl) return true;
    
    try {
      const response = await axios.get(service.healthCheckUrl, { 
        timeout: 5000,
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      const isHealthy = response.status === 200;
      this.serviceHealth[service.name] = {
        isHealthy,
        lastChecked: Date.now()
      };
      
      if (__DEV__) {
        console.log(`✅ Health check for ${service.name}: ${isHealthy ? 'healthy' : 'unhealthy'}`);
      }
      
      return isHealthy;
    } catch (error) {
      if (__DEV__) {
        console.warn(`❌ Health check failed for ${service.name}:`, error.message);
      }
      
      this.serviceHealth[service.name] = {
        isHealthy: false,
        lastChecked: Date.now()
      };
      return false;
    }
  }

  private async performFailover() {
    if (this.retryCount >= this.maxRetries) {
      console.warn('Max retry attempts reached. Performing service failover...');
      this.retryCount = 0;
      
      // Try to find a healthy service
      for (let i = 0; i < this.services.length; i++) {
        if (i === this.currentServiceIndex) continue;
        
        const isHealthy = await this.checkServiceHealth(this.services[i]);
        if (isHealthy) {
          console.log(`🔀 Failing over to ${this.services[i].name} service`);
          this.currentServiceIndex = i;
          this.axiosInstance = this.createAxiosInstance(this.getActiveService());
          this.setupInterceptors();
          return true;
        }
      }
      
      console.error('No healthy services available');
      return false;
    }
    
    this.retryCount++;
    return true;
  }

  private initializeHealthMonitoring() {
    // Initial health check
    this.services.forEach(service => {
      this.checkServiceHealth(service).catch(console.error);
    });

    // Periodic health check
    this.healthCheckInterval = setInterval(async () => {
      if (__DEV__) {
        console.log('🔄 Running periodic health check...');
      }
      
      await Promise.all(
        this.services.map(service => this.checkServiceHealth(service))
      );
    }, HEALTH_CHECK_INTERVAL);
  }

  private setupInterceptors() {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        // Track request start time
        const requestKey = `${config.method?.toUpperCase()}:${config.url}`;
        this.requestTimings[requestKey] = Date.now();
        
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
        return Promise.reject(error);
      },
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response: AxiosResponse) => {
        // Calculate request duration
        const requestKey = `${response.config.method?.toUpperCase()}:${response.config.url}`;
        const startTime = this.requestTimings[requestKey];
        const duration = startTime ? Date.now() - startTime : 0;
        delete this.requestTimings[requestKey];

        // Log successful response
        if (__DEV__) {
          console.log(
            `✅ ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url} (${duration}ms)`,
            response.data
          );
        }
        
        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as RetryConfig;
        
        // Log error
        if (error.response) {
          // The request was made and the server responded with a status code
          // that falls out of the range of 2xx
          console.error('❌ API Error Response:', {
            status: error.response.status,
            statusText: error.response.statusText,
            url: originalRequest.url,
            method: originalRequest.method,
            data: error.response.data,
          });
          
          // Handle specific error statuses
          if (error.response.status === 401) {
            // Handle unauthorized (token expired, invalid, etc.)
            if (!originalRequest._retry) {
              originalRequest._retry = true;
              try {
                const newToken = await this.refreshToken();
                if (newToken) {
                  originalRequest.headers = originalRequest.headers || {};
                  originalRequest.headers.Authorization = `Bearer ${newToken}`;
                  return this.axiosInstance(originalRequest);
                }
              } catch (refreshError) {
                console.error('Failed to refresh token:', refreshError);
                // Redirect to login or handle token refresh failure
              }
            }
          } else if (error.response.status >= 500) {
            // Server error, try to failover
            await this.performFailover();
            if (originalRequest._retryCount === undefined) {
              originalRequest._retryCount = 1;
              return this.axiosInstance(originalRequest);
            } else if (originalRequest._retryCount < this.maxRetries) {
              originalRequest._retryCount++;
              return new Promise(resolve => {
                setTimeout(() => resolve(this.axiosInstance(originalRequest)), RETRY_DELAY);
              });
            }
          }
        } else if (error.request) {
          // The request was made but no response was received
          console.error('❌ No response received:', error.request);
          
          // Network error, try to failover
          await this.performFailover();
          if (originalRequest._retryCount === undefined) {
            originalRequest._retryCount = 1;
            return this.axiosInstance(originalRequest);
          }
        } else {
          // Something happened in setting up the request
          console.error('❌ Request setup error:', error.message);
        }
        
        return Promise.reject(error);
      }
    );
  }

  // Public API methods
  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.get<T>(url, config);
  }

  public async post<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.post<T>(url, data, config);
  }

  public async put<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.put<T>(url, data, config);
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.axiosInstance.delete<T>(url, config);
  }

  public async patch<T = any>(
    url: string, 
    data?: any, 
    config?: AxiosRequestConfig
  ): Promise<AxiosResponse<T>> {
    return this.axiosInstance.patch<T>(url, data, config);
  }

  public getActiveServiceName(): string {
    return this.getActiveService().name;
  }

  public cleanup() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  // Add request/response interceptors
  public addRequestInterceptor(
    onFulfilled?: (value: InternalAxiosRequestConfig) => InternalAxiosRequestConfig | Promise<InternalAxiosRequestConfig>,
    onRejected?: (error: any) => any
  ): number {
    return this.axiosInstance.interceptors.request.use(onFulfilled, onRejected);
  }

  public addResponseInterceptor(
    onFulfilled?: (value: AxiosResponse) => AxiosResponse | Promise<AxiosResponse>,
    onRejected?: (error: any) => any
  ): number {
    return this.axiosInstance.interceptors.response.use(onFulfilled, onRejected);
  }

  public removeRequestInterceptor(interceptorId: number): void {
    this.axiosInstance.interceptors.request.eject(interceptorId);
  }

  public removeResponseInterceptor(interceptorId: number): void {
    this.axiosInstance.interceptors.response.eject(interceptorId);
  }
}

// Export singleton instance
const api = new ApiService();

export default api;
