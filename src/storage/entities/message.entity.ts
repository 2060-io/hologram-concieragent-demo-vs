import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
  RelationId,
} from 'typeorm'
import { SessionEntity } from './session.entity'
import type { LLMToolCall, MessageRole } from '../../providers/types'

@Entity('messages')
@Index('idx_messages_session_id', ['sessionId'])
export class MessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @ManyToOne(() => SessionEntity, session => session.messages, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'sessionId' })
  session!: SessionEntity

  @RelationId((message: MessageEntity) => message.session)
  sessionId!: string

  @Column({ type: 'varchar', length: 20 })
  role!: MessageRole

  @Column({ type: 'text' })
  content!: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  toolCallId?: string

  @Column({ type: 'jsonb', nullable: true })
  toolCalls?: LLMToolCall[]

  @Column({ type: 'integer' })
  @Index('idx_messages_sequence')
  sequenceNumber!: number

  @CreateDateColumn({ type: 'timestamptz' })
  createdAt!: Date
}
