  function debounce(fn, wait) {
    let timeout;
    return function(...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  // Слайдер
  class Slider {
    constructor(root) {
      this.slider = root;
      this.track  = root.querySelector('.slider__track');
      this.prev   = root.querySelector('.slider__nav--prev');
      this.next   = root.querySelector('.slider__nav--next');

      this.infinite = !root.classList.contains('slider--finite');
      this.gap      = parseFloat(getComputedStyle(this.track).gap) || 0;

      if (this.infinite) {
        this.setupClones();
        this.currentIndex = 1;
      } else {
        this.slides       = Array.from(this.track.children);
        this.currentIndex = 0;
      }

      this.isTransitioning = false;
      this.update          = this.update.bind(this);
      this.onTransitionEnd = this.onTransitionEnd.bind(this);

      this.prev?.addEventListener('click', () => this.move(-1));
      this.next?.addEventListener('click', () => this.move(+1));
      this.track.addEventListener('transitionend', this.onTransitionEnd);
      window.addEventListener('resize', debounce(this.update, 100));

      this.update();
      this.updateNavButtons();
    }

    setupClones() {
      const originals = Array.from(this.track.children);
      const first     = originals[0].cloneNode(true);
      const last      = originals[originals.length - 1].cloneNode(true);
      this.track.insertBefore(last, originals[0]);
      this.track.appendChild(first);
      this.slides = Array.from(this.track.children);
    }

    getSlideWidth() {
      const isMobile = window.innerWidth < 1024;
      const isMulti  = this.slider.classList.contains('slider--multi');
      if (isMobile) return this.slider.clientWidth;
      return this.slider.clientWidth * (isMulti ? 0.33 : 0.80);
    }

    update() {
      this.slideWidth = this.getSlideWidth();
      this.step       = this.slideWidth + this.gap;
      this.track.style.transition = 'transform .5s ease';
      this.track.style.transform  = `translateX(${-this.currentIndex * this.step}px)`;
    }

    onTransitionEnd() {
      this.isTransitioning = false;
      if (this.infinite) {
        if (this.currentIndex === 0) {
          this.track.style.transition = 'none';
          this.currentIndex = this.slides.length - 2;
        } else if (this.currentIndex === this.slides.length - 1) {
          this.track.style.transition = 'none';
          this.currentIndex = 1;
        }
        this.track.style.transform = `translateX(${-this.currentIndex * this.step}px)`;
        void this.track.offsetWidth; // рефлоу
        this.track.style.transition = 'transform .5s ease';
      }
      this.updateNavButtons();
    }

    move(direction) {
      if (this.isTransitioning) return;
      this.isTransitioning = true;
      if (!this.infinite) {
        const maxIndex  = this.slides.length - 1;
        const nextIndex = this.currentIndex + direction;
        if (nextIndex < 0 || nextIndex > maxIndex) {
          this.isTransitioning = false;
          return;
        }
        this.currentIndex = nextIndex;
        this.update();
        this.updateNavButtons();
      } else {
        this.currentIndex += direction;
        this.update();
      }
    }

    updateNavButtons() {
      if (!this.prev || !this.next) return;
      if (this.infinite) {
        this.prev.classList.remove('disabled');
        this.next.classList.remove('disabled');
      } else {
        const max = this.slides.length - 1;
        this.prev.classList.toggle('disabled', this.currentIndex === 0);
        this.next.classList.toggle('disabled', this.currentIndex === max);
      }
    }
  }

  // Инициализаторы
  function initSliders() {
    document.querySelectorAll('.slider').forEach(el => new Slider(el));
  }
function initAccordion() {
  const items = document.querySelectorAll('.accordion__item');
  if (!items.length) return;

  items.forEach(item => {
    const header = item.querySelector('.accordion__header');
    const body   = item.querySelector('.accordion__body');
    const arrow  = header.querySelector('.accordion__arrow');
    if (!header || !body) return;

    header.style.cursor = 'pointer';

    // Начальное состояние
    body.classList.remove('is-expanded');
    if (arrow) {
      arrow.style.transform = '';
    }

    header.addEventListener('click', () => {
      const isOpen = body.classList.contains('is-expanded');

      // Закрываем все остальные
      items.forEach(other => {
        const oHdr  = other.querySelector('.accordion__header');
        const oBody = other.querySelector('.accordion__body');
        const oArr  = oHdr.querySelector('.accordion__arrow');
        oBody.classList.remove('is-expanded');
        if (oArr) {
          oArr.style.transform = '';
        }
      });

      // Открываем/закрываем текущий
      if (!isOpen) {
        body.classList.add('is-expanded');
        if (arrow) {
          arrow.style.transform = 'rotate(180deg)';
        }
      }
    });
  });
}
  function initBurgerMenu() {
    const burger   = document.querySelector('.burger-menu');
    const sidebar  = document.querySelector('.sidebar');
    const overlay  = document.querySelector('.sidebar__overlay');
    const closeBtn = document.querySelector('.sidebar__btn-close');
    if (!burger || !sidebar) return;

    burger.addEventListener('click', () => {
      sidebar.classList.add('sidebar--active');
      sidebar.classList.remove('sidebar--hidden');
    });
    function hide() {
      sidebar.classList.remove('sidebar--active');
      sidebar.classList.add('sidebar--hidden');
    }
    closeBtn?.addEventListener('click', hide);
    overlay?.addEventListener('click', hide);
  }

  function initLangSwitcher() {
    const toggle   = document.querySelector('.header__lang-current');
    const dropdown = document.querySelector('.header__lang-dropdown');
    const options  = document.querySelectorAll('.header__lang-option');
    const display  = document.querySelector('.header__lang-text');
    if (!toggle || !dropdown || !display) return;

    toggle.addEventListener('click', e => {
      e.stopPropagation();
      dropdown.classList.toggle('is-open');
      toggle.classList.toggle('is-open');
    });

    options.forEach(opt => {
      opt.addEventListener('click', e => {
        e.stopPropagation();
        const lang = opt.dataset.lang;
        display.textContent =
          lang === 'KZ' ? 'ҚАЗ' :
          lang === 'RU' ? 'РУС' : 'ENG';
        dropdown.classList.remove('is-open');
        toggle.classList.remove('is-open');
      });
    });

    document.addEventListener('click', e => {
      if (!e.target.closest('.header__lang')) {
        dropdown.classList.remove('is-open');
        toggle.classList.remove('is-open');
      }
    });
  }

  function initSearchPopup() {
    document.querySelectorAll('.expanding-search').forEach(block => {
      const toggleBtn = block.querySelector('.expanding-search__toggle');
      const form      = block.querySelector('.expanding-search__form');
      const input     = block.querySelector('.expanding-search__input');
      const closeBtn  = block.querySelector('.expanding-search__close');
      if (!toggleBtn || !form) return;

      function onOutsideClick(e) {
        if (!block.contains(e.target)) closeSearch();
      }
      function onEscPress(e) {
        if (e.key === 'Escape') closeSearch();
      }
      function openSearch() {
        form.classList.add('is-open');
        input.focus();
        document.addEventListener('click', onOutsideClick);
        document.addEventListener('keydown', onEscPress);
      }
      function closeSearch() {
        form.classList.remove('is-open');
        input.value = '';
        document.removeEventListener('click', onOutsideClick);
        document.removeEventListener('keydown', onEscPress);
      }

      toggleBtn.addEventListener('click', e => {
        e.stopPropagation();
        form.classList.contains('is-open') ? closeSearch() : openSearch();
      });
      closeBtn?.addEventListener('click', e => {
        e.preventDefault();
        closeSearch();
      });
    });
  }

  // Единая точка входа
  document.addEventListener('DOMContentLoaded', () => {
    initSliders();
    initAccordion();
    initBurgerMenu();
    initLangSwitcher();
    initSearchPopup();
  });