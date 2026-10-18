import { StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type ScreenPlaceholderProps = {
  title: string;
  description: string;
};

/** Shared presentation for the temporary customer tab placeholders only. */
export function ScreenPlaceholder({
  title,
  description,
}: ScreenPlaceholderProps) {
  return (
    <SafeAreaView edges={["top"]} style={styles.safeArea}>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#FFF9F4",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  title: {
    color: "#1F2937",
    fontSize: 32,
    fontWeight: "700",
    marginBottom: 12,
  },
  description: {
    color: "#4B5563",
    fontSize: 17,
    lineHeight: 26,
  },
});
