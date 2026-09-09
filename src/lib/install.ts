export function shouldShowInstallNudge(
  userAgent: string,
  isStandalone: boolean,
  dismissed: boolean,
): boolean {
  const isIos = /iphone|ipad|ipod/i.test(userAgent);
  return isIos && !isStandalone && !dismissed;
}

export function isStandaloneDisplay(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in navigator && (navigator as { standalone?: boolean }).standalone === true)
  );
}
