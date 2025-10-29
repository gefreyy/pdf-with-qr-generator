import { Injectable } from '@nestjs/common';
import PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';
import { ClientData } from './interfaces/client-data.interface';
import { GenerateDocumentDto } from './dto/GenerateDocumentDTO';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentsService {
    /**
   * Genera un código QR como buffer de imagen
   * El QR contiene la URL para ver el documento
   */
  async generateQRCode(accessToken: string, baseUrl: string): Promise<Buffer> {
    // URL que apunta al endpoint para ver el documento
    const documentUrl = `${baseUrl}/documents/view/${accessToken}`;

    // Generar QR como buffer PNG
    const qrBuffer = await QRCode.toBuffer(documentUrl, {
      errorCorrectionLevel: 'H',
      type: 'png',
      margin: 1,
      width: 200,
      scale: 8,
    });

    return qrBuffer;
  }

  /**
   * Genera el documento PDF con la información del cliente y el QR
   */
  async generatePDF(clientData: ClientData, baseUrl: string): Promise<Buffer> {
    return new Promise(async (resolve, reject) => {
      try {
        // Crear documento PDF
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 50, bottom: 50, left: 50, right: 50 },
        });

        // Buffer para almacenar el PDF
        const chunks: Buffer[] = [];

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // Generar QR con la URL
        const qrImage = await this.generateQRCode(clientData.accessToken, baseUrl);

        // ===== DISEÑO DEL DOCUMENTO =====

        // Encabezado
        doc
          .fontSize(24)
          .font('Helvetica-Bold')
          .text('DOCUMENTO OFICIAL', { align: 'center' })
          .moveDown(0.5);

        doc
          .fontSize(12)
          .font('Helvetica')
          .text(`Tipo: ${clientData.documentType || 'General'}`, { align: 'center' })
          .moveDown(2);

        // Información del cliente
        doc
          .fontSize(16)
          .font('Helvetica-Bold')
          .text('Información del Cliente')
          .moveDown(0.5);

        const infoY = doc.y;

        doc.fontSize(11).font('Helvetica');

        doc.text(`ID Cliente: `, { continued: true }).font('Helvetica-Bold').text(clientData.clientId);
        doc.font('Helvetica').text(`Nombre: `, { continued: true }).font('Helvetica-Bold').text(clientData.clientName);
        doc.font('Helvetica').text(`Email: `, { continued: true }).font('Helvetica-Bold').text(clientData.clientEmail);
        doc
          .font('Helvetica')
          .text(`Fecha de Emisión: `, { continued: true })
          .font('Helvetica-Bold')
          .text(clientData.generatedAt.toLocaleString('es-ES'));

        if (clientData.additionalInfo) {
          doc.moveDown(0.5);
          doc
            .font('Helvetica')
            .text(`Información Adicional: `, { continued: true })
            .font('Helvetica-Bold')
            .text(clientData.additionalInfo);
        }

        doc.moveDown(2);

        // Línea separadora
        doc
          .strokeColor('#cccccc')
          .lineWidth(1)
          .moveTo(50, doc.y)
          .lineTo(545, doc.y)
          .stroke();

        doc.moveDown(1);

        // Código QR
        doc.fontSize(14).font('Helvetica-Bold').text('Código de Verificación').moveDown(0.5);

        doc
          .fontSize(10)
          .font('Helvetica')
          .text('Escanea este código QR para verificar la autenticidad del documento:')
          .moveDown(0.5);

        // Insertar imagen QR
        const qrX = (doc.page.width - 200) / 2; // Centrar
        doc.image(qrImage, qrX, doc.y, {
          width: 200,
          height: 200,
        });

        doc.moveDown(12); // Espacio después del QR

        // Pie de página
        doc
          .fontSize(9)
          .font('Helvetica')
          .fillColor('#666666')
          .text(
            'Este documento ha sido generado automáticamente y contiene un código QR con información encriptada del cliente.',
            50,
            doc.page.height - 100,
            {
              align: 'center',
              width: doc.page.width - 100,
            },
          );

        doc.text('Para soporte contactar a: soporte@empresa.com', {
          align: 'center',
        });

        // Finalizar documento
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Procesa la solicitud y genera el documento
   */
  async createDocument(dto: GenerateDocumentDto, baseUrl: string, accessToken: string): Promise<Buffer> {
    const clientData: ClientData = {
      ...dto,
      generatedAt: new Date(),
      accessToken // El token que se generó en saveDocument
    };

    return this.generatePDF(clientData, baseUrl);
  }

  /**
   * Almacena los datos del documento para acceso posterior
   * En producción esto debería ir a una base de datos
   */
  private documentsCache = new Map<string, ClientData>();

  async saveDocument(dto: GenerateDocumentDto): Promise<string> {
    const accessToken = randomUUID();
    const clientData: ClientData = {
      ...dto,
      generatedAt: new Date(),
      accessToken,
    };
    this.documentsCache.set(accessToken, clientData);

    return accessToken;
  }

  async getDocumentByAccessToken(accessToken: string): Promise<ClientData | undefined> {
    return this.documentsCache.get(accessToken);
  }
}
