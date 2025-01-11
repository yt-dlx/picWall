// src/utils/Footer.tsx
import Colorizer from "@/utils/Colorizer";
import { Text, View } from "react-native";
import { AntDesign } from "@expo/vector-icons";
// ============================================================================================
// ============================================================================================
const Footer: React.FC = () => (
  <View style={{ backgroundColor: Colorizer("#0C0C0C", 1.0) }} className="relative w-full p-2">
    <View style={{ backgroundColor: Colorizer("#0C0C0C", 0.6), borderRadius: 9999, padding: 10 }}>
      <Text style={{ fontFamily: "Lobster_Regular", color: Colorizer("#FFFFFF", 1.0), fontSize: 10, textAlign: "center" }}>
        Crafted with <AntDesign name="heart" size={10} color={Colorizer("#FFFFFF", 1.0)} /> in India. All rights reserved
      </Text>
    </View>
  </View>
);
export default Footer;
