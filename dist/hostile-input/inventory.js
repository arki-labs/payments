/**
 * The public operations of the package, derived at test time
 *
 * Imports every module the `package.json` `exports` map names, and lists
 * every exported function and every public method of every exported class.
 * A new export or method shows up here by itself, so it fails the gate's
 * completeness check until it has a case or a listed exemption.
 */
import { readFileSync } from 'node:fs';
import { z } from 'zod';
import { srcDir } from './engine.js';
const packageJsonSchema = z.object({
    exports: z.record(z.string(), z.union([z.string(), z.object({ import: z.string() })])),
});
/** `./dist/core/money.js` → `core/money.ts`. */
function sourceOf(target) {
    return target.replace(/^\.\/dist\//, '').replace(/\.js$/, '.ts');
}
function isClass(value) {
    return typeof value === 'function' && /^class[\s{]/.test(Function.prototype.toString.call(value));
}
/** A failure definition from `defineFailure`: a frozen maker with a `code` and an `is` guard. */
function isFailureDefinition(value) {
    return (typeof value === 'function' &&
        'code' in value &&
        typeof value.code === 'string' &&
        'is' in value &&
        typeof value.is === 'function');
}
function declares(text, name) {
    return new RegExp(`\\bexport\\s+(?:declare\\s+)?(?:abstract\\s+)?(?:async\\s+)?(?:function\\*?|const|let|class)\\s+${name}\\b`).test(text);
}
/** The body of `class Name` in a source text: from its declaration to the next top-level declaration. */
function classBody(text, name) {
    const start = text.search(new RegExp(`class\\s+${name}\\b`));
    if (start < 0)
        return '';
    const rest = text.slice(start + 1);
    const end = rest.search(/\n(?:export\s|class\s|function\s|const\s)/);
    return end < 0 ? rest : rest.slice(0, end);
}
function isHidden(body, method) {
    return new RegExp(`\\b(?:private|protected)\\s+(?:static\\s+)?(?:async\\s+)?${method}\\s*[(<]`).test(body);
}
export async function inventory() {
    const pkg = packageJsonSchema.parse(JSON.parse(readFileSync(`${srcDir}../package.json`, 'utf8')));
    const files = Object.values(pkg.exports)
        .map(target => (typeof target === 'string' ? target : target.import))
        .filter(target => target.startsWith('./dist/'))
        .map(target => sourceOf(target));
    // Leaf modules first, barrels last: a value re-exported by a barrel keeps its declaring file.
    const ordered = [...new Set(files)].toSorted((a, b) => Number(a.endsWith('index.ts')) - Number(b.endsWith('index.ts')) || a.localeCompare(b));
    const keyOf = new Map();
    const sourceText = new Map();
    const textOf = (file) => {
        let text = sourceText.get(file);
        if (text === undefined) {
            text = readFileSync(srcDir + file, 'utf8');
            sourceText.set(file, text);
        }
        return text;
    };
    const modules = [];
    for (const file of ordered) {
        const loaded = await import(srcDir + file);
        modules.push([file, loaded]);
    }
    // Declaring files win; a value only re-exported keeps the first module that exports it.
    for (const pass of ['declared', 'any']) {
        for (const [file, loaded] of modules) {
            for (const [name, value] of Object.entries(loaded)) {
                if (typeof value !== 'function' || keyOf.has(value))
                    continue;
                if (pass === 'declared' && !declares(textOf(file), name))
                    continue;
                keyOf.set(value, `${file}::${name}`);
            }
        }
    }
    const operations = [];
    const structural = new Map();
    for (const [value, key] of keyOf) {
        const [file = '', name = ''] = key.split('::');
        if (isFailureDefinition(value)) {
            structural.set(key, 'failure definition');
            continue;
        }
        if (!isClass(value)) {
            operations.push(key);
            continue;
        }
        const body = classBody(textOf(file), name);
        const abstract = new RegExp(`abstract\\s+class\\s+${name}\\b`).test(textOf(file));
        if (value.prototype instanceof Error)
            structural.set(key, 'error class');
        else if (abstract)
            structural.set(key, 'abstract class');
        // A private constructor is no operation: callers build the class through its `static create`.
        else if (!/\bprivate\s+constructor\s*\(/.test(body))
            operations.push(key);
        const prototype = value.prototype;
        for (const method of Object.getOwnPropertyNames(prototype)) {
            if (method === 'constructor')
                continue;
            const descriptor = Object.getOwnPropertyDescriptor(prototype, method);
            if (typeof descriptor?.value !== 'function' || isHidden(body, method))
                continue;
            operations.push(`${key}.${method}`);
        }
        for (const method of Object.getOwnPropertyNames(value)) {
            const descriptor = Object.getOwnPropertyDescriptor(value, method);
            if (typeof descriptor?.value !== 'function' || isHidden(body, method))
                continue;
            operations.push(`${key}.${method}`);
        }
    }
    return { operations: operations.toSorted(), structural };
}
//# sourceMappingURL=inventory.js.map