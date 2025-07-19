import {
  BaseEntity,
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";

@Entity()
export class User extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    nullable: true,
  })
  name?: string;

  @Column({
    unique: true,
  })
  email: string;

  @Column({
    nullable: true,
  })
  password?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ default: "local" })
  registerType: string;

  @OneToMany(() => Friendship, (friendship) => friendship.user1)
  sentFriendRequest: Friendship[];

  @OneToMany(() => Friendship, (friendship) => friendship.user2)
  receivedFriend: Friendship[];

  @OneToMany(() => Message, (message) => message.sender)
  messages: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class Friendship extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.sentFriendRequest)
  user1?: User;

  @ManyToOne(() => User, (user) => user.receivedFriend)
  user2?: User;

  @Column({ default: false })
  isConfirmed?: boolean;

  @OneToMany(() => Message, (message) => message.friendship)
  messages?: Message[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

@Entity()
export class Message extends BaseEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Friendship, (friendship) => friendship.messages)
  friendship?: Friendship;

  @ManyToOne(() => User, (user) => user.messages)
  sender?: User;

  @Column({ nullable: true })
  text?: string;

  @Column({ nullable: true })
  image?: string;

  @Column({ nullable: true })
  voice?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
