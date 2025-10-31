import React, { Component, ReactNode } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as Sentry from '@sentry/react-native';
import { theme } from '../config/theme';

interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
}

interface Props {
  children: ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps> | ReactNode | ((props: ErrorFallbackProps) => ReactNode);
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: any;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error to Sentry
    Sentry.withScope((scope: Sentry.Scope) => {
      scope.setExtras({
        componentStack: errorInfo?.componentStack,
      });
      Sentry.captureException(error);
    });

    this.setState({ error, errorInfo });
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  // Show error report dialog in development
  showErrorReport = () => {
    const { error, errorInfo } = this.state;
    if (!error) return;
    
    const report = `Error: ${error.toString()}\n\n` +
      `Component Stack: ${errorInfo?.componentStack || 'No stack trace available'}`;
    
    Alert.alert(
      'Error Report',
      'Would you like to report this error?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Report',
          onPress: () => {
            // You can implement your error reporting logic here
            Alert.alert('Thank you!', 'The error has been reported.');
          },
        },
      ],
      { cancelable: true }
    );
  };

  render() {
    const { fallback } = this.props;
    const { hasError, error } = this.state;

    if (hasError && error) {
      if (fallback) {
        if (typeof fallback === 'function') {
          const FallbackComponent = fallback as React.ComponentType<ErrorFallbackProps>;
          return <FallbackComponent error={error} resetError={this.handleReset} />;
        }
        return fallback as ReactNode;
      }

      return (
        <View style={styles.container} testID="error-boundary">
          <Text style={styles.title}>😢 Oops! Something went wrong</Text>
          <Text style={styles.message}>
            {error.message || 'An unexpected error occurred'}
          </Text>
          
          {__DEV__ && (
            <TouchableOpacity 
              style={[styles.button, styles.reportButton]} 
              onPress={this.showErrorReport}
            >
              <Text style={styles.buttonText}>Report Error</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            style={[styles.button, styles.retryButton]} 
            onPress={this.handleReset}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    color: theme.colors.error,
    textAlign: 'center',
  },
  message: {
    textAlign: 'center',
    marginBottom: 24,
    color: theme.colors.text,
    fontSize: 16,
    lineHeight: 24,
  },
  button: {
    padding: 14,
    borderRadius: 8,
    minWidth: 200,
    alignItems: 'center',
    marginVertical: 8,
  },
  retryButton: {
    backgroundColor: theme.colors.primary,
  },
  reportButton: {
    backgroundColor: theme.colors.secondary,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 16,
  },
});
