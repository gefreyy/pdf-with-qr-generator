import { IsString, IsEmail, IsOptional } from 'class-validator';

export class GenerateDocumentDto {
  @IsString()
  clientName: string;

  @IsEmail()
  clientEmail: string;

  @IsString()
  clientId: string;

  @IsString()
  @IsOptional()
  documentType?: string;

  @IsString()
  @IsOptional()
  additionalInfo?: string;
}