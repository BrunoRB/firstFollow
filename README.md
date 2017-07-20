# firstFollow

Simples javascript script that computes FIRST and FOLLOW sets for context-free grammars.

## Grammar format

 - Check https://brunorb.github.io/firstFollow#rules
 - [test/grammar.js](test/grammar.js) contains some examples
 - grammars copied from compilers books like the Dragon Book should work just fine

## Installing / Running

Try the live demo: https://brunorb.github.io/firstFollow/

or

`npm install firstfollow`

then for node:


    var myGrammar = 'A -> b w';
    var firstFollow = require('firstfollow');
    var data = firstFollow(myGrammar);
    var computedFirstSet = data.firstSet;
    var computedFollowSet = data.followSet;

for the browser:

    <script src="/src/main.js"><script>`
    <script>
    var myGrammar = 'A -> b w';
    var data = firstFollow(myGrammar);
    var computedFirstSet = data.firstSet;
    var computedFollowSet = data.followSet;
    </script>

## License

[The MIT License](LICENSE)
