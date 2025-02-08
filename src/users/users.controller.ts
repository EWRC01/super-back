// src/users/users.controller.ts
import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { User } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post('register')
  @ApiOperation({ summary: 'Registrar un nuevo usuario' })
  @ApiResponse({
    status: 201,
    description: 'Usuario registrado exitosamente',
    type: User,
  })
  @ApiBody({ type: CreateUserDto })
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.registerUser(createUserDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los usuarios' })
  @ApiResponse({
    status: 200,
    description: 'Lista de usuarios',
    type: [User],
  })
  async getUsers() {
    return this.usersService.getUsers();
  }

  @Post('login')
  @ApiOperation({ summary: 'Iniciar sesión' })
  @ApiResponse({
    status: 200,
    description: 'Usuario autenticado',
    type: User,
  })
  @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
  @ApiBody({ type: LoginUserDto })
  async loginUser(@Body() loginUserDto: LoginUserDto) {
    const user = await this.usersService.loginUser(loginUserDto);
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return user;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario encontrado', type: User })
  @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  async getUserById(@Param('id') id: number) {
    return this.usersService.getUserById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar usuario por ID' })
  @ApiResponse({
    status: 200,
    description: 'Usuario actualizado',
    type: User,
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiBody({ type: UpdateUserDto })
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.updateUser(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar usuario por ID' })
  @ApiResponse({ status: 200, description: 'Usuario eliminado' })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  async deleteUser(@Param('id') id: number) {
    return this.usersService.deleteUser(id);
  }

  @Post('verify-password')
  @ApiOperation({ summary: 'Verificar contraseña del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Resultado de la verificación',
    type: Boolean,
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number', example: 1 },
        password: { type: 'string', example: 'oldpassword' },
      },
    },
  })
  async verifyPassword(
    @Body('userId') userId: number,
    @Body('password') password: string,
  ) {
    return this.usersService.verifyPassword(userId, password);
  }

  @Post('change-password')
  @ApiOperation({ summary: 'Cambiar contraseña del usuario' })
  @ApiResponse({
    status: 200,
    description: 'Contraseña actualizada',
    type: User,
  })
  @ApiBody({ type: ChangePasswordDto })
  async changePassword(@Body() changePasswordDto: ChangePasswordDto) {
    return this.usersService.changePassword(changePasswordDto);
  }
}