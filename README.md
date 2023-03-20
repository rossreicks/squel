# squel.ts - SQL query string builder

<!-- [![Build Status](https://secure.travis-ci.org/hiddentao/squel.svg?branch=master)](http://travis-ci.org/hiddentao/squel)
[![CDNJS](https://img.shields.io/cdnjs/v/squel.svg)](https://cdnjs.com/libraries/squel)
[![NPM module](https://badge.fury.io/js/squel.svg)](https://badge.fury.io/js/squel)
[![NPM downloads](https://img.shields.io/npm/dm/squel.svg?maxAge=2592000)](https://www.npmjs.com/package/squel) -->

A flexible and powerful SQL query string builder for Typescript.

This is a fork of [squel](https://github.com/hiddentao/squel) that converts it to TypeScript and ESM modules. That project has been abandoned and this fork is intended to be a drop-in replacement for it. Please see the [CHANGELOG](CHANGELOG.md) for details of the changes. Feel free to submit issues if you encounter problems upgrading from squel.

## Features

* Works in node.js and in the browser.
* Supports the standard SQL queries: SELECT, UPDATE, INSERT and DELETE.
* Supports non-standard commands for popular DB engines such as MySQL.
* Supports parametrized queries for safe value escaping.
* Can be customized to build any query or command of your choosing.
* Uses method chaining for ease of use.
* Zero Dependencies

**WARNING: Do not ever pass queries generated on the client side to your web server for execution.** Such a configuration would make it trivial for a casual attacker to execute arbitrary queries&mdash;as with an SQL-injection vector, but much easier to exploit and practically impossible to protect against.

_Note: Squel is suitable for production use, but you may wish to consider more
actively developed alternatives such as [Knex](http://knexjs.org/)_

## Table of Contents
[Installation](#installation)\
[Examples](#examples)
   - [Select](#select)
   - [Insert](#insert)
   - [Update](#udate)
   - [Delete](#delete)
   - [Parameterised queries](#Parameterized-queries)
   - [Advanced Expressions](#expression-builder)

[Contributing](#contributing)\
[Building](#building)\
[License](#license)

<a name="Installation" />

## Installation

Install using [npm](http://npmjs.org/):

```bash
npm install squel-ts
```

Install using [yarn](https://yarnpkg.com/):

```bash
yarn add squel-ts
```

<a name="Examples"/>

## Examples

<a name="Examples-Select"/>

### SELECT

```typescript
import { select } from 'squel-ts';

// SELECT * FROM table
select()
    .from("table")
    .toString()

// SELECT t1.id, t2.name FROM table `t1` LEFT JOIN table2 `t2` ON (t1.id = t2.id) WHERE (t2.name <> 'Mark') AND (t2.name <> 'John') GROUP BY t1.id
select()
    .from("table", "t1")
    .field("t1.id")
    .field("t2.name")
    .left_join("table2", "t2", "t1.id = t2.id")
    .group("t1.id")
    .where("t2.name <> 'Mark'")
    .where("t2.name <> 'John'")
    .toString()

// SELECT `t1`.`id`, `t1`.`name` as "My name", `t1`.`started` as "Date" FROM table `t1` WHERE age IN (RANGE(1, 1.2)) ORDER BY id ASC LIMIT 20
select({ autoQuoteFieldNames: true })
    .from("table", "t1")
    .field("t1.id")
    .field("t1.name", "My name")
    .field("t1.started", "Date")
    .where("age IN ?", squel.str('RANGE(?, ?)', 1, 1.2))
    .order("id")
    .limit(20)
    .toString()
```

You can build parameterized queries:

```typescript
/*
{
    text: "SELECT `t1`.`id`, `t1`.`name` as "My name", `t1`.`started` as "Date" FROM table `t1` WHERE age IN (RANGE(?, ?)) ORDER BY id ASC LIMIT 20",
    values: [1, 1.2]
}
*/
select({ autoQuoteFieldNames: true })
    .from("table", "t1")
    .field("t1.id")
    .field("t1.name", "My name")
    .field("t1.started", "Date")
    .where("age IN ?", squel.str('RANGE(?, ?)', 1, 1.2))
    .order("id")
    .limit(20)
    .toParam()
```

You can use nested queries:

```typescript
// SELECT s.id FROM (SELECT * FROM students) `s` INNER JOIN (SELECT id FROM marks) `m` ON (m.id = s.id)
select()
    .from( select().from('students'), 's' )
    .field('id')
    .join( select().from('marks').field('id'), 'm', 'm.id = s.id' )
    .toString()
```

<a name="Examples-Update"/>

### UPDATE

```typescript
import { update } from 'squel-ts';

// UPDATE test SET f1 = 1
update()
    .table("test")
    .set("f1", 1)
    .toString()

// UPDATE test, test2, test3 AS `a` SET test.id = 1, test2.val = 1.2, a.name = "Ram", a.email = NULL, a.count = a.count + 1
update()
    .table("test")
    .set("test.id", 1)
    .table("test2")
    .set("test2.val", 1.2)
    .table("test3","a")
    .setFields({
        "a.name": "Ram",
        "a.email": null,
        "a.count = a.count + 1": undefined
    })
    .toString()
```

<a name="Examples-Insert"/>

### INSERT

```typescript
import { insert } from 'squel-ts';

// INSERT INTO test (f1) VALUES (1)
insert()
    .into("test")
    .set("f1", 1)
    .toString()

// INSERT INTO test (name, age) VALUES ('Thomas', 29), ('Jane', 31)
insert()
    .into("test")
    .setFieldsRows([
        { name: "Thomas", age: 29 },
        { name: "Jane", age: 31 }
    ])
    .toString()
```

<a name="Examples-Delete"/>

### DELETE

```typescript
import { delete } from 'squel-ts';

// DELETE FROM test
delete()
    .from("test")
    .toString()

// DELETE FROM table1 WHERE (table1.id = 2) ORDER BY id DESC LIMIT 2
delete()
    .from("table1")
    .where("table1.id = ?", 2)
    .order("id", false)
    .limit(2)
```

<a name="Examples-Paramaterized-Queries"/>

### Parameterized queries

Use the `toParam()` method to obtain a parameterized query with a separate list of formatted parameter values:

```typescript
import { insert } from 'squel-ts';

// { text: "INSERT INTO test (f1, f2, f3, f4, f5) VALUES (?, ?, ?, ?, ?)", values: [1, 1.2, "TRUE", "blah", "NULL"] }
insert()
    .into("test")
    .set("f1", 1)
    .set("f2", 1.2)
    .set("f3", true)
    .set("f4", "blah")
    .set("f5", null)
    .toParam()
```

<a name="Examples-Expression-Builder" />

### Expression builder

There is also an expression builder which allows you to build complex expressions for `WHERE` and `ON` clauses:

```typescript
import { expr } from 'squel-ts';

// test = 3 OR test = 4
expr()
    .or("test = 3")
    .or("test = 4")
    .toString()

// test = 3 AND (inner = 1 OR inner = 2) OR (inner = 3 AND inner = 4 OR (inner IN ('str1, 'str2', NULL)))
expr()
    .and("test = 3")
    .and(
        expr()
            .or("inner = 1")
            .or("inner = 2")
    )
    .or(
        expr()
            .and("inner = ?", 3)
            .and("inner = ?", 4)
            .or(
                expr()
                    .and("inner IN ?", ['str1', 'str2', null])
            )
    )
    .toString()

// SELECT * FROM test INNER JOIN test2 ON (test.id = test2.id) WHERE (test = 3 OR test = 4)
select()
    .join( "test2", null, expr().and("test.id = test2.id") )
    .where( expr().or("test = 3").or("test = 4") )
```

<a name="Building"/>

## Building

To build the code and run the tests:

```bash
    yarn install
    yarn build
    yarn test
```

<a name="Contributing"/>

## Contributing

Contributions are welcome! Please see [CONTRIBUTING](CONTRIBUTING.md).

<a name="License"/>

## License

MIT - see [LICENSE](LICENSE.md)
