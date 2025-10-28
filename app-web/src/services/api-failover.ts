import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { BACKEND_SERVICES, checkServiceHealth, updateServiceUrls, API_TIMEOUT } from '../config/api'

// Maximum number of retries per request
const MAX_RETRIES = 3

class ApiFailoverService {
  private currentServiceIndex: number = 0
  private axiosInstance: AxiosInstance
  private failoverAttempts: number = 0
  private maxFailoverAttempts: number = 3
  private requestInterceptorId: number | null = null
  private responseInterceptorId: number | null = null
  private healthCheckInterval: NodeJS.Timeout | null = null

  constructor() {
    this.axiosInstance = this.createAxiosInstance(BACKEND_SERVICES[0])
    this.initializeHealthMonitoring()
  }

  private createAxiosInstance(service: typeof BACKEND_SERVICES[0]): AxiosInstance {
    console.log(`🔗 Creating axios instance for ${service.name}`)
    const instance = axios.create({
      baseURL: service.apiUrl,
      timeout: API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    })
    
    // Setup interceptors immediately for the new instance
    this.setupInterceptors(instance)
    return instance
  }

  private setupInterceptors(instance: AxiosInstance) {
    // Eject any existing interceptors to prevent duplicates
    if (this.requestInterceptorId !== null) {
      this.axiosInstance.interceptors.request.eject(this.requestInterceptorId)
    }
    if (this.responseInterceptorId !== null) {
      this.axiosInstance.interceptors.response.eject(this.responseInterceptorId)
    }

    // Add new interceptors and store their IDs
    this.requestInterceptorId = instance.interceptors.request.use(
      (config) => {
        let token: string | null = null
        try {
          token = localStorage.getItem('authToken')
        } catch (e) {
          console.warn('⚠️ localStorage is not available')
        }
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        console.log(`📤 ${config.method?.toUpperCase()} ${config.url}`)
        return config
      },
      (error) => {
        console.error('❌ Request interceptor error:', error.message)
        return Promise.reject(error)
      },
    )

    this.responseInterceptorId = instance.interceptors.response.use(
      (response) => {
        console.log(`✅ Response: ${response.status} from ${response.config.url}`)
        return response
      },
      async (error) => {
        console.error('❌ API Error:', {
          url: error.config?.url,
          status: error.response?.status,
          message: error.message,
        })

        if (
          error.response?.status === 502 ||
          error.response?.status === 503 ||
          error.response?.status === 504 ||
          error.code === 'ECONNABORTED' ||
          error.code === 'ERR_NETWORK'
        ) {
          // Initialize retry counter if missing
          if (!error.config.__retryCount) {
            error.config.__retryCount = 0
          }

          // Check if we haven't exceeded max retries
          if (error.config.__retryCount < MAX_RETRIES) {
            console.warn(`⚠️ Server error detected, attempting failover... (retry ${error.config.__retryCount + 1}/${MAX_RETRIES})`)
            const failedOver = await this.performFailover()
            
            if (failedOver && error.config) {
              // Increment retry counter before retrying
              error.config.__retryCount++
              console.log(`🔄 Retrying request with backup server... (attempt ${error.config.__retryCount}/${MAX_RETRIES})`)
              return this.axiosInstance.request(error.config)
            }
          } else {
            console.error(`❌ Max retries (${MAX_RETRIES}) exceeded for request to ${error.config?.url}`)
          }
        }

        if (error.response?.status === 401) {
          try {
            localStorage.removeItem('authToken')
            localStorage.removeItem('user')
          } catch (e) {
            console.warn('⚠️ Failed to clear localStorage')
          }
        }
        
        return Promise.reject(error)
      },
    )
  }

  private initializeHealthMonitoring() {
    // Clear any existing interval to prevent multiple intervals
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
    }
    
    this.healthCheckInterval = setInterval(async () => {
      await this.checkAndFailover()
    }, 60000)
  }

  private async checkAndFailover() {
    const currentService = BACKEND_SERVICES[this.currentServiceIndex]
    const isHealthy = await checkServiceHealth(currentService)

    if (!isHealthy && this.failoverAttempts < this.maxFailoverAttempts) {
      console.warn(`⚠️ Current service ${currentService.name} is unhealthy, attempting failover...`)
      await this.performFailover()
    } else if (isHealthy) {
      this.failoverAttempts = 0
    }
  }

  private async performFailover(): Promise<boolean> {
    this.failoverAttempts++
    
    for (let i = 0; i < BACKEND_SERVICES.length; i++) {
      const nextIndex = (this.currentServiceIndex + 1 + i) % BACKEND_SERVICES.length
      const nextService = BACKEND_SERVICES[nextIndex]
      
      const isHealthy = await checkServiceHealth(nextService)
      
      if (isHealthy) {
        console.log(`✅ Failing over to ${nextService.name}`)
        this.currentServiceIndex = nextIndex
        this.axiosInstance = this.createAxiosInstance(nextService)
        updateServiceUrls(nextService)
        this.failoverAttempts = 0
        return true
      }
    }

    console.error('❌ All backend services are unavailable')
    return false
  }

  public get<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.get<T>(url, config)
  }

  public post<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.post<T>(url, data, config)
  }

  public put<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.put<T>(url, data, config)
  }

  public delete<T = any>(url: string, config?: AxiosRequestConfig) {
    return this.axiosInstance.delete<T>(url, config)
  }

  public patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig) {
    return this.axiosInstance.patch<T>(url, data, config)
  }

  public getCurrentService() {
    return BACKEND_SERVICES[this.currentServiceIndex]
  }

  public setAuthToken(token: string) {
    this.axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${token}`
  }

  public removeAuthToken() {
    delete this.axiosInstance.defaults.headers.common['Authorization']
  }

  public cleanup() {
    // Eject interceptors to prevent memory leaks
    if (this.requestInterceptorId !== null) {
      this.axiosInstance.interceptors.request.eject(this.requestInterceptorId)
      this.requestInterceptorId = null
    }
    if (this.responseInterceptorId !== null) {
      this.axiosInstance.interceptors.response.eject(this.responseInterceptorId)
      this.responseInterceptorId = null
    }
    
    // Clear health check interval to prevent memory leaks
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
    }
  }
}

export const apiFailoverService = new ApiFailoverService()