import { Controller, Post } from '@nestjs/common';
import { BackupService } from './backup.service';

@Controller('backup')
export class BackupController {
  constructor(private readonly backupService: BackupService) {}

  @Post('create')
  async createBackup() {
    await this.backupService.createBackup();
    return { message: '🔄 Respaldo iniciado. Revisa los logs para más detalles.' };
  }
}
    