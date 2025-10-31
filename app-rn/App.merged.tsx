// ... [Previous imports remain the same until line 180]

// Custom error fallback component with improved error handling and UI
const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const [showDetails, setShowDetails] = React.useState(false);
  
  const handleReportError = useCallback(async () => {
    if (ENV.IS_DEV) {
      Alert.alert('Error Report', 'In development mode - error would be reported in production');
      return;
    }
    
    try {
      const eventId = Sentry.captureException(error);
      Alert.alert(
        'Error Reported',
        `Error ID: ${eventId}\n\nThank you for helping us improve the app.`,
        [{ text: 'OK', onPress: resetError }]
      );
    } catch (reportError) {
      console.error('Failed to report error:', reportError);
      Alert.alert(
        'Error',
        'Failed to send error report. Please check your connection and try again.',
        [{ text: 'OK' }]
      );
    }
  }, [error, resetError]);
  
  const toggleDetails = useCallback(() => {
    setShowDetails(prev => !prev);
  }, []);
  
  const handleReportPress = async () => {
    if (!__DEV__) {
      const eventId = Sentry.captureException(error);
      alert(`Error reported with ID: ${eventId}`);
    } else {
      alert('In development mode - error would be reported in production');
    }
    resetError();
  };

  return (
    <View style={styles.errorContainer}>
      <Text style={styles.errorTitle}>Something went wrong</Text>
      <Text style={styles.errorText}>{error.message}</Text>
      <View style={styles.buttonContainer}>
        <Button 
          title="Report Error" 
          onPress={handleReportError} 
          accessibilityLabel="Report this error"
        />
        <Button 
          title="Try Again" 
          onPress={resetError} 
          accessibilityLabel="Try to restart the app"
        />
        <Button 
          onPress={handleReportPress} 
          title="Report Error" 
          color="#FF3B30"
          accessibilityLabel="Report this error to the developers"
        />
      </View>
      <Button
        onPress={toggleDetails}
        title={showDetails ? 'Hide Details' : 'Show Details'}
        color="#8E8E93"
      />
      {showDetails && (
        <View style={styles.detailsContainer}>
          <Text style={styles.detailsTitle}>Error Details:</Text>
          <Text style={styles.detailsText}>
            {JSON.stringify({
              name: error.name,
              message: error.message,
              stack: error.stack
            }, null, 2)}
          </Text>
        </View>
      )}
    </View>
  );
};

// Custom error boundary component with proper TypeScript types
const ErrorBoundary: React.FC<ErrorBoundaryProps> = ({ 
  children, 
  fallback: FallbackComponent,
  onError
}) => {
  const [error, setError] = useState<Error | null>(null);
  const [errorInfo, setErrorInfo] = useState<React.ErrorInfo | null>(null);

  const resetError = useCallback(() => {
    setError(null);
    setErrorInfo(null);
  }, []);

  if (error && errorInfo) {
    return <FallbackComponent error={error} resetError={resetError} />;
  }

  return (
    <ErrorBoundaryComponent
      onError={(err: Error, errorInfo: React.ErrorInfo) => {
        setError(err);
        setErrorInfo(errorInfo);
        onError?.(err, errorInfo.componentStack);
      }}
    >
      {children}
    </ErrorBoundaryComponent>
  );
};

// App initialization function
const initializeApp = async (): Promise<void> => {
  try {
    // Initialize API service health checks
    const checkApiHealth = useCallback(async (): Promise<boolean> => {
      try {
        const response = await api.get('/health');
        if (!response.ok) {
          throw new Error('API service is not healthy');
        }
        return true;
      } catch (error) {
        console.error('API health check failed:', error);
        throw error;
      }
    }, []);

    await checkApiHealth();
    
    // Set up network monitoring
    const unsubscribeNetInfo = NetInfo.addEventListener(state => {
      console.log('Connection type:', state.type);
      console.log('Is connected?', state.isConnected);
      
      if (state.isConnected) {
        // Re-check service health when connection is restored
        checkApiHealth().catch(console.error);
      }
    });

    return () => unsubscribeNetInfo();
  } catch (error) {
    console.error('Failed to initialize app:', error);
    throw error;
  }
};

// ... [Rest of the file remains the same]
