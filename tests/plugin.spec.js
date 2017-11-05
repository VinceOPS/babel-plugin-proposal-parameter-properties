const babel = require('babel-core');
const plugin = require('../').default;
const syntaxDecorators = require('babel-plugin-syntax-decorators');

describe('Class declaration syntax', () => {
    it('does not transform when decorator is not valid', () => {
        const example = '@baddecorator class DoNotCare { constructor(prop1) {} }';
        const {code} = babel.transform(example, {plugins: [syntaxDecorators, plugin]});
        expect(code).toMatchSnapshot();
    });

    it('does transform when decorator is valid', () => {
        const example = '@paramProperties class DoCare { constructor(prop1) {} }';
        const {code} = babel.transform(example, {plugins: [syntaxDecorators, plugin]});
        expect(code).toMatchSnapshot();
    });
});