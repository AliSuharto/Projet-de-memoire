import { useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { 
  getNavigationConfig, 
  convertToTopNavFormat, 
  convertToSideNavFormat,
  UnifiedNavItem 
} from '@/lib/navigation-config';

export function useRoleNavigation() {
  const { user } = useAuth();
  
  const navigationConfig = useMemo(() => {
    if (!user?.role) {
      return {
        unified: [] as UnifiedNavItem[],
        topNav: [],
        sideNav: []
      };
    }
    
    const unified = getNavigationConfig(user.role);
    const topNav = convertToTopNavFormat(unified);
    const sideNav = convertToSideNavFormat(unified);
    
    return {
      unified,
      topNav,
      sideNav
    };
  }, [user?.role]);
  
  return navigationConfig;
}
