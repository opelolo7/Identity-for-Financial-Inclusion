import { vi } from "vitest"

// Mock implementation of clarity-bitcoin for testing
export const mockClarityBitcoin = {
	// Add mock implementations as needed for tests
	parseTransaction: vi.fn(),
	verifyTransaction: vi.fn(),
	getTransactionHeight: vi.fn(),
}

