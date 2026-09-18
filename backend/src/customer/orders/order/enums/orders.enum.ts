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

export enum PaymentMethod {
  CARD = 'CARD',
  CASH = 'CASH',
}

registerEnumType(OrderType, {
  name: 'OrderType',
  description: 'Type of order: DINE_IN, TAKEAWAY, or DELIVERY',
});

registerEnumType(OrderStatus, {
  name: 'OrderStatus',
  description: 'Current status of the order',
});

registerEnumType(PaymentMethod, {
  name: 'PaymentMethod',
  description: 'Payment method for the order: CARD or CASH',
});
