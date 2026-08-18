import React, {
  useEffect,
  useState,
} from 'react';

import {
  Platform,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getSyncStatus,
  subscribeSyncStatus,
  type SyncStatusState,
} from './syncService';


export function SyncStatusBanner() {

  const [
    syncState,
    setSyncState,
  ] = useState<SyncStatusState>(
    getSyncStatus(),
  );


  const [
    visible,
    setVisible,
  ] = useState(false);


  useEffect(() => {

    const unsubscribe =
      subscribeSyncStatus(
        state => {

          console.log(
            'SYNC UI STATUS:',
            state,
          );


          setSyncState(state);


          /*
           * =========================================
           * OFFLINE
           * =========================================
           *
           * Always show when the device is offline.
           *
           * This is useful because the user needs
           * to know that changes are waiting.
           */
          if (
            state.status === 'offline'
          ) {

            setVisible(true);

            return;
          }


          /*
           * =========================================
           * SYNCING
           * =========================================
           *
           * Only show syncing when syncService
           * explicitly provides a user-facing message.
           *
           * Normal online background sync uses:
           *
           * status: 'syncing'
           * message: undefined
           *
           * Therefore it remains completely silent.
           *
           * Reconnection sync uses:
           *
           * status: 'syncing'
           * message: 'Syncing your changes...'
           *
           * Therefore it WILL be shown.
           */
          if (
            state.status === 'syncing' &&
            !!state.message
          ) {

            setVisible(true);

            return;
          }


          /*
           * =========================================
           * ERROR
           * =========================================
           */
          if (
            state.status === 'error'
          ) {

            setVisible(true);

            return;
          }


          /*
           * =========================================
           * SUCCESS
           * =========================================
           *
           * Only show successful synchronization when
           * syncService explicitly provides a message.
           *
           * Normal background sync has:
           *
           * message: undefined
           *
           * so it remains silent.
           */
          if (
            state.status === 'synced' &&
            state.pendingCount === 0 &&
            !!state.message
          ) {

            setVisible(true);


            const timer =
              setTimeout(() => {

                setVisible(false);

              }, 2500);


            return () => {

              clearTimeout(timer);

            };
          }


          /*
           * Everything else is silent.
           */
          setVisible(false);

        },
      );


    return unsubscribe;

  }, []);


  if (!visible) {
    return null;
  }


  const isOffline =
    syncState.status === 'offline';


  /*
   * IMPORTANT:
   *
   * A normal background sync has status "syncing"
   * but message === undefined.
   *
   * That state never reaches the visible banner
   * because of the condition above.
   */
  const isSyncing =
    syncState.status === 'syncing' &&
    !!syncState.message;


  const isError =
    syncState.status === 'error';


  const isSynced =
    syncState.status === 'synced';


  /* ================================================= */
  /* ICON                                              */
  /* ================================================= */

  const icon =
    isOffline
      ? '!'
      : isSyncing
        ? '↻'
        : isError
          ? '!'
          : '✓';


  /* ================================================= */
  /* TITLE                                             */
  /* ================================================= */

  const title =
    isOffline
      ? 'You are offline'
      : isSyncing
        ? 'Syncing changes'
        : isError
          ? 'Sync failed'
          : 'All changes synced';


  /* ================================================= */
  /* MESSAGE                                           */
  /* ================================================= */

  let message =
    syncState.message ??
    'Your changes are saved locally.';


  /*
   * OFFLINE
   */
  if (
    isOffline &&
    syncState.pendingCount > 0
  ) {

    message =
      `${syncState.pendingCount} unsynced change${
        syncState.pendingCount === 1
          ? ''
          : 's'
      }`;

  }


  /*
   * RECONNECTION / VISIBLE SYNC
   */
  if (isSyncing) {

    message =
      syncState.pendingCount > 0
        ? `Uploading ${syncState.pendingCount} change${
            syncState.pendingCount === 1
              ? ''
              : 's'
          }...`
        : syncState.message ??
          'Updating your tasks...';

  }


  /*
   * SUCCESS
   */
  if (isSynced) {

    message =
      syncState.message ??
      'Everything is up to date.';

  }


  /* ================================================= */
  /* RENDER                                            */
  /* ================================================= */

  return (
    <View
      style={[
        styles.statusArea,

        isOffline &&
          styles.offlineArea,

        isSyncing &&
          styles.syncingArea,

        isError &&
          styles.errorArea,

        isSynced &&
          styles.syncedArea,
      ]}>

      <View
        style={[
          styles.banner,

          isOffline &&
            styles.offlineBanner,

          isSyncing &&
            styles.syncingBanner,

          isError &&
            styles.errorBanner,

          isSynced &&
            styles.syncedBanner,
        ]}>

        {/* =========================================== */}
        {/* ICON                                        */}
        {/* =========================================== */}

        <View
          style={[
            styles.iconCircle,

            isOffline &&
              styles.offlineIcon,

            isSyncing &&
              styles.syncingIcon,

            isError &&
              styles.errorIcon,

            isSynced &&
              styles.syncedIcon,
          ]}>

          <Text
            style={[
              styles.icon,

              isOffline &&
                styles.offlineIconText,

              isSyncing &&
                styles.syncingIconText,

              isError &&
                styles.errorIconText,

              isSynced &&
                styles.syncedIconText,
            ]}>

            {icon}

          </Text>

        </View>


        {/* =========================================== */}
        {/* TEXT                                        */}
        {/* =========================================== */}

        <View
          style={styles.textContainer}>

          <Text
            numberOfLines={1}
            style={styles.title}>

            {title}

          </Text>


          <Text
            numberOfLines={1}
            style={styles.message}>

            {message}

          </Text>

        </View>

      </View>

    </View>
  );
}


