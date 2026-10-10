import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode
} from 'react';

/**
 * Minimal hash router. Three routes and no nested layouts means a full routing
 * library would be more surface than this needs.
 *
 * Hash routing also means deep links survive a refresh on static hosts like
 * GitHub Pages, which cannot rewrite unknown paths to index.html.
 */

interface RouterValue {
  path: string;
  navigate: (to: string) => void;
}

const RouterContext = createContext<RouterValue>({
  path: '/',
  navigate: () => {}
});

function readPath(): string {
  const raw = window.location.hash.replace(/^#/, '');
  if (!raw) return '/';
  return raw.startsWith('/') ? raw : `/${raw}`;
}

export function HashRouter({ children }: { children: ReactNode }) {
  const [path, setPath] = useState(readPath);

  useEffect(() => {
    const onChange = () => setPath(readPath());
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  const navigate = useCallback((to: string) => {
    if (readPath() === to) return;
    window.location.hash = to;
  }, []);

  // Each route is a fresh screen, so start it at the top.
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [path]);

  const value = useMemo(() => ({ path, navigate }), [path, navigate]);

  return <RouterContext.Provider value={value}>{children}</RouterContext.Provider>;
}

export const useNavigate = () => useContext(RouterContext).navigate;
export const useRoutePath = () => useContext(RouterContext).path;
