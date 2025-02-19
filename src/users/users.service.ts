import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { Sale } from '../sales/entities/sale.entity';
import { AccountsHoldings } from 'src/accountsholdings/entities/accountsholding.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Sale)
    private readonly saleRepository: Repository<Sale>,
    @InjectRepository(AccountsHoldings)
    private readonly accountsHoldingsRepository: Repository<AccountsHoldings>,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async getUsers() {
    return this.userRepository.find();
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const user = await this.userRepository.findOne({
      where: { username: loginUserDto.username },
      select: ['id', 'username', 'name', 'phone', 'password'], // Incluye la contraseña explícitamente
    });
  
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
  
    const isPasswordValid = await bcrypt.compare(loginUserDto.password, user.password);
  
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }
  
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
    const user = await this.getUserById(id);
    Object.assign(user, updateUserDto);
    return this.userRepository.save(user);
  }

  async deleteUser(id: number) {
    const user = await this.getUserById(id);
    return this.userRepository.remove(user);
  }

  async verifyPassword(userId: number, password: string) {
    const user = await this.getUserById(userId);
    return bcrypt.compare(password, user.password);
  }

  async changePassword(changePasswordDto: ChangePasswordDto) {
    const user = await this.getUserById(changePasswordDto.userId);
    user.password = await bcrypt.hash(changePasswordDto.newPassword, 10);
    return this.userRepository.save(user);
  }

  async getMonthlySalesByUser(userId: number, year: number) {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('MONTH(sale.date)', 'month')
      .addSelect('SUM(sale.total)', 'totalSales')
      .where('YEAR(sale.date) = :year AND sale.userId = :userId', { year, userId })
      .groupBy('month')
      .orderBy('month', 'ASC')
      .getRawMany();
    return result;
  }

  async getTotalIncomeByUser(userId: number) {
    const salesIncome = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.total)', 'totalIncome')
      .where('sale.userId = :userId', { userId })
      .getRawOne();

    const accountsIncome = await this.accountsHoldingsRepository
      .createQueryBuilder('account')
      .select('SUM(account.paid)', 'totalIncome')
      .where('account.userId = :userId', { userId })
      .getRawOne();

    const totalIncome = (parseFloat(salesIncome.totalIncome) || 0) + (parseFloat(accountsIncome.totalIncome) || 0);
    return { totalIncome };
  }

  async getTodayIncomeByUser(userId: number) {
    const salesIncome = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.total)', 'totalIncome')
      .where('DATE(sale.date) = CURDATE() AND sale.userId = :userId', { userId })
      .getRawOne();

    const accountsIncome = await this.accountsHoldingsRepository
      .createQueryBuilder('account')
      .select('SUM(account.paid)', 'totalIncome')
      .where('DATE(account.date) = CURDATE() AND account.userId = :userId', { userId })
      .getRawOne();

    const totalIncome = (parseFloat(salesIncome.totalIncome) || 0) + (parseFloat(accountsIncome.totalIncome) || 0);
    return { totalIncome };
  }

  async getWeeklyIncomeByUser(userId: number) {
    const salesIncome = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.total)', 'totalIncome')
      .where('WEEK(sale.date) = WEEK(NOW()) AND sale.userId = :userId', { userId })
      .getRawOne();

    const accountsIncome = await this.accountsHoldingsRepository
      .createQueryBuilder('account')
      .select('SUM(account.paid)', 'totalIncome')
      .where('WEEK(account.date) = WEEK(NOW()) AND account.userId = :userId', { userId })
      .getRawOne();

    const totalIncome = (parseFloat(salesIncome.totalIncome) || 0) + (parseFloat(accountsIncome.totalIncome) || 0);
    return { totalIncome };
  }

  async getMonthlyIncomeByUser(userId: number) {
    const salesIncome = await this.saleRepository
      .createQueryBuilder('sale')
      .select('SUM(sale.total)', 'totalIncome')
      .where('MONTH(sale.date) = MONTH(CURRENT_DATE()) AND YEAR(sale.date) = YEAR(CURRENT_DATE()) AND sale.userId = :userId', { userId })
      .getRawOne();

    const accountsIncome = await this.accountsHoldingsRepository
      .createQueryBuilder('account')
      .select('SUM(account.paid)', 'totalIncome')
      .where('MONTH(account.date) = MONTH(CURRENT_DATE()) AND YEAR(account.date) = YEAR(CURRENT_DATE()) AND account.userId = :userId', { userId })
      .getRawOne();

    const totalIncome = (parseFloat(salesIncome.totalIncome) || 0) + (parseFloat(accountsIncome.totalIncome) || 0);
    return { totalIncome };
  }

  async getSalesByUser() {
    const result = await this.saleRepository
      .createQueryBuilder('sale')
      .select('user.username', 'username')
      .addSelect('SUM(sale.total)', 'totalSales')
      .innerJoin('sale.user', 'user')
      .groupBy('user.id')
      .getRawMany();
    return result;
  }
}