/* ================================================= */
/* STATUS BAR HEIGHT                                  */
/* ================================================= */

const statusBarHeight =
  Platform.OS === 'android'
    ? StatusBar.currentHeight ?? 24
    : 0;


/* ================================================= */
/* STYLES                                            */
/* ================================================= */

const styles = StyleSheet.create({

  statusArea: {

    paddingTop:
      Platform.OS === 'android'
        ? statusBarHeight
        : 0,

    paddingHorizontal: 12,

    paddingBottom: 8,

    backgroundColor: '#F7F8FA',
  },


  banner: {

    minHeight: 54,

    borderRadius: 14,

    paddingHorizontal: 14,

    paddingVertical: 9,

    flexDirection: 'row',

    alignItems: 'center',

    borderWidth: 1,

    elevation: 2,

    shadowOffset: {
      width: 0,
      height: 1,
    },

    shadowOpacity: 0.08,

    shadowRadius: 4,
  },


  /* ================================================= */
  /* BACKGROUNDS                                       */
  /* ================================================= */

  offlineArea: {
    backgroundColor: '#F7F8FA',
  },


  syncingArea: {
    backgroundColor: '#F7F8FA',
  },


  errorArea: {
    backgroundColor: '#F7F8FA',
  },


  syncedArea: {
    backgroundColor: '#F7F8FA',
  },


  offlineBanner: {
    backgroundColor: '#FFF4F2',

    borderColor: '#FFD8D2',
  },


  syncingBanner: {
    backgroundColor: '#FFF9E8',

    borderColor: '#FFE5A8',
  },


  errorBanner: {
    backgroundColor: '#FFF4F2',

    borderColor: '#FFD8D2',
  },


  syncedBanner: {
    backgroundColor: '#EFFAF3',

    borderColor: '#CDEED8',
  },


  /* ================================================= */
  /* ICON                                              */
  /* ================================================= */

  iconCircle: {

    width: 34,

    height: 34,

    borderRadius: 17,

    alignItems: 'center',

    justifyContent: 'center',

    marginRight: 11,
  },


  offlineIcon: {
    backgroundColor: '#FFE0DB',
  },


  syncingIcon: {
    backgroundColor: '#FFECC2',
  },


  errorIcon: {
    backgroundColor: '#FFE0DB',
  },


  syncedIcon: {
    backgroundColor: '#D7F3DF',
  },


  icon: {

    fontSize: 17,

    fontWeight: '800',
  },


  offlineIconText: {
    color: '#D94B3D',
  },


  syncingIconText: {
    color: '#B57900',
  },


  errorIconText: {
    color: '#D94B3D',
  },


  syncedIconText: {
    color: '#2E8B57',
  },


  /* ================================================= */
  /* TEXT                                              */
  /* ================================================= */

  textContainer: {

    flex: 1,

    justifyContent: 'center',
  },


  title: {

    fontSize: 13,

    lineHeight: 18,

    fontWeight: '700',

    color: '#20242A',
  },


  message: {

    marginTop: 1,

    fontSize: 11,

    lineHeight: 16,

    color: '#68707A',
  },

});