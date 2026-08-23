import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { BranchService } from './branch.service';
import { CreateBranchDto } from './DTO/createBranch.dto';
import { JwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

@Controller('branch')
@UseGuards(JwtAuthGuard)
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post('create-branch')
  async createBranch(@Body() dto: CreateBranchDto, @Req() req) {
    return this.branchService.createBranch(dto, req.user);
  }
}
