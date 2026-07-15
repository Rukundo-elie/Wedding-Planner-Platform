export const DIAMOND_PACKAGE_IMAGE =
  'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&q=80&w=800';

const BROKEN_PACKAGE_IMAGES = new Set([
  'https://images.unsplash.com/photo-1469371670803-b01385206935?auto=format&fit=crop&q=80&w=800',
]);

export const getPackageImage = (pkg) => {
  const isDiamond = pkg?.name?.toLowerCase().includes('diamond');

  if (isDiamond) {
    if (!pkg?.image || BROKEN_PACKAGE_IMAGES.has(pkg.image)) {
      return DIAMOND_PACKAGE_IMAGE;
    }
  }

  if (pkg?.image && !BROKEN_PACKAGE_IMAGES.has(pkg.image)) {
    return pkg.image;
  }

  if (isDiamond) {
    return DIAMOND_PACKAGE_IMAGE;
  }

  return null;
};
