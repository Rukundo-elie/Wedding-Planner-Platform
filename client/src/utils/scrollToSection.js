export const scrollToSection = (sectionId) => {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' });
  }
};

export const navigateToSection = (sectionId, { pathname, navigate }) => {
  if (pathname !== '/') {
    navigate(`/#${sectionId}`);
    return;
  }

  scrollToSection(sectionId);
  window.history.replaceState(null, '', `#${sectionId}`);
};

export const goHome = (navigate, location) => {
  if (location.pathname === '/' && !location.hash) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    return;
  }

  navigate('/');
};
