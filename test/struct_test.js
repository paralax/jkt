"use strict";

const chai = require("chai");
const jkt = require(`${src}/index`);

chai.should();
chai.use(require("chai-things"));

const expect = chai.expect;

describe("Struct", () => {
  it("should be able to create by multiple lines", () => {
    const person = jkt`
      name: String
      age: Number
      birthday: Date
    `;

    expect(person.isJKT).to.be.true;
    expect(person.schema).to.deep.equal({
      name: "String",
      age: "Number",
      birthday: "Date"
    });
  });
  it("should be able to create by one liner", () => {
    const person = jkt`name: String,age: Number, birthday: Date`;

    expect(person.isJKT).to.be.true;
    expect(person.schema).to.deep.equal({
      name: "String",
      age: "Number",
      birthday: "Date"
    });
  });
  it("should be able to extend", () => {
    const person = jkt`
      name: String
      age: Number
    `;

    const father = person`
      hasFamily: Boolean
    `;

    const validSchema = {
      name: "String",
      age: "Number",
      hasFamily: "Boolean"
    };

    const schemaFromInst = father({}).getSchema();
    const schemaFromStruct = father.schema;
    expect(schemaFromInst).to.deep.equal(validSchema);
    expect(schemaFromStruct).to.deep.equal(validSchema);
  });
  it("should be able to remove property on extend", () => {
    const person = jkt`
      name: String
      age: Number
      birthday: Date
    `;

    const fruit = person`
      age: !DELETE
      birthday: !DELETE
      color: String
    `;

    const validSchema = {
      name: "String",
      color: "String"
    };

    const schemaFromInst = fruit({}).getSchema();
    expect(schemaFromInst).to.deep.equal(validSchema);
    expect(fruit.schema).to.deep.equal(validSchema);
  });
  it.only("Should be able to create nested struct", () => {
    const hobby = jkt`
      name: String
      cost: Number
      outdoor: Boolean
    `;

    const person = jkt`
      name: String
      age: Number
      hobby: ${hobby}
    `;

    const mother = jkt`
      gender: String
      beauty: Boolean
      child: ${person}
    `;

    const validSchemaPerson = {
      name: "String",
      age: "Number",
      hobby: {
        name: "String",
        cost: "Number",
        outdoor: "Boolean"
      }
    };

    const validSchemaMother = {
      gender: "String",
      beauty: "Boolean",
      child: validSchemaPerson
    };

    expect(person.schema).to.deep.equal(validSchemaPerson);
    expect(mother.schema).to.deep.equal(validSchemaMother);
  });
  it("should be able to create struct with enum", () => {});
  it("should be able to parse value with enum", () => {});
  it("should be able to extend from existing struct", () => {});
  it("should be able to extend from existing struct with deleting parent property", () => {});
  it("should trigger error when using reserved words", () => {});
  it("should be able to parse in-listed values", () => {});
  it("should be able to parse object values", () => {});
  it("should be able to parse function values", () => {});
  it("should have built-in properties for default jkt object", () => {
    // check isJkt
    // check schema
    // check instance has function getSchema, toJSON, toString
  });
  it("should be able to use existing struct as a nested struct", () => {});
});
