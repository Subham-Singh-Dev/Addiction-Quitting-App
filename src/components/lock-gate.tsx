import * as LocalAuthentication from 'expo-local-authentication';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { AppState, Pressable, StyleSheet, Text, View } from 'react-native';

import { getLockEnabled, setLockEnabled } from '@/db/settings';
import { shouldRelock } from '@/features/lock/lockPolicy';

export default function LockGate({ children }: { children: ReactNode }) {
  const db = useSQLiteContext();
  const [locked, setLocked] = useState(true); // locked until we know the setting
  const authenticating = useRef(false);
  const backgroundedAt = useRef<number | null>(null);

  const authenticate = useCallback(async () => {
    if (authenticating.current) return;
    authenticating.current = true;
    try {
      // Safety: if the phone's screen lock was removed, never trap the user out.
      const level = await LocalAuthentication.getEnrolledLevelAsync();
      if (level === LocalAuthentication.SecurityLevel.NONE) {
        await setLockEnabled(db, false);
        setLocked(false);
        return;
      }
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Unlock Streak',
      });
      if (result.success) setLocked(false);
    } finally {
      authenticating.current = false;
    }
  }, [db]);

  // Cold start: read the setting, then lock or open.
  useEffect(() => {
    let isMounted = true;
    async function init() {
      const enabled = await getLockEnabled(db);
      if (!isMounted) return;
      if (!enabled) {
        setLocked(false);
        return;
      }
      await authenticate();
    }
    void init();
    return () => {
      isMounted = false;
    };
  }, [db, authenticate]);

  // Relock after the app has been in the background long enough.
  useEffect(() => {
    const sub = AppState.addEventListener('change', (next) => {
      if (next === 'background') {
        if (!authenticating.current) backgroundedAt.current = Date.now();
        return;
      }
      if (next === 'active') {
        const at = backgroundedAt.current;
        backgroundedAt.current = null;
        if (at === null) return;
        void (async () => {
          const enabled = await getLockEnabled(db);
          if (enabled && shouldRelock(at, Date.now())) {
            setLocked(true);
            await authenticate();
          }
        })();
      }
    });
    return () => sub.remove();
  }, [db, authenticate]);

  return (
    <View style={styles.fill}>
      {children}
      {locked && (
        <View style={[StyleSheet.absoluteFill, styles.overlay]}>
          <Text style={styles.title}>Streak is locked</Text>
          <Pressable onPress={() => void authenticate()} style={styles.button}>
            <Text style={styles.buttonText}>Unlock</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  overlay: { backgroundColor: '#111', alignItems: 'center', justifyContent: 'center', gap: 16 },
  title: { color: '#fff', fontSize: 20, fontWeight: '600' },
  button: { backgroundColor: '#fff', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  buttonText: { color: '#111', fontWeight: '600' },
});