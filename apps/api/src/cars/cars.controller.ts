import { Controller, Get, Param } from '@nestjs/common';
import { CarsService } from './cars.service';

@Controller('cars')
export class CarsController {
  constructor(private cars: CarsService) {}

  @Get('makes')
  getMakes() {
    return this.cars.getMakes();
  }

  @Get('makes/:makeId/models')
  getModels(@Param('makeId') makeId: string) {
    return this.cars.getModels(makeId);
  }
}
