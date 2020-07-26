import { Injectable, UnauthorizedException, Logger } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthCredentialsDto } from './dto/auth-credentials.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './jwt-payload.interface';
import { AccessToken } from './access-token.interface';

@Injectable()
export class AuthService {

    private logger = new Logger("AuthService");

    constructor(
        @InjectRepository(UserRepository) private userRepository: UserRepository,
        private jwtService: JwtService) { }

    async signUp(authCredentialsDto: AuthCredentialsDto): Promise<void> {
        return this.userRepository.signUp(authCredentialsDto);
    }

    async signIn(authCredentialsDto: AuthCredentialsDto): Promise<AccessToken> {
        const username = await this.userRepository.validateUserPassword(authCredentialsDto);

        if (!username) {
            this.logger.warn(`User ${authCredentialsDto.username} with invalid credentials`);
            throw new UnauthorizedException("Invalid credentials");
        }

        const payload: JwtPayload = { username };
        const accessToken = await this.jwtService.sign(payload);

        this.logger.debug(`JWT successfully created for user ${username}`);

        return { accessToken };
    }

}
