import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CacheModule } from './infra/cache/cache.module';

@Module({
  imports: [ConfigModule, DatabaseModule, AuthModule, UsersModule, CacheModule],
})
export class AppModule {}
