import { Controller, Post, Body, HttpStatus, HttpCode, ValidationPipe, UseGuards, Req } from '@nestjs/common';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { AuthService } from './auth.service';
import { AccessToken } from './access-token.interface';

@Controller('auth')
export class AuthController {

    constructor(private authService: AuthService) { }

    @Post('/signup')
    @HttpCode(HttpStatus.CREATED)
    signUp(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.authService.signUp(authCredentialsDto);
    }

    @Post('/signin')
    @HttpCode(HttpStatus.CREATED)
    signIn(@Body(ValidationPipe) authCredentialsDto: AuthCredentialsDto): Promise<AccessToken> {
        return this.authService.signIn(authCredentialsDto);
    }

}
