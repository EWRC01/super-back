import { HttpException, HttpStatus, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Sale } from '../sales/entities/sale.entity';
import * as moment from 'moment-timezone';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
      isAdmin: createUserDto.isAdmin ?? false, // Si no se envia, por defecto es false
      isActive: createUserDto.isActive ?? true, // Si no se envia, por defecto es true
    });
    return this.userRepository.save(user);
  }

  async getUsers() {
    return this.userRepository.find();
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { username: loginUserDto.username },
      select: ['id', 'username', 'name', 'phone', 'password', 'isAdmin', 'isActive'], // Incluye la contraseña explícitamente
    });
  
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    const isActive = user.isActive;

    if (isActive === false) {
      throw new HttpException(`El usuario se encuentra inactivo`, HttpStatus.UNAUTHORIZED);
    }
    else {

      const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
  
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
  
    return user;

    }

  }

  async changeState(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new HttpException(`User with ID ${id} not found`, HttpStatus.NOT_FOUND);
    }

    // Invertir el valor actual del usuario

    user.isActive = !user.isActive;

    // Guardar el cambio en la base de datos

    await this.userRepository.save(user);

    return user;
  }
  

  async getUserById(id: number) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto) {

    const userExists = await this.userRepository.findOne({ where: { id: id } });

    if (!userExists) { throw new HttpException('User not found', HttpStatus.NOT_FOUND); }

    const user = await this.getUserById(id);

    // Encriptamos la password en el update
    
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);

    return this.userRepository.save(user);
  }

  async deleteUser(id: number) {

    const userExists = await this.userRepository.findOne({ where: { id: id } });

    if (!userExists) { throw new HttpException('User not found', HttpStatus.NOT_FOUND); }

    const user = await this.getUserById(id);
    return this.userRepository.remove(user);

  }

  async verifyPassword(userId: number, password: string) {
    const user = await this.getUserById(userId);
    return bcrypt.compare(password, user.password);
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {

    const userExists = await this.userRepository.findOne({ where: { id: changePasswordDto.userId } });

    if (!userExists) { throw new HttpException('User not found', HttpStatus.NOT_FOUND); }

    const user = await this.getUserById(changePasswordDto.userId);
    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    return this.userRepository.save(user);
  }

  async getMonthlySalesByUser(userId: number, year: number): Promise<{ month: number; totalSales: number }[]> {

    const user = await this.userRepository.findOne({where: {id: userId}});

    if (!user) {throw new HttpException('User not found', HttpStatus.NOT_FOUND);}

    const timezone = 'America/El_Salvador'; // Zona horaria
    const results = [];
  
    // Iterar sobre cada mes del año
    for (let month = 0; month < 12; month++) {
      // Obtener el inicio y el fin del mes en la zona horaria especificada
      const monthStart = moment.tz({ year, month, day: 1 }, timezone).startOf('month').toDate();
      const monthEnd = moment.tz({ year, month, day: 1 }, timezone).endOf('month').toDate();
  
      // Consultar las ventas del mes para el usuario específico
      const result = await this.saleRepository
        .createQueryBuilder('sale')
        .select('SUM(sale.totalWithIVA)', 'totalSales')
        .where('sale.date >= :monthStart AND sale.date <= :monthEnd', { monthStart, monthEnd })
        .andWhere('sale.userId = :userId', { userId })
        .getRawOne();
  
      // Guardar el resultado
      results.push({
        month: month + 1, // Los meses en JavaScript van de 0 a 11, por eso sumamos 1
        totalSales: parseFloat(result.totalSales) || 0, // Si no hay ventas, devolvemos 0
      });
    }
  
    return results;
  }

  async getTotalIncomeByUser(userId: number) {

    const user = await this.userRepository.findOne({where: {id: userId}});

    if (!user) {throw new HttpException('User not found', HttpStatus.NOT_FOUND);}

    const salesIncome = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalWithIVA)', 'totalIncome')
      .where('sale.userId = :userId', { userId })
      .getRawOne();

    const totalIncome = (parseFloat(salesIncome.totalIncome) || 0);
    return { totalIncome };
  }

  async getTodayIncomeByUser(userId: number): Promise<{ totalIncome: number }> {
    const timezone = 'America/El_Salvador'; // Zona horaria
  
    // Obtener el usuario
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
  
    // Obtener el inicio y el fin del día en la zona horaria especificada
    const todayStart = moment().tz(timezone).startOf('day').toDate(); // Inicio del día (00:00:00)
    const todayEnd = moment().tz(timezone).endOf('day').toDate(); // Fin del día (23:59:59)
  
    // Consultar las ventas del día para el usuario específico
    const salesIncome = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalWithIVA)', 'totalIncome')
      .where('sale.date >= :todayStart AND sale.date <= :todayEnd', { todayStart, todayEnd })
      .andWhere('sale.userId = :userId', { userId })
      .getRawOne();
  
    // Calcular el ingreso total
    const totalIncome = (parseFloat(salesIncome.totalIncome) || 0);
    return { totalIncome };
  }

  async getWeeklyIncomeByUser(userId: number): Promise<{ totalIncome: number }> {

        // Obtener el usuario
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) { throw new HttpException('User not found', HttpStatus.NOT_FOUND); }

    const timezone = 'America/El_Salvador'; // Zona horaria
  
    // Obtener el inicio y el fin de la semana actual en la zona horaria especificada
    const weekStart = moment().tz(timezone).startOf('week').toDate(); // Inicio de la semana (domingo a las 00:00:00)
    const weekEnd = moment().tz(timezone).endOf('week').toDate(); // Fin de la semana (sábado a las 23:59:59)
  
    // Consultar las ventas de la semana para el usuario específico
    const salesIncome = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalWithIVA)', 'totalIncome')
      .where('sale.date >= :weekStart AND sale.date <= :weekEnd', { weekStart, weekEnd })
      .andWhere('sale.userId = :userId', { userId })
      .getRawOne();
  
    // Calcular el ingreso total
    const totalIncome = (parseFloat(salesIncome.totalIncome) || 0);
    return { totalIncome };
  }

  async getMonthlyIncomeByUser(userId: number): Promise<{ totalIncome: number }> {

    // Obtener el usuario
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) { throw new HttpException('User not found', HttpStatus.NOT_FOUND); }

    const timezone = 'America/El_Salvador'; // Zona horaria
  
    // Obtener el inicio y el fin del mes actual en la zona horaria especificada
    const monthStart = moment().tz(timezone).startOf('month').toDate(); // Inicio del mes (día 1 a las 00:00:00)
    const monthEnd = moment().tz(timezone).endOf('month').toDate(); // Fin del mes (último día a las 23:59:59)
  
    // Consultar las ventas del mes para el usuario específico
    const salesIncome = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.totalWithIVA)', 'totalIncome')
      .where('sale.date >= :monthStart AND sale.date <= :monthEnd', { monthStart, monthEnd })
      .andWhere('sale.userId = :userId', { userId })
      .getRawOne();
  
    // Calcular el ingreso total
    const totalIncome = (parseFloat(salesIncome.totalIncome) || 0);
    return { totalIncome };
  }

  async getSalesByUser() {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('user.username', 'username')
      .addSelect('SUM(sale.totalWithIVA)', 'totalSales')
      .innerJoin('sale.user', 'user')
      .groupBy('user.id')
      .getRawMany();
    return result;
  }
}