import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { CustomerService } from 'src/customer/customer.service';

@Injectable()
export class CustomerJwtAuthGuard implements CanActivate {
  constructor(private readonly customerService: CustomerService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const gqlContext = GqlExecutionContext.create(context);
    const req = gqlContext.getContext().req;

    let accessToken = req?.cookies?.customer_access_token;
    const authHeader = req?.headers?.['authorization'];
    if (
      !accessToken &&
      authHeader &&
      typeof authHeader === 'string' &&
      authHeader.startsWith('Bearer ')
    ) {
      accessToken = authHeader.substring(7);
    }

    if (
      typeof accessToken !== 'string' ||
      !accessToken.trim() ||
      accessToken.trim() === 'undefined' ||
      accessToken.trim() === 'null'
    ) {
      throw new UnauthorizedException(
        'Dining session has expired. Please rescan the QR code to continue.',
      );
    }

    try {
      const validatedContext =
        await this.customerService.validateCustomerToken(accessToken);

      // Attach validated customer context to request object
      req.currentCustomer = validatedContext.customer;
      req.currentSession = validatedContext.session;
      req.currentTable = validatedContext.table;

      return true;
    } catch (err) {
      if (err instanceof UnauthorizedException) {
        throw new UnauthorizedException(
          'Your dining session has expired. Please scan the QR code again.',
        );
      }
      throw err;
    }
  }
}
