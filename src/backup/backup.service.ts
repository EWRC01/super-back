import { Injectable, Logger } from '@nestjs/common';
import { exec } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BackupService {
  private readonly logger = new Logger(BackupService.name);
  private readonly backupPath: string;

  constructor(private readonly configService: ConfigService) {
    this.backupPath = path.join(__dirname, '../../backups');

    // Verificar si la carpeta de backups existe, sino, crearla
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { recursive: true });
    }
  }

  async createBackup(): Promise<void> {
    const dbHost = this.configService.get<string>('DB_HOST');
    const dbUser = this.configService.get<string>('DB_USER');
    const dbPassword = this.configService.get<string>('DB_PASSWORD');
    const dbName = this.configService.get<string>('DB_NAME');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupPath, `backup-${timestamp}.sql`);

    const dumpCommand = `mysqldump -h ${dbHost} -u ${dbUser} ${dbPassword ? `-p${dbPassword}` : ''} ${dbName} > ${backupFile}`;

    exec(dumpCommand, (error, stdout, stderr) => {
      if (error) {
        this.logger.error(`❌ Error al crear el respaldo: ${error.message}`);
        return;
      }
      if (stderr) {
        this.logger.warn(`⚠️ mysqldump stderr: ${stderr}`);
      }
      this.logger.log(`✅ Respaldo creado exitosamente: ${backupFile}`);
    });
  }
}
