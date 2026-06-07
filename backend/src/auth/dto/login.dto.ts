import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Потрібен коректний email' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Пароль є обовʼязковим' })
  password: string;
}
