import { ObjectType, Field, Int, Float } from '@nestjs/graphql';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

import { CustCart } from '../../cart/entity/createCustCart.entity';
import { MenuItem } from 'src/menu/menu-items/menu-items/entity/createMenuItems.entity';

@ObjectType()
@Entity('cust_cart_items')
@Index('UQ_cust_cart_items_unique_item', ['cartId', 'menuItemId', 'itemVariationName', 'itemCustomizationName'], { unique: true })
export class CustCartItems {
  @Field(() => Int)
  @PrimaryGeneratedColumn()
  id: number;

  // ================= FK =================

  @Field(() => Int)
  @Column()
  cartId: number;

  @Field(() => Int, { nullable: true })
  @Column({ nullable: true })
  menuItemId?: number;

  // ================= SNAPSHOT / DENORMALIZED FIELDS =================

  @Field()
  @Column()
  menuItemName: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  itemVariationName?: string;

  @Field({ nullable: true })
  @Column({ nullable: true })
  itemCustomizationName?: string;

  @Field(() => Int)
  @Column({ default: 1 })
  quantity: number;

  @Field(() => Float)
  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Field({ nullable: true })
  @Column({ nullable: true })
  image?: string;

  // ================= RELATIONS =================

  @Field(() => CustCart)
  @ManyToOne(() => CustCart, (cart) => cart.items, {
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'cartId' })
  cart: Promise<CustCart>;

  @Field(() => MenuItem, { nullable: true })
  @ManyToOne(() => MenuItem, (menuItem) => menuItem.cartItems, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'menuItemId' })
  menuItem?: Promise<MenuItem>;

  // ================= TIMESTAMPS =================

  @Field()
  @CreateDateColumn()
  createdAt: Date;

  @Field()
  @UpdateDateColumn()
  updatedAt: Date;
}
