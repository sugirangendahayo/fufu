import type { AuthUser } from "@/features/auth/api";
import { apiRequest } from "@/lib/api-client";
import type { Address, AddressInput, ProfileInput } from "./types";

export const profileApi = {
  getMe: async (token: string, signal?: AbortSignal) => {
    const response = await apiRequest<{ data: AuthUser }>("/auth/me", {
      signal,
      token,
    });
    return response.data;
  },

  updateMe: async (token: string, input: ProfileInput) => {
    const response = await apiRequest<{ data: AuthUser }>("/auth/me", {
      body: input,
      method: "PATCH",
      token,
    });
    return response.data;
  },

  listAddresses: async (token: string, signal?: AbortSignal) => {
    const response = await apiRequest<{ data: Address[] }>("/addresses", {
      signal,
      token,
    });
    return response.data;
  },

  createAddress: async (token: string, input: AddressInput) => {
    const response = await apiRequest<{ data: Address }>("/addresses", {
      body: input,
      method: "POST",
      token,
    });
    return response.data;
  },

  updateAddress: async (
    token: string,
    addressId: string,
    input: Partial<AddressInput>,
  ) => {
    const response = await apiRequest<{ data: Address }>(
      `/addresses/${encodeURIComponent(addressId)}`,
      {
        body: input,
        method: "PATCH",
        token,
      },
    );
    return response.data;
  },

  removeAddress: (token: string, addressId: string) =>
    apiRequest<void>(`/addresses/${encodeURIComponent(addressId)}`, {
      method: "DELETE",
      token,
    }),
};
