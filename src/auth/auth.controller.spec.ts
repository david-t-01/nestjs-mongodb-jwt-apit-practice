import { Test, TestingModule } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: { signIn: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call authService.signIn with username and password', async () => {
    jest.spyOn(authService, 'signIn').mockResolvedValue({ access_token: 'token-123' });

    const result = await controller.signIn({ password: 'changeme', username: 'david' });

    expect(authService.signIn).toHaveBeenCalledWith('david', 'changeme');
    expect(result).toEqual({ access_token: 'token-123' });
  });
});
