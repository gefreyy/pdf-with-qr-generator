export interface ClientData {
  clientName: string;
  clientEmail: string;
  clientId: string;
  documentType?: string;
  additionalInfo?: string;
  generatedAt: Date;
  accessToken: string;
}