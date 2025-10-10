import {
  Model, Table, Column, DataType, ForeignKey, BelongsTo
} from "sequelize-typescript";
import { User } from "./user.js";

export interface BitesAttributes {
  id?: string;
  createdAt?: Date;
  updatedAt?: Date;
  biterId: string;
  bittenId: string;
}

@Table({
  tableName: "bites",
  modelName: "bites",
  timestamps: true
})
export class Bites extends Model<BitesAttributes, BitesAttributes> implements BitesAttributes {
  @Column({
    primaryKey: true,
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4
  })
  declare id: string

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID
  })
  declare biterId: string;

  @ForeignKey(() => User)
  @Column({
    type: DataType.UUID
  })
  declare bittenId: string;

  @BelongsTo(() => User, "biterId")
  declare biter: User;

  @BelongsTo(() => User, "bittenId")
  declare bitten: User;
}