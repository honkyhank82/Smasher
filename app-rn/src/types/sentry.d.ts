declare module "@sentry/react-native" {
  import * as SentryCore from "@sentry/core";

  export * from "@sentry/core";

  export interface ReactNativeOptions extends SentryCore.Options {
    enableAutoSessionTracking?: boolean;
    enableNativeCrashHandling?: boolean;
    enableAutoPerformanceTracking?: boolean;
  }

  export function init(options: ReactNativeOptions): void;
  export function captureException(
    exception: any,
    captureContext?: any,
  ): string;
  export function captureMessage(
    message: string,
    level?: SentryCore.SeverityLevel,
  ): string;
  export function configureScope(
    callback: (scope: SentryCore.Scope) => void,
  ): void;
  export function withScope(callback: (scope: SentryCore.Scope) => void): void;
  export function setUser(user: SentryCore.User | null): void;
  export function setTag(key: string, value: string): void;
  export function setExtra(key: string, value: any): void;
  export function addBreadcrumb(breadcrumb: SentryCore.Breadcrumb): void;

  export const Integrations: {
    ReactNativeTracing: any;
  };

  export const ReactNativeTracing: any;
  export const ReactNativeClient: any;
  export const ReactNativeWrapper: any;
  export const ReactNativeErrorHandlers: any;
  export const ReactNativeInfo: any;

  export type Severity = SentryCore.Severity;
  export type SeverityLevel = SentryCore.SeverityLevel;
  export type Scope = SentryCore.Scope;
  export type Breadcrumb = SentryCore.Breadcrumb;
  export type User = SentryCore.User;
  export type Event = SentryCore.Event;
  export type EventHint = SentryCore.EventHint;
  export type Integration = SentryCore.Integration;
  export type Options = SentryCore.Options;
  export type Transport = SentryCore.Transport;
}
