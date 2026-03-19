import { createNavigationContainerRef } from '@react-navigation/native';

export const navigationRef: any = createNavigationContainerRef();

export function navigate(name: string, params: any) {
  // console.log('navigate is valid', navigationRef.current.getRootState());

  if (navigationRef.isReady()) {
    navigationRef.navigate(name, params);
  }
}
