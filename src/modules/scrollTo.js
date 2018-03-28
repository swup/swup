module.exports = function(element, to, duration) {
    const body = document.body;

    const UP = -1;
    const DOWN = 1;

    let friction = 0.7;
    let acceleration = 0.04;

    let positionY = 100;
    let velocityY = 0;
    let targetPositionY = 400;

    let raf = null;

    function getScrollTop() {
        return document.body.scrollTop || document.documentElement.scrollTop;
    }

    const animate = () => {
        const distance = update();
        render();

        if (Math.abs(distance) > 0.1) {
            raf = requestAnimationFrame(animate);
        } else {
            this.triggerEvent('scrollDone')
        }
    }

    function update() {
        const distance = targetPositionY - positionY;
        const attraction = distance * acceleration;

        applyForce(attraction);

        velocityY *= friction;
        positionY += velocityY;

        return distance;
    }

    const applyForce = (force) => {
        velocityY += force;
    }

    const render = () => {
        window.scrollTo(0, positionY);
    }

    window.addEventListener('mousewheel', event => {
        if (raf) {
            cancelAnimationFrame(raf);
            raf = null;
        }
    }, {
        passive: true
    });

    const scrollTo = (offset, callback) => {
        positionY = getScrollTop();
        targetPositionY = offset;
        velocityY = 0;
        animate();
    }

    this.triggerEvent('scrollStart');
    if (duration == 0) {
        window.scrollTo(0, 0);
        this.triggerEvent('scrollDone')
    } else {
        scrollTo(to);
    }
};
