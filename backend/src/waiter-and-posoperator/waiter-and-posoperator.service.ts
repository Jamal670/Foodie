import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { RoleModuleService } from 'src/user/role-module/role-module.service';
import { OrderService } from 'src/customer/orders/order/order.service';
import { CustomerService } from 'src/customer/customer.service';
import { OrderItemsService } from 'src/customer/orders/order-items/order-items.service';
import { MenuItemsService } from 'src/menu/menu-items/menu-items/menu-items.service';
import { MenuCategoryService } from 'src/menu/menu-category/menu-category.service';
import { TableService } from 'src/table-module/table/table.service';
import { Table } from 'src/table-module/table/entity/table.entity';
import { Orders } from 'src/customer/orders/order/entity/orders.entity';
import { OrderItems } from 'src/customer/orders/order-items/entity/OrderItems.entity';
import { MenuItem } from 'src/menu/menu-items/menu-items/entity/createMenuItems.entity';
import { OrderStatus } from 'src/customer/orders/order/enums/orders.enum';
import { WaiterJwtPayload } from 'src/auth/guards/waiter-jwt-auth.guard';
import { VerifyPermissionDto } from './dto/verifyPermisison.dto';
import { GetMenuItemDetailByIdDto } from './dto/menuItemDetailsById.dto';
import { CreatePosOrderDto } from './dto/createOrder.dto';
import { WaiterPOSMenuResponse } from './Response/waiter-pos-menu-response.dto';
import { ProductDetailsResponse } from 'src/customer/dto/product-details.dto';

@Injectable()
export class WaiterAndPosoperatorService {
  constructor(
    private readonly roleModuleService: RoleModuleService,
    private readonly orderService: OrderService,
    private readonly customerService: CustomerService,
    private readonly orderItemsService: OrderItemsService,
    private readonly menuItemsService: MenuItemsService,
    private readonly menuCategoryService: MenuCategoryService,
    private readonly tableService: TableService,
  ) { }

  private async checkPermission(
    user: WaiterJwtPayload,
    input: VerifyPermissionDto,
    expectedPermissionKey: string,
    expectedPermissionCode: string,
  ): Promise<void> {
    if (
      !user?.roleId ||
      !user?.restaurantId ||
      !input?.permissionKey ||
      !input?.permissionCode ||
      input.permissionKey !== expectedPermissionKey ||
      input.permissionCode !== expectedPermissionCode
    ) {
      throw new UnauthorizedException(
        'You have not permission to perform this task',
      );
    }

    const hasPermission = await this.roleModuleService.verifyPermission(
      user.roleId,
      user.restaurantId,
      expectedPermissionKey,
      expectedPermissionCode,
    );

    if (!hasPermission) {
      throw new UnauthorizedException(
        'You have not permission to perform this task',
      );
    }
  }

  async GetWaiterPOSMenuItems(
    input: VerifyPermissionDto,
    user: WaiterJwtPayload,
  ): Promise<WaiterPOSMenuResponse> {
    await this.checkPermission(
      user,
      input,
      'waiter.POS.view',
      '92407670843',
    );

    const [categories, menuItems] = await Promise.all([
      this.menuCategoryService.getMenuCategoriesTree(user.restaurantId),
      this.menuItemsService.getMenuItems(user.restaurantId),
    ]);

    return {
      categories,
      menuItems,
    };
  }

  async getMenuItemDetailById(
    permissionInput: VerifyPermissionDto,
    input: GetMenuItemDetailByIdDto,
    user: WaiterJwtPayload,
  ): Promise<ProductDetailsResponse> {
    await this.checkPermission(
      user,
      permissionInput,
      'waiter.POS.view',
      '92407670843',
    );

    return this.menuItemsService.getMenuItemDetailById(
      input.menuItemId,
      user.restaurantId,
    );
  }

  async AvailableTablesNumbers(
    input: VerifyPermissionDto,
    user: WaiterJwtPayload,
  ): Promise<Table[]> {
    await this.checkPermission(
      user,
      input,
      'waiter.POS.create.order',
      '924076702730673',
    );

    return this.tableService.getAvailableTables(
      user.restaurantId,
      user.branchId,
    );
  }

  async createOrderByPosOperator(
    permissionInput: VerifyPermissionDto,
    input: CreatePosOrderDto,
    user: WaiterJwtPayload,
  ): Promise<boolean> {
    await this.checkPermission(
      user,
      permissionInput,
      'waiter.POS.create.order',
      '924076702730673',
    );

    await this.orderService.createOrderByPosOperator(input, user);
    return true;
  }

  async waiterViewOrders(
    input: VerifyPermissionDto,
    user: WaiterJwtPayload,
  ): Promise<Orders[]> {
    await this.checkPermission(
      user,
      input,
      'waiter.Orders.view',
      '92406370843',
    );

    // 2. Retrieve active DINE_IN orders for the branch (excluding COMPLETED/CANCELLED)
    const orders = await this.orderService.findActiveDineInOrdersByBranch(
      user.branchId,
    );

    // 3. Ensure customer info is available on orders
    for (const order of orders) {
      if (!order.customer && order.customerId) {
        const cust = await this.customerService.findCustomerById(order.customerId);
        if (cust) {
          order.customer = Promise.resolve(cust);
        }
      }
    }

    return orders;
  }

  async showMenuItemsDetails(
    input: VerifyPermissionDto,
    user: WaiterJwtPayload,
  ): Promise<OrderItems[]> {
    await this.checkPermission(
      user,
      input,
      'waiter.Orders.view.details',
      '924063708430338',
    );

    if (!input.orderId) {
      return [];
    }

    return this.orderItemsService.findOrderItemsByOrderId(
      input.orderId,
      user.branchId,
    );
  }

  async updateOrderStatus(
    input: VerifyPermissionDto,
    user: WaiterJwtPayload,
  ): Promise<boolean> {
    await this.checkPermission(
      user,
      input,
      'waiter.Orders.edit',
      '92406370334',
    );

    if (!input.orderId) {
      throw new BadRequestException('orderId is required');
    }

    return this.orderService.updateOrderStatus(
      input.orderId,
      user.branchId,
      OrderStatus.PREPARING,
    );
  }
}
