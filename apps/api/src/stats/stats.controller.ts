import { Controller, Get } from '@nestjs/common';
import { StatsService } from './stats.service';

// Public endpoint — no auth guard. Served at GET /api/stats.
@Controller('stats')
export class StatsController {
  constructor(private stats: StatsService) {}

  @Get()
  getStats() {
    return this.stats.getStats();
  }
}
