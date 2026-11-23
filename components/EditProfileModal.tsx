import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Camera, User } from 'lucide-react-native';
import { Sheet } from '@/components/ui/Sheet';
import { useFinance } from '@/context/FinanceContext';
import { initialsOf } from '@/lib/format';
import { INPUT, LABEL } from '@/lib/ui';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

export function EditProfileModal({ visible, onClose }: EditProfileModalProps) {
  const { profile, updateProfile } = useFinance();
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [username, setUsername] = useState(profile.username);
  const [avatarUri, setAvatarUri] = useState(profile.avatarUri);

  useEffect(() => {
    if (!visible) return;
    setName(profile.name);
    setEmail(profile.email);
    setPhone(profile.phone);
    setUsername(profile.username);
    setAvatarUri(profile.avatarUri);
  }, [visible, profile]);

  const choosePhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Allow photo access to update your profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets?.length) {
      setAvatarUri(result.assets[0].uri);
    }
  };

  const handleSave = () => {
    updateProfile({
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      username: username.trim(),
      avatarUri,
    });
    onClose();
  };

  return (
    <Sheet
      visible={visible}
      onClose={onClose}
      title="Edit Profile"
      footer={
        <Pressable
          onPress={handleSave}
          className="h-14 items-center justify-center rounded-2xl bg-neon"
          style={({ pressed }) => (pressed ? { opacity: 0.88 } : null)}
        >
          <Text className="text-[16.5px] font-semibold text-white">Save Changes</Text>
        </Pressable>
      }
    >
      <View className="items-center pb-2 pt-1">
        <View className="relative">
          <View className="h-[92px] w-[92px] items-center justify-center overflow-hidden rounded-full bg-white/[0.06]">
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: 92, height: 92 }} />
            ) : name.trim() || profile.name ? (
              <Text className="text-[30px] font-semibold text-ink">
                {initialsOf(name.trim() || profile.name)}
              </Text>
            ) : (
              <User size={34} color="#9A9AA2" strokeWidth={1.6} />
            )}
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Change photo"
            onPress={choosePhoto}
            className="absolute -bottom-1 -right-1 h-9 w-9 items-center justify-center rounded-full border-[3px] border-[#141416] bg-neon"
          >
            <Camera size={16} color="#FFFFFF" strokeWidth={2} />
          </Pressable>
        </View>
        <Pressable onPress={choosePhoto} hitSlop={8} className="mt-3">
          <Text className="text-[14px] font-semibold text-neon">Change Photo</Text>
        </Pressable>
      </View>

      <Text className={`${LABEL} mt-5`}>Full Name</Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="Josh Hill"
        placeholderTextColor="#5A5A63"
        className={INPUT}
        selectionColor="#7C5CFF"
      />

      <Text className={`${LABEL} mt-5`}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="name@mail.com"
        placeholderTextColor="#5A5A63"
        keyboardType="email-address"
        autoCapitalize="none"
        className={INPUT}
        selectionColor="#7C5CFF"
      />

      <Text className={`${LABEL} mt-5`}>Phone Number</Text>
      <TextInput
        value={phone}
        onChangeText={setPhone}
        placeholder="+62 812 3456 7890"
        placeholderTextColor="#5A5A63"
        keyboardType="phone-pad"
        className={INPUT}
        selectionColor="#7C5CFF"
      />

      <Text className={`${LABEL} mt-5`}>Username</Text>
      <TextInput
        value={username}
        onChangeText={setUsername}
        placeholder="@joshhill"
        placeholderTextColor="#5A5A63"
        autoCapitalize="none"
        className={INPUT}
        selectionColor="#7C5CFF"
      />

    </Sheet>
  );
}
