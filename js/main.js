class Slider {
  constructor(root) {
    this.slider = root;
    this.track  = root.querySelector('.slider__track');
    this.prev   = root.querySelector('.slider__nav--prev');
    this.next   = root.querySelector('.slider__nav--next');
    
    // Режим: infinite (true) или finite (false)
    this.infinite = !root.classList.contains('slider--finite');

    // Только в infinite‑режиме создаём клоны
    if (this.infinite) {
      this.setupClones();
      this.currentIndex = 1;                // клонированный нулевой в начале
    } else {
      this.slides       = Array.from(this.track.children);
      this.currentIndex = 0;                // первый реальный
    }

    this.isTransitioning = false;
    this.onResize        = this.update.bind(this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);

    // Повесим клики
    this.prev.addEventListener('click', () => this.move(-1));
    this.next.addEventListener('click', () => this.move(+1));
    this.track.addEventListener('transitionend', this.onTransitionEnd);
    window.addEventListener('resize', this.onResize);

    // Стартовый рендер
    this.update();
    this.updateNavButtons();
  }

  setupClones() {
    const originals = Array.from(this.track.children);
    const first  = originals[0].cloneNode(true);
    const last   = originals[originals.length - 1].cloneNode(true);

    this.track.insertBefore(last, originals[0]);
    this.track.appendChild(first);

    this.slides = Array.from(this.track.children);
  }

  update() {
    // определяем ширину слайда: 80% или 33% (или маленький — flex:0 0 XX%)
    const baseRatio = this.slider.classList.contains('slider--multi') ? 0.33 : 0.80;
    this.slideWidth = this.slider.clientWidth * baseRatio;

    this.track.style.transition = 'transform .5s ease';
    this.track.style.transform  = `translateX(${-this.currentIndex * this.slideWidth}px)`;
  }

  onTransitionEnd() {
    this.isTransitioning = false;
    
    // если infinite — «заезд» в клоны
    if (this.infinite) {
      if (this.currentIndex === 0) {
        this.track.style.transition = 'none';
        this.currentIndex = this.slides.length - 2;
      }
      else if (this.currentIndex === this.slides.length - 1) {
        this.track.style.transition = 'none';
        this.currentIndex = 1;
      }
      this.track.style.transform = `translateX(${-this.currentIndex * this.slideWidth}px)`;
    }

    this.updateNavButtons();
  }

  move(direction) {
    // direction: +1 или -1
    if (this.isTransitioning) return;
    this.isTransitioning = true;

    // в finite‑режиме блокируем выход за границы
    if (!this.infinite) {
      const maxIndex = this.slides.length - 1;
      const nextIndex = this.currentIndex + direction;
      if (nextIndex < 0 || nextIndex > maxIndex) {
        this.isTransitioning = false;
        return;
      }
      this.currentIndex = nextIndex;
      this.update();
      this.updateNavButtons();
    } else {
      // infinite режим — просто двигаем и «заезжаем» в клоны
      this.currentIndex += direction;
      this.update();
    }
  }

  updateNavButtons() {
    if (this.infinite) {
      // у infinite‑режима кнопки всегда активны
      this.prev.classList.remove('disabled');
      this.next.classList.remove('disabled');
    } else {
      const max = this.slides.length - 1;
      // дизейблим кнопки на концах
      this.prev.classList.toggle('disabled', this.currentIndex === 0);
      this.next.classList.toggle('disabled', this.currentIndex === max);
    }
  }
}

// Инициализация для всех `.slider` на странице
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.slider').forEach(el => new Slider(el));
});


document.addEventListener('DOMContentLoaded', () => {
  const accordions = document.querySelectorAll('.accordion__item');

  accordions.forEach(item => {
    const header = item.querySelector('.accordion__header');
    const body   = item.querySelector('.accordion__body');
    const arrow  = header.querySelector('.accordion__arrow');

    item.addEventListener('click', () => {
      const isOpen = body.classList.contains('is-expanded');

      // Сначала закрываем все
      accordions.forEach(otherItem => {
        const otherBody = otherItem.querySelector('.accordion__body');
        const otherArrow = otherItem.querySelector('.accordion__header .accordion__arrow');
        otherBody.classList.remove('is-expanded');
        otherArrow.style.transform = ''; // убираем поворот
      });

      if (!isOpen) {
        body.classList.add('is-expanded');
        // Поворачиваем стрелку
        arrow.style.transform = 'rotate(180deg)';
      }
    });
  });
});