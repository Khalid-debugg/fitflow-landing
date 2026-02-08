import { Prisma } from '@prisma/client'

/**
 * Custom error class for database-related errors
 */
export class DatabaseError extends Error {
  constructor(message: string, public originalError?: unknown) {
    super(message)
    this.name = 'DatabaseError'
  }
}

/**
 * Checks if an error is a database connection error
 */
export function isDatabaseConnectionError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true
  }

  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    // P1001: Can't reach database server
    // P1002: Database server timeout
    // P1008: Operations timed out
    return ['P1001', 'P1002', 'P1008'].includes(error.code)
  }

  const errorMessage = error instanceof Error ? error.message : String(error)
  return (
    errorMessage.includes('Can\'t reach database') ||
    errorMessage.includes('ECONNREFUSED') ||
    errorMessage.includes('Connection timeout')
  )
}

/**
 * Wraps a database operation with error handling
 * Converts Prisma errors to user-friendly DatabaseError
 */
export async function withDatabaseErrorHandling<T>(
  operation: () => Promise<T>,
  context?: string
): Promise<T> {
  try {
    return await operation()
  } catch (error) {
    console.error(`Database error${context ? ` in ${context}` : ''}:`, error)

    if (isDatabaseConnectionError(error)) {
      throw new DatabaseError(
        'Unable to connect to the database. Please try again in a moment.',
        error
      )
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle specific Prisma errors
      switch (error.code) {
        case 'P2002':
          throw new DatabaseError('A record with this information already exists.', error)
        case 'P2025':
          throw new DatabaseError('The requested record was not found.', error)
        default:
          throw new DatabaseError('A database error occurred. Please try again.', error)
      }
    }

    // Re-throw unknown errors
    throw error
  }
}
