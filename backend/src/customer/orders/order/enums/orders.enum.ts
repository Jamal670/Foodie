import { registerEnumType } from '@nestjs/graphql';

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

registerEnumType(OrderType, {
  name: 'OrderType',
  description: 'Type of order: DINE_IN, TAKEAWAY, or DELIVERY',
});

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'Current status of the order',
});
