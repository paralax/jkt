"use strict";

const chai = require("chai");
const jkt = require(`${src}/index`);
const reservedKeys = require(`${src}/reserved_keys`);

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
  it("Should be able to create nested struct", () => {
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
  it("Should be able to parse from nested struct", () => {
    const hobby = jkt`
      name: String
      cost: Number
      outdoor: Boolean
    `;

    const person = jkt`
      name: String
      age: Number
      hobby: ${hobby}
      toys: Array
    `;

    const mother = jkt`
      gender: String
      beauty: Boolean
      child: ${person}
    `;

    const parsed = mother({
      gender: "Woman",
      beauty: true,
      child: {
        name: "Dera",
        age: "5.67",
        toys: [1, "dua", 3],
        hobby: {
          name: "Fishing",
          cost: "300",
          outdoor: "yes",
          lalala: "sss"
        }
      }
    });

    expect(parsed.j()).to.deep.equal({
      gender: "Woman",
      beauty: true,
      child: {
        name: "Dera",
        age: 5.67,
        toys: [1, "dua", 3],
        hobby: {
          name: "Fishing",
          cost: 300,
          outdoor: null
        }
      }
    });
  });
  it("should be able to check instance and parent", () => {
    const person = jkt`
      name: String
      age: Number
      birthday: Date
    `;

    const mother = person`
      doShopping: Boolean
    `;

    const someHuman = mother`
      athlete: Boolean!
    `;

    const m = mother({});
    const p = person({});
    const h = someHuman({});

    expect(m.instanceOf(person)).to.be.true;
    expect(p.instanceOf(mother)).to.be.false;
    expect(h.instanceOf(mother)).to.be.true;
    expect(mother.childOf(person)).to.be.true;
    expect(person.childOf(mother)).to.be.false;
    expect(someHuman.childOf(person)).to.be.true;
    expect(someHuman.childOf(mother)).to.be.true;
  });
  it("should be able to handle values with container", () => {
    const person = jkt`
      name: String
      age: Number
      birthday: Date
    `;

    const fruit = jkt`
      name: String
      color: String
    `;

    const people = jkt`
      group: String
      people: ${jkt.c.arr(person)}
    `;

    const countryGroup = jkt`
      country: String
      groupOfPeople: ${people}
      fruits: ${jkt.c.arr(fruit)}
    `;

    const peopleStrict = jkt`
      group: String
      people: ${jkt.c.arr(person, true)}
    `;

    const groupOfPeople = people({
      group: "Bike Lover",
      people: [
        {
          name: "Tono"
        },
        {
          name: "Aditya",
          age: "26"
        },
        "sasasa"
      ]
    });

    const groupOfStrictPeople = peopleStrict({
      group: "Bike Lover",
      people: [
        {
          name: "Tono"
        },
        {
          name: "Aditya",
          age: "26"
        },
        "sasasa"
      ]
    });

    const groupOfCountry = countryGroup({
      country: "Indonesia",
      groupOfPeople: {
        group: "Bike Lover",
        people: [
          {
            name: "Tono"
          },
          {
            name: "Aditya",
            age: "26"
          }
        ]
      }
    });

    expect(groupOfPeople.j()).to.deep.equal({
      group: "Bike Lover",
      people: [
        {
          name: "Tono",
          age: null,
          birthday: null
        },
        {
          name: "Aditya",
          age: 26,
          birthday: null
        },
        {
          name: null,
          age: null,
          birthday: null
        }
      ]
    });

    expect(groupOfStrictPeople.j()).to.deep.equal({
      group: "Bike Lover",
      people: [
        {
          name: "Tono",
          age: null,
          birthday: null
        },
        {
          name: "Aditya",
          age: 26,
          birthday: null
        }
      ]
    });

    expect(groupOfCountry.j()).to.deep.equal({
      country: "Indonesia",
      fruits: [],
      groupOfPeople: {
        group: "Bike Lover",
        people: [
          {
            name: "Tono",
            age: null,
            birthday: null
          },
          {
            name: "Aditya",
            age: 26,
            birthday: null
          }
        ]
      }
    });
  });
  it("should be able to create struct with enum", () => {
    const hobby = jkt.ENUM`
      biking
      swimming
      running
      something: Interesting
      some: ${"Value Here"}
    `;
    const person = jkt`
      hobby: ${hobby}
    `;

    const person2 = jkt`
      hobby: ${jkt.ENUM("biking, swimming: Berenang")}
    `;

    expect(person.E.HOBBY).to.deep.equal({
      BIKING: "BIKING",
      SWIMMING: "SWIMMING",
      RUNNING: "RUNNING",
      SOMETHING: "Interesting",
      SOME: "Value Here"
    });
    expect(person2.E.HOBBY).to.deep.equal({
      BIKING: "BIKING",
      SWIMMING: "Berenang"
    });
  });
  it("should be able to parse value without enum included", () => {
    const Colors = jkt.ENUM`white, blue, green, orange`;
    const Hobbies = jkt.ENUM`
      Hiking
      Biking
      Swimming
    `;

    const person = jkt`
      name: String,
      age: Number
      hobby: ${Hobbies}
    `;

    const aditya = person({
      name: "Aditya kresna",
      age: "26",
      hobby: "SWIMMING"
    });

    const amelia = person({
      name: "Amelia Zahra",
      age: "25",
      hobby: "hiking"
    });

    expect(aditya.j()).to.deep.equal({
      name: "Aditya kresna",
      age: 26,
      hobby: "SWIMMING"
    });
    expect(amelia.j()).to.deep.equal({
      name: "Amelia Zahra",
      age: 25,
      hobby: null
    });
  });
  it("should trigger error when using reserved words", () => {
    const reservedJObj = () => {
      const person = jkt`
        name: String
        j: Object
      `;
    };

    const reservedToJSONObj = () => {
      const person = jkt`
        name: String
        toJSON: Object
      `;
    };

    const reservedGetSchema = () => {
      const person = jkt`
        name: String
        getSchema: Object
      `;
    };

    const reservedGetDirtySchema = () => {
      const person = jkt`
        name: String
        getDirtySchema: Object
      `;
    };

    const reservedInstanceOf = () => {
      const person = jkt`
        name: String
        instanceOf: Object
      `;
    };

    const reservedToString = () => {
      const person = jkt`
        name: String
        toJSON: Object
      `;
    };

    const errorThrown = `Any properties and methods with name ${reservedKeys.RESERVED_KEYS.join(
      ", "
    )} are reserved`;

    expect(reservedJObj).to.throw(errorThrown);
    expect(reservedToJSONObj).to.throw(errorThrown);
    expect(reservedToString).to.throw(errorThrown);
    expect(reservedGetSchema).to.throw(errorThrown);
    expect(reservedGetDirtySchema).to.throw(errorThrown);
    expect(reservedInstanceOf).to.throw(errorThrown);
  });
  it("should be able to parse in-listed values", () => {});
  it("should be able to parse object values", () => {});
  it("should be able to parse function values", () => {});
  it("should have built-in properties for default jkt object", () => {
    // check isJkt
    // check schema
    // check instance has function getSchema, toJSON, toString
  });
  it("should have built-in properties for enum object", () => {
    // check isJKTEnum
    // check values
    // check instance has function j and toJSON
  });
});
