import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const CurrentCustomer = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(ctx);
    const req = gqlContext.getContext().req;
    return req?.currentCustomer;
  },
);

export const CurrentSession = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const gqlContext = GqlExecutionContext.create(ctx);
    const req = gqlContext.getContext().req;
    return req?.currentSession;
  },
);
