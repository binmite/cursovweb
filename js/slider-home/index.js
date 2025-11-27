class Slider {
    constructor(container) {
        this.container = container;
        this.wrapper = container.querySelector('.section-slider-top-slider-wrapper');
        this.slides = Array.from(container.querySelectorAll('.section-slider-top-slider-slide'));
        this.prevBtn = container.querySelector('.slider-prev');
        this.nextBtn = container.querySelector('.slider-next');
        this.currentIndex = 0;
        
        this.init();
    }
    
    init() {
        this.slides[this.currentIndex].classList.add('active');
        
        this.prevBtn.addEventListener('click', () => this.prev());
        this.nextBtn.addEventListener('click', () => this.next());
        
        this.startAutoPlay();
    }
    
    next() {
        this.goToSlide((this.currentIndex + 1) % this.slides.length);
    }
    
    prev() {
        this.goToSlide((this.currentIndex - 1 + this.slides.length) % this.slides.length);
    }
    
    goToSlide(index) {
        this.slides[this.currentIndex].classList.remove('active');
        
        this.slides[index].classList.add('active');
        
        this.currentIndex = index;
    }
    
    startAutoPlay() {
        setInterval(() => {
            this.next();
        }, 5000);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    const sliderContainer = document.querySelector('.section-slider-top-slider');
    if (sliderContainer) {
        new Slider(sliderContainer);
    }
});