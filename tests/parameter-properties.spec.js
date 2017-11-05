import ParameterProperties from '../src/parameter-properties';
import {types} from 'babel-core';

const t = types;
const DECORATOR = 'paramProperties';

describe('ParameterProperties', () => {
    /** @type {ParameterProperties} */
    let paramProps = new ParameterProperties(t);

    /** @type {babel.types.Identifier} */
    let identifier;
    /** @type {babel.types.ClassBody} */
    let classBody;
    /** @type {babel.types.ClassDeclaration} */
    let classDeclaration;
    /** @type {babel.types.Decorator} */
    let decorator;

    beforeEach(() => {
        identifier = t.identifier('MyClass');
        decorator = t.decorator(t.identifier(DECORATOR));
        classBody = t.classBody([]);
        classDeclaration = t.classDeclaration(identifier,
            null,
            classBody,
            [decorator]);
    });

    describe('getDecorator', () => {
        it('returns nothing when class is not decorated', () => {
            classDeclaration.decorators = [];

            const dec = paramProps.getDecorator(classDeclaration);
            expect(dec).toBe(undefined);
        });

        it('returns the proper decorator', () => {
            const random = t.decorator(t.identifier('random'));
            classDeclaration.decorators = [random, decorator, random];

            const dec = paramProps.getDecorator(classDeclaration);
            expect(dec).not.toBeFalsy();
            expect(dec.expression).not.toBeFalsy();
            expect(dec.expression.name).toBe(DECORATOR);
        });

        it('returns it only once', () => {
            classDeclaration.decorators = [decorator, decorator];

            const dec = paramProps.getDecorator(classDeclaration);
            expect(dec).not.toBeFalsy();
            expect(dec.expression).not.toBeFalsy();
            expect(dec.expression.name).toBe(DECORATOR);
        });
    });

    describe('undecorate', () => {
        it('removes all occurrences of our decorator', () => {
            const random = t.decorator(t.identifier('random'));
            // add a random decorator and a second occurrence of our decorator
            classDeclaration.decorators.push(random, decorator);

            paramProps.undecorate(classDeclaration);
            expect(classDeclaration.decorators.length).toBe(1);
            expect(classDeclaration.decorators[0]).toBe(random);
        });
    });
});