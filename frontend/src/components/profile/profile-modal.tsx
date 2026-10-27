import { type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { Field } from "@/components/auth/auth-ui";
import { FUFU } from "@/theme/colors";

export type AddressFormValues = {
  building: string;
  district: string;
  instructions: string;
  isDefault: boolean;
  label: string;
  phone: string;
  province: string;
  recipientName: string;
  sector: string;
  street: string;
};

export function createAddressForm(phone = ""): AddressFormValues {
  return {
    building: "",
    district: "",
    instructions: "",
    isDefault: false,
    label: "Home",
    phone,
    province: "Kigali",
    recipientName: "",
    sector: "",
    street: "",
  };
}

type ModalShellProps = {
  children: ReactNode;
  onClose: () => void;
  title: string;
  visible: boolean;
};

function ModalShell({ children, onClose, title, visible }: ModalShellProps) {
  return (
    <Modal
      animationType="slide"
      onRequestClose={onClose}
      presentationStyle="pageSheet"
      transparent
      visible={visible}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-end bg-[rgba(40,23,14,0.44)]"
      >
        <View className="max-h-[92%] rounded-t-[28px] bg-fufu-bg px-[22px] pt-[18px]">
          <View className="flex-row items-center justify-between pb-2">
            <Text className="font-outfit-bold text-[22px] text-fufu-ink">{title}</Text>
            <Pressable
              accessibilityLabel="Close"
              accessibilityRole="button"
              className="active:opacity-70"
              hitSlop={10}
              onPress={onClose}
            >
              <Text className="font-outfit text-[28px] leading-7 text-fufu-muted">×</Text>
            </Pressable>
          </View>
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type ModalActionsProps = {
  disabled: boolean;
  onCancel: () => void;
  onSave: () => void;
  saving: boolean;
  saveLabel: string;
};

function ModalActions({
  disabled,
  onCancel,
  onSave,
  saving,
  saveLabel,
}: ModalActionsProps) {
  return (
    <View className="mt-0.5 flex-row gap-2">
      <Pressable
        accessibilityRole="button"
        className="min-h-[50px] flex-1 items-center justify-center rounded-[14px] border border-fufu-line px-3 active:opacity-70 active:scale-[0.98]"
        disabled={saving}
        onPress={onCancel}
      >
        <Text className="font-outfit-semibold text-sm text-fufu-ink-soft">Cancel</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: saving, disabled }}
        className={`min-h-[50px] flex-[1.35] items-center justify-center rounded-[14px] bg-fufu-primary px-3 ${disabled ? "opacity-50" : ""} active:opacity-70 active:scale-[0.98]`}
        disabled={disabled}
        onPress={onSave}
      >
        {saving ? (
          <ActivityIndicator color={FUFU.white} size="small" />
        ) : (
          <Text className="font-outfit-semibold text-sm text-fufu-white">{saveLabel}</Text>
        )}
      </Pressable>
    </View>
  );
}

type ProfileEditModalProps = {
  error?: string | null;
  firstName: string;
  lastName: string;
  onChangeFirstName: (value: string) => void;
  onChangeLastName: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  visible: boolean;
};

export function ProfileEditModal({
  error,
  firstName,
  lastName,
  onChangeFirstName,
  onChangeLastName,
  onClose,
  onSave,
  saving,
  visible,
}: ProfileEditModalProps) {
  return (
    <ModalShell onClose={onClose} title="Personal details" visible={visible}>
      <ScrollView
        contentContainerClassName="gap-[17px] pb-7 pt-2.5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-outfit text-sm leading-5 text-fufu-muted">
          Keep your details current for every order.
        </Text>
        <Field
          autoCapitalize="words"
          label="First name"
          onChangeText={onChangeFirstName}
          placeholder="Luc"
          value={firstName}
        />
        <Field
          autoCapitalize="words"
          label="Last name"
          onChangeText={onChangeLastName}
          placeholder="Hirwa"
          value={lastName}
        />
        {error ? <Text className="font-outfit text-[13px] leading-[18px] text-fufu-danger">{error}</Text> : null}
        <ModalActions
          disabled={saving || !firstName.trim()}
          onCancel={onClose}
          onSave={onSave}
          saving={saving}
          saveLabel="Save details"
        />
      </ScrollView>
    </ModalShell>
  );
}

type AddressFormModalProps = {
  error?: string | null;
  onChange: (field: keyof AddressFormValues, value: string | boolean) => void;
  onClose: () => void;
  onSave: () => void;
  saving: boolean;
  values: AddressFormValues;
  visible: boolean;
};

export function AddressFormModal({
  error,
  onChange,
  onClose,
  onSave,
  saving,
  values,
  visible,
}: AddressFormModalProps) {
  return (
    <ModalShell onClose={onClose} title="Add a delivery address" visible={visible}>
      <ScrollView
        contentContainerClassName="gap-[17px] pb-7 pt-2.5"
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text className="font-outfit text-sm leading-5 text-fufu-muted">
          Add a place where our rider can find you in Kigali.
        </Text>
        <Field
          autoCapitalize="words"
          label="Address label"
          onChangeText={(value) => onChange("label", value)}
          placeholder="Home"
          value={values.label}
        />
        <Field
          autoCapitalize="words"
          label="Recipient name"
          onChangeText={(value) => onChange("recipientName", value)}
          placeholder="Luc Hirwa"
          value={values.recipientName}
        />
        <Field
          autoComplete="tel"
          keyboardType="phone-pad"
          label="Phone number"
          onChangeText={(value) => onChange("phone", value)}
          placeholder="0788 123 456"
          value={values.phone}
        />
        <View className="flex-row gap-3.5">
          <View className="flex-1">
            <Field
              autoCapitalize="words"
              label="District"
              onChangeText={(value) => onChange("district", value)}
              placeholder="Gasabo"
              value={values.district}
            />
          </View>
          <View className="flex-1">
            <Field
              autoCapitalize="words"
              label="Sector"
              onChangeText={(value) => onChange("sector", value)}
              placeholder="Remera"
              value={values.sector}
            />
          </View>
        </View>
        <Field
          label="Street or landmark"
          onChangeText={(value) => onChange("street", value)}
          placeholder="Near the stadium"
          value={values.street}
        />
        <Field
          label="Building or apartment (optional)"
          onChangeText={(value) => onChange("building", value)}
          placeholder="Block B, Apt 4"
          value={values.building}
        />
        <Field
          label="Rider instructions (optional)"
          onChangeText={(value) => onChange("instructions", value)}
          placeholder="Call when you arrive"
          value={values.instructions}
        />
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: values.isDefault }}
          className="flex-row items-center gap-2.5 py-0.5 active:opacity-70"
          onPress={() => onChange("isDefault", !values.isDefault)}
        >
          <View className={`h-6 w-6 items-center justify-center rounded-[7px] border ${values.isDefault ? "border-fufu-primary bg-fufu-primary" : "border-fufu-line"}`}>
            {values.isDefault ? <Text className="font-outfit-bold text-base text-fufu-white">✓</Text> : null}
          </View>
          <Text className="font-outfit-medium text-sm text-fufu-ink-soft">Use this as my default address</Text>
        </Pressable>
        {error ? <Text className="font-outfit text-[13px] leading-[18px] text-fufu-danger">{error}</Text> : null}
        <ModalActions
          disabled={
            saving ||
            !values.recipientName.trim() ||
            !values.phone.trim() ||
            !values.district.trim()
          }
          onCancel={onClose}
          onSave={onSave}
          saving={saving}
          saveLabel="Save address"
        />
      </ScrollView>
    </ModalShell>
  );
}
