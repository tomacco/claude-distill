// aura-distill research — theme + navigation
(function() {
    // Apply saved or system theme immediately (before paint)
    const saved = localStorage.getItem('distill-mode');
    if (saved === 'dark') {
        document.body.setAttribute('data-theme', 'dark');
    } else if (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        document.body.setAttribute('data-theme', 'dark');
    }

    // Listen for system changes (if no manual override)
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('distill-mode')) {
            document.body.setAttribute('data-theme', e.matches ? 'dark' : '');
            if (!e.matches) document.body.removeAttribute('data-theme');
        }
    });

    // Toggle function (attached to window for onclick)
    window.toggleMode = function() {
        const isDark = document.body.getAttribute('data-theme') === 'dark';
        if (isDark) {
            document.body.removeAttribute('data-theme');
            localStorage.setItem('distill-mode', 'light');
        } else {
            document.body.setAttribute('data-theme', 'dark');
            localStorage.setItem('distill-mode', 'dark');
        }
    };

    // TOC scroll highlighting
    const sections = document.querySelectorAll('section[id]');
    const tocLinks = document.querySelectorAll('.toc a');
    if (sections.length && tocLinks.length) {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    tocLinks.forEach(link => link.classList.remove('active'));
                    const active = document.querySelector('.toc a[href="#' + entry.target.id + '"]');
                    if (active) active.classList.add('active');
                }
            });
        }, { rootMargin: '-30% 0px -60% 0px' });
        sections.forEach(section => observer.observe(section));
    }
})();
