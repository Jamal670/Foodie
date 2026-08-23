import { Resolver, Mutation, Args, Context } from '@nestjs/graphql';

import { CustomerService } from './customer.service';
import { ScanQrInput } from './dto/scan-qr.dto';
import { CustomerScanResponse } from './dto/customer-scan-response.dto';

@Resolver()
export class CustomerResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Mutation(() => CustomerScanResponse)
  async scanQrCode(
    @Args('input') input: ScanQrInput,
    @Context() context: any,
  ): Promise<CustomerScanResponse> {
    const req = context.req;
    const res = context.res;
    const userAgent = req?.headers?.['user-agent'];

    // 1. Read token: HttpOnly cookie first, then optional Bearer authorization fallback
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

    const response = await this.customerService.scanQrCode(
      input,
      userAgent,
      accessToken,
    );

    // 2. Set HttpOnly cookie if customer access token is returned
    if (response?.accessToken && res) {
      res.cookie('customer_access_token', response.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 2 * 60 * 60 * 1000, // 2 hours
      });
    }

    return response;
  }
}
