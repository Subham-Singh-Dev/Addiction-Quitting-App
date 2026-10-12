import * as LocalAuthentication from 'expo-local-authentication';
import { useSQLiteContext } from 'expo-sqlite';
import { useEffect, useState } from 'react';
import { Alert, Switch, Text, View } from 'react-native';

import { getLockEnabled, setLockEnabled } from '@/db/settings';

export default function AppLockToggle() {
  const db = useSQLiteContext();
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      const value = await getLockEnabled(db);
      if (isMounted) setEnabled(value);
    }
    void load();
    return () => {
      isMounted = false;
    };
  }, [db]);

  async function onToggle(next: boolean) {
    if (next) {
      const level = await LocalAuthentication.getEnrolledLevelAsync();
      if (level === LocalAuthentication.SecurityLevel.NONE) {
        Alert.alert('Set a screen lock first', 'Add a PIN, pattern or fingerprint in your phone settings, then try again.');
        return;
      }
      // Prove it works before turning it on.
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Confirm to enable app lock',
      });
      if (!result.success) return;
    }
    await setLockEnabled(db, next);
    setEnabled(next);
  }

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 }}>
      <Text>App lock</Text>
      <Switch value={enabled} onValueChange={(v) => void onToggle(v)} />
    </View>
  );
}