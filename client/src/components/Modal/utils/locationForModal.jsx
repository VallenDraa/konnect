export default function locationForModal(pathname) {
  if (pathname.includes('/user/')) return true;
  if (pathname.includes('/new/')) return true;
  if (pathname.includes('/')) return false;
}
