import { api, USE_MOCKS } from "./api";
import { UpdateProfileInput, UserProfile } from "@/types/user";
import { MOCK_USER_PROFILE } from "@/mocks/data";

let mockProfileOverrides: Partial<UserProfile> = {};

function mockProfile(): UserProfile {
  return { ...MOCK_USER_PROFILE, ...mockProfileOverrides };
}

export const userService = {
  getProfile: (): Promise<UserProfile> => {
    if (USE_MOCKS) return Promise.resolve(mockProfile());
    return api.get("/users/me");
  },

  updateProfile: (input: UpdateProfileInput): Promise<UserProfile> => {
    if (USE_MOCKS) {
      mockProfileOverrides = { ...mockProfileOverrides, displayName: input.displayName.trim() };
      return Promise.resolve(mockProfile());
    }
    return api.patch("/users/me", input);
  },
};
