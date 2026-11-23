/** The package's `src/` folder, where the op keys' file paths start. */
export declare const srcDir: string;
/** One step of an argument path: an object key or an array index. */
type PathStep = string | number;
/** One hostile substitution at one argument path. */
type Mutation = {
    path: PathStep[];
    label: string;
    /** Builds the hostile value from the valid one at the same path. */
    value: (valid: unknown) => unknown;
    /** A slow value (100k text, 200k items) gets the long time limit. */
    slow?: boolean;
};
/** One public operation under the gate. Build it with {@link op}; the engine never sees the argument types. */
export type HostileCase<Ctx> = {
    /** `<path under src>::<export>`, `<path>::<Class>.<method>`, `<path>::<Class>` (constructor) or `<path>::<factory>().<fn>`. */
    op: string;
    /** Calls the operation on fresh valid arguments, after `mutate` changed them in place. */
    run: (ctx: Ctx, mutate: (args: unknown[]) => void) => Promise<{
        args: unknown[];
        result: unknown;
    }>;
    /** Checks the result of the valid call. */
    valid: (result: unknown, ctx: Ctx) => void | Promise<void>;
    /** The result is an object of operations: each function on it must have a case `<op>().<name>`. */
    surface: boolean;
    /** Argument paths (as `args[0].x`) the walk leaves alone, with the reason. */
    keep: Record<string, string>;
    /** Time limit of one call, in ms. */
    timeoutMs: number;
};
type OpOptions<Ctx, Args extends unknown[]> = {
    /** Fresh valid arguments for one call. May write rows, through the package's own commands. */
    arrange: (ctx: Ctx) => Args | Promise<Args>;
    /** Calls the operation on a real object. */
    call: (ctx: Ctx, ...args: NoInfer<Args>) => unknown;
    /** Checks the valid call's result. Default: it is not a failure. */
    valid?: (result: unknown, ctx: Ctx) => void | Promise<void>;
    /** The result is an object of operations: each must have its own case. */
    surface?: boolean;
    /** Argument paths the walk leaves alone (a dependency, a callback), with the reason. */
    keep?: Record<string, string>;
    timeoutMs?: number;
};
/** Defines the case of one operation. `call` is typed by what `arrange` returns. */
export declare function op<Ctx, Args extends unknown[]>(key: string, options: OpOptions<Ctx, Args>): HostileCase<Ctx>;
/** The arguments of one call, as a tuple: `arrange: () => args(id, { name: 'x' })`. */
export declare function args<Values extends unknown[]>(...values: Values): Values;
/** One area of the package: a fixture opened once, and the cases that run on it. */
export type HostileArea<Ctx> = {
    area: string;
    open: () => Promise<Ctx>;
    close?: (ctx: Ctx) => Promise<void>;
    cases: HostileCase<Ctx>[];
    /** Operations of this area that need no case, each with the reason. */
    exempt?: Record<string, string>;
};
/** Defines an area. */
export declare function area<Ctx>(definition: HostileArea<Ctx>): HostileArea<Ctx>;
/** Every hostile substitution the valid arguments allow, leaf by leaf. */
export declare function mutationsOf(args: unknown[]): Mutation[];
/** What went wrong, short: the class, a SQLSTATE or code when there is one, and the message. */
export declare function describeError(error: unknown): {
    kind: string;
    message: string;
};
/** One failing case, as the report and the fixers see it. */
export type HostileFailure = {
    area: string;
    op: string;
    path: string;
    hostile: string;
    kind: string;
    message: string;
};
/** Where an area's failing cases are written, one JSON line each (`.cache/` is git-ignored). */
export declare const reportDir: string;
/** Registers one vitest test per operation of the area. */
export declare function runArea<Ctx>(definition: HostileArea<Ctx>): void;
export {};
//# sourceMappingURL=engine.d.ts.map