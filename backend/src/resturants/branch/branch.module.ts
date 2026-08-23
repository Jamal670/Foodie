import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Branch } from './entity/branch.entity';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
//modules
import { UserModule } from 'src/user/users/user.module';
import { ResturantModule } from '../resturant/resturant.module';

@Module({
  imports: [TypeOrmModule.forFeature([Branch]), UserModule, ResturantModule],
  providers: [BranchService],
  exports: [BranchService],
  controllers: [BranchController],
})
export class BranchModule {}
