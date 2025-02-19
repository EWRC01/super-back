// src/configuration/configuration.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Configuration } from './entities/configuration.entity';

@Injectable()
export class ConfigurationService {
  constructor(
    @InjectRepository(Configuration)
    private configurationRepository: Repository<Configuration>,
  ) {}

  /**
   * Crea o actualiza la configuración.
   * Si ya existe una configuración con el nombre dado, actualiza los campos; de lo contrario, la crea.
   */
  async createOrUpdateConfiguration(name: string, phone: string, logo: string): Promise<Configuration> {
    let config = await this.configurationRepository.findOne({ where: { name } });
    if (!config) {
      config = this.configurationRepository.create({ name, phone, logo });
    } else {
      config.phone = phone;
      if (logo) {
        config.logo = logo;
      }
    }
    return this.configurationRepository.save(config);
  }
}
