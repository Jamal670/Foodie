import { ObjectType, Field } from '@nestjs/graphql';
import { TableSession } from 'src/table-module/table-section/entity/tableSession.entity';
import { Table } from 'src/table-module/table/entity/table.entity';
import { Restaurant } from 'src/resturants/resturant/entity/resturant.entity';
import { Branch } from 'src/resturants/branch/entity/branch.entity';
import { MenuCategory } from 'src/menu/menu-category/Entity/createMenuCategory.entity';
import { MenuItem } from 'src/menu/menu-items/menu-items/entity/createMenuItems.entity';

@ObjectType()
export class CustomerScanResponse {
  @Field()
  accessToken: string;

  @Field(() => TableSession)
  session: TableSession;

  @Field(() => Table)
  table: Table;

  @Field(() => Restaurant)
  restaurant: Restaurant;

  @Field(() => Branch)
  branch: Branch;

  @Field(() => [MenuCategory])
  categories: MenuCategory[];

  @Field(() => [MenuItem])
  menuItems: MenuItem[];
}
