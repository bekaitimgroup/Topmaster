import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BidsService } from './bids.service';
import { CreateBidDto } from './dto/create-bid.dto';

@Controller('bids')
@UseGuards(JwtAuthGuard)
export class BidsController {
  constructor(private bids: BidsService) {}

  @Post()
  submit(@Request() req: any, @Body() dto: CreateBidDto) {
    return this.bids.submit(req.user.id, dto);
  }

  @Get('my')
  myBids(@Request() req: any) {
    return this.bids.getMyBids(req.user.id);
  }

  @Get('task/:taskId')
  taskBids(@Param('taskId') taskId: string, @Request() req: any) {
    return this.bids.getTaskBids(taskId, req.user.id);
  }

  @Patch(':id/accept')
  accept(@Param('id') id: string, @Request() req: any) {
    return this.bids.accept(req.user.id, id);
  }

  @Patch(':id/decline')
  decline(@Param('id') id: string, @Request() req: any) {
    return this.bids.decline(req.user.id, id);
  }

  @Delete(':id')
  withdraw(@Param('id') id: string, @Request() req: any) {
    return this.bids.withdraw(req.user.id, id);
  }
}
