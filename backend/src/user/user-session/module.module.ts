import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSessionService } from './user-session.service';
import { UserSession } from './entity/userSession.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserSession])],
  providers: [UserSessionService],
  exports: [UserSessionService],
})
export class UserSessionModule {}
