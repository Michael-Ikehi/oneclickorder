import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Download(): Promise<never> {
  const headersList = await headers();
  const ua = headersList.get('user-agent') || '';
  const referer = headersList.get('referer') || '';

  const androidLink = 'https://play.google.com/store/apps/details?id=com.foodhutz.users';
  const iosLink = 'https://apps.apple.com/ng/app/foodhutz/id6446799967';

  // SAFELY HANDLE REFERER
  let safeReturn = '/takeaway';

  try {
    // Use a base URL so relative URLs don't throw
    const base = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost';
    const url = new URL(referer, base);

    // allow only your own domain
    if (url.hostname === new URL(base).hostname) {
      safeReturn = url.pathname + url.search + url.hash;
    }
  } catch {
    // referer missing or invalid → keep fallback
  }


  // DEVICE REDIRECTS
  if (/android/i.test(ua)) {
    redirect(androidLink);
  } else if (/iPhone|iPad|iPod/i.test(ua)) {
    redirect(iosLink);
  } else {
    redirect(safeReturn);
  }
}
