/**
 * Jitsi Meet Helper Utility — MENTlink
 * Generates room names and URLs for Jitsi Meet, and opens calls in external browser or Jitsi Meet app.
 */
import { Linking, Alert } from 'react-native';

export interface JitsiRoomOptions {
  startWithVideo: boolean;
  displayName: string;
}

/**
 * Returns the clean Jitsi room name derived from a session UUID.
 */
export const getJitsiRoomName = (sessionId: string): string => {
  return `MENTlink-${sessionId.replace(/-/g, '')}`;
};

/**
 * Builds a Jitsi Meet direct web/app URL.
 */
export const buildJitsiRoomUrl = (
  sessionId: string,
  options: JitsiRoomOptions
): string => {
  const roomName = getJitsiRoomName(sessionId);
  const encodedName = encodeURIComponent(options.displayName || 'MENTlink User');
  const videoMuted = !options.startWithVideo;

  return (
    `https://meet.jit.si/${roomName}` +
    `#config.startWithVideoMuted=${videoMuted}` +
    `&config.prejoinPageEnabled=false` +
    `&config.disableDeepLinking=false` +
    `&config.enableWelcomePage=false` +
    `&config.enableClosePage=false` +
    `&config.p2p.enabled=true` +
    `&userInfo.displayName=${encodedName}`
  );
};

/**
 * Directly opens the Jitsi meeting in external browser or installed Jitsi Meet app.
 */
export const openJitsiCall = async (
  sessionId: string,
  options: JitsiRoomOptions
): Promise<void> => {
  const url = buildJitsiRoomUrl(sessionId, options);
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      await Linking.openURL(`https://meet.jit.si/${getJitsiRoomName(sessionId)}`);
    }
  } catch (err: any) {
    console.warn('Could not launch Jitsi URL:', err);
    Alert.alert('Launch Call', `Opening room in web browser...\nURL: ${url}`, [
      { text: 'Open URL', onPress: () => Linking.openURL(url) },
      { text: 'Cancel' },
    ]);
  }
};
