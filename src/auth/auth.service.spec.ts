import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { UsersService } from '@/users/users.service';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { findOne: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { signAsync: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return access_token when credentials are valid', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue({
      password: 'changeme',
      userId: 1,
      username: 'david',
    });
    jest.spyOn(jwtService, 'signAsync').mockResolvedValue('mocked-token');

    const result = await service.signIn('david', 'changeme');

    expect(result).toEqual({ access_token: 'mocked-token' });
    expect(jwtService.signAsync).toHaveBeenCalledWith({ sub: 1, username: 'david' });
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue(undefined);

    await expect(service.signIn('unknown', 'pass')).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException when password is wrong', async () => {
    jest.spyOn(usersService, 'findOne').mockResolvedValue({
      password: 'changeme',
      userId: 1,
      username: 'david',
    });

    await expect(service.signIn('david', 'wrong')).rejects.toThrow(UnauthorizedException);
  });
});
