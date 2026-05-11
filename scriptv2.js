/**
 * .NET Core Developer Roadmap — script.js
 * Features:
 *  - Theme toggle (dark/light) with localStorage persistence
 *  - Accordion open/close with ARIA
 *  - Checkbox progress tracking with localStorage
 *  - Per-section progress bars + overall pill
 *  - Stats counters
 *  - Active nav link highlighting on scroll
 *  - Sidebar mobile toggle
 *  - Search / filter topics
 *  - Progress modal + export as text
 *  - Keyboard shortcut (Ctrl+K) for search focus
 *  - Reset confirmation
 */

/* ══════════════════════════════════════════════════════════════
   CONFIG — maps section IDs to readable names
══════════════════════════════════════════════════════════════ */
const SECTIONS = {
  csharp:   { name: 'C# Fundamentals',        progId: 'prog-csharp' },
  sql:      { name: 'SQL & Databases',         progId: 'prog-sql' },
  dotnet:   { name: '.NET Core',               progId: 'prog-dotnet' },
  mvc:      { name: 'ASP.NET Core MVC',        progId: 'prog-mvc' },
  webapi:   { name: 'Web API',                 progId: 'prog-webapi' },
  linq:     { name: 'LINQ',                    progId: 'prog-linq' },
  ef:       { name: 'Entity Framework Core',   progId: 'prog-ef' },
  testing:  { name: 'Testing',                 progId: 'prog-testing' },
  devops:   { name: 'DevOps',                  progId: 'prog-devops' },
  advanced: { name: 'Advanced Topics',         progId: 'prog-advanced' },
  azure:    { name: 'Azure Cloud Services',    progId: 'prog-azure' },
  ai:       { name: 'AI & ML with .NET',       progId: 'prog-ai' },
};

const LS_KEY_THEME    = 'dotnet-roadmap-theme';
const LS_KEY_CHECKS   = 'dotnet-roadmap-checks';

/* ══════════════════════════════════════════════════════════════
   UTILITY
══════════════════════════════════════════════════════════════ */
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

function debounce(fn, wait = 220) {
  let t;
  return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), wait); };
}

/* ══════════════════════════════════════════════════════════════
   THEME
══════════════════════════════════════════════════════════════ */
const themeToggleBtn = $('#theme-toggle');
const toggleIcon     = $('#toggle-icon');

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  toggleIcon.textContent = theme === 'dark' ? '☀' : '☾';
  themeToggleBtn.title = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
}

function initTheme() {
  const saved = localStorage.getItem(LS_KEY_THEME) || 'dark';
  applyTheme(saved);
}

themeToggleBtn.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(LS_KEY_THEME, next);
});

/* ══════════════════════════════════════════════════════════════
   ACCORDIONS
══════════════════════════════════════════════════════════════ */
function initAccordions() {
  $$('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      const body   = trigger.nextElementSibling;

      trigger.setAttribute('aria-expanded', String(!isOpen));
      if (isOpen) {
        body.classList.remove('open');
      } else {
        body.classList.add('open');
      }
    });
  });

  // Open any accordions that are marked aria-expanded="true" initially
  $$('.accordion-trigger[aria-expanded="true"]').forEach(trigger => {
    trigger.nextElementSibling.classList.add('open');
  });
}

/* ══════════════════════════════════════════════════════════════
   PROGRESS TRACKING
══════════════════════════════════════════════════════════════ */
let savedChecks = {};

function loadChecks() {
  try {
    savedChecks = JSON.parse(localStorage.getItem(LS_KEY_CHECKS)) || {};
  } catch {
    savedChecks = {};
  }
}

function saveChecks() {
  localStorage.setItem(LS_KEY_CHECKS, JSON.stringify(savedChecks));
}

function initCheckboxes() {
  loadChecks();
  $$('.checklist input[type="checkbox"]').forEach(cb => {
    const id = cb.dataset.id;
    if (savedChecks[id]) {
      cb.checked = true;
      cb.closest('li').classList.add('done');
    }

    cb.addEventListener('change', () => {
      savedChecks[id] = cb.checked;
      saveChecks();
      cb.closest('li').classList.toggle('done', cb.checked);
      updateAllProgress();
    });
  });
}

