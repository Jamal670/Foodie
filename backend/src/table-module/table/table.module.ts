import { Module } from '@nestjs/common';
import { TableService } from './table.service';
import { TableResolver } from './table.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Table } from './entity/table.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Table])],
  providers: [TableService, TableResolver],
  exports: [TableService, TypeOrmModule],
})
export class TableModule {}
