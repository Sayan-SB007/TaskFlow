import { useEffect, useState } from 'react';

import NetInfo from '@react-native-community/netinfo';

export interface NetworkStatus {
  isConnected: boolean;
  isInternetReachable: boolean | null;
}

export const useNetworkStatus = (): NetworkStatus => {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isConnected: true,
    isInternetReachable: null,
  });

  useEffect(() => {
    let mounted = true;

    /*
     * Get the current state immediately.
     */
    NetInfo.fetch()
      .then(state => {
        if (!mounted) {
          return;
        }

        setNetworkStatus({
          isConnected: state.isConnected === true,

          isInternetReachable: state.isInternetReachable,
        });
      })
      .catch(() => {
        if (!mounted) {
          return;
        }

        setNetworkStatus({
          isConnected: false,

          isInternetReachable: false,
        });
      });

    /*
     * Listen for network changes.
     */
    const unsubscribe = NetInfo.addEventListener(state => {
      if (!mounted) {
        return;
      }

      setNetworkStatus({
        isConnected: state.isConnected === true,

        isInternetReachable: state.isInternetReachable,
      });
    });

    return () => {
      mounted = false;

      unsubscribe();
    };
  }, []);

  return networkStatus;
};
