module.exports = function(element, to, animatedScroll = this.options.animateScroll) {
    let friction = 1 - this.options.scrollFriction;
    let acceleration = this.options.scrollAcceleration;

    let positionY = 0;
    let velocityY = 0;
    let targetPositionY = 0;
    let targetPositionYWithOffset = 0;
    let direction = 0;

    let raf = null;

    function getScrollTop() {
        return document.body.scrollTop || document.documentElement.scrollTop;
    }

    const animate = () => {
        const distance = update();
        render();

        if (direction === 1 && targetPositionY > positionY || direction === -1 && targetPositionY < positionY) {
            raf = requestAnimationFrame(animate);
        } else {
            window.scrollTo(0, targetPositionY);
            this.triggerEvent('scrollDone')
        }
    }

    function update() {
        const distance = targetPositionYWithOffset - positionY;
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
        direction = (positionY > offset) ? -1 : 1;
        targetPositionYWithOffset = offset + direction;
        targetPositionY = offset;
        velocityY = 0;
        if (positionY != targetPositionY) {
            animate();
        } else {
            this.triggerEvent('scrollDone')
        }
    }

    this.triggerEvent('scrollStart');
    if (animatedScroll == 0) {
        window.scrollTo(0, to);
        this.triggerEvent('scrollDone')
    } else {
        scrollTo(to);
    }
};
