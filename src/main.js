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
        return grammar.split(/;|\n/).map((line) => line.trim()).filter((line) => line).map(function(rule) {
            var data = rule.split(/->|→/);
            if (data.length < 2 || !data[0]) {
                throw `Invalid rule ${rule}`;
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

        this.productionList.forEach((prod) => {
            if (!(prod.symbol in that.productions)) {
                that.productions[prod.symbol] = [];
            }

            this.firstSet[prod.symbol] = {};
            this.followSet[prod.symbol] = {};
            prod.derivation.forEach((d) => {
                if (d === '') {
                    return;
                }
                else if (this.isNonTerminal(d)) {
                    this.firstSet[d] = {};
                    this.followSet[d] = {};
                }
                else {
                    this.firstSet[d] = {};
                    this.firstSet[d][d] = 1;
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
        // 1. Place $ in FOLLOW(S) , where S is the start symbol, and $ is the input right endmarker.
        this.followSet[this.startSymbol] = {$: 1};

        var ws;
        do {
            this._changed = false;
            this.productionList.forEach((prod) => {
                var symbol = prod.symbol;
                var derivationList = prod.derivation;

                if (!this.isNonTerminal(symbol)) {
                    this.addToFirstSet(symbol, symbol);
                }
                else {
                    var addEpsilon = false;
                    derivationList.forEach((derivation, index) => {
                        if (derivation === '') {
                            this.firstSet[symbol][''] = 1;
                        }
                        else {
                            var prevDerivation = index > 0 ? derivationList[index - 1] : null;
                            var prevDerivationFirstSet = this.firstSet[derivationList[index - 1]] || {};
                            if (index === 0 || '' in prevDerivationFirstSet) {
                                var fSet = this.firstSet[derivation] || {};

                                // only add epsilon to firt(X) if epsilon is in all k for X -> Y1, Y2...Yk
                                addEpsilon = '' in fSet;

                                for (ws in fSet) {
                                    if (ws === '') {
                                        continue;
                                    }

                                    this.addToFirstSet(symbol, ws);
                                }
                            }

                            // 2.
                            // If there is a production A -> aBb, then everything in FIRST(b) except EPSILON
                            // is in FOLLOW(B)
                            if (prevDerivation && this.isNonTerminal(prevDerivation)) {
                                for (ws in this.firstSet[derivation]) {
                                    if (ws === '') {
                                        continue;
                                    }
                                    this.addToFollowSet(prevDerivation, ws);
                                }
                            }

                            // 3. If there is a production A -> aB, or a production A -> aBb, where FIRST(b) contains
                            // epsilon, then everything in FOLLOW(A) is in FOLLOW(B)
                            if (index + 1 === derivationList.length && this.isNonTerminal(derivation)) {
                                var lastDer = derivation;
                                var reverseIndex = index;
                                var hasEpsilon = false;
                                var symbolFollow = this.followSet[symbol];
                                do {
                                    for (ws in symbolFollow) {
                                        this.addToFollowSet(lastDer, ws);
                                    }

                                    hasEpsilon = '' in this.firstSet[lastDer];
                                    reverseIndex--;
                                    lastDer = derivationList[reverseIndex];
                                } while(this.isNonTerminal(lastDer) && hasEpsilon);
                            }
                        }
                    });

                    if (addEpsilon) {
                        this.addToFirstSet(symbol, '');
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
