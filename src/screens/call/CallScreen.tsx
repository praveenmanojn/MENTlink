/**
 * CallScreen — PeerLink
 * Jitsi Meet WebView-based Audio & Video Call Screen (100% Expo Go Compatible).
 * Requests camera + mic OS permissions before loading Jitsi to avoid "configuring" hang.
 */
import React, { useEffect, useState, useRef } from 'react';
import {
  View, StyleSheet, SafeAreaView, StatusBar, Text,
  TouchableOpacity, Alert, Platform, PermissionsAndroid, Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { RootStackParamList, RootStackNavigationProp } from '../../types/navigation';
import { useUpdateCallStatus } from '../../hooks/useUpdateCallStatus';
import { buildJitsiRoomUrl, openJitsiCall } from '../../utils/jitsiHelper';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Colors } from '../../theme/colors';
import { FontFamily, FontSize } from '../../theme/typography';
import { Radius } from '../../theme/decorations';

// ── Permission helper ──────────────────────────────────────────
/**
 * Requests CAMERA + RECORD_AUDIO at OS level before the WebView loads.
 * Without this, Android WebView blocks getUserMedia silently → Jitsi hangs on "Configuring".
 */
const requestCallPermissions = async (callType: 'audio' | 'video'): Promise<boolean> => {
  if (Platform.OS !== 'android') return true; // iOS handles this via Info.plist

  try {
    const permsNeeded: string[] = [
      PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
      PermissionsAndroid.PERMISSIONS.MODIFY_AUDIO_SETTINGS,
    ];

    if (callType === 'video') {
      permsNeeded.push(PermissionsAndroid.PERMISSIONS.CAMERA);
    }

    const results = await PermissionsAndroid.requestMultiple(permsNeeded as any);

    const allGranted = Object.values(results).every(
      (result) => result === PermissionsAndroid.RESULTS.GRANTED
    );

    if (!allGranted) {
      Alert.alert(
        'Permission Required',
        `MENTlink needs ${callType === 'video' ? 'camera and ' : ''}microphone access for the call.\n\nPlease allow it in your device Settings → Apps → MENTlink → Permissions.`,
        [{ text: 'OK' }]
      );
    }

    return allGranted;
  } catch (err) {
    console.warn('Permission request error:', err);
    return false;
  }
};

// ── Jitsi iframe HTML ──────────────────────────────────────────
/**
 * Returns a self-contained HTML page that embeds Jitsi via the IFrame API.
 * This is far more reliable than loading meet.jit.si directly in a WebView
 * because it lets us configure every option via JS before the conference starts.
 */
const buildJitsiIframeHtml = (
  sessionId: string,
  options: { startWithVideo: boolean; displayName: string }
): string => {
  const roomName = `MENTlink-${sessionId.replace(/-/g, '')}`;
  const { startWithVideo, displayName } = options;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
  <title>MENTlink Call</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    html, body { width: 100%; height: 100%; background: #1a1a2e; overflow: hidden; }
    #jitsi-container { width: 100%; height: 100vh; }
    #status {
      position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
      color: #fff; font-family: sans-serif; font-size: 16px; text-align: center;
    }
  </style>
</head>
<body>
  <div id="status">⏳ Connecting to call room...</div>
  <div id="jitsi-container"></div>

  <script src="https://meet.jit.si/external_api.js"></script>
  <script>
    (function() {
      var domain = 'meet.jit.si';
      var options = {
        roomName: '${roomName}',
        width: '100%',
        height: '100%',
        parentNode: document.querySelector('#jitsi-container'),
        configOverwrite: {
          startWithAudioMuted: false,
          startWithVideoMuted: ${!startWithVideo},
          prejoinPageEnabled: false,
          disableDeepLinking: true,
          enableWelcomePage: false,
          enableClosePage: false,
          disableInviteFunctions: true,
          p2p: { enabled: true },
          analytics: { disabled: true },
          disableRemoteMute: false,
          toolbarButtons: [
            'microphone', 'camera', 'hangup', 'chat',
            'tileview', 'fullscreen', 'settings'
          ],
        },
        interfaceConfigOverwrite: {
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          MOBILE_APP_PROMO: false,
          SHOW_CHROME_EXTENSION_BANNER: false,
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'hangup', 'chat',
            'tileview', 'fullscreen', 'settings'
          ],
        },
        userInfo: {
          displayName: '${displayName.replace(/'/g, "\\'")}',
        },
        onload: function() {
          document.getElementById('status').style.display = 'none';
        }
      };

      try {
        var api = new JitsiMeetExternalAPI(domain, options);
        document.getElementById('status').style.display = 'none';

        api.addEventListener('videoConferenceJoined', function() {
          document.getElementById('status').style.display = 'none';
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'joined' }));
        });

        api.addEventListener('readyToClose', function() {
          window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'left' }));
        });

        api.addEventListener('participantLeft', function() {
          // optional: handle participant left
        });
      } catch(e) {
        document.getElementById('status').textContent = '❌ Failed to load call: ' + e.message;
      }
    })();
  </script>
