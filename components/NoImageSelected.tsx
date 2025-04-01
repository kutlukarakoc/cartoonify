import { View } from "react-native";
import { Text } from "~/components/ui/text";
import { Image } from "~/lib/icons/Image";

export const NoImageSelected = () => (
  <View className="flex-col gap-2 items-center px-6">
    <Image size={24} className="text-[#8b7355]" />
    <Text className="text-[#594d3f] text-xl text-center">
      Select an image or take a photo to start conversion process
    </Text>
  </View>
);
