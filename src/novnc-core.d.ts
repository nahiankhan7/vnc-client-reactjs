declare module "novnc-core" {
  export interface RFBOptions {
    credentials?: {
      username?: string;
      password?: string;
    };
  }

  export default class RFB {
    constructor(target: HTMLElement, url: string, options?: RFBOptions);

    // Methods
    connect(): void;
    disconnect(): void;

    // Properties
    viewOnly: boolean;
    scaleViewport: boolean;
    resizeSession: boolean;

    // Event Listeners
    addEventListener(event: string, callback: (event: any) => void): void;
    removeEventListener(event: string, callback: (event: any) => void): void;
  }
}
