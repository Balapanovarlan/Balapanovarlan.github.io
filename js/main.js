document.addEventListener('DOMContentLoaded', () => {
  const slider = document.querySelector('.slider');
  const track  = document.querySelector('.slider__track');
  const prev   = document.querySelector('.slider__nav--prev');
  const next   = document.querySelector('.slider__nav--next');

  const originals = Array.from(track.children);
  const firstClone = originals[0].cloneNode(true);
  const lastClone  = originals[originals.length - 1].cloneNode(true);
  track.insertBefore(lastClone, originals[0]);
  track.appendChild(firstClone);
  const slides = Array.from(track.children);

  let currentIndex    = 1;      // старт — первый «реальный» слайд
  let slideWidth      = 0;
  let isTransitioning = false;  // флаг «в процессе анимации»

  function update() {
    slideWidth = slider.clientWidth * 0.8;
    // включаем анимацию
    track.style.transition = 'transform .5s ease';
    track.style.transform  = `translateX(${-currentIndex * slideWidth}px)`;
  }

  // ловим завершение анимации
  track.addEventListener('transitionend', () => {
    // сбросим флаг, разрешив новые клики
    isTransitioning = false;

    // если мы в клоне «последнего» — без анимации перескакиваем на настоящий
    if (currentIndex === 0) {
      track.style.transition = 'none';
      currentIndex = slides.length - 2;
      track.style.transform  = `translateX(${-currentIndex * slideWidth}px)`;
    }
    // если мы в клоне «первого» — прыгаем на настоящий первый
    else if (currentIndex === slides.length - 1) {
      track.style.transition = 'none';
      currentIndex = 1;
      track.style.transform  = `translateX(${-currentIndex * slideWidth}px)`;
    }
  });

  prev.addEventListener('click', () => {
    if (isTransitioning) return;        // блокируем «два клика в одну анимацию»
    isTransitioning = true;
    currentIndex--;                     // уходим влево
    update();
  });

  next.addEventListener('click', () => {
    if (isTransitioning) return;
    isTransitioning = true;
    currentIndex++;                     // уходим вправо
    update();
  });

  window.addEventListener('resize', update);

  // инициализация
  update();
});
