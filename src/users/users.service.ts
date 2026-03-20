import { Injectable } from '@nestjs/common';

// TODO: Replace with real User entity and database integration
export type User = any;

@Injectable()
export class UsersService {
  private readonly users = [
    {
      password: 'changeme',
      userId: 1,
      username: 'john',
    },
    {
      password: 'guess',
      userId: 2,
      username: 'maria',
    },
  ];

  async findOne(username: string): Promise<User> {
    return this.users.find((user) => user.username === username);
  }
}
