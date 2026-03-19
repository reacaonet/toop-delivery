export type TypeValidatePayment = {
  Type: string;
  Amount: number;
  Installments: number;
  SoftDescriptor: string;
  CreditCard: {
    CardNumber: string;
    Holder: string;
    ExpirationDate: string;
    SecurityCode: string;
    Brand: string;
    CardOnFile: {
      Usage: string;
      Reason: string;
    };
  };
  FraudAnalysis: {
    Provider: string;
    TotalOrderAmount: number;
  };
};
