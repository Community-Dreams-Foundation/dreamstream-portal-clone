
interface PayPalButtons {
  render: (target: string) => void;
  createSubscription: (data: any, actions: any) => Promise<any>;
  onApprove: (data: any) => void;
  onError: (err: any) => void;
}

interface PayPalNamespace {
  Buttons: (config: {
    style?: {
      shape?: string;
      color?: string;
      layout?: string;
      label?: string;
    };
    createSubscription: (data: any, actions: any) => Promise<any>;
    onApprove: (data: any) => void;
    onError: (err: any) => void;
  }) => PayPalButtons;
}

declare global {
  interface Window {
    paypal: PayPalNamespace;
  }
}

export {};
