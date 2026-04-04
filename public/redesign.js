// Mobile menu toggle
function toggleMenu() {
  const menu = document.getElementById('mobileMenu');
  if (menu) {
    menu.classList.toggle('open');
  }
}

// Scroll fade-in animation using Intersection Observer
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));

    // Bookmark toggle functionality
    document.querySelectorAll('.bookmark-btn').forEach(btn => {
      btn.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        const icon = this.querySelector('i');
        if (icon) {
          icon.classList.toggle('far');
          icon.classList.toggle('fas');
          this.style.color = icon.classList.contains('fas') ? '#ff5733' : '#ccc';
        }
      });
    });
    // Header Profile Dropdown toggle
    const headerTrigger = document.getElementById('headerProfileTrigger');
    const headerMenu = document.getElementById('headerProfileMenu');
    
    if (headerTrigger && headerMenu) {
      headerTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        headerMenu.classList.toggle('show');
      });
      
      document.addEventListener('click', () => {
        headerMenu.classList.remove('show');
      });
    }
});
