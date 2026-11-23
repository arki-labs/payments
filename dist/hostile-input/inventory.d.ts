/** Why an operation needs no case: the structural kinds every package has. */
export type StructuralExemption = 'failure definition' | 'error class' | 'abstract class';
export type Inventory = {
    /** `<path under src>::<name>` for functions and constructors, `::<Class>.<method>` for methods. */
    operations: string[];
    /** Callables that are not operations, with the structural reason. */
    structural: Map<string, StructuralExemption>;
};
export declare function inventory(): Promise<Inventory>;
//# sourceMappingURL=inventory.d.ts.map