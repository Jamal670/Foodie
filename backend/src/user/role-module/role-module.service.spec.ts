import { Test, TestingModule } from '@nestjs/testing';
import { RoleModuleService } from './role-module.service';

describe('RoleModuleService', () => {
  let service: RoleModuleService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RoleModuleService],
    }).compile();

    service = module.get<RoleModuleService>(RoleModuleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
