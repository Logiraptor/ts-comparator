interface Difference {
    property: string;
    expected: any;
    actual: any;
}

interface ComparisonResult {
    equal: boolean;
    differences: Difference[];
}

export class Comparator<T extends object> {
    private ignored: boolean = false;
    private subComparators: { [K in keyof T]?: Comparator<T[K]> } = {};

    compare(expected: T, actual: T): ComparisonResult {
        if (this.ignored) {
            return { equal: true, differences: [] };
        }

        let diff = this.compareValues(expected, actual);
        return { equal: diff.length == 0, differences: diff };
    }

    field<K extends keyof T>(field: K): Comparator<T[K]> {
        const cachedComparator = this.subComparators[field];
        if (cachedComparator) {
            return cachedComparator;
        }
        const newComparator = new Comparator<T[K]>();
        this.subComparators[field] = newComparator;
        return newComparator;
    }

    arrayField<ElementType extends object>(field: keyof T): Comparator<ElementType> {
        return this.field(field as any);
    }

    ignore(): this {
        this.ignored = true;
        return this;
    }

    private compareValues(expected: T, actual: T): Difference[] {
        switch (typeof expected) {
            case "object":
                const differences: Difference[] = [];
                for (let key in expected) {
                    if (expected[key] && (expected[key] as any).constructor === Array) {
                        differences.push(...this.compareArrayField(key, expected[key], actual[key]));
                    } else {
                        differences.push(...this.compareObjectField(key, expected[key], actual[key]));
                    }
                }
                return differences;
            case "function":
                // ignore methods explicitly
                break;
            default:
                if (expected !== actual) {
                    return [ { expected, actual, property: "" } ];
                }
                break;
        }
        return [];
    }

    private compareObjectField<K extends keyof T>(key: K, expected: T[K], actual: T[K]) {
        const diff = this.field(key).compare(expected, actual);
        return diff.differences.map((diff) => ({
            expected: diff.expected,
            actual: diff.actual,
            property: `.${key}${diff.property}`,
        }));
    }

    private compareArrayField<K extends keyof T>(key: K, expected: T[K], actual: T[K]) {
        const elementComparator = this.arrayField(key);
        const differences: Difference[] = [];
        for (let i in expected) {
            const diff = elementComparator.compare(expected[i], actual[i]);

            differences.push(
                ...diff.differences.map((diff) => ({
                    expected: diff.expected,
                    actual: diff.actual,
                    property: `.${key}.${i}${diff.property}`,
                })),
            );
        }
        return differences;
    }
}
