import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsOptional,
} from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Некоректний формат email' })
  @IsNotEmpty({ message: 'Email є обовʼязковим полем' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль має містити мінімум 6 символів' })
  password: string;

  @IsString()
  @IsNotEmpty({ message: 'Імʼя є обовʼязковим полем' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Номер телефону є обовʼязковим полем' })
  phone: string;

  @IsOptional()
  role?: string;
}
