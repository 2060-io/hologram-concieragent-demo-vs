import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm'
import { MessageEntity } from './message.entity'
import type { ExtractedUserInfo } from '../types'

@Entity('sessions')
export class SessionEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ type: 'varchar', length: 255, unique: true })
  @Index('idx_sessions_connection_id')
  connectionId!: string

  @Column({ type: 'jsonb', default: {} })
  extractedInfo!: ExtractedUserInfo

  @UpdateDateColumn({ type: 'timestamptz' })
  @Index('idx_sessions_last_updated')
  lastUpdated!: Date

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date

  @Column({ type: 'timestamptz' })
  @Index('idx_sessions_expires_at')
  expiresAt!: Date

  @OneToMany(() => MessageEntity, message => message.session, {
    cascade: true,
    onDelete: 'CASCADE',
  })
  messages!: MessageEntity[]
}
