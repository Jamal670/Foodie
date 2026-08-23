import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { TableSectionService } from './table-section.service';
import { TableSession } from './entity/tableSession.entity';

@Module({
  imports: [TypeOrmModule.forFeature([TableSession])],
  providers: [TableSectionService],
  exports: [TableSectionService, TypeOrmModule],
})
export class TableSectionModule {}
