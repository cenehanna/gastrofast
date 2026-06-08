import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty({ message: 'Імʼя є обовʼязковим' })
  name: string;

  @IsEmail({}, { message: 'Потрібен коректний email' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Телефон є обовʼязковим' })
  @Length(10, 20, { message: 'Телефон повинен мати від 10 до 20 символів' })
  phone: string;

  @IsString()
  @IsNotEmpty({ message: 'Пароль є обовʼязковим' })
  @Length(6, 128, { message: 'Пароль має бути не менше 6 символів' })
  password: string;

  @IsOptional()
  @IsString()
  role?: string;
}
