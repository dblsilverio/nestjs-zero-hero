import { User } from './user.entity';
import * as bcrypt from 'bcrypt';

describe('User entity', () => {

    let user: User;

    beforeEach(() => {
        user = new User();

        user.password = 'testPassword';
        user.salt = 'testSalt';
        bcrypt.hash = jest.fn();
    });

    describe('validatePassword', () => {

        it('valid password', async () => {
            bcrypt.hash.mockReturnValue('testPassword');
            expect(bcrypt.hash).not.toHaveBeenCalled();
            const result = await user.validatePassword('123456');
            expect(bcrypt.hash).toHaveBeenCalledWith('123456', 'testSalt');
            expect(result).toEqual(true);
        });

        it('invalid password', async () => {
            bcrypt.hash.mockReturnValue('notTestPassword');
            expect(bcrypt.hash).not.toHaveBeenCalled();
            const result = await user.validatePassword('notTestPassword');
            expect(bcrypt.hash).toHaveBeenCalledWith('notTestPassword', 'testSalt');
            expect(result).toEqual(false);
        });
    });

});