function getSectionStats(sectionKey) {
  const sectionEl = $(`#section-${sectionKey}`);
  if (!sectionEl) return { total: 0, done: 0 };
  const boxes = $$('input[type="checkbox"]', sectionEl);
  const done  = boxes.filter(b => b.checked).length;
  return { total: boxes.length, done };
}

function updateAllProgress() {
  let grandTotal = 0;
  let grandDone  = 0;

  Object.entries(SECTIONS).forEach(([key, cfg]) => {
    const { total, done } = getSectionStats(key);
    grandTotal += total;
    grandDone  += done;

    // Per-section progress bar
    const bar = $(`#${cfg.progId}`);
    if (bar) {
      bar.style.width = total > 0 ? `${Math.round((done / total) * 100)}%` : '0%';
    }
  });

  // Stats counters
  const pct = grandTotal > 0 ? Math.round((grandDone / grandTotal) * 100) : 0;
  $('#stat-total').textContent  = grandTotal;
  $('#stat-done').textContent   = grandDone;
  $('#stat-pct').textContent    = `${pct}%`;
  $('#stat-remain').textContent = grandTotal - grandDone;

  // Header pill
  $('#pill-fill').style.width   = `${pct}%`;
  $('#pill-label').textContent  = `${pct}%`;
}

/* ══════════════════════════════════════════════════════════════
   SIDEBAR — MOBILE TOGGLE
══════════════════════════════════════════════════════════════ */
const sidebar        = $('#sidebar');
const hamburger      = $('#hamburger');
const sidebarOverlay = $('#sidebar-overlay');

function openSidebar() {
  sidebar.classList.add('open');
  sidebarOverlay.hidden = false;
  hamburger.classList.add('open');
  hamburger.setAttribute('aria-expanded', 'true');
}

function closeSidebar() {
  sidebar.classList.remove('open');
  sidebarOverlay.hidden = true;
  hamburger.classList.remove('open');
  hamburger.setAttribute('aria-expanded', 'false');
}

hamburger.addEventListener('click', () => {
  sidebar.classList.contains('open') ? closeSidebar() : openSidebar();
});
sidebarOverlay.addEventListener('click', closeSidebar);

// Close sidebar on nav link click (mobile)
$$('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    if (window.innerWidth <= 768) closeSidebar();
  });
});

/* ══════════════════════════════════════════════════════════════
   ACTIVE NAV ON SCROLL
══════════════════════════════════════════════════════════════ */
function initScrollSpy() {
  const sections = $$('.content-section[id]');
  const navLinks = $$('.nav-link');

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id.replace('section-', '');
        navLinks.forEach(link => {
          link.classList.toggle('active', link.dataset.section === id);
        });
      }
    });
  }, {
    rootMargin: `-${parseInt(getComputedStyle(document.documentElement).getPropertyValue('--header-h'))}px 0px -60% 0px`,
    threshold: 0,
  });

  sections.forEach(sec => observer.observe(sec));
}

/* ══════════════════════════════════════════════════════════════
   SEARCH / FILTER
══════════════════════════════════════════════════════════════ */
const searchInput  = $('#search-input');
const noResults    = $('#no-results');
const noResultsQ   = $('#no-results-query');

// Collect all searchable list items and their text
function getAllCheckItems() {
  return $$('.checklist li').map(li => ({
    el:   li,
    text: li.textContent.trim().toLowerCase(),
    sec:  li.closest('.content-section'),
  }));
}

let checkItems = [];

function openAccordionOf(el) {
  const body    = el.closest('.accordion-body');
  const trigger = body?.previousElementSibling;
  if (body && !body.classList.contains('open')) {
    body.classList.add('open');
    if (trigger) trigger.setAttribute('aria-expanded', 'true');
  }
}

