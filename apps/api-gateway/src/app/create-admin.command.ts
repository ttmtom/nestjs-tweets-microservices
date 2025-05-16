import { EUserRole } from '@libs/contracts/auth/enums';
import { Logger } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { RegisterDto } from '../auth/dto';
import { AppService } from './app.service';

interface ICreateAdminCommandOptions {
  username?: string;
  password?: string;
}

@Command({
  name: 'create:admin',
})
export class CreateAdminCommand extends CommandRunner {
  private readonly logger = new Logger(CreateAdminCommand.name);

  constructor(private readonly appService: AppService) {
    super();
  }

  async run(
    _passedParam: string[],
    options?: ICreateAdminCommandOptions,
  ): Promise<void> {
    const username = options?.username;
    const password = options?.password;

    if (!username || !password) {
      this.logger.error('Email and password are required');
      return;
    }

    const adminRegisterDto = new RegisterDto(
      username,
      password,
      'admin',
      'admin',
      new Date('2000-01-01'),
    );

    try {
      await this.appService.register(adminRegisterDto, EUserRole.ADMIN);
    } catch (error) {
      this.logger.error('Failed to create admin user:', error.message);
    }
  }

  @Option({
    flags: '-u, --username [string]',
  })
  parseUsername(val: string): string {
    return val;
  }

  @Option({
    flags: '-p, --password [string]',
  })
  parsePassword(val: string): string {
    return val;
  }
}
