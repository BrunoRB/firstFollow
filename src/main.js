var firstFollow = (function() {
    'use strict';

    /**
     * SYMBOL -> DERIVATION
    */
    var Production = function(symbol, derivation) {
        this.symbol = symbol;
        this.derivation = derivation;
    };

    /**
    *  Given a grammar of the form:
    *      S -> derivation1 derivation2 | derivation3 | derivation4
    *      B -> derivation1 ...
    *  returns an array containg "Production" objects, one for each rule.
    */
    var GetProductions = function(grammar) {
        // remove spaces, filter empty lines, and break the rules into (production, derivations)
        return grammar.split(/;|\n/).map(function(line) {
            return line.trim();
        }).filter(function(line) {
            return line;
        }).map(function(rule) {
            var data = rule.split(/->|→/);
            if (data.length < 2 || !data[0]) {
                throw 'Invalid rule ' + rule;
            }
            var symbol = data[0];
            var derivation = (data[1] || '').replace(/ε|ϵ/g, '').trim();

            // split multiple derivations
            return derivation.split(/\||∣/).map(function(d) {
                return new Production(
                    symbol.replace(/\s+/, ''),
                    d.trim().split(/\s+/)
                );
            });
        }).reduce(function(a, b) { // at this point we have an array of arrays, make it flat.
            return a.concat(b);
        }, []);
    };

    var Grammar = function(str) {
        var that = this;
        this.grammar = str;
        this.productionList = GetProductions(str);
        if (!this.productionList.length) {
            throw 'Empty grammar';
        }

        this.startSymbol = this.productionList[0].symbol;
        /**
        * {Production1: [derivation1, derivation2, ...], ...}
        */
        this.productions = {};
        /**
        * {symbol: {x1: 1, x2: 1, ...}, ...}
        */
        this.firstSet = {};
        /**
        * {NonTerminal: {x1: 1, x2: 1, ...}, ...}
        */
        this.followSet = {};

        this.productionList.forEach(function(prod) {
            if (!(prod.symbol in that.productions)) {
                that.productions[prod.symbol] = [];
            }

            that.firstSet[prod.symbol] = {};
            that.followSet[prod.symbol] = {};
            prod.derivation.forEach(function(d) {
                if (d === '') {
                    return;
                }
                else if (that.isNonTerminal(d)) {
                    that.firstSet[d] = {};
                    that.followSet[d] = {};
                }
                else {
                    that.firstSet[d] = {};
                    that.firstSet[d][d] = 1;
                }
            });

            that.productions[prod.symbol].push(prod.derivation);
        });
    };

    Grammar.prototype.addToFirstSet = function(symbol, v) {
        if (v in this.firstSet[symbol]) {
            return;
        }
        this.firstSet[symbol][v] = 1;
        this._changed = true;
    };

    Grammar.prototype.addToFollowSet = function(symbol, v) {
        if (v in this.followSet[symbol]) {
            return;
        }
        this.followSet[symbol][v] = 1;
        this._changed = true;
    };

    Grammar.prototype.isNonTerminal = function(symbol) {
        return symbol in this.productions;
    };


    /**
    * An incremental algorithm for computing FIRST and FOLLOW sets,
    * the rules are taken from the Dragon Book.
    */
    Grammar.prototype.firstAndFollow = function() {
        var that = this;
        // 1. Place $ in FOLLOW(S) , where S is the start symbol, and $ is the input right endmarker.
        this.followSet[this.startSymbol] = {$: 1};

        var ws;
        do {
            this._changed = false;
            this.productionList.forEach(function(prod) {
                var symbol = prod.symbol;
                var derivationList = prod.derivation;

                if (!that.isNonTerminal(symbol)) {
                    that.addToFirstSet(symbol, symbol);
                }
                else {
                    // set to true when the first derivation has epsilon in its first set,
                    // it remains true as long as the subsequent derivations also contain '' in their first sets.
                    var addEpsilon = false;
                    derivationList.forEach(function(derivation, index) {
                        if (derivation === '') {
                            that.addToFirstSet(symbol, '');
                        }
                        else {
                            if (index === 0 || addEpsilon) {
                                var fSet = that.firstSet[derivation] || {};

                                // only add epsilon to firt(X) if epsilon is in all k for X -> Y1, Y2...Yk
                                addEpsilon = '' in fSet;

                                for (ws in fSet) {
                                    if (ws === '') {
                                        continue;
                                    }

                                    that.addToFirstSet(symbol, ws);
                                }
                            }

                            // 2.
                            // If there is a production A -> aBb, then everything in FIRST(b) except EPSILON
                            // is in FOLLOW(B)
                            var prevDerivation = index > 0 ? derivationList[index - 1] : null;
                            if (prevDerivation && that.isNonTerminal(prevDerivation)) {
                                for (ws in that.firstSet[derivation]) {
                                    if (ws === '') {
                                        continue;
                                    }
                                    that.addToFollowSet(prevDerivation, ws);
                                }
                            }

                            // 3. If there is a production A -> aB, or a production A -> aBb, where FIRST(b) contains
                            // epsilon, then everything in FOLLOW(A) is in FOLLOW(B)
                            if (index + 1 === derivationList.length && that.isNonTerminal(derivation)) {
                                var lastDer = derivation;
                                var reverseIndex = index;
                                var hasEpsilon = false;
                                var symbolFollow = that.followSet[symbol];
                                do {
                                    for (ws in symbolFollow) {
                                        that.addToFollowSet(lastDer, ws);
                                    }

                                    hasEpsilon = '' in that.firstSet[lastDer];
                                    reverseIndex--;
                                    lastDer = derivationList[reverseIndex];
                                } while(that.isNonTerminal(lastDer) && hasEpsilon);
                            }
                        }
                    });

                    if (addEpsilon) {
                        that.addToFirstSet(symbol, '');
                    }
                }
            });
        // we stop iterating and consider that the sets are complete when after a iteration nothing was added to them.
        } while(this._changed);
    }

    return function(grammar) {
        var o = new Grammar(grammar);
        o.firstAndFollow();
        return {
            firstSet: o.firstSet,
            followSet: o.followSet
        };
    };
})();

if (typeof module !== 'undefined') {
    module.exports = firstFollow;
}
