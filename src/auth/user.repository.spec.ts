import { Test } from '@nestjs/testing';
import { UserRepository } from './user.repository';
import { ConflictException, InternalServerErrorException } from '@nestjs/common';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

const mockCredentialsDTO = { username: 'john', password: 'Doe123!@#' };

describe('UserRepository', () => {
    let userRepository;

    beforeEach(async () => {
        const module = await Test.createTestingModule({
            providers: [
                UserRepository
            ]
        }).compile();

        userRepository = await module.get<UserRepository>(UserRepository);
    });

    describe('signUp', () => {
        let save;

        beforeEach(() => {
            save = jest.fn();
            userRepository.create = jest.fn().mockReturnValue({ save });
        });

        it('signs up user', () => {
            save.mockResolvedValue(undefined);
            expect(userRepository.signUp(mockCredentialsDTO)).resolves.not.toThrow();
        });

        it('throws a conflict exception', () => {
            save.mockRejectedValue({ code: '23505' });
            expect(userRepository.signUp(mockCredentialsDTO)).rejects.toThrow(ConflictException);
        });

        it('throws a internal error exception', () => {
            save.mockRejectedValue({ code: '23506' });
            expect(userRepository.signUp(mockCredentialsDTO)).rejects.toThrow(InternalServerErrorException);
        });

    });

    describe('validateUserPassword', () => {

        let user;

        beforeEach(() => {
            userRepository.findOne = jest.fn();

            user = new User();
            user.username = mockCredentialsDTO.username;
            user.validatePassword = jest.fn();
        })

        it('successful validation', async () => {
            userRepository.findOne.mockResolvedValue(user);
            user.validatePassword.mockResolvedValue(true);

            const result = await userRepository.validateUserPassword(mockCredentialsDTO);
            expect(result).toEqual(mockCredentialsDTO.username);
        });

        it('user not found', async () => {
            userRepository.findOne.mockResolvedValue(null);
            const result = await userRepository.validateUserPassword(mockCredentialsDTO);
            expect(user.validatePassword).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });

        it('password is invalid', async () => {
            userRepository.findOne.mockResolvedValue(false);
            const result = await userRepository.validateUserPassword(mockCredentialsDTO);
            expect(user.validatePassword).not.toHaveBeenCalled();
            expect(result).toBeNull();
        });
    });

    describe('hashPassword', () => {
        it('generate a hash', async () => {
            bcrypt.hash = jest.fn().mockResolvedValue('hash');
            expect(bcrypt.hash).not.toHaveBeenCalled();

            const result = await userRepository.hashPassword('testPassword', 'testSalt');
            expect(bcrypt.hash).toHaveBeenCalled();
            expect(result).toEqual('hash');
        });
    });
});