function clearHighlights() {
  $$('mark').forEach(m => {
    const parent = m.parentNode;
    parent.replaceChild(document.createTextNode(m.textContent), m);
    parent.normalize();
  });
}

function highlightText(el, query) {
  const label = $('label', el);
  if (!label) return;
  const input = $('input', el);
  const inputHtml = input ? input.outerHTML : '';

  // Get text without the input element
  const walker = document.createTreeWalker(label, NodeFilter.SHOW_TEXT);
  let node;
  while ((node = walker.nextNode())) {
    const txt = node.textContent;
    const idx = txt.toLowerCase().indexOf(query);
    if (idx === -1) continue;
    const before = document.createTextNode(txt.slice(0, idx));
    const mark   = document.createElement('mark');
    mark.textContent = txt.slice(idx, idx + query.length);
    const after  = document.createTextNode(txt.slice(idx + query.length));
    const frag   = document.createDocumentFragment();
    frag.append(before, mark, after);
    node.parentNode.replaceChild(frag, node);
    break;
  }
}

const handleSearch = debounce(() => {
  const q = searchInput.value.trim().toLowerCase();
  clearHighlights();

  if (!q) {
    // Show everything
    $$('.content-section').forEach(s => s.hidden = false);
    noResults.hidden = true;
    return;
  }

  const matched = new Set();

  checkItems.forEach(({ el, text, sec }) => {
    if (text.includes(q)) {
      el.hidden = false;
      matched.add(sec);
      openAccordionOf(el);
      highlightText(el, q);
    } else {
      el.hidden = true;
    }
  });

  $$('.content-section').forEach(sec => {
    // Always show intro and projects sections
    if (sec.id === 'section-intro' || sec.id === 'section-projects') return;
    sec.hidden = !matched.has(sec);
  });

  if (matched.size === 0) {
    noResults.hidden = false;
    noResultsQ.textContent = searchInput.value.trim();
  } else {
    noResults.hidden = true;
  }
}, 200);

searchInput.addEventListener('input', handleSearch);

// Keyboard shortcut Ctrl+K
document.addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
    e.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
  if (e.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.value = '';
    handleSearch();
    searchInput.blur();
  }
});

/* ══════════════════════════════════════════════════════════════
   PROGRESS MODAL
══════════════════════════════════════════════════════════════ */
const progressModal  = $('#progress-modal');
const modalClose     = $('#modal-close');
const progressPill   = $('#progress-pill');
const downloadBtn    = $('#download-btn');
const modalContent   = $('#modal-content');

function buildModalContent() {
  let html = '';
  let grandTotal = 0, grandDone = 0;

  Object.entries(SECTIONS).forEach(([key, cfg]) => {
    const { total, done } = getSectionStats(key);
    grandTotal += total;
    grandDone  += done;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    html += `
      <div class="modal-section-row">
        <span class="name">${cfg.name}</span>
        <div class="modal-mini-bar">
          <div class="modal-mini-fill" style="width:${pct}%"></div>
        </div>
        <span class="count">${done}/${total}</span>
      </div>`;
  });

  const overallPct = grandTotal > 0 ? Math.round((grandDone / grandTotal) * 100) : 0;
  html = `
    <div class="modal-section-row" style="border-bottom: 2px solid var(--accent); margin-bottom: 8px; padding-bottom: 12px;">
      <span class="name" style="color:var(--accent); font-weight:700">Overall Progress</span>
      <div class="modal-mini-bar">
        <div class="modal-mini-fill" style="width:${overallPct}%; background: var(--accent)"></div>
      </div>
      <span class="count" style="color:var(--accent)">${overallPct}%</span>
    </div>` + html;

  modalContent.innerHTML = html;
}

function openModal() {
  buildModalContent();
  progressModal.hidden = false;
  document.body.style.overflow = 'hidden';
  modalClose.focus();
}

function closeModal() {
  progressModal.hidden = true;
  document.body.style.overflow = '';
}

