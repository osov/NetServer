export interface Vec2XY {
    x: number;
    y: number;
}


export function vec2_distance_to(a: Vec2XY, b: Vec2XY) {
    const dx = a.x - b.x, dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
}

export function vec2_div_scalar(v: Vec2XY, d: number) {
    v.x /= d;
    v.y /= d;
    return v;
}

export function vec2_length(v: Vec2XY) {
    return Math.sqrt(v.x * v.x + v.y * v.y);
}

export function vec2_normalize(v: Vec2XY) {
    return vec2_div_scalar(v, vec2_length(v) || 1);
}

export function vec2_sub(v1: Vec2XY, v2: Vec2XY) {
    return { x: v1.x - v2.x, y: v1.y - v2.y };
}

export function shuffle<T>(array: T[]) {
    let currentIndex = array.length;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {

        // Pick a remaining element...
        let randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
    }

    return array;
}