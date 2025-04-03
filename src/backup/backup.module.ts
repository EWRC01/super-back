import { Module } from '@nestjs/common';
import { BackupController } from './backup.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BackupService } from './backup.service';
import { BackupCron } from './backup.cron';

@Module({
  imports: [ConfigModule],
  providers: [BackupService, BackupCron, ConfigService],
  controllers: [BackupController],
  exports: [BackupService]
})
export class BackupModule {}
