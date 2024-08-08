declare global {
    const json: ReturnType<typeof json_module>

    function tonumber(e: any, base?: number): number | undefined;

    // math
    namespace math {
        function ceil(value: number): number;
        function pow(x: number, y: number): number;
        function abs(x: number): number;
        function cos(x: number): number;
        function sin(x: number): number;
        function rad(x: number): number;
        function random(min: number, max: number): number;
    }

    // vmath
    namespace vmath {
        type vector3 = {
            x: number,
            y: number,
            z: number,
        }

        function vector3(): vmath.vector3
        function vector3(n: number): vmath.vector3
        function vector3(v1: vmath.vector3): vmath.vector3
        function vector3(x: number, y: number, z: number): vmath.vector3
        function length(v: vmath.vector3): number
    }
}


function json_module() {
    function encode(data: any, options?: any) {
        return JSON.stringify(data)
    }

    function decode(s: string) {
        return JSON.parse(s)
    }

    return { encode, decode }
}

function math_module() {

    function ceil(value: number) {
        return Math.ceil(value);
    }
    function pow(x: number, y: number) {
        return Math.pow(x, y);
    }
    function abs(x: number) {
        return Math.abs(x);
    }
    function cos(x: number) {
        return Math.cos(x);
    }
    function sin(x: number) {
        return Math.sin(x);
    }
    function rad(x: number) {
        return Math.PI * x / 180;
    }

    function random(min: number, max: number) {
        const minCeiled = Math.ceil(min);
        const maxFloored = Math.floor(max);
        return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
    }

    return { ceil, pow, abs, cos, sin, rad, random }
}

//
// ---------------------------------------------------------------------
//

function vmath_module() {

    function vector3_0() {
        //log('vector3_0')
        return { x: 0, y: 0, z: 0 };
    }
    function vector3_1(n: number) {
        //log('vector3_1', n)
        return { x: n, y: n, z: n };
    }
    function vector3_2(v1: vmath.vector3) {
        //log('vector3_2', v1)
        return { x: v1.x, y: v1.y, z: v1.z };
    }
    function vector3_3(x: number, y: number, z: number) {
        //log('vector3_3', x, y, z)
        return { x, y, z };
    }

    function vector3(...args: any) {
        if (args.length == 0) return vector3_0();
        if (args.length == 1) {
            if (Number.isInteger(args[0]))
                return vector3_1(args[0]);
            else
                return vector3_2(args[0]);
        }
        if (args.length == 3)
            return vector3_3(args[0], args[1], args[2]);
        //log(args);
    }

    function length(v: vmath.vector3) {
        return Math.sqrt(v.x * v.x + v.y * v.y);
    }

    return { vector3, length }
}


export function register_lua_types() {
    (global as any).tonumber = Number;
    (global as any).json = json_module();
    (global as any).math = math_module();
    (global as any).vmath = vmath_module();
}