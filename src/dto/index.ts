// Data Transfer Objects
// Add DTOs here as needed for request/response types

export interface MessageReceivedDto {
  message: {
    connectionId: string
    content: string
  }
}

export interface ConnectionEstablishedDto {
  connectionId: string
  language?: string
}

export interface WelcomeResponseDto {
  message: string
  language: string
  supportedLanguages: Array<{ code: string; name: string }>
}
