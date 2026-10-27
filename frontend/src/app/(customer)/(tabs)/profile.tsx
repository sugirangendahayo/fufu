import { router, type Href } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
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
      ...(addressForm.building.trim()
        ? { building: addressForm.building.trim() }
        : {}),
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
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: tabBarInset },
        ]}
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

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.duration(500)} style={styles.profileHero}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initialsText}</Text>
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroEyebrow}>{roleLabel(user?.role)}</Text>
              <Text numberOfLines={1} style={styles.heroName}>
                {fullName || "Fufu member"}
              </Text>
              <Text style={styles.heroPhone}>{user?.phone ?? "Your phone number"}</Text>
              <Text style={styles.heroMeta}>{memberSince(user?.createdAt)}</Text>
            </View>
            <Pressable
              accessibilityLabel="Edit personal details"
              accessibilityRole="button"
              hitSlop={8}
              onPress={openEdit}
              style={({ pressed }) => [styles.editIcon, pressed && styles.pressed]}
            >
              <Text style={styles.editIconText}>✎</Text>
            </Pressable>
          </Animated.View>

          {notice ? <NoticeBanner message={notice} /> : null}

          {loading ? (
            <ProfileSkeleton />
          ) : (
            <>
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Personal details</Text>
                  <Pressable
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={openEdit}
                    style={({ pressed }) => [pressed && styles.pressed]}
                  >
                    <Text style={styles.sectionAction}>Edit</Text>
                  </Pressable>
                </View>
                <View style={styles.detailsCard}>
                  <ProfileRow label="Name" value={fullName || "Not set"} />
                  <ProfileRow label="Phone" value={user?.phone ?? "Not set"} />
                  <ProfileRow
                    label="Account"
                    value={user?.isActive ? "Active" : "Needs attention"}
                    valueTone={user?.isActive ? "success" : "danger"}
                  />
                </View>
              </View>

              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Saved addresses</Text>
                  <Pressable
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={openAddressForm}
                    style={({ pressed }) => [pressed && styles.pressed]}
                  >
                    <Text style={styles.sectionAction}>Add new</Text>
                  </Pressable>
                </View>
                {addressesQuery.isError ? (
                  <CatalogError
                    message="We couldn't load your saved delivery addresses."
                    onRetry={() => void addressesQuery.refetch()}
                  />
                ) : addresses.length > 0 ? (
                  <View style={styles.addresses}>
                    {addresses.map((address) => (
                      <AddressCard
                        address={address}
                        busy={addressAction.isPending}
                        key={address.id}
                        onRemove={() =>
                          confirmRemoveAddress(
                            address.id,
                            address.label || "this address",
                          )
                        }
                      />
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyAddress}>
                    <Text style={styles.emptyMark}>⌂</Text>
                    <View style={styles.emptyCopy}>
                      <Text style={styles.emptyTitle}>No saved addresses yet</Text>
                      <Text style={styles.emptyBody}>
                        Add your delivery spot once and make your next order easier.
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              <View style={styles.accountCard}>
                <Text style={styles.accountTitle}>Account access</Text>
                <Text style={styles.accountBody}>
                  Your phone number is used to sign in and confirm important order
                  updates.
                </Text>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ busy: loggingOut }}
                  disabled={loggingOut}
                  onPress={logout}
                  style={({ pressed }) => [
                    styles.logoutButton,
                    loggingOut && styles.disabled,
                    pressed && styles.pressed,
                  ]}
                >
                  {loggingOut ? (
                    <ActivityIndicator color={FUFU.danger} size="small" />
                  ) : (
                    <Text style={styles.logoutText}>Log out</Text>
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
    <View style={styles.profileRow}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text
        numberOfLines={1}
        style={[
          styles.rowValue,
          valueTone === "success" && styles.success,
          valueTone === "danger" && styles.danger,
        ]}
      >
        {value}
      </Text>
    </View>
  );
}

function ProfileSkeleton() {
  return (
    <View style={styles.skeletonStack}>
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonLineWide} />
        <View style={styles.skeletonLineShort} />
        <View style={styles.skeletonLineWide} />
      </View>
      <View style={styles.skeletonCard}>
        <View style={styles.skeletonLineWide} />
        <View style={styles.skeletonLineShort} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: FUFU.background,
    flex: 1,
  },
  contentContainer: {
    paddingTop: 1,
  },
  content: {
    gap: 25,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  profileHero: {
    alignItems: "center",
    backgroundColor: FUFU.ink,
    borderRadius: 26,
    flexDirection: "row",
    gap: 13,
    minHeight: 142,
    padding: 18,
  },
  avatar: {
    alignItems: "center",
    backgroundColor: FUFU.primary,
    borderColor: "rgba(255, 255, 255, 0.25)",
    borderRadius: 34,
    borderWidth: 1,
    height: 68,
    justifyContent: "center",
    width: 68,
  },
  avatarText: {
    color: FUFU.white,
    fontFamily: "Outfit_800ExtraBold",
    fontSize: 22,
  },
  heroCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  heroEyebrow: {
    color: FUFU.butter,
    fontFamily: "Outfit_700Bold",
    fontSize: 10,
    letterSpacing: 1.2,
    textTransform: "uppercase",
  },
  heroName: {
    color: FUFU.white,
    fontFamily: "Outfit_700Bold",
    fontSize: 22,
  },
  heroPhone: {
    color: "rgba(255, 255, 255, 0.74)",
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
  },
  heroMeta: {
    color: "rgba(255, 255, 255, 0.5)",
    fontFamily: "Outfit_400Regular",
    fontSize: 11,
    marginTop: 3,
  },
  editIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.12)",
    borderRadius: 12,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  editIconText: {
    color: FUFU.white,
    fontSize: 18,
  },
  section: {
    gap: 13,
  },
  sectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  sectionTitle: {
    color: FUFU.ink,
    fontFamily: "Outfit_700Bold",
    fontSize: 20,
  },
  sectionAction: {
    color: FUFU.primaryDeep,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 13,
  },
  detailsCard: {
    backgroundColor: FUFU.surface,
    borderColor: FUFU.line,
    borderRadius: 20,
    borderWidth: 1,
    gap: 0,
    paddingHorizontal: 16,
  },
  profileRow: {
    alignItems: "center",
    borderBottomColor: FUFU.line,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 53,
  },
  rowLabel: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
  },
  rowValue: {
    color: FUFU.ink,
    flexShrink: 1,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
    marginLeft: 18,
    textAlign: "right",
  },
  success: {
    color: FUFU.success,
  },
  danger: {
    color: FUFU.danger,
  },
  addresses: {
    gap: 11,
  },
  emptyAddress: {
    alignItems: "center",
    backgroundColor: FUFU.surface,
    borderColor: FUFU.line,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    gap: 13,
    padding: 16,
  },
  emptyMark: {
    alignItems: "center",
    backgroundColor: FUFU.sageSoft,
    borderRadius: 14,
    color: FUFU.success,
    fontFamily: "Outfit_700Bold",
    fontSize: 22,
    height: 42,
    lineHeight: 42,
    textAlign: "center",
    width: 42,
  },
  emptyCopy: {
    flex: 1,
    gap: 3,
  },
  emptyTitle: {
    color: FUFU.ink,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 15,
  },
  emptyBody: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 12,
    lineHeight: 17,
  },
  accountCard: {
    backgroundColor: FUFU.primarySoft,
    borderRadius: 22,
    gap: 8,
    padding: 17,
  },
  accountTitle: {
    color: FUFU.ink,
    fontFamily: "Outfit_700Bold",
    fontSize: 17,
  },
  accountBody: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 13,
    lineHeight: 19,
  },
  logoutButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: "rgba(180, 35, 24, 0.24)",
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 4,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 15,
  },
  logoutText: {
    color: FUFU.danger,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 13,
  },
  skeletonStack: {
    gap: 13,
  },
  skeletonCard: {
    backgroundColor: FUFU.surface,
    borderRadius: 20,
    gap: 14,
    padding: 18,
  },
  skeletonLineWide: {
    backgroundColor: "#F4E9DF",
    borderRadius: 6,
    height: 14,
    width: "72%",
  },
  skeletonLineShort: {
    backgroundColor: "#F4E9DF",
    borderRadius: 6,
    height: 12,
    width: "42%",
  },
  disabled: {
    opacity: 0.45,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.97 }],
  },
});
