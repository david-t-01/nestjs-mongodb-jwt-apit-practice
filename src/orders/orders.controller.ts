import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';

@ApiBearerAuth()
@ApiTags('orders')
@Controller('orders')
export class OrdersController {
  // eslint-disable-next-line prettier/prettier
  constructor(private readonly ordersService: OrdersService) { }

  @Post()
  @ApiOperation({ summary: 'Create an order' })
  @ApiResponse({ description: 'Order created', status: 201, type: Order })
  @ApiResponse({ description: 'Bad request', status: 400 })
  async create(@Body() dto: CreateOrderDto): Promise<Order> {
    return this.ordersService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update an order' })
  @ApiResponse({ description: 'Order updated', status: 200, type: Order })
  @ApiResponse({ description: 'Order not found', status: 404 })
  async update(@Param('id') id: string, @Body() dto: UpdateOrderDto): Promise<Order> {
    return this.ordersService.update(id, dto);
  }

  @Get('stats/balance-last-month')
  @ApiOperation({ summary: 'Get total sold price within the last month' })
  @ApiResponse({ description: 'Total sold price', status: 200 })
  async balanceLastMonth(): Promise<{ total: number }> {
    return this.ordersService.balanceLastMonth();
  }

  @Get('stats/best-last-month')
  @ApiOperation({ summary: 'Get order with the highest total amount in the last month' })
  @ApiResponse({ description: 'Order with highest total', status: 200, type: Order })
  async bestLastMonth(): Promise<Order | null> {
    return this.ordersService.bestLastMonth();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an order by ID' })
  @ApiResponse({ description: 'The found order', status: 200, type: Order })
  @ApiResponse({ description: 'Order not found', status: 404 })
  async findOne(@Param('id') id: string): Promise<Order> {
    return this.ordersService.findOne(id);
  }
}
