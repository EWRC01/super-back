// src/users/users.service.ts
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async registerUser(createUserDto: CreateUserDto) {
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10); // Usa la contraseña real del DTO
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
}