
type Curry<A extends any[], R> = A extends [infer First, ...infer Rest]
    ? (first: First) => Curry<Rest, R>
    : () => R;
declare function curry<A extends any[], R>(fn: (...args: A) => R): Curry<A, R>;

export class TempTest {
    init() {
        let sum = this.curry(this.sum);
        let result = sum(1)(1)("张")(false);
        console.log("result", result);
    }

     curry<A extends any[], R>(fn: (...args: A) => R): Curry<A, R> {
        return function curried(...args: A): any {
            if (args.length >= fn.length) {
                return fn(...args);
            }else{
                return function (...args2: A): Curry<A, R> {
                    return curried(...args.concat(args2)as A);
                }
            }
        }as Curry<A, R>;
    }

    sum(a: number, b: number, c: string,d:boolean): string {
        return a + b + c + d;
    }
}