</body>
</html>`;
};

// ── Component ──────────────────────────────────────────────────
export const CallScreen = () => {
  const navigation = useNavigation<RootStackNavigationProp<'CallScreen'>>();
  const route = useRoute<RouteProp<RootStackParamList, 'CallScreen'>>();
  const { sessionId, callType, channelId, userId, userName } = route.params;

  const [isLoading, setIsLoading] = useState(true);
  const [permissionGranted, setPermissionGranted] = useState<boolean | null>(null);
  const [webviewKey, setWebviewKey] = useState(0);

  const updateStatusMutation = useUpdateCallStatus();
  const webviewRef = useRef<any>(null);

  // ── Step 1: Request permissions BEFORE loading WebView ──
  useEffect(() => {
    let isMounted = true;
    requestCallPermissions(callType).then((granted) => {
      if (isMounted) setPermissionGranted(granted);
    });
    return () => { isMounted = false; };
  }, [callType]);

  // ── Step 2: Mark session ongoing ──
  useEffect(() => {
    if (sessionId) {
      updateStatusMutation.mutate({
        sessionId,
        status: 'ongoing',
        questionId: channelId,
      });
    }
  }, [sessionId]);

  // ── Handle WebView messages from Jitsi iframe ──
  const handleWebViewMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.event === 'left') {
        handleLeaveCall();
      }
    } catch {}
  };

  // ── Leave call ──
  const handleLeaveCall = async () => {
    try {
      if (sessionId) {
        await updateStatusMutation.mutateAsync({
          sessionId,
          status: 'completed',
          questionId: channelId,
        });
      }
    } catch (err) {
      console.warn('Failed to update call status on leave:', err);
    } finally {
      navigation.goBack();
    }
  };

  // Build iframe HTML
  const jitsiHtml = buildJitsiIframeHtml(sessionId, {
    startWithVideo: callType === 'video',
    displayName: userName || 'MENTlink User',
  });

  // ── Permission Denied Screen ──
  if (permissionGranted === false) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={Colors.inkBlack} />
        <View style={styles.permDeniedContainer}>
          <Text style={styles.permDeniedIcon}>🚀</Text>
          <Text style={styles.permDeniedTitle}>Join Jitsi Meeting</Text>
          <Text style={styles.permDeniedSub}>
            Open room directly in your web browser or Jitsi Meet app for native audio & video!
          </Text>

          <TouchableOpacity
            style={styles.openExternalBtn}
            onPress={() => {
              openJitsiCall(sessionId, {
                startWithVideo: callType === 'video',
                displayName: userName || 'MENTlink User',
              });
            }}
          >
            <Text style={styles.openExternalBtnText}>🌐 Open in Browser / Jitsi App →</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.retryBtn}
            onPress={() => {
              requestCallPermissions(callType).then(setPermissionGranted);
            }}
          >
            <Text style={styles.retryBtnText}>🔄 Retry In-App WebView</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.leaveBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.leaveBtnText}>← Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.inkBlack} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTitleGroup}>
          <Text style={styles.headerTitle}>
            {callType === 'video' ? '📹 Video Call' : '🎙 Audio Call'}
          </Text>
          <Text style={styles.headerSub}>{userName || 'MENTlink Call'}</Text>
        </View>

        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.externalHeaderBtn}
            onPress={() => {
              openJitsiCall(sessionId, {
                startWithVideo: callType === 'video',
                displayName: userName || 'MENTlink User',
              });
            }}
          >
            <Text style={styles.externalHeaderBtnText}>🌐 App / Web</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            style={styles.leaveBtn}
            onPress={handleLeaveCall}
          >
            <Text style={styles.leaveBtnText}>Leave ✖</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* WebView — only renders after permission check completes */}
      <View style={styles.webviewContainer}>
        {permissionGranted !== null && (
          <WebView
            key={webviewKey}
            ref={webviewRef}
            // Use local HTML with Jitsi IFrame API instead of direct URL
            source={{ html: jitsiHtml, baseUrl: 'https://meet.jit.si' }}
            style={styles.webview}
            // Media permissions
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            mediaCapturePermissionGrantType="grant"
            onPermissionRequest={(event) => {
              // Automatically grant all requested resources (camera, mic)
              if (event.grant) {
                event.grant(event.resources);
              }
            }}
            // JavaScript & storage
            javaScriptEnabled={true}
            domStorageEnabled={true}
            // Required for WebRTC to work in WebView on Android
            mixedContentMode="always"
            allowUniversalAccessFromFileURLs={true}
            allowFileAccessFromFileURLs={true}
            allowFileAccess={true}
            // Events
            onLoadStart={() => setIsLoading(true)}
            onLoadEnd={() => setIsLoading(false)}
            onMessage={handleWebViewMessage}
            onError={(e) => {
              console.warn('WebView error:', e.nativeEvent);
              setIsLoading(false);
            }}
            // User agent — Jitsi works better with Chrome UA
            userAgent="Mozilla/5.0 (Linux; Android 12; Pixel 5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
          />
        )}

        {/* Loading overlay */}
        {(isLoading || permissionGranted === null) && (
          <View style={styles.loadingOverlay}>
            <LoadingSpinner
              message={
                permissionGranted === null
                  ? 'Requesting permissions...'
                  : 'Connecting to call room...'
              }
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.inkBlack,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.paperWhite,
    borderBottomWidth: 3,
    borderColor: Colors.borderBlack,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 4,
    zIndex: 20,
  },
  headerTitleGroup: {
    flexDirection: 'column',
    gap: 2,
  },
  headerTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.inkBlack,
  },
  headerSub: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xxs,
    color: Colors.inkMedium,
  },
  leaveBtn: {
    backgroundColor: Colors.stickyRed,
    borderWidth: 2,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.sm,
    paddingHorizontal: 12,
    paddingVertical: 6,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    shadowRadius: 0,
    elevation: 3,
  },
  leaveBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  webviewContainer: {
    flex: 1,
    position: 'relative',
  },
  webview: {
    flex: 1,
    backgroundColor: Colors.inkBlack,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.paperCream,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },

  // Permission denied screen
  permDeniedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
    backgroundColor: Colors.paperCream,
    gap: 16,
  },
  permDeniedIcon: {
    fontSize: 56,
    marginBottom: 8,
  },
  permDeniedTitle: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.lg,
    color: Colors.inkBlack,
    textAlign: 'center',
  },
  permDeniedSub: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.inkMedium,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryBtn: {
    backgroundColor: Colors.stickyGreen,
    borderWidth: 2,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.md,
    paddingHorizontal: 24,
    paddingVertical: 12,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    elevation: 3,
  },
  retryBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.inkBlack,
  },
  openExternalBtn: {
    backgroundColor: Colors.stickyGreen,
    borderWidth: 2.5,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.md,
    paddingHorizontal: 24,
    paddingVertical: 14,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 1,
    elevation: 4,
    width: '100%',
    alignItems: 'center',
  },
  openExternalBtnText: {
    fontFamily: FontFamily.extraBold,
    fontSize: FontSize.md,
    color: Colors.inkBlack,
  },
  externalHeaderBtn: {
    backgroundColor: Colors.stickyYellow,
    borderWidth: 2,
    borderColor: Colors.borderBlack,
    borderRadius: Radius.sm,
    paddingHorizontal: 10,
    paddingVertical: 6,
    shadowColor: Colors.borderBlack,
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 1,
    elevation: 3,
  },
  externalHeaderBtnText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.inkBlack,
  },
});

export default CallScreen;
