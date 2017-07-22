module.exports = {
    simple: `
        A -> y w B
        B -> k w
    `,

    simpleTwo: `
        A -> Y B

        Y -> | x
        B -> w
    `,

    recursive: `
        CK -> CK id | bla | | id CK
    `,

    recursiveTwo: `
        CK -> CK id | bla | ε | id CK | S CK | CK S
        S -> a B ; B -> w
    `,

    mutuallyRecursive: `
        S -> B a
        B -> S c | ε
    `,

    mutuallyRecursiveTwo: `
        E → T E'
        E' → + T E' |
        T → F T'
        T' → * F T' |
        F → ( E ) | id
    `,

    mutuallyRecursiveThree: `
        S → A ( S ) B ∣ ϵ
        A → S ∣ S B ∣ x ∣ ϵ
        B → S B ∣ y
    `,

    mutuallyRecursiveFour: `
         S -> A c | B b | S C a b ;
         A -> a | b B | C
         B -> A C | d ;
         C -> a S | C d B d | A B | ;
    `,
};
