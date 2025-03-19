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
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBody,
  ApiParam,
  ApiQuery,
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

  // Nuevos endpoints para las funciones adicionales

  @Get(':id/monthly-sales')
  @ApiOperation({ summary: 'Obtener ventas mensuales de un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Ventas mensuales del usuario',
    type: Object,
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  @ApiQuery({ name: 'year', type: Number, description: 'Año para filtrar las ventas' })
  async getMonthlySalesByUser(
    @Param('id') userId: number,
    @Query('year') year: number,
  ) {
    return this.usersService.getMonthlySalesByUser(userId, year);
  }

  @Get(':id/total-income')
  @ApiOperation({ summary: 'Obtener el total de ingresos de un usuario' })
  @ApiResponse({
    status: 200,
    description: 'Total de ingresos del usuario',
    type: Object,
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  async getTotalIncomeByUser(@Param('id') userId: number) {
    return this.usersService.getTotalIncomeByUser(userId);
  }

  @Get(':id/today-income')
  @ApiOperation({ summary: 'Obtener los ingresos de un usuario hoy' })
  @ApiResponse({
    status: 200,
    description: 'Ingresos del usuario hoy',
    type: Object,
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  async getTodayIncomeByUser(@Param('id') userId: number) {
    return this.usersService.getTodayIncomeByUser(userId);
  }

  @Post(':id/isActive')
  @ApiOperation({ summary: 'Cambiar el estado isActive del usuario'})
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  async changeState(@Param('id') id: number) {
    return this.usersService.changeState(id);
  }

  @Get(':id/weekly-income')
  @ApiOperation({ summary: 'Obtener los ingresos de un usuario esta semana' })
  @ApiResponse({
    status: 200,
    description: 'Ingresos del usuario esta semana',
    type: Object,
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  async getWeeklyIncomeByUser(@Param('id') userId: number) {
    return this.usersService.getWeeklyIncomeByUser(userId);
  }

  @Get(':id/monthly-income')
  @ApiOperation({ summary: 'Obtener los ingresos de un usuario este mes' })
  @ApiResponse({
    status: 200,
    description: 'Ingresos del usuario este mes',
    type: Object,
  })
  @ApiParam({ name: 'id', type: Number, description: 'ID del usuario' })
  async getMonthlyIncomeByUser(@Param('id') userId: number) {
    return this.usersService.getMonthlyIncomeByUser(userId);
  }

  @Get('report/sales-by-user')
  @ApiOperation({ summary: 'Obtener las ventas por usuario' })
  @ApiResponse({
    status: 200,
    description: 'Ventas agrupadas por usuario',
    type: Object,
  })
  async getSalesByUser() {
    return this.usersService.getSalesByUser();
  }
}