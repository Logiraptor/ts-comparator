import { Comparator } from "./comparator";
import { expect } from "chai";

describe("Comparator", () => {
    it("does deep object comparison", () => {
        let modelA = { name: "", subModel: { age: 2, height: 7 } };
        let modelB = { name: "", subModel: { age: 2, height: 7 } };
        let comparator = new Comparator<typeof modelB>();
        expect(comparator.compare(modelA, modelB).equal).to.be.true;

        modelB.subModel.age = 7;
        expect(comparator.compare(modelA, modelB).equal).to.be.false;
    });

    it("ignores methods", () => {
        let modelA = {
            name: "",
            sayHi() {
                return "hi";
            },
        };
        let modelB = { name: "" };
        let comparator = new Comparator<typeof modelB>();
        expect(comparator.compare(modelA, modelB).equal).to.be.true;
    });

    it("does not report inequality on ignored fields", () => {
        let modelA = { name: "", subModel: { age: 2, height: 7 } };
        let modelB = { name: "", subModel: { age: 7, height: 7 } };
        let comparator = new Comparator<typeof modelB>();
        comparator.field("subModel").ignore();
        expect(comparator.compare(modelA, modelB).equal).to.be.true;
    });

    it("does not report inequality on ignored nested fields", () => {
        let modelA = { name: "", subModel: { age: 2, height: 7 } };
        let modelB = { name: "", subModel: { age: 7, height: 7 } };
        let comparator = new Comparator<typeof modelB>();
        comparator.field("subModel").field("age").ignore();
        expect(comparator.compare(modelA, modelB).equal).to.be.true;
    });

    it("does not report inequality on ignored nested array fields", () => {
        let modelA = { friends: [ { name: "bob" }, { name: "fred" } ] };
        let modelB = { friends: [ { name: "bob" }, { name: "jim" } ] };
        let comparator = new Comparator<typeof modelB>();
        comparator.arrayField<typeof modelB["friends"][0]>("friends").field("name").ignore();
        expect(comparator.compare(modelA, modelB).equal).to.be.true;
    });

    it("recursively compares array fields", () => {
        let modelA = { friends: [ { name: "bob" }, { name: "fred" } ] };
        let modelB = { friends: [ { name: "bob" }, { name: "fred" } ] };
        let comparator = new Comparator<typeof modelB>();
        expect(comparator.compare(modelA, modelB).equal).to.be.true;

        modelB = { friends: [ { name: "bob" }, { name: "joe" } ] };
        expect(comparator.compare(modelA, modelB).equal).to.be.false;
    });
});
