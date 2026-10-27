import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";
import { FUFU } from "@/theme/colors";

export function CatalogSkeleton({ rows = 1 }: { rows?: number }) {
  return (
    <View style={styles.skeletonRow}>
      {Array.from({ length: rows }).map((_, index) => (
        <View key={index} style={styles.skeletonCard}>
          <View style={styles.skeletonImage} />
          <View style={styles.skeletonLineWide} />
          <View style={styles.skeletonLineShort} />
        </View>
      ))}
    </View>
  );
}

export function CatalogLoading({ label = "Loading the good stuff…" }) {
  return (
    <View accessibilityLabel={label} style={styles.loading}>
      <ActivityIndicator color={FUFU.primary} />
      <Text style={styles.loadingText}>{label}</Text>
    </View>
  );
}

export function CatalogError({
  message = "We couldn't load this part of the menu.",
  onRetry,
}: {
  message?: string;
  onRetry: () => void;
}) {
  return (
    <View style={styles.messageCard}>
      <Text style={styles.messageTitle}>A small kitchen delay</Text>
      <Text style={styles.messageBody}>{message}</Text>
      <Pressable
        accessibilityRole="button"
        onPress={onRetry}
        style={({ pressed }) => [styles.retry, pressed && styles.retryPressed]}
      >
        <Text style={styles.retryText}>Try again</Text>
      </Pressable>
    </View>
  );
}

export function CatalogEmpty({
  message = "There are no items here yet.",
}: {
  message?: string;
}) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyMark}>✦</Text>
      <Text style={styles.emptyText}>{message}</Text>
    </View>
  );
}

export function NoticeBanner({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <View accessibilityRole="alert" style={styles.notice}>
      <Text style={styles.noticeText}>{message}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  skeletonRow: {
    flexDirection: "row",
    gap: 12,
  },
  skeletonCard: {
    backgroundColor: FUFU.surface,
    borderRadius: 20,
    flex: 1,
    gap: 10,
    padding: 10,
  },
  skeletonImage: {
    backgroundColor: "#F4E9DF",
    borderRadius: 15,
    height: 110,
  },
  skeletonLineWide: {
    backgroundColor: "#F4E9DF",
    borderRadius: 5,
    height: 12,
    width: "80%",
  },
  skeletonLineShort: {
    backgroundColor: "#F4E9DF",
    borderRadius: 5,
    height: 10,
    width: "48%",
  },
  loading: {
    alignItems: "center",
    gap: 10,
    paddingVertical: 28,
  },
  loadingText: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
  },
  messageCard: {
    backgroundColor: FUFU.primarySoft,
    borderRadius: 18,
    gap: 8,
    padding: 16,
  },
  messageTitle: {
    color: FUFU.ink,
    fontFamily: "Outfit_700Bold",
    fontSize: 16,
  },
  messageBody: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    lineHeight: 20,
  },
  retry: {
    alignSelf: "flex-start",
    backgroundColor: FUFU.primary,
    borderRadius: 11,
    marginTop: 3,
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  retryPressed: {
    opacity: 0.8,
  },
  retryText: {
    color: FUFU.white,
    fontFamily: "Outfit_600SemiBold",
    fontSize: 13,
  },
  empty: {
    alignItems: "center",
    gap: 7,
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  emptyMark: {
    color: FUFU.butter,
    fontSize: 25,
  },
  emptyText: {
    color: FUFU.muted,
    fontFamily: "Outfit_400Regular",
    fontSize: 14,
    textAlign: "center",
  },
  notice: {
    backgroundColor: FUFU.ink,
    borderRadius: 14,
    marginBottom: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  noticeText: {
    color: FUFU.white,
    fontFamily: "Outfit_500Medium",
    fontSize: 13,
    lineHeight: 18,
  },
});