progressPill.addEventListener('click', openModal);
modalClose.addEventListener('click', closeModal);
progressModal.addEventListener('click', e => {
  if (e.target === progressModal) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && !progressModal.hidden) closeModal();
});

// Download progress as plain text
$('#download-pdf').addEventListener('click', () => {
  let content = '.NET CORE DEVELOPER ROADMAP — PROGRESS SUMMARY\n';
  content += '='.repeat(50) + '\n';
  content += `Generated: ${new Date().toLocaleString()}\n\n`;

  Object.entries(SECTIONS).forEach(([key, cfg]) => {
    const { total, done } = getSectionStats(key);
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    content += `${cfg.name}\n${'─'.repeat(40)}\n`;
    content += `Progress: ${done}/${total} (${pct}%)\n`;

    // Completed items
    const sectionEl = $(`#section-${key}`);
    if (sectionEl) {
      const done_items = $$('input[type="checkbox"]:checked', sectionEl);
      if (done_items.length) {
        content += 'Completed:\n';
        done_items.forEach(cb => {
          content += `  ✓ ${cb.closest('label').textContent.trim()}\n`;
        });
      }
      const todo_items = $$('input[type="checkbox"]:not(:checked)', sectionEl);
      if (todo_items.length) {
        content += 'Remaining:\n';
        todo_items.forEach(cb => {
          content += `  ○ ${cb.closest('label').textContent.trim()}\n`;
        });
      }
    }
    content += '\n';
  });

  const blob = new Blob([content], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'dotnet-roadmap-progress.txt';
  a.click();
  URL.revokeObjectURL(url);
});

/* ══════════════════════════════════════════════════════════════
   SIDEBAR EXPORT / RESET
══════════════════════════════════════════════════════════════ */
downloadBtn.addEventListener('click', openModal);

$('#reset-btn').addEventListener('click', () => {
  if (!confirm('Reset all progress? This cannot be undone.')) return;
  savedChecks = {};
  saveChecks();
  $$('.checklist input[type="checkbox"]').forEach(cb => {
    cb.checked = false;
    cb.closest('li').classList.remove('done');
  });
  updateAllProgress();
  clearHighlights();
});

/* ══════════════════════════════════════════════════════════════
   INIT
══════════════════════════════════════════════════════════════ */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initAccordions();
  initCheckboxes();
  updateAllProgress();
  initScrollSpy();

  // Populate check items after DOM is ready
  checkItems = getAllCheckItems();

  // Animate stat numbers on load
  animateStats();
});

function animateStats() {
  const stat_total  = parseInt($('#stat-total').textContent)  || 0;
  const stat_done   = parseInt($('#stat-done').textContent)   || 0;
  const stat_remain = parseInt($('#stat-remain').textContent) || 0;

  animateNumber('#stat-total',  stat_total);
  animateNumber('#stat-done',   stat_done);
  animateNumber('#stat-remain', stat_remain);
}

function animateNumber(selector, target, duration = 600) {
  const el  = $(selector);
  if (!el || target === 0) return;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const prog    = Math.min(elapsed / duration, 1);
    const eased   = 1 - Math.pow(1 - prog, 3); // ease-out cubic
    const current = Math.round(eased * target);
    el.textContent = current;
    if (prog < 1) requestAnimationFrame(step);
    else el.textContent = target;
  }
  requestAnimationFrame(step);
}

/* ══════════════════════════════════════════════════════════════
   BONUS: Keyboard navigation for accordions
══════════════════════════════════════════════════════════════ */
$$('.accordion-trigger').forEach(trigger => {
  trigger.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      trigger.click();
    }
  });
});

/* ══════════════════════════════════════════════════════════════
   SMOOTH NAV LINK CLICK + OPEN SECTION
══════════════════════════════════════════════════════════════ */
$$('.nav-link').forEach(link => {
  link.addEventListener('click', e => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    // If the target section is hidden (search filter), reveal it
    const target = $(href);
    if (target && target.hidden) {
      target.hidden = false;
    }
  });
});
