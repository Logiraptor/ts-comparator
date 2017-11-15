# ts-comparator

Custom comparison logic for typescript models. Supports ignoring fields.

```typescript
let modelA = { name: "", subModel: { age: 2, height: 7 } };
let modelB = { name: "", subModel: { age: 7, height: 7 } };
let comparator = new Comparator<typeof modelB>();
comparator.field("subModel").field("age").ignore();
expect(comparator.compare(modelA, modelB).equal).to.be.true;
```
