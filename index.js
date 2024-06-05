document.addEventListener('DOMContentLoaded', () => {
    const thumb = document.querySelector('.thumbCircle');
    const track = document.querySelector('.track');
    const progress = document.querySelector('.progress');
    const thumbSize = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--thumbSize'));
    let confettiRunning = false;
    let lastValue = null;
    let sliderStarted = false;

    const trackRect = track.getBoundingClientRect();
    const thumbRect = thumb.getBoundingClientRect();

    const calculation = (value) => {
        let newLeft = (value / 100) * (trackRect.width - thumbSize);

        // Ensure the thumb stays within the boundaries
        newLeft = Math.max(0, Math.min(newLeft, trackRect.width - thumbSize));

        const progressPercent = (newLeft / (trackRect.width - thumbSize)) * 100;

        progress.style.width = `calc(${progressPercent}% + ${thumbSize / 2}px)`;
        thumb.style.left = `calc(${progressPercent}% - ${thumbSize / 2}px)`;

        // Trigger confetti when value reaches 100%
        if (value === 100 && !confettiRunning && lastValue !== 100) {
            confettiRunning = true;
            lastValue = 100;
            confetti({
                particleCount: 100,
                spread: 70,
                origin: {
                    x: (thumbRect.left + thumbRect.width / 2) / window.innerWidth,
                    y: (thumbRect.top + thumbRect.height / 2) / window.innerHeight
                }
            }).then(() => {
                confettiRunning = false;
            });
        } else if (value !== 100) {
            lastValue = value;
        }
    };

    // Read the initial value from the data-value attribute
    const initialValue = parseFloat(track.getAttribute('data-value')) || 0;
    calculation(initialValue);

    const onMove = (clientX) => {
        const value = ((clientX - trackRect.left - thumbSize / 2) / (trackRect.width - thumbSize)) * 100;
        calculation(Math.max(0, Math.min(value, 100)));
        track.setAttribute('aria-valuenow', Math.max(0, Math.min(value, 100)));
    };

    const onPointerMove = (e) => {
        e.preventDefault();
        const clientX = e.clientX || e.touches[0].clientX;
        onMove(clientX);
    };

    const startMove = (e) => {
        e.preventDefault();
        if (!sliderStarted) {
            document.querySelector('.thumb').classList.add('started');
            sliderStarted = true;
        }
        document.addEventListener('mousemove', onPointerMove);
        document.addEventListener('touchmove', onPointerMove, { passive: false });

        const endMove = () => {
            document.removeEventListener('mousemove', onPointerMove);
            document.removeEventListener('touchmove', onPointerMove);
            document.removeEventListener('mouseup', endMove);
            document.removeEventListener('touchend', endMove);
        };

        document.addEventListener('mouseup', endMove, { once: true });
        document.addEventListener('touchend', endMove, { once: true });
    };

    const onKeyDown = (e) => {
        const step = 1;
        let value = parseFloat(track.getAttribute('aria-valuenow')) || initialValue;

        switch (e.key) {
            case 'ArrowRight':
            case 'ArrowUp':
                value = Math.min(100, value + step);
                calculation(value);
                track.setAttribute('aria-valuenow', value);
                break;
            case 'ArrowLeft':
            case 'ArrowDown':
                value = Math.max(0, value - step);
                calculation(value);
                track.setAttribute('aria-valuenow', value);
                break;
        }

        // Add 'started' class to thumb if the slider is used for the first time
        if (!sliderStarted) {
            document.querySelector('.thumb').classList.add('started');
            sliderStarted = true;
        }
    };

    thumb.addEventListener('mousedown', startMove);
    thumb.addEventListener('touchstart', startMove, { passive: false });
    track.addEventListener('keydown', onKeyDown);
    track.setAttribute('tabindex', '0');
});
