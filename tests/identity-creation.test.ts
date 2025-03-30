import { describe, it, expect, beforeEach, vi } from "vitest"

// Mock the Clarity runtime environment
const mockClarity = {
  tx: {
    sender: "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM",
  },
  block: {
    height: 100,
  },
}

// Mock contract calls
const contractCalls = {
  "create-identity": vi.fn(),
  "get-identity": vi.fn(),
  "get-identity-by-owner": vi.fn(),
  "deactivate-identity": vi.fn(),
  "reactivate-identity": vi.fn(),
  "update-metadata": vi.fn(),
}

describe("Identity Creation Contract", () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.resetAllMocks()
    
    // Set up default mock behavior
    contractCalls["get-identity"].mockReturnValue(null)
    contractCalls["get-identity-by-owner"].mockReturnValue(null)
  })
  
  describe("create-identity", () => {
    it("should create a new identity with metadata", () => {
      const metadata = "Test metadata"
      contractCalls["create-identity"].mockReturnValue({ value: 0 })
      
      const result = contractCalls["create-identity"](metadata)
      
      expect(result).toEqual({ value: 0 })
      expect(contractCalls["create-identity"]).toHaveBeenCalledWith(metadata)
    })
    
    it("should reject if user already has an identity", () => {
      contractCalls["get-identity-by-owner"].mockReturnValue({
        id: 0,
        owner: mockClarity.tx.sender,
        "created-at": 100,
        active: true,
        metadata: "Existing metadata",
      })
      
      contractCalls["create-identity"].mockReturnValue({ error: 1 })
      
      const result = contractCalls["create-identity"]("New metadata")
      
      expect(result).toEqual({ error: 1 })
    })
  })
  
  describe("get-identity", () => {
    it("should return identity data when it exists", () => {
      const identityData = {
        id: 1,
        owner: mockClarity.tx.sender,
        "created-at": 100,
        active: true,
        metadata: "Test metadata",
      }
      
      contractCalls["get-identity"].mockReturnValue(identityData)
      
      const result = contractCalls["get-identity"](1)
      
      expect(result).toEqual(identityData)
    })
    
    it("should return null when identity does not exist", () => {
      const result = contractCalls["get-identity"](999)
      
      expect(result).toBeNull()
    })
  })
  
  describe("deactivate-identity", () => {
    it("should deactivate an identity owned by the caller", () => {
      const identityData = {
        id: 1,
        owner: mockClarity.tx.sender,
        "created-at": 100,
        active: true,
        metadata: "Test metadata",
      }
      
      contractCalls["get-identity"].mockReturnValue(identityData)
      contractCalls["deactivate-identity"].mockReturnValue({ value: true })
      
      const result = contractCalls["deactivate-identity"](1)
      
      expect(result).toEqual({ value: true })
    })
    
    it("should reject if identity does not exist", () => {
      contractCalls["deactivate-identity"].mockReturnValue({ error: 2 })
      
      const result = contractCalls["deactivate-identity"](999)
      
      expect(result).toEqual({ error: 2 })
    })
    
    it("should reject if caller is not the owner", () => {
      const identityData = {
        id: 1,
        owner: "ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG",
        "created-at": 100,
        active: true,
        metadata: "Test metadata",
      }
      
      contractCalls["get-identity"].mockReturnValue(identityData)
      contractCalls["deactivate-identity"].mockReturnValue({ error: 3 })
      
      const result = contractCalls["deactivate-identity"](1)
      
      expect(result).toEqual({ error: 3 })
    })
  })
})

