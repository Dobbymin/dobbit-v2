import { Controller, Get } from '@nestjs/common';
import { HomeSummaryResponse } from '@dobbit/shared';
import { HomeService } from './home.service';

@Controller('api/home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @Get('summary')
  async getSummary(): Promise<HomeSummaryResponse> {
    return this.homeService.getSummary();
  }
}
