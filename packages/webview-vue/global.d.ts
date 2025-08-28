declare module '*.css' {
  const content: string;
  export default content;
}

  interface Window {
    __APP_CONFIG__: {
      ENV: 'vscode' | 'web'
      RUNNING_IN_VSCODE: boolean
    }
  }
declare var window: Window;

declare var acquireVsCodeApi: () => any;
