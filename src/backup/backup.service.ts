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
    // Usar ruta absoluta y directorio accesible
    this.backupPath = path.join(process.cwd(), 'backups'); 

    // Crear directorio con permisos explícitos (si no existe)
    if (!fs.existsSync(this.backupPath)) {
      fs.mkdirSync(this.backupPath, { 
        recursive: true,
        mode: 0o755 // Permisos: usuario (rwx), grupo (rx), otros (rx)
      });
    }
  }

  async createBackup(): Promise<void> {
    const dbHost = this.configService.get<string>('DB_HOST');
    const dbUser = this.configService.get<string>('DB_USERNAME');
    const dbPassword = this.configService.get<string>('DB_PASSWORD');
    const dbName = this.configService.get<string>('DB_NAME');

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupFile = path.join(this.backupPath, `backup-${timestamp}.sql`);

    // Construir comando con comillas y escaping correcto
    const dumpCommand = [
      'mysqldump',
      `-h${dbHost}`,
      `-u${dbUser}`,
      `-p"${dbPassword.replace(/"/g, '\\"')}"`, // Escapar comillas en la contraseña
      dbName,
      `> "${backupFile}"` // Comillas en la ruta de salida
    ].join(' ');

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