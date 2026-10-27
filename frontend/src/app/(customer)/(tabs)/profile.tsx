import { router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";
import { CatalogError, NoticeBanner } from "@/components/catalog/catalog-state";
import { CustomerHeader } from "@/components/customer/customer-header";
import { useTabBarInset } from "@/components/navigation/floating-tab-bar";
import { AddressCard } from "@/components/profile/address-card";
import {
  AddressFormModal,
  createAddressForm,
  ProfileEditModal,
  type AddressFormValues,
} from "@/components/profile/profile-modal";
import { authApi } from "@/features/auth/api";
import { useAuthStore } from "@/features/auth/auth-store";
import {
  getProfileError,
  useAddresses,
  useProfile,
  useProfileActions,
} from "@/features/profile/hooks";
import type { AddressInput } from "@/features/profile/types";
import { FUFU } from "@/theme/colors";
import { initials } from "@/utils/catalog";

function roleLabel(role?: string) {
  if (!role) return "Fufu member";
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function memberSince(createdAt?: string) {
  if (!createdAt) return "Fufu member";
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return "Fufu member";
  return `Member since ${new Intl.DateTimeFormat("en", {
    month: "short",
    year: "numeric",
  }).format(date)}`;
}

export default function ProfileScreen() {
  const storeUser = useAuthStore((state) => state.user);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearSession = useAuthStore((state) => state.clearSession);
  const profileQuery = useProfile();
  const addressesQuery = useAddresses();
  const { addressAction, updateProfile } = useProfileActions();
  const tabBarInset = useTabBarInset();
  const user = profileQuery.data ?? storeUser;
  const { refetch: refetchProfile } = profileQuery;
  const { refetch: refetchAddresses } = addressesQuery;

  const [editVisible, setEditVisible] = useState(false);
  const [addressVisible, setAddressVisible] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [addressForm, setAddressForm] = useState<AddressFormValues>(() =>
    createAddressForm(storeUser?.phone),
  );
  const [loggingOut, setLoggingOut] = useState(false);

  const openMenu = useCallback(() => {
    router.push("/(customer)/(tabs)/menu" as Href);
  }, []);

  const openEdit = useCallback(() => {
    setEditFirstName(user?.firstName ?? "");
    setEditLastName(user?.lastName ?? "");
    setEditVisible(true);
  }, [user?.firstName, user?.lastName]);

  const openAddressForm = useCallback(() => {
    setAddressForm(createAddressForm(user?.phone));
    setAddressVisible(true);
  }, [user?.phone]);

  const updateAddressForm = useCallback(
    (field: keyof AddressFormValues, value: string | boolean) => {
      setAddressForm((current) => ({ ...current, [field]: value }));
    },
    [],
  );

  const saveProfile = useCallback(async () => {
    try {
      await updateProfile.mutateAsync({
        firstName: editFirstName.trim(),
        lastName: editLastName.trim() || null,
      });
      setEditVisible(false);
    } catch {
      // The mutation error is rendered inside the modal.
    }
  }, [editFirstName, editLastName, updateProfile]);

  const saveAddress = useCallback(async () => {
    const input: AddressInput = {
      district: addressForm.district.trim(),
      phone: addressForm.phone.trim(),
      province: addressForm.province.trim() || "Kigali",
      recipientName: addressForm.recipientName.trim(),
      ...(addressForm.building.trim() ? { building: addressForm.building.trim() } : {}),
      ...(addressForm.instructions.trim()
        ? { instructions: addressForm.instructions.trim() }
        : {}),
      ...(addressForm.isDefault ? { isDefault: true } : {}),
      ...(addressForm.label.trim() ? { label: addressForm.label.trim() } : {}),
      ...(addressForm.sector.trim() ? { sector: addressForm.sector.trim() } : {}),
      ...(addressForm.street.trim() ? { street: addressForm.street.trim() } : {}),
    };

    try {
      await addressAction.mutateAsync({ input, kind: "create" });
      setAddressVisible(false);
    } catch {
      // The mutation error is rendered inside the modal.
    }
  }, [addressAction, addressForm]);

  const confirmRemoveAddress = useCallback(
    (addressId: string, label: string) => {
      if (addressAction.isPending) return;
      Alert.alert(
        `Remove ${label}?`,
        "This address will no longer be available at checkout.",
        [
          { text: "Keep address", style: "cancel" },
          {
            text: "Remove",
            onPress: () =>
              void addressAction
                .mutateAsync({ addressId, kind: "remove" })
                .catch(() => undefined),
            style: "destructive",
          },
        ],
      );
    },
    [addressAction],
  );

  const logout = useCallback(() => {
    if (loggingOut) return;
    Alert.alert("Log out of FUFU?", "You can sign back in anytime.", [
      { text: "Stay signed in", style: "cancel" },
      {
        text: "Log out",
        onPress: () => {
          void (async () => {
            setLoggingOut(true);
            try {
              if (refreshToken) await authApi.logout(refreshToken);
            } catch {
              // The local session must still be cleared if the server is offline.
            } finally {
              await clearSession();
              setLoggingOut(false);
            }
          })();
        },
        style: "destructive",
      },
    ]);
  }, [clearSession, loggingOut, refreshToken]);

  const profileError = profileQuery.isError
    ? "Your profile details couldn't be refreshed."
    : null;
  const addressError = addressesQuery.isError
    ? "Your saved addresses couldn't be loaded."
    : null;
  const mutationError = updateProfile.isError
    ? getProfileError(updateProfile.error)
    : addressAction.isError
      ? getProfileError(addressAction.error)
      : null;
  const notice = profileError ?? addressError ?? mutationError;
  const addresses = addressesQuery.data ?? [];
  const loading = profileQuery.isPending || addressesQuery.isPending;
  const refreshing = profileQuery.isRefetching || addressesQuery.isRefetching;
  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");
  const initialsText = useMemo(
    () => initials(user?.firstName, user?.lastName),
    [user?.firstName, user?.lastName],
  );

  const refresh = useCallback(() => {
    void Promise.all([refetchProfile(), refetchAddresses()]);
  }, [refetchAddresses, refetchProfile]);

  return (
    <SafeAreaView className="flex-1 bg-fufu-bg" edges={["top"]}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={{ paddingBottom: tabBarInset }}
        refreshControl={
          <RefreshControl
            onRefresh={refresh}
            refreshing={refreshing}
            tintColor={FUFU.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        <CustomerHeader onSearch={openMenu} />

        <View className="gap-[25px] px-5 pt-[25px]">
          <Animated.View
            entering={FadeInDown.duration(500)}
            className="min-h-[142px] flex-row items-center gap-[13px] rounded-[26px] bg-fufu-ink p-[18px]"
          >
            <View className="h-[68px] w-[68px] items-center justify-center rounded-[34px] border border-[rgba(255,255,255,0.25)] bg-fufu-primary">
              <Text className="font-outfit-extrabold text-[22px] text-fufu-white">{initialsText}</Text>
            </View>
            <View className="min-w-0 flex-1 gap-[3px]">
              <Text className="font-outfit-bold text-[10px] uppercase tracking-[1.2px] text-fufu-butter">
                {roleLabel(user?.role)}
              </Text>
              <Text numberOfLines={1} className="font-outfit-bold text-[22px] text-fufu-white">
                {fullName || "Fufu member"}
              </Text>
              <Text className="font-outfit text-[13px] text-[rgba(255,255,255,0.74)]">
                {user?.phone ?? "Your phone number"}
              </Text>
              <Text className="mt-0.5 font-outfit text-[11px] text-[rgba(255,255,255,0.5)]">
                {memberSince(user?.createdAt)}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Edit personal details"
              accessibilityRole="button"
              className="h-9 w-9 items-center justify-center rounded-xl bg-[rgba(255,255,255,0.12)] active:opacity-70 active:scale-95"
              hitSlop={8}
              onPress={openEdit}
            >
              <Text className="text-lg text-fufu-white">✎</Text>
            </Pressable>
          </Animated.View>

          {notice ? <NoticeBanner message={notice} /> : null}

          {loading ? (
            <ProfileSkeleton />
          ) : (
            <>
              <View className="gap-[13px]">
                <View className="flex-row items-center justify-between">
                  <Text className="font-outfit-bold text-xl text-fufu-ink">Personal details</Text>
                  <Pressable
                    accessibilityRole="button"
                    className="active:opacity-60"
                    hitSlop={8}
                    onPress={openEdit}
                  >
                    <Text className="font-outfit-semibold text-[13px] text-fufu-primary-deep">Edit</Text>
                  </Pressable>
                </View>
                <View className="rounded-[20px] border border-fufu-line bg-fufu-surface px-4">
                  <ProfileRow label="Name" value={fullName || "Not set"} />
                  <ProfileRow label="Phone" value={user?.phone ?? "Not set"} />
                  <ProfileRow
                    label="Account"
                    value={user?.isActive ? "Active" : "Needs attention"}
                    valueTone={user?.isActive ? "success" : "danger"}
                  />
                </View>
              </View>

              <View className="gap-[13px]">
                <View className="flex-row items-center justify-between">
                  <Text className="font-outfit-bold text-xl text-fufu-ink">Saved addresses</Text>
                  <Pressable
                    accessibilityRole="button"
                    className="active:opacity-60"
                    hitSlop={8}
                    onPress={openAddressForm}
                  >
                    <Text className="font-outfit-semibold text-[13px] text-fufu-primary-deep">Add new</Text>
                  </Pressable>
                </View>
                {addressesQuery.isError ? (
                  <CatalogError
                    message="We couldn't load your saved delivery addresses."
                    onRetry={() => void addressesQuery.refetch()}
                  />
                ) : addresses.length > 0 ? (
                  <View className="gap-[11px]">
                    {addresses.map((address) => (
                      <AddressCard
                        address={address}
                        busy={addressAction.isPending}
                        key={address.id}
                        onRemove={() =>
                          confirmRemoveAddress(address.id, address.label || "this address")
                        }
                      />
                    ))}
                  </View>
                ) : (
                  <View className="flex-row items-center gap-[13px] rounded-[20px] border border-fufu-line bg-fufu-surface p-4">
                    <Text className="h-[42px] w-[42px] rounded-[14px] bg-fufu-sage-soft text-center font-outfit-bold text-[22px] leading-[42px] text-fufu-success">
                      ⌂
                    </Text>
                    <View className="flex-1 gap-[3px]">
                      <Text className="font-outfit-semibold text-[15px] text-fufu-ink">
                        No saved addresses yet
                      </Text>
                      <Text className="font-outfit text-xs leading-[17px] text-fufu-muted">
                        Add your delivery spot once and make your next order easier.
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View className="gap-2 rounded-[22px] bg-fufu-primary-soft p-[17px]">
                <Text className="font-outfit-bold text-[17px] text-fufu-ink">Account access</Text>
                <Text className="font-outfit text-[13px] leading-[19px] text-fufu-muted">
                  Your phone number is used to sign in and confirm important order updates.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ busy: loggingOut }}
                  className={`mt-1 min-h-10 self-start items-center justify-center rounded-xl border border-[rgba(180,35,24,0.24)] px-[15px] ${loggingOut ? "opacity-45" : ""} active:opacity-70 active:scale-[0.97]`}
                  disabled={loggingOut}
                  onPress={logout}
                >
                  {loggingOut ? (
                    <ActivityIndicator color={FUFU.danger} size="small" />
                  ) : (
                    <Text className="font-outfit-semibold text-[13px] text-fufu-danger">Log out</Text>
                  )}
                </Pressable>
              </View>
            </>
          )}
        </View>
      </ScrollView>

      <ProfileEditModal
        error={updateProfile.isError ? getProfileError(updateProfile.error) : null}
        firstName={editFirstName}
        lastName={editLastName}
        onChangeFirstName={setEditFirstName}
        onChangeLastName={setEditLastName}
        onClose={() => setEditVisible(false)}
        onSave={() => void saveProfile()}
        saving={updateProfile.isPending}
        visible={editVisible}
      />
      <AddressFormModal
        error={addressAction.isError ? getProfileError(addressAction.error) : null}
        onChange={updateAddressForm}
        onClose={() => setAddressVisible(false)}
        onSave={() => void saveAddress()}
        saving={addressAction.isPending}
        values={addressForm}
        visible={addressVisible}
      />
    </SafeAreaView>
  );
}

type ProfileRowProps = {
  label: string;
  value: string;
  valueTone?: "danger" | "default" | "success";
};

function ProfileRow({ label, value, valueTone = "default" }: ProfileRowProps) {
  return (
    <View className="min-h-[53px] flex-row items-center justify-between border-b border-fufu-line">
      <Text className="font-outfit text-sm text-fufu-muted">{label}</Text>
      <Text
        numberOfLines={1}
        className={`ml-[18px] flex-shrink font-outfit-semibold text-sm ${valueTone === "success" ? "text-fufu-success" : valueTone === "danger" ? "text-fufu-danger" : "text-fufu-ink"}`}
      >
        {value}
      </Text>
    </View>
  );
}

function ProfileSkeleton() {
  return (
    <View className="gap-[13px]">
      <View className="gap-3.5 rounded-[20px] bg-fufu-surface p-[18px]">
        <View className="h-3.5 w-[72%] rounded-md bg-[#F4E9DF]" />
        <View className="h-3 w-[42%] rounded-md bg-[#F4E9DF]" />
        <View className="h-3.5 w-[72%] rounded-md bg-[#F4E9DF]" />
      </View>
      <View className="gap-3.5 rounded-[20px] bg-fufu-surface p-[18px]">
        <View className="h-3.5 w-[72%] rounded-md bg-[#F4E9DF]" />
        <View className="h-3 w-[42%] rounded-md bg-[#F4E9DF]" />
      </View>
    </View>
  );
}
