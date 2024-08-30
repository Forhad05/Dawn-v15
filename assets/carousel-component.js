
if(!customElements.get('carousel-component')) {
  customElements.define(
    'carousel-component',
    class CarouselComponent extends SliderComponent {
      constructor() {
        super();
        this.sliderControlWrapper = this.querySelector('.slider-buttons');
        this.enableSliderLooping = true;
    
        if (!this.sliderControlWrapper) return;
        this.sliderFirstItemNode = this.slider.querySelector('.carousel__slide');
        if (this.sliderItemsToShow.length > 0) this.currentPage = 1;
    
        this.sliderControlLinksArray = Array.from(this.sliderControlWrapper.querySelectorAll('.slider-counter__link'));
        this.sliderControlLinksArray.forEach((link) => link.addEventListener('click', this.linkToSlide.bind(this)));
        this.slider.addEventListener('scroll', this.setSlideVisibility.bind(this));
        this.setSlideVisibility();
    
        if (this.slider.getAttribute('data-autoplay') === 'true') this.setAutoPlay();
      }
    
      setAutoPlay() {
        this.autoplaySpeed = this.slider.dataset.speed * 1000;
        this.addEventListener('mouseover', this.focusInHandling.bind(this));
        this.addEventListener('mouseleave', this.focusOutHandling.bind(this));
        this.addEventListener('focusin', this.focusInHandling.bind(this));
        this.addEventListener('focusout', this.focusOutHandling.bind(this));
    
        if (this.querySelector('.slideshow__autoplay')) {
          this.sliderAutoplayButton = this.querySelector('.slideshow__autoplay');
          this.sliderAutoplayButton.addEventListener('click', this.autoPlayToggle.bind(this));
          this.autoplayButtonIsSetToPlay = true;
          this.play();
        } else {
          this.reducedMotion.matches || this.announcementBarArrowButtonWasClicked ? this.pause() : this.play();
        }
      }
    
      setSlidePosition(position) {
        if (this.setPositionTimeout) clearTimeout(this.setPositionTimeout);
        this.setPositionTimeout = setTimeout(() => {
          this.slider.scrollTo({
            left: position,
          });
        }, this.announcerBarAnimationDelay);
      }
    
      update() {
        super.update();
        this.carouselSliderItems = this.querySelectorAll('.carousel__slide');
        this.sliderControlButtons = this.querySelectorAll('.slider-counter__link');
        this.prevButton.removeAttribute('disabled');
    
        if (!this.sliderControlButtons.length) return;
    
        this.sliderControlButtons.forEach((link) => {
          link.classList.remove('slider-counter__link--active');
          link.removeAttribute('aria-current');
        });
        this.sliderControlButtons[this.currentPage - 1].classList.add('slider-counter__link--active');
        this.sliderControlButtons[this.currentPage - 1].setAttribute('aria-current', true);
    
        if (this.isSlideVisible(this.sliderItemsToShow[0]) && this.slider.scrollLeft === 0) {
          this.prevButton.setAttribute('disabled', 'disabled');
        } else {
          this.prevButton.removeAttribute('disabled');
        }
    
        if (this.isSlideVisible(this.sliderItemsToShow[this.sliderItemsToShow.length - 1])) {
          this.nextButton.setAttribute('disabled', 'disabled');
          if(this.sliderControlButtons[this.sliderControlButtons.length - 1] != this.querySelector('.slider-counter__link[aria-current="true"]')) 
            setTimeout(() => {
              this.slider.scrollTo({ left: this.sliderFirstItemNode.offsetLeft})
            }, this.autoplaySpeed);
        } else {
          this.nextButton.removeAttribute('disabled');
        }
      }
    
      isSlideVisible(element, offset = 0) {
        const lastVisibleSlide = this.slider.clientWidth + this.slider.scrollLeft - offset;
        return element.offsetLeft + element.clientWidth <= lastVisibleSlide && element.offsetLeft >= this.slider.scrollLeft;
      }
    
      autoPlayToggle() {
        this.togglePlayButtonState(this.autoplayButtonIsSetToPlay);
        this.autoplayButtonIsSetToPlay ? this.pause() : this.play();
        this.autoplayButtonIsSetToPlay = !this.autoplayButtonIsSetToPlay;
      }
    
      focusOutHandling(event) {
        if (this.sliderAutoplayButton) {
          const focusedOnAutoplayButton =
            event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
          if (!this.autoplayButtonIsSetToPlay || focusedOnAutoplayButton) return;
          this.play();
        } else if (!this.reducedMotion.matches && !this.announcementBarArrowButtonWasClicked) {
          this.play();
        }
      }
    
      focusInHandling(event) {
        if (this.sliderAutoplayButton) {
          const focusedOnAutoplayButton =
            event.target === this.sliderAutoplayButton || this.sliderAutoplayButton.contains(event.target);
          if (focusedOnAutoplayButton && this.autoplayButtonIsSetToPlay) {
            this.play();
          } else if (this.autoplayButtonIsSetToPlay) {
            this.pause();
          }
        } else if (this.announcementBarSlider.contains(event.target)) {
          this.pause();
        }
      }
    
      play() {
        this.slider.setAttribute('aria-live', 'off');
        clearInterval(this.autoplay);
        this.autoplay = setInterval(this.autoRotateSlides.bind(this), this.autoplaySpeed);
      }
    
      pause() {
        this.slider.setAttribute('aria-live', 'polite');
        clearInterval(this.autoplay);
      }
    
      togglePlayButtonState(pauseAutoplay) {
        if (pauseAutoplay) {
          this.sliderAutoplayButton.classList.add('slideshow__autoplay--paused');
          this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.playSlideshow);
        } else {
          this.sliderAutoplayButton.classList.remove('slideshow__autoplay--paused');
          this.sliderAutoplayButton.setAttribute('aria-label', window.accessibilityStrings.pauseSlideshow);
        }
      }
    
      autoRotateSlides() {
        const slideScrollPosition =
          this.currentPage === this.sliderItems.length ? 0 : this.slider.scrollLeft + this.sliderItemOffset;
    
        this.setSlidePosition(slideScrollPosition);
      }
    
      setSlideVisibility(event) {
        this.sliderItemsToShow.forEach((item, index) => {
          const linkElements = item.querySelectorAll('a');
          if (index === this.currentPage - 1) {
            if (linkElements.length)
              linkElements.forEach((button) => {
                button.removeAttribute('tabindex');
              });
            item.setAttribute('aria-hidden', 'false');
            item.removeAttribute('tabindex');
          } else {
            if (linkElements.length)
              linkElements.forEach((button) => {
                button.setAttribute('tabindex', '-1');
              });
            item.setAttribute('aria-hidden', 'true');
            item.setAttribute('tabindex', '-1');
          }
        });
        this.wasClicked = false;
      }
    
      linkToSlide(event) {
        event.preventDefault();
        console.log(this.currentPage);
        console.log(event.currentTarget);
        const slideScrollPosition = this.slider.scrollLeft + this.sliderFirstItemNode.clientWidth * (this.sliderControlLinksArray.indexOf(event.currentTarget) + 1 - this.currentPage);
        this.slider.scrollTo({
          left: slideScrollPosition,
        });
      }
    }
  );
}