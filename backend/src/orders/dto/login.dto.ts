import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Некоректний формат email' })
  @IsNotEmpty({ message: 'Email є обовʼязковим' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Пароль має бути не менше 6 символів' })
  password: string;
}
