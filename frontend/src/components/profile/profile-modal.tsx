import { type ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { AUTH, Field } from "@/components/auth/auth-ui";
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
        style={styles.modalBackdrop}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable
              accessibilityLabel="Close"
              accessibilityRole="button"
              hitSlop={10}
              onPress={onClose}
              style={({ pressed }) => [pressed && styles.pressed]}
            >
              <Text style={styles.close}>×</Text>
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
    <View style={styles.actions}>
      <Pressable
        accessibilityRole="button"
        disabled={saving}
        onPress={onCancel}
        style={({ pressed }) => [styles.cancelButton, pressed && styles.pressed]}
      >
        <Text style={styles.cancelText}>Cancel</Text>
      </Pressable>
      <Pressable
        accessibilityRole="button"
        accessibilityState={{ busy: saving, disabled }}
        disabled={disabled}
        onPress={onSave}
        style={({ pressed }) => [
          styles.saveButton,
          disabled && styles.disabled,
          pressed && styles.pressed,
        ]}
      >
        {saving ? (
          <ActivityIndicator color={FUFU.white} size="small" />
        ) : (
          <Text style={styles.saveText}>{saveLabel}</Text>
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
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.helper}>Keep your details current for every order.</Text>
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
        {error ? <Text style={styles.error}>{error}</Text> : null}
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
        contentContainerStyle={styles.form}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.helper}>
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
        <View style={styles.row}>
          <View style={styles.rowField}>
            <Field
              autoCapitalize="words"
              label="District"
              onChangeText={(value) => onChange("district", value)}
              placeholder="Gasabo"
              value={values.district}
            />
          </View>
          <View style={styles.rowField}>
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
          onPress={() => onChange("isDefault", !values.isDefault)}
          style={styles.defaultRow}
        >
          <View style={[styles.checkbox, values.isDefault && styles.checkboxChecked]}>
            {values.isDefault ? <Text style={styles.check}>✓</Text> : null}
          </View>
          <Text style={styles.defaultText}>Use this as my default address</Text>
        </Pressable>
        {error ? <Text style={styles.error}>{error}</Text> : null}
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

const styles = StyleSheet.create({
  modalBackdrop: {
    backgroundColor: "rgba(40, 23, 14, 0.44)",
    flex: 1,
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: FUFU.background,
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: "92%",
    paddingHorizontal: 22,
    paddingTop: 18,
  },
  modalHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 8,
  },
  modalTitle: {
    color: FUFU.ink,
    fontFamily: "Outfit_700Bold",
    fontSize: 22,
  },
  close: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 28,
    lineHeight: 28,
  },
  form: {
    gap: 17,
    paddingBottom: 28,
    paddingTop: 10,
  },
  helper: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  row: {
    flexDirection: "row",
    gap: 14,
  },
  rowField: {
    flex: 1,
  },
  defaultRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    paddingVertical: 3,
  },
  checkbox: {
    alignItems: "center",
    borderColor: FUFU.line,
    borderRadius: 7,
    borderWidth: 1,
    height: 24,
    justifyContent: "center",
    width: 24,
  },
  checkboxChecked: {
    backgroundColor: FUFU.primary,
    borderColor: FUFU.primary,
  },
  check: {
    color: FUFU.white,
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
  },
  defaultText: {
    color: FUFU.inkSoft,
    fontFamily: "Outfit_500Medium",
    fontSize: 14,
  },
  error: {
    color: AUTH.error,
    fontFamily: "Outfit_500Medium",
    fontSize: 13,
    lineHeight: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 2,
  },
  cancelButton: {
    alignItems: "center",
    borderColor: FUFU.line,
    borderRadius: 14,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 12,
  },
  cancelText: {
    color: FUFU.inkSoft,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
  },
  saveButton: {
    alignItems: "center",
    backgroundColor: FUFU.primary,
    borderRadius: 14,
    flex: 1.35,
    justifyContent: "center",
    minHeight: 50,
    paddingHorizontal: 12,
  },
  saveText: {
    color: FUFU.white,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 14,
  },
  disabled: {
    opacity: 0.5,
  },
  pressed: {
    opacity: 0.72,
    transform: [{ scale: 0.98 }],
  },
});
