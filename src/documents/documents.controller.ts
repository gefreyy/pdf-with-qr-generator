import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Req,
  StreamableFile,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import express from 'express';
import { DocumentsService } from './documents.service';
import { GenerateDocumentDto } from './dto/GenerateDocumentDTO';

@Controller('documents')
export class DocumentsController {
  constructor(private readonly documentsService: DocumentsService) {}

  /**
   * Genera el documento PDF inicial y lo guarda para acceso posterior
   */
  @Post('generate')
  async generateDocument(
    @Body() dto: GenerateDocumentDto,
    @Req() req: express.Request,
  ): Promise<StreamableFile> {
    try {
      // Obtener la URL base del servidor
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const accessToken = this.documentsService.saveDocument(dto);
      const pdfBuffer = await this.documentsService.createDocument(
        dto,
        baseUrl,
        accessToken,
      );

      // ✅ Usar StreamableFile en vez de @Res()
      return new StreamableFile(pdfBuffer, {
        type: 'application/pdf',
        disposition: `attachment; filename="documento-${dto.clientId}-${Date.now()}.pdf"`,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      throw new InternalServerErrorException({
        message: 'Error al generar el documento',
        error: errorMessage,
      });
    }
  }

  /**
   * Endpoint público para ver el documento escaneando el QR
   * Este es el endpoint al que apunta el código QR
   */
  @Get('view/:accessToken')
  async viewDocument(
    @Param('accessToken') accessToken: string,
    @Req() req: express.Request,
  ): Promise<StreamableFile> {
    try {
      const clientData =
        this.documentsService.getDocumentByAccessToken(accessToken);

      if (!clientData) {
        throw new NotFoundException('Documento no encontrado');
      }

      // Obtener la URL base
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      const pdfBuffer = await this.documentsService.createDocument(
        {
          clientName: clientData.clientName,
          clientEmail: clientData.clientEmail,
          clientId: clientData.clientId,
          documentType: clientData.documentType,
          additionalInfo: clientData.additionalInfo,
        },
        baseUrl,
        accessToken,
      );

      return new StreamableFile(pdfBuffer, {
        type: 'application/pdf',
        disposition: 'inline', // Para ver en navegador
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      const errorMessage =
        error instanceof Error ? error.message : 'Error desconocido';

      throw new InternalServerErrorException({
        message: 'Error al visualizar el documento',
        error: errorMessage,
      });
    }
  }
}
