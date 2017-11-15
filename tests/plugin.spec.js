const babel = require('babel-core');
const plugin = require('../').default;
const syntaxDecorators = require('babel-plugin-syntax-decorators');

describe('Decorated classes only: ', () => {
    it('does not transform when no decorator are set', () => {
        const example = 'class DoNotCare { constructor(@pp prop1) {} }';
        const {code} = babel.transform(example, {plugins: [syntaxDecorators, plugin]});
        expect(code).toMatchSnapshot();
    });

    it('does not transform when decorator is not valid', () => {
        const example = '@baddecorator class DoNotCare { constructor(@pp prop1) {} }';
        const {code} = babel.transform(example, {plugins: [syntaxDecorators, plugin]});
        expect(code).toMatchSnapshot();
    });

    it('does transform when decorator is valid', () => {
        const example = '@paramProperties class DoCare { constructor(@pp prop1) {} }';
        const {code} = babel.transform(example, {plugins: [syntaxDecorators, plugin]});
        expect(code).toMatchSnapshot();
    });
});

describe('Transformation: ', () => {
    it('always puts assignments after a call to super() 1', () => {
        const classDeclaration = '@paramProperties class DoCare extends Imaginary';
        const classCtor = 'constructor(@pp prop1, @pp prop2) {\nsuper();\n}';
        const classBody = `{ ${classCtor} }`;

        const example = `${classDeclaration} ${classBody}`;
        const {code} = babel.transform(example, {plugins: [syntaxDecorators, plugin]});
        expect(code).toMatchSnapshot();
    });

    it('always puts assignments after a call to super() 2', () => {
        const classDeclaration = '@paramProperties class DoCare extends Imaginary';
        const classCtor = 'constructor(@pp prop1, @pp prop2) {\nconsole.log("ok");\nsuper();\n}';
        const classBody = `{ ${classCtor} }`;

        const example = `${classDeclaration} ${classBody}`;
        const {code} = babel.transform(example, {plugins: [syntaxDecorators, plugin]});
        expect(code).toMatchSnapshot();
    });
});