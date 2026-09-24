import { ObjectType, Field } from '@nestjs/graphql';
import { MenuCategory } from 'src/menu/menu-category/Entity/createMenuCategory.entity';
import { MenuItem } from 'src/menu/menu-items/menu-items/entity/createMenuItems.entity';

@ObjectType()
export class WaiterPOSMenuResponse {
  @Field(() => [MenuCategory])
  categories: MenuCategory[];

  @Field(() => [MenuItem])
  menuItems: MenuItem[];
}
