import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

// La tabla User de la base de datos
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id?: number;

  @Column()
  name: string;

  @Column()
  lastName: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  birthDate: string;

  @Column()
  phone: string;

  @Column()
  gender: string;

  @Column()
  role: string;

  @Column()
  createdAt: string;
}
