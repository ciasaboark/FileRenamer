import { UUID, randomUUID } from 'crypto';

export type FileRenameRequest = {
    id: UUID,
    status: 'pending' | 'active' | 'failed' | 'complete',
    originalPath: string,
    newPath: string,
    error: string
}