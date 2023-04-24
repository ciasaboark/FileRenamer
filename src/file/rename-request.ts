import { UUID } from 'crypto';
import { FileRule } from './file-rule';

export type FileRenameRequest = {
    /** A random ID */
    id: UUID,

    /** The status of the rename request */
    status: 'pending' | 'active' | 'failed' | 'complete',

    /** The time the request was initiated. */
    requestTime: Date,

    /** The time the file finished copying.  Will be undefined if status is not 'failed' or 'complete' */
    completeTime?: Date,

    /** The path the file was originally in.  Will be null if the file was an email attachment */
    originalPath: string,

    /** The original file name (sans path).  Will be the attachment name if file was from an email */
    originalFilename: string,

    /** The timestamp the original file was last changed.  If null this value will be read from filesystem */
    originalFileLastChange?: Date,

    /** The path the file will be stored in. Will be missing when the request is first created */
    newPath?: string,

    /** The new file name (sans path).  Will be missing when the request is first created */
    newFilename?: string,

    /** Any error messages.  Will be undefined if no errors exist */
    error?: string

    /** The create date for the file */
    fileCreateTime?: Date,

    /** The rule that was used */
    rule?: FileRule
}