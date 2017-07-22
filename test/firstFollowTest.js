const assert = require('assert');
const expect = require('chai').expect;
const fs = require('fs');
const grammars = require('./grammar.js');
const G = require('./../src/main.js');

var testSets = function(grammar, expectedFirst, expectedFollow) {
	var g = new G(grammar);

	var firstSet = g.firstSet;
	var followSet = g.followSet;

	if (expectedFirst) {
		assert.deepEqual(expectedFirst, firstSet);
	}
	if (expectedFollow) {
		assert.deepEqual(expectedFollow, followSet);
	}
};

describe('First-follow', function() {
	it('should compute the sets of a simple grammar ' + grammars.simple, function() {
		var expectedFirst = {
			A: {y: 1},
			B: {k: 1},
			y: {y: 1},
			k: {k: 1},
			w: {w: 1}
		};
		var expectedFollow = {
			A: {$: 1},
			B: {$: 1}
		};

		testSets(grammars.simple, expectedFirst, expectedFollow);
    });

	it('should compute the sets of a simple grammar 2' + grammars.simpleTwo, function() {
		var expectedFirst = {
			A: {x: 1, w: 1},
			Y: {'': 1, x: 1},
			B: {w: 1},
			x: {x: 1},
			w: {w: 1}
		};
		var expectedFollow = {
			A: {$: 1},
			B: {$: 1},
			Y: {w: 1}
		};

		testSets(grammars.simpleTwo, expectedFirst, expectedFollow);
    });

	it('should compute the sets of a recursive grammar' + grammars.recursive, function() {
		var expectedFirst = {
			CK: {'': 1, id: 1, bla: 1},
			id: {id: 1},
			bla: {bla: 1}
		};
		var expectedFollow = {
			CK: {$: 1, id: 1}
		};

		testSets(grammars.recursive, expectedFirst, expectedFollow);
    });

	it('should compute the sets of a recursive grammar' + grammars.recursiveTwo, function() {
		var expectedFirst = {
			CK: {'': 1, id: 1, bla: 1, a: 1},
			S: {a: 1},
			B: {w: 1},
			id: {id: 1},
			bla: {bla: 1},
			a: {a: 1},
			w: {w: 1}
		};
		var expectedFollow = {
			CK: {$: 1, id: 1, a: 1},
			S: {$: 1, id: 1, bla: 1, a: 1},
			B: {$: 1, id: 1, bla: 1, a: 1},
		};

		testSets(grammars.recursiveTwo, expectedFirst, expectedFollow);
    });

	it('should compute the sets of a mutually recursive grammar' + grammars.mutuallyRecursive, function() {
		var expectedFirst = {
			S: {a: 1},
			B: {'': 1, a: 1},
			a: {a: 1},
			c: {c: 1}
		};
		var expectedFollow = {
			S: {$:1, c: 1},
			B: {a: 1}
		};

		testSets(grammars.mutuallyRecursive, expectedFirst, expectedFollow);
    });

	it('should compute the sets of a mutually recursive grammar' + grammars.mutuallyRecursiveTwo, function() {
		var expectedFirst = {
			"E": {'(': 1, 'id': 1},
			"E'": {'+': 1, '': 1},
			"T": {'(': 1, 'id': 1},
			"T'": {'*': 1, '': 1},
			"F": {'(': 1, 'id': 1},
			"+": {'+': 1},
			"*": {'*': 1},
			"(": {'(': 1},
			")": {')': 1},
			"id": {id: 1},
		};
		var expectedFollow = {
			"E": {'$': 1, ')': 1},
			"E'": {'$': 1, ')': 1},
			"T": {'+': 1, ')': 1, '$': 1},
			"T'": {'+': 1, ')': 1, '$': 1},
			"F": {'*': 1, '+': 1, ')': 1, '$': 1},
		};

		testSets(grammars.mutuallyRecursiveTwo, expectedFirst, expectedFollow);
    });

	it('should compute the sets of a mutually recursive grammar' + grammars.mutuallyRecursiveThree, function() {
		var expectedFirst = {
			"S": {'': 1, '(': 1, 'x': 1, 'y': 1},
			"A": {'': 1, '(': 1, 'x': 1, 'y': 1},
			"B": {'y': 1, '(': 1, 'x': 1},
			"x": {'x': 1},
			"y": {'y': 1},
			"(": {'(': 1},
			")": {')': 1}
		};
		var expectedFollow = {
			"S": {'$': 1, 'y': 1, 'x': 1, '(': 1, ')': 1},
			"A": {'(': 1},
			"B": {'$': 1, 'y': 1, 'x': 1, '(': 1, ')': 1}
		};

		testSets(grammars.mutuallyRecursiveThree, expectedFirst, expectedFollow);
    });
});
