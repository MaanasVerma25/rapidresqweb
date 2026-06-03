import { useState, useEffect, useCallback } from "react";
import type { UserLocation } from "@/lib/types";

export interface GeolocationState {
  location: UserLocation | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation(options?: PositionOptions & { autoWatch?: boolean }) {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: false,
  });

  const updateLocation = useCallback((pos: GeolocationPosition) => {
    setState({
      location: {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        label: "Live GPS Coordinates",
      },
      error: null,
      loading: false,
    });
  }, []);

  const handleError = useCallback((err: GeolocationPositionError) => {
    let errorMessage = "An unknown error occurred while fetching location.";

    switch (err.code) {
      case err.PERMISSION_DENIED:
        errorMessage = "Location permission denied. Please enable GPS access in your browser.";
        break;
      case err.POSITION_UNAVAILABLE:
        errorMessage = "Location information is unavailable.";
        break;
      case err.TIMEOUT:
        errorMessage = "The request to get user location timed out.";
        break;
    }

    setState((s) => ({ ...s, error: errorMessage, loading: false }));
  }, []);

  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setState((s) => ({ ...s, error: "Geolocation is not supported by your browser." }));
      return;
    }

    setState((s) => ({ ...s, loading: true, error: null }));
    navigator.geolocation.getCurrentPosition(updateLocation, handleError, options);
  }, [updateLocation, handleError, options]);

  useEffect(() => {
    if (!options?.autoWatch || !navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(updateLocation, handleError, options);

    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [options?.autoWatch, updateLocation, handleError, options]);

  return { ...state, getPosition };
}
