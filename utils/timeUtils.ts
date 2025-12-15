export const formatTime = (time: number) => {
    const date = new Date(time);
    const min = String(date.getUTCMinutes()).padStart(2, '0');
    const sec = String(date.getUTCSeconds()).padStart(2, '0');
    const ms = String(Math.floor(date.getUTCMilliseconds() / 10)).padStart(2, '0');
    return { min, sec, ms };
};

export const vibratePhone = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(50);
    }
};