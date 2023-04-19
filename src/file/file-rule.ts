/**
 * Describes the rules for renaming a file that matches a given pattern
 */
export interface FileRule {
    /** A description of the rule */
    description: string,

    /** How should this rule be mapped to a filename.
     * Contains: match any filename that includes the matchStr.
     * Equals: match any filename that exactly matches the matchStr.
     * Regex: match based on javascript regex test()
    */
    matchType: 'contains' | 'equals' | 'regex',
    
    /** The string to match the filename against */
    matchStr: string,

    /** Whether to include the file path when matching */
    includePath: boolean,
    
    /** The destination path that matching files should be put in */
    destinationPath: string,
    
    /** Whether matching files should be moved to the destination path, or copied.  Has no effect if the file was an email attachment */
    renameType: 'copy' | 'move'
    
    /** The pattern to use when renaming the file
     * Potential tokens:
     * - {filename}: the original file name (without path or extension)
     * - {ext}: the original file extension
     * - {create_date}: the create date (or receipt time if file was an email attachment).  Rendered as YYYYMMDD
     * - {create_time}: the create time of the file (or receipt time if file was an email attachment). Rendered as HHMMSS (24 hour time)
     */
    renamePattern: string
}