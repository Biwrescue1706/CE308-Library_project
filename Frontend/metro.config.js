const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// ✅ ปิด CSS Interop ที่ทำให้ EAS Build พัง
config.transformer = {
  ...config.transformer,
  unstable_disableCssInterop: true,
};

// ✅ ใช้ร่วมกับ NativeWind ปกติ
module.exports = withNativeWind(config, {
  input: "./app/global.css",
});
