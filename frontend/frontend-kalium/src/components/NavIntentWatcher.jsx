import { useEffect } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';

function NavIntentWatcher() {
  const location = useLocation();
  const navType = useNavigationType(); // 'POP' for refresh/back, 'PUSH'/'REPLACE' for in-app navigation

  useEffect(() => {
    if (navType === 'PUSH' || navType === 'REPLACE') {
      // Mark that this route was reached via UI navigation
      sessionStorage.setItem('navIntent', '1');
      sessionStorage.setItem('intentPath', location.pathname);
    }
    // Do not set intent on 'POP' (refresh/deeplink/back/forward)
  }, [location.pathname, navType]);

  return null;
}

export default NavIntentWatcher;
