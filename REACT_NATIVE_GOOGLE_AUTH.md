# Google OAuth cho React Native

## Backend đã sẵn sàng!

Backend đã được cấu hình để làm việc với React Native app thông qua WebView.

## Cài đặt trong React Native App

### 1. Cài đặt dependencies

```bash
npm install react-native-webview
# hoặc
yarn add react-native-webview
```

### 2. Tạo Google Login Component

Tạo file `GoogleLogin.js` hoặc `GoogleLogin.tsx`:

```javascript
import React, { useRef } from 'react';
import { Modal, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';

const GoogleLogin = ({ visible, onClose, onLoginSuccess }) => {
  const webViewRef = useRef(null);
  const BACKEND_URL = 'http://YOUR_BACKEND_URL:3000'; // Thay bằng URL backend của bạn

  const handleMessage = (event) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      
      if (data.success && data.user) {
        // Đăng nhập thành công
        onLoginSuccess(data.user);
        onClose();
      }
    } catch (error) {
      console.error('Error parsing message:', error);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>✕ Đóng</Text>
          </TouchableOpacity>
        </View>
        
        <WebView
          ref={webViewRef}
          source={{ uri: `${BACKEND_URL}/auth/google` }}
          onMessage={handleMessage}
          startInLoadingState={true}
          scalesPageToFit={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    height: 60,
    backgroundColor: '#f8f8f8',
    justifyContent: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  closeButton: {
    padding: 10,
  },
  closeButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
});

export default GoogleLogin;
```

### 3. Sử dụng trong App

```javascript
import React, { useState } from 'react';
import { View, Button, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import GoogleLogin from './components/GoogleLogin';

const App = () => {
  const [showGoogleLogin, setShowGoogleLogin] = useState(false);
  const [user, setUser] = useState(null);

  const handleLoginSuccess = async (userData) => {
    console.log('User logged in:', userData);
    
    // Lưu thông tin user vào AsyncStorage
    await AsyncStorage.setItem('user', JSON.stringify(userData));
    
    setUser(userData);
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  return (
    <View style={styles.container}>
      {user ? (
        <View style={styles.userInfo}>
          <Text style={styles.title}>Xin chào, {user.name}!</Text>
          <Text>Email: {user.email}</Text>
          <Text>Role: {user.role}</Text>
          <Button title="Đăng xuất" onPress={handleLogout} />
        </View>
      ) : (
        <View style={styles.loginContainer}>
          <Text style={styles.title}>Đăng nhập</Text>
          <Button
            title="Đăng nhập bằng Google"
            onPress={() => setShowGoogleLogin(true)}
          />
        </View>
      )}

      <GoogleLogin
        visible={showGoogleLogin}
        onClose={() => setShowGoogleLogin(false)}
        onLoginSuccess={handleLoginSuccess}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loginContainer: {
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
});

export default App;
```

### 4. Cài đặt AsyncStorage (nếu chưa có)

```bash
npm install @react-native-async-storage/async-storage
# hoặc
yarn add @react-native-async-storage/async-storage
```

Sau đó chạy:
```bash
cd android && ./gradlew clean
cd .. && npx react-native run-android
```

## Cấu hình Backend URL

### Development (Testing trên máy thật)
- Sử dụng IP của máy tính: `http://192.168.1.XXX:3000`
- Tìm IP của bạn:
  - Windows: `ipconfig` trong cmd
  - Mac/Linux: `ifconfig` trong terminal

### Development (Emulator)
- Android Emulator: `http://10.0.2.2:3000`
- iOS Simulator: `http://localhost:3000`

### Production
- Sử dụng domain thực: `https://yourdomain.com`

## Lưu ý quan trọng

### 1. Cấu hình Google OAuth Callback URL
Trong Google Cloud Console, thêm callback URL:
```
http://YOUR_IP:3000/auth/google/callback
```

### 2. Android Permissions
Thêm vào `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.INTERNET" />
```

### 3. iOS Configuration
Thêm vào `ios/Podfile`:
```ruby
pod 'React-RCTWebView', :path => '../node_modules/react-native-webview'
```

Sau đó chạy:
```bash
cd ios && pod install
```

## Flow hoạt động

1. User nhấn "Đăng nhập bằng Google"
2. App mở WebView với URL `/auth/google`
3. WebView redirect đến trang đăng nhập Google
4. User đăng nhập và cho phép quyền
5. Google redirect về `/auth/google/callback`
6. Backend trả về HTML page với `postMessage` chứa thông tin user
7. React Native WebView nhận message qua `onMessage`
8. App đóng WebView và lưu thông tin user

## Troubleshooting

### Lỗi: "Unable to connect"
- Kiểm tra backend có đang chạy không
- Kiểm tra URL có đúng không
- Thử dùng IP thay vì localhost

### Lỗi: "redirect_uri_mismatch"
- Kiểm tra callback URL trong Google Console
- Đảm bảo GOOGLE_CALLBACK_URL trong .env đúng

### WebView không load
- Kiểm tra permissions trong AndroidManifest.xml
- Thử clear cache: `cd android && ./gradlew clean`

## Alternative: Deep Linking

Nếu muốn sử dụng browser thay vì WebView, có thể dùng Deep Linking:
- Cài đặt `react-native-app-auth` hoặc `@react-native-google-signin/google-signin`
- Cấu hình deep link scheme
- Xử lý redirect về app sau khi đăng nhập

Nhưng cách dùng WebView như trên đơn giản hơn và không cần cấu hình phức tạp!
