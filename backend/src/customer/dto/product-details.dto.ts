import { InputType, ObjectType, Field, Int } from '@nestjs/graphql';
import { IsInt, IsNotEmpty } from 'class-validator';
import { MenuItemImage } from 'src/menu/menu-items/menu-items-images/entity/createMenuItemImage.entity';
import { ItemVariation } from 'src/menu/menu-items/item-variation/entity/createItemVariation.entity';
import { ItemCustomization } from 'src/menu/menu-items/item-customization/entity/createItemCustomization.entity';
import { ItemAddon } from 'src/menu/menu-items/item-addons/entity/createItemAddons.entity';

@InputType()
export class ProductDetailsDto {
    @Field(() => Int)
    @IsInt()
    @IsNotEmpty()
    menuItemId: number;
}

@ObjectType()
export class ProductDetailsResponse {

    @Field(() => [ItemVariation])
    @IsInt()
    @IsNotEmpty()
    variations: ItemVariation[];

    @Field(() => [ItemCustomization])
    customizations: ItemCustomization[];

    @Field(() => [ItemAddon])
    addons: ItemAddon[];
}