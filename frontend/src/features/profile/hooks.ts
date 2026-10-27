import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/features/auth/auth-store";
import { ApiClientError } from "@/lib/api-client";
import { profileApi } from "./api";
import type { AddressInput, ProfileInput } from "./types";

export const profileKeys = {
  addresses: ["profile", "addresses"] as const,
  me: ["profile", "me"] as const,
};

export function useProfile() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    enabled: Boolean(accessToken),
    queryFn: ({ signal }) =>
      accessToken
        ? profileApi.getMe(accessToken, signal)
        : Promise.reject(new Error("You need to sign in to view your profile.")),
    queryKey: profileKeys.me,
    staleTime: 5 * 60 * 1000,
  });
}

export function useAddresses() {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    enabled: Boolean(accessToken),
    queryFn: ({ signal }) =>
      accessToken
        ? profileApi.listAddresses(accessToken, signal)
        : Promise.reject(new Error("You need to sign in to view your addresses.")),
    queryKey: profileKeys.addresses,
    staleTime: 60 * 1000,
  });
}

export type AddressAction =
  | { input: AddressInput; kind: "create" }
  | { addressId: string; kind: "remove" };

export function getProfileError(reason: unknown) {
  return reason instanceof ApiClientError
    ? reason.message
    : "We couldn't save that change. Please try again.";
}

export function useProfileActions() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const updateUser = useAuthStore((state) => state.updateUser);
  const queryClient = useQueryClient();

  const updateProfile = useMutation({
    mutationFn: (input: ProfileInput) => {
      if (!accessToken) {
        return Promise.reject(new Error("Sign in to update your profile."));
      }
      return profileApi.updateMe(accessToken, input);
    },
    onSuccess: async (user) => {
      queryClient.setQueryData(profileKeys.me, user);
      await updateUser(user);
    },
  });

  const addressAction = useMutation({
    mutationFn: async (action: AddressAction) => {
      if (!accessToken) {
        throw new Error("Sign in to manage your addresses.");
      }
      if (action.kind === "create") {
        await profileApi.createAddress(accessToken, action.input);
        return;
      }
      await profileApi.removeAddress(accessToken, action.addressId);
    },
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: profileKeys.addresses }),
  });

  return { addressAction, updateProfile };
}
