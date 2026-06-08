import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Перевіряємо, чи вже існує користувач з таким email
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (existingUser) {
      throw new ConflictException(
        'Користувач з таким email вже зареєстрований',
      );
    }

    // 2. Хешуємо пароль (пароль у чистій формі ніколи не пишемо в БД!)
    const saltRounds = 10;
    const hashed = await bcrypt.hash(dto.password, saltRounds);

    // 3. Створюємо запис у базі даних відповідно до нашої схеми
    const newUser = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash: hashed, // пишемо хеш в оновлене поле
        name: dto.name,
        phone: dto.phone,
        role: dto.role || 'CLIENT', // за замовчуванням звичайний клієнт
        savedAddresses: [],
      },
    });

    // 4. Вирізаємо passwordHash з об'єкта відповіді, щоб випадково не віддати його на фронтенд
    const { passwordHash, ...userWithoutHash } = newUser;

    const payload = {
      sub: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      phone: newUser.phone,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: userWithoutHash.id,
        email: userWithoutHash.email,
        name: userWithoutHash.name,
        phone: userWithoutHash.phone,
        role: userWithoutHash.role,
        savedAddresses: userWithoutHash.savedAddresses || [],
      },
    };
  }

  async login(dto: LoginDto) {
    // 1. Шукаємо користувача в базі
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });

    if (!user) {
      throw new UnauthorizedException('Неправильний email або пароль');
    }

    // 2. Порівнюємо введений пароль із захешованим у базі даних
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Неправильний email або пароль');
    }

    // 3. Формуємо корисне навантаження (payload) для токена
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      phone: user.phone,
    };

    // 4. Генеруємо токен та повертаємо його разом із базовими даними користувача
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        phone: user.phone,
        role: user.role,
        savedAddresses: user.savedAddresses || [],
      },
    };
  }
}
