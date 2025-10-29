import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Res,
  Req,
  HttpStatus,
  ValidationPipe,
  NotFoundException,
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
    @Body(ValidationPipe) dto: GenerateDocumentDto,
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    try {
      // Obtener la URL base del servidor
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      // Primero guardar y obtener el token
      const accessToken = await this.documentsService.saveDocument(dto);
      
      // Luego generar el PDF usando ESE MISMO token
      const pdfBuffer = await this.documentsService.createDocument(dto, baseUrl, accessToken);

      // Configurar headers para descarga del PDF
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="documento-${dto.clientId}-${Date.now()}.pdf"`,
        'Content-Length': pdfBuffer.length,
      });

      res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (error) {
      res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Error al generar el documento',
        error: error.message,
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
    @Res() res: express.Response,
  ) {
    try {
      // Buscar el documento usando el token único 
      const clientData = await this.documentsService.getDocumentByAccessToken(accessToken);

      if (!clientData) {
        throw new NotFoundException('Documento no encontrado');
      }

      // Obtener la URL base
      const baseUrl = `${req.protocol}://${req.get('host')}`;

      // Regenerar el PDF
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

      // Configurar headers para visualizar en el navegador
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'inline', // 'inline' para ver en navegador, 'attachment' para descargar
        'Content-Length': pdfBuffer.length,
      });

      res.status(HttpStatus.OK).send(pdfBuffer);
    } catch (error) {
      if (error instanceof NotFoundException) {
        res.status(HttpStatus.NOT_FOUND).json({
          message: 'Documento no encontrado',
          accessToken: accessToken,
        });
      } else {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: 'Error al visualizar el documento',
          error: error.message,
        });
      }
    }
  